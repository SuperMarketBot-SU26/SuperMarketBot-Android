import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ChevronLeft, ScanFace, KeyRound } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp, withRepeat, withSequence, withTiming, useSharedValue, useAnimatedStyle, Easing } from 'react-native-reanimated';
import { useCameraPermissions, CameraView } from 'expo-camera';

export default function FaceLoginScreenMain() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const scanLineY = useSharedValue(0);

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  useEffect(() => {
    // Scan line animation
    scanLineY.value = withRepeat(
      withSequence(
        withTiming(150, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const animatedScanLineStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: scanLineY.value }]
    };
  });

  return (
    <LinearGradient colors={['#E8F5E9', '#F8FAFC', '#FFFFFF']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>

        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft color="#1F2937" size={28} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Đăng nhập bằng khuôn mặt</Text>
          <View style={{ width: 44 }} />
        </View>

        <View style={styles.content}>
          {/* Scanner Area */}
          <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.scannerContainer}>
            <View style={styles.scannerBox}>

              {/* Brackets */}
              <View style={[styles.bracket, styles.bracketTL]} />
              <View style={[styles.bracket, styles.bracketTR]} />
              <View style={[styles.bracket, styles.bracketBL]} />
              <View style={[styles.bracket, styles.bracketBR]} />

              {/* Camera Preview or Placeholder */}
              <View style={styles.cameraFrame}>
                {permission?.granted ? (
                  <CameraView style={styles.camera} facing="front" />
                ) : (
                  <View style={styles.cameraPlaceholder} />
                )}

                <View style={styles.faceOverlay}>
                  <ScanFace color="#86EFAC" size={120} strokeWidth={1} />
                </View>

                {/* Animated Scan Line */}
                <Animated.View style={[styles.scanLine, animatedScanLineStyle]} />
              </View>
            </View>
          </Animated.View>

          {/* Status Text */}
          <Animated.View entering={FadeInUp.delay(400).springify()} style={styles.statusContainer}>
            <View style={styles.statusDotRow}>
              <View style={styles.statusDot} />
              <Text style={styles.statusTitle}>Đang nhận diện...</Text>
            </View>
            <Text style={styles.statusSubtitle}>Vui lòng giữ khuôn mặt trong khung hình</Text>
          </Animated.View>

          {/* Buttons */}
          <Animated.View entering={FadeInUp.delay(600).springify()} style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
              <Text style={styles.cancelButtonText}>Hủy bỏ</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.passwordButton} onPress={() => router.back()}>
              <KeyRound color="#166534" size={20} style={{ marginRight: 8 }} />
              <Text style={styles.passwordButtonText}>Sử dụng mật khẩu</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Footer */}
        <Animated.View entering={FadeInUp.delay(800).springify()} style={styles.footerContainer}>
          <Text style={styles.footerText}>Bảo mật bởi </Text>
          <Text style={styles.footerBrand}>SmartMarketBot AI</Text>
        </Animated.View>

      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 20 : 0,
    marginBottom: 40,
  },
  backButton: {
    width: 44,
    height: 44,
    backgroundColor: 'white',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  scannerContainer: {
    marginBottom: 32,
  },
  scannerBox: {
    width: 260,
    height: 260,
    backgroundColor: 'white',
    borderRadius: 40,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    position: 'relative',
  },
  cameraFrame: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    ...StyleSheet.absoluteFillObject,
  },
  cameraPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F0FDF4',
  },
  faceOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.6,
  },
  scanLine: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    height: 3,
    backgroundColor: '#22C55E',
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 5,
    borderRadius: 2,
  },
  bracket: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#22C55E',
  },
  bracketTL: { top: 24, left: 24, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 16 },
  bracketTR: { top: 24, right: 24, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 16 },
  bracketBL: { bottom: 24, left: 24, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 16 },
  bracketBR: { bottom: 24, right: 24, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 16 },

  statusContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  statusDotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22C55E',
    marginRight: 8,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B5563',
  },
  statusSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  cancelButton: {
    backgroundColor: '#166534',
    height: 54,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  passwordButton: {
    backgroundColor: 'white',
    height: 54,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  passwordButtonText: {
    color: '#166534',
    fontSize: 15,
    fontWeight: '700',
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: 24,
  },
  footerText: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  footerBrand: {
    color: '#166534',
    fontSize: 12,
    fontWeight: '700',
  }
});
