import { CameraView, useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { CheckCircle, ChevronLeft, KeyRound, XCircle } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  Easing,
  FadeInDown, FadeInUp,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat, withSequence, withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { AuthService } from '../../services/AuthService';

const { width: SCREEN_W } = Dimensions.get('window');
const OVAL_W = SCREEN_W * 0.62;
const OVAL_H = OVAL_W * 1.28;

// ─── Scan Line ────────────────────────────────────────────────────────────────
function ScanLine({ active, color }: { active: boolean; color: string }) {
  const y = useSharedValue(0);
  useEffect(() => {
    if (active) {
      y.value = withRepeat(
        withSequence(
          withTiming(OVAL_H - 24, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
        ), -1, true,
      );
    } else {
      cancelAnimation(y);
      y.value = 0;
    }
  }, [active]);
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
  if (!active) return null;
  return (
    <Animated.View style={[styles.scanLine, { backgroundColor: color, shadowColor: color }, style]} pointerEvents="none" />
  );
}

// ─── Pulsing ring ─────────────────────────────────────────────────────────────
function PulseRing({ color, active }: { color: string; active: boolean }) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.6);
  useEffect(() => {
    if (active) {
      scale.value = withRepeat(withSequence(
        withTiming(1.06, { duration: 900, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      ), -1, true);
      opacity.value = withRepeat(withSequence(
        withTiming(1, { duration: 900 }),
        withTiming(0.5, { duration: 900 }),
      ), -1, true);
    } else {
      cancelAnimation(scale);
      cancelAnimation(opacity);
      scale.value = withTiming(1);
      opacity.value = withTiming(0.6);
    }
  }, [active]);
  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
    borderColor: color,
  }));
  return <Animated.View style={[styles.pulseRing, style]} pointerEvents="none" />;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
type Status = 'idle' | 'scanning' | 'processing' | 'success' | 'fail';

export default function FaceLoginScreenMain() {
  const router = useRouter();
  const { login } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const cameraRef = useRef<CameraView>(null);

  // Soft white flash effect
  const flashOpacity = useSharedValue(0);
  const flashStyle = useAnimatedStyle(() => ({ opacity: flashOpacity.value }));

  const captureTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopTimers = useCallback(() => {
    if (captureTimer.current) { clearTimeout(captureTimer.current); captureTimer.current = null; }
    if (retryTimer.current) { clearTimeout(retryTimer.current); retryTimer.current = null; }
  }, []);

  const startCapture = useCallback((delay = 0) => {
    const run = () => {
      setStatus('scanning');
      captureTimer.current = setTimeout(() => {
        captureTimer.current = null;
        doCapture();
      }, 2000);
    };
    if (delay > 0) { retryTimer.current = setTimeout(run, delay); } else { run(); }
  }, []);

  const doCapture = async () => {
    if (!cameraRef.current) return;
    setStatus('processing');
    try {
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.35,
        shutterSound: false,
      });
      if (!photo?.base64) throw new Error('Không thể chụp ảnh');

      const data = await AuthService.loginFace(photo.base64);
      if (!data.success || !data.token) {
        throw new Error(data.message || 'Không nhận diện được khuôn mặt');
      }

      const roles: string[] = data.token?.roles || [];
      if (!roles.includes('Member')) {
        throw new Error('Tài khoản không có quyền truy cập ứng dụng');
      }

      await login(data.token.accessToken, {
        userId: data.token.userId,
        email: data.token.email,
        fullName: data.token.fullName,
        roles: data.token.roles,
      });

      // Soft white flash — nhẹ nhàng như AI scan
      flashOpacity.value = withSequence(
        withTiming(0.55, { duration: 100, easing: Easing.out(Easing.quad) }),
        withTiming(0, { duration: 650, easing: Easing.in(Easing.quad) }),
      );
      setStatus('success');
      setTimeout(() => router.replace('/home'), 1800);

    } catch (err: any) {
      setErrorMsg(err.message || 'Thử lại nhé');
      setStatus('fail');
      startCapture(4000);
    }
  };

  useEffect(() => {
    if (permission?.granted && status === 'idle') {
      const t = setTimeout(() => startCapture(), 800);
      return () => clearTimeout(t);
    }
  }, [permission, status]);

  useEffect(() => {
    if (!permission?.granted) requestPermission();
  }, [permission]);

  useEffect(() => () => stopTimers(), []);

  const frameColor = status === 'success' ? '#22C55E'
    : status === 'fail' ? '#EF4444'
      : status === 'processing' ? '#F59E0B'
        : '#22C55E';

  const statusLabel = status === 'idle' ? 'Chuẩn bị camera...'
    : status === 'scanning' ? 'Đang nhận diện khuôn mặt...'
      : status === 'processing' ? 'Đang xác thực...'
        : status === 'success' ? 'Nhận diện thành công!'
          : errorMsg || 'Thử lại...';

  return (
    <LinearGradient colors={['#0F1923', '#1A2E1F', '#0F1923']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>

        {/* Header */}
        <Animated.View entering={FadeInDown.duration(500)} style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ChevronLeft color="white" size={26} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Đăng nhập khuôn mặt</Text>
          <View style={{ width: 44 }} />
        </Animated.View>

        {/* Content */}
        <View style={styles.content}>
          <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.ovalArea}>

            {/* Pulse ring */}
            <PulseRing color={frameColor} active={status === 'scanning'} />

            {/* Oval camera */}
            <View style={[styles.ovalContainer, { borderColor: frameColor }]}>
              <View style={styles.cameraOval}>
                {permission?.granted ? (
                  <CameraView ref={cameraRef} style={{ flex: 1, width: '100%', height: '100%' }} facing="front" />
                ) : (
                  <View style={[{ flex: 1, width: '100%', height: '100%' }, { backgroundColor: '#111' }]} />
                )}
                <ScanLine active={status === 'scanning'} color={frameColor} />

                {status === 'success' && (
                  <View style={[styles.resultOverlay, { backgroundColor: 'rgba(34,197,94,0.35)' }]}>
                    <CheckCircle color="#22C55E" size={80} strokeWidth={1.5} />
                  </View>
                )}
                {status === 'fail' && (
                  <View style={[styles.resultOverlay, { backgroundColor: 'rgba(239,68,68,0.3)' }]}>
                    <XCircle color="#EF4444" size={80} strokeWidth={1.5} />
                  </View>
                )}

                {/* Soft white flash overlay */}
                <Animated.View
                  style={[
                    { flex: 1, width: '100%', height: '100%' },
                    { backgroundColor: 'white', borderRadius: OVAL_W / 2 },
                    flashStyle,
                  ]}
                  pointerEvents="none"
                />
              </View>

              {/* Corner brackets */}
              {(['TL', 'TR', 'BL', 'BR'] as const).map(pos => (
                <View key={pos} style={[styles.corner, styles[`corner${pos}`], { borderColor: frameColor }]} />
              ))}
            </View>

          </Animated.View>

          {/* Status label */}
          <Animated.View entering={FadeInUp.delay(300).springify()} style={styles.statusBox}>
            <View style={[styles.statusDot, { backgroundColor: frameColor }]} />
            <Text style={[styles.statusText, { color: frameColor }]}>{statusLabel}</Text>
          </Animated.View>

          {(status === 'scanning' || status === 'idle') && (
            <Animated.Text entering={FadeInUp.delay(400)} style={styles.hint}>
              Nhìn thẳng vào camera · Giữ điện thoại ngang tầm mắt
            </Animated.Text>
          )}
        </View>

        {/* Footer */}
        <Animated.View entering={FadeInUp.delay(500)} style={styles.footer}>
          <TouchableOpacity style={styles.altBtn} onPress={() => { stopTimers(); router.back(); }}>
            <KeyRound color="#9CA3AF" size={18} style={{ marginRight: 8 }} />
            <Text style={styles.altBtnText}>Sử dụng mật khẩu</Text>
          </TouchableOpacity>
          <Text style={styles.footerSecure}>🔒 Bảo mật bởi SmartMarketBot AI</Text>
        </Animated.View>

      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 16 : 0,
    paddingBottom: 8,
  },
  backBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { color: 'white', fontSize: 17, fontWeight: '700' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  ovalArea: {
    width: OVAL_W + 48,
    height: OVAL_H + 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 36,
  },
  pulseRing: {
    position: 'absolute',
    width: OVAL_W + 24,
    height: OVAL_H + 24,
    borderRadius: (OVAL_W + 24) / 2,
    borderWidth: 2,
  },
  ovalContainer: {
    width: OVAL_W, height: OVAL_H,
    borderRadius: OVAL_W / 2,
    borderWidth: 2.5,
    overflow: 'visible',
    position: 'relative',
  },
  cameraOval: {
    width: '100%', height: '100%',
    borderRadius: OVAL_W / 2,
    overflow: 'hidden',
    backgroundColor: '#111',
  },
  scanLine: {
    position: 'absolute', left: 20, right: 20, top: 10,
    height: 2, borderRadius: 2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9, shadowRadius: 8, elevation: 5,
  },
  corner: { position: 'absolute', width: 24, height: 24, borderWidth: 3, zIndex: 10 },
  cornerTL: { top: -6, left: -6, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 8 },
  cornerTR: { top: -6, right: -6, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 8 },
  cornerBL: { bottom: -6, left: -6, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 8 },
  cornerBR: { bottom: -6, right: -6, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 8 },
  resultOverlay: { ...{ flex: 1, width: '100%', height: '100%' }, justifyContent: 'center', alignItems: 'center' },
  statusBox: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 15, fontWeight: '600' },
  hint: { color: '#6B7280', fontSize: 13, textAlign: 'center', lineHeight: 20, paddingHorizontal: 24 },
  footer: { alignItems: 'center', paddingBottom: 32, gap: 14 },
  altBtn: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, paddingHorizontal: 24,
    borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
  },
  altBtnText: { color: '#9CA3AF', fontSize: 15, fontWeight: '600' },
  footerSecure: { color: 'rgba(255,255,255,0.25)', fontSize: 12 },
});
