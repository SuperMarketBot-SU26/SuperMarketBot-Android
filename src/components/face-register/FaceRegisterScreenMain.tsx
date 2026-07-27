import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Platform,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { CheckCircle, XCircle } from 'lucide-react-native';
import Animated, {
  FadeInDown, FadeInUp,
  useSharedValue, useAnimatedStyle,
  withRepeat, withSequence, withTiming, withSpring,
  Easing, cancelAnimation,
} from 'react-native-reanimated';
import { useCameraPermissions, CameraView } from 'expo-camera';
import { AuthService } from '../../services/AuthService';
import { useAuth } from '../../context/AuthContext';

const LOGIN_ROUTE = '/login' as any;

const { width: SCREEN_W } = Dimensions.get('window');
const OVAL_W = SCREEN_W * 0.62;
const OVAL_H = OVAL_W * 1.28;

function ScanLine({ active, color }: { active: boolean; color: string }) {
  const y = useSharedValue(0);
  useEffect(() => {
    if (active) {
      y.value = withRepeat(
        withSequence(
          withTiming(OVAL_H - 24, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
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

function PulseRing({ color, active }: { color: string; active: boolean }) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.5);
  useEffect(() => {
    if (active) {
      scale.value = withRepeat(withSequence(
        withTiming(1.07, { duration: 900, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      ), -1, true);
      opacity.value = withRepeat(withSequence(
        withTiming(1, { duration: 900 }), withTiming(0.4, { duration: 900 }),
      ), -1, true);
    } else {
      cancelAnimation(scale); cancelAnimation(opacity);
      scale.value = withTiming(1); opacity.value = withTiming(0.5);
    }
  }, [active]);
  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }], opacity: opacity.value, borderColor: color,
  }));
  return <Animated.View style={[styles.pulseRing, style]} pointerEvents="none" />;
}

type Status = 'idle' | 'scanning' | 'processing' | 'success' | 'fail';

export default function FaceRegisterScreenMain() {
  const router = useRouter();
  const { token, logout } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const [status, setStatus] = useState<Status>('idle');
  const [countdown, setCountdown] = useState(3);
  const [errorMsg, setErrorMsg] = useState('');
  const [isDone, setIsDone] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  const flashOpacity = useSharedValue(0);
  const flashStyle = useAnimatedStyle(() => ({ opacity: flashOpacity.value }));
  const countdownTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopCountdown = useCallback(() => {
    if (countdownTimer.current) { clearTimeout(countdownTimer.current); countdownTimer.current = null; }
    if (retryTimer.current) { clearTimeout(retryTimer.current); retryTimer.current = null; }
  }, []);

  const startCapture = useCallback((delay = 0) => {
    const run = () => {
      setStatus('scanning');
      countdownTimer.current = setTimeout(() => {
        countdownTimer.current = null;
        doCapture();
      }, 1200);
    };
    if (delay > 0) { retryTimer.current = setTimeout(run, delay); } else { run(); }
  }, [isDone]);

  const doCapture = async () => {
    if (!cameraRef.current) return;
    setStatus('processing');
    try {
      if (!token) throw new Error('Phiên đăng nhập hết hạn. Vui lòng thử lại.');
      const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.35, shutterSound: false });
      if (!photo?.base64) throw new Error('Không thể chụp ảnh');

      await AuthService.registerFace(photo.base64, token);

      // Soft white flash
      flashOpacity.value = withSequence(
        withTiming(0.55, { duration: 100, easing: Easing.out(Easing.quad) }),
        withTiming(0, { duration: 700, easing: Easing.in(Easing.quad) }),
      );
      setStatus('success');
      setIsDone(true);

      // Xóa session tạm — user phải đăng nhập lại chính thức
      await logout();

      // Chuyển về login sau 2s
      setTimeout(() => router.replace(LOGIN_ROUTE), 2000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Thử lại nhé');
      setStatus('fail');
      if (!isDone) startCapture(4000);
    }
  };

  useEffect(() => {
    if (permission?.granted && status === 'idle' && !isDone) {
      const t = setTimeout(() => startCapture(), 800);
      return () => clearTimeout(t);
    }
  }, [permission, status, isDone]);

  useEffect(() => { if (!permission?.granted) requestPermission(); }, [permission]);
  useEffect(() => () => stopCountdown(), []);

  const frameColor = status === 'success' ? '#22C55E'
    : status === 'fail' ? '#EF4444'
    : status === 'processing' ? '#F59E0B'
    : '#3B82F6';

  const statusLabel = status === 'idle' ? 'Chuẩn bị camera...'
    : status === 'scanning' ? `Giữ khuôn mặt trong khung  ${countdown}`
    : status === 'processing' ? 'Đang lưu khuôn mặt...'
    : status === 'success' ? 'Đăng ký khuôn mặt thành công!'
    : errorMsg || 'Thử lại...';

  return (
    <LinearGradient colors={['#0F1923', '#1C1F3A', '#0F1923']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>

        {/* Header */}
        <Animated.View entering={FadeInDown.duration(500)} style={styles.header}>
          <Text style={styles.headerTitle}>Đăng ký khuôn mặt</Text>
          <View style={styles.stepRow}>
            <View style={styles.stepDone}><Text style={styles.stepText}>✓</Text></View>
            <View style={[styles.stepLine, isDone && { backgroundColor: '#22C55E' }]} />
            <View style={[styles.stepActive, isDone && { backgroundColor: '#22C55E' }]}>
              <Text style={styles.stepText}>{isDone ? '✓' : '2'}</Text>
            </View>
          </View>
          <Text style={styles.stepLabel}>Bước 2/2 — Xác thực khuôn mặt</Text>
        </Animated.View>

        <View style={styles.content}>
          <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.ovalArea}>
            <PulseRing color={frameColor} active={status === 'scanning'} />

            <View style={[styles.ovalContainer, { borderColor: frameColor }]}>
              <View style={styles.cameraOval}>
                {permission?.granted ? (
                  <CameraView ref={cameraRef} style={StyleSheet.absoluteFillObject} facing="front" />
                ) : (
                  <View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#111' }]} />
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
                {/* Soft white flash */}
                <Animated.View
                  style={[StyleSheet.absoluteFillObject, { backgroundColor: 'white', borderRadius: OVAL_W / 2 }, flashStyle]}
                  pointerEvents="none"
                />
              </View>

              {(['TL','TR','BL','BR'] as const).map(pos => (
                <View key={pos} style={[styles.corner, styles[`corner${pos}`], { borderColor: frameColor }]} />
              ))}
            </View>

          </Animated.View>

          <Animated.View entering={FadeInUp.delay(300).springify()} style={styles.statusBox}>
            <View style={[styles.statusDot, { backgroundColor: frameColor }]} />
            <Text style={[styles.statusText, { color: frameColor }]}>{statusLabel}</Text>
          </Animated.View>

          {(status === 'scanning' || status === 'idle') && (
            <Animated.Text entering={FadeInUp.delay(400)} style={styles.hint}>
              Nhìn thẳng vào camera · Xoay nhẹ đầu sang trái và phải
            </Animated.Text>
          )}
        </View>

        {/* Footer */}
        <Animated.View entering={FadeInUp.delay(500)} style={styles.footer}>
          {isDone ? (
            <TouchableOpacity style={styles.primaryBtn} onPress={() => router.replace(LOGIN_ROUTE)}>
              <CheckCircle color="white" size={20} style={{ marginRight: 8 }} />
              <Text style={styles.primaryBtnText}>Đăng nhập ngay</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.skipBtn} onPress={async () => { stopCountdown(); await logout(); router.replace(LOGIN_ROUTE); }}>
              <Text style={styles.skipBtnText}>Bỏ qua, đăng nhập sau</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.footerSecure}>🔒 Bảo mật bởi SmartMarketBot AI</Text>
        </Animated.View>

      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: { alignItems: 'center', paddingTop: Platform.OS === 'android' ? 16 : 0, paddingBottom: 8, gap: 8 },
  headerTitle: { color: 'white', fontSize: 18, fontWeight: '700' },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stepDone: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#22C55E', justifyContent: 'center', alignItems: 'center' },
  stepActive: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#3B82F6', justifyContent: 'center', alignItems: 'center' },
  stepText: { color: 'white', fontWeight: '700', fontSize: 12 },
  stepLine: { width: 32, height: 2, backgroundColor: '#374151' },
  stepLabel: { color: '#6B7280', fontSize: 12 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  ovalArea: {
    width: OVAL_W + 48, height: OVAL_H + 48,
    justifyContent: 'center', alignItems: 'center', marginBottom: 36,
  },
  pulseRing: {
    position: 'absolute',
    width: OVAL_W + 20, height: OVAL_H + 20,
    borderRadius: (OVAL_W + 20) / 2, borderWidth: 2,
  },
  ovalContainer: {
    width: OVAL_W, height: OVAL_H,
    borderRadius: OVAL_W / 2, borderWidth: 2.5,
    overflow: 'visible', position: 'relative',
  },
  cameraOval: {
    width: '100%', height: '100%',
    borderRadius: OVAL_W / 2, overflow: 'hidden', backgroundColor: '#111',
  },
  scanLine: {
    position: 'absolute', left: 20, right: 20, top: 10, height: 2, borderRadius: 2,
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.9, shadowRadius: 8, elevation: 5,
  },
  corner: { position: 'absolute', width: 24, height: 24, borderWidth: 3, zIndex: 10 },
  cornerTL: { top: -6, left: -6, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 8 },
  cornerTR: { top: -6, right: -6, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 8 },
  cornerBL: { bottom: -6, left: -6, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 8 },
  cornerBR: { bottom: -6, right: -6, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 8 },
  resultOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  dotsRow: { position: 'absolute', bottom: -22, flexDirection: 'row', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  statusBox: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 15, fontWeight: '600' },
  hint: { color: '#6B7280', fontSize: 13, textAlign: 'center', lineHeight: 20, paddingHorizontal: 24 },
  footer: { alignItems: 'center', paddingBottom: 32, gap: 14 },
  primaryBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#22C55E', paddingVertical: 14, paddingHorizontal: 32,
    borderRadius: 16, shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 6,
  },
  primaryBtnText: { color: 'white', fontSize: 16, fontWeight: '700' },
  skipBtn: {
    paddingVertical: 12, paddingHorizontal: 28,
    borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
  },
  skipBtnText: { color: '#6B7280', fontSize: 14, fontWeight: '600' },
  footerSecure: { color: 'rgba(255,255,255,0.25)', fontSize: 12 },
});
