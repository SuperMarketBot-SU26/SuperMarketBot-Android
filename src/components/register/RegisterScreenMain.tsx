import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Animated as RNAnimated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { User, AtSign, Lock, Eye, EyeOff, ShieldCheck, ArrowRight, Phone, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp, FadeInLeft, FadeInRight, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { AuthService } from '../../services/AuthService';
import { useAuth } from '../../context/AuthContext';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

// ─── In-app Toast Component ─────────────────────────────────────────────────
type ToastType = 'success' | 'error' | 'warning';
interface Toast { message: string; type: ToastType }

function InAppToast({ toast, onHide }: { toast: Toast | null; onHide: () => void }) {
  const opacity = React.useRef(new RNAnimated.Value(0)).current;

  useEffect(() => {
    if (!toast) return;
    RNAnimated.sequence([
      RNAnimated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      RNAnimated.delay(3000),
      RNAnimated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => onHide());
  }, [toast]);

  if (!toast) return null;

  const config = {
    success: { bg: '#ECFDF5', border: '#22C55E', icon: <CheckCircle2 size={20} color="#22C55E" />, titleColor: '#166534' },
    error:   { bg: '#FEF2F2', border: '#EF4444', icon: <XCircle size={20} color="#EF4444" />,       titleColor: '#991B1B' },
    warning: { bg: '#FFFBEB', border: '#F59E0B', icon: <AlertTriangle size={20} color="#F59E0B" />, titleColor: '#92400E' },
  }[toast.type];

  return (
    <RNAnimated.View style={[toastStyles.container, { opacity, backgroundColor: config.bg, borderLeftColor: config.border }]}>
      {config.icon}
      <Text style={[toastStyles.message, { color: config.titleColor }]} numberOfLines={3}>
        {toast.message}
      </Text>
    </RNAnimated.View>
  );
}

const toastStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    zIndex: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 14,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
});
// ────────────────────────────────────────────────────────────────────────────

export default function RegisterScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  const scale = useSharedValue(1);
  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  const showToast = (message: string, type: ToastType = 'error') => {
    setToast({ message, type });
  };

  const handleRegister = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      showToast('Vui lòng điền đầy đủ thông tin bắt buộc.');
      return;
    }
    if (password !== confirmPassword) {
      showToast('Mật khẩu xác nhận không khớp.');
      return;
    }

    setIsLoading(true);
    console.log('──── [RegisterScreen] Bắt đầu đăng ký ────');
    console.log('[RegisterScreen] Payload:', { fullName, email, phone: phone || null, password: '***' });

    try {
      // ── Bước 1: Đăng ký ────────────────────────────────────────────────────
      console.log('[RegisterScreen] STEP 1 — Gọi POST /api/auth/register ...');
      await AuthService.register(fullName, email, phone || null, password);
      console.log('[RegisterScreen] STEP 1 ✓ — Đăng ký thành công (200 OK)');

      // ── Bước 2: Tự login lấy token ─────────────────────────────────────────
      console.log('[RegisterScreen] STEP 2 — Gọi POST /api/auth/login để lấy token ...');
      const loginData = await AuthService.login(email, password);
      console.log('[RegisterScreen] STEP 2 ✓ — Login thành công. userId:', loginData.userId, '| roles:', loginData.roles);

      // ── Bước 3: Lưu vào context ─────────────────────────────────────────────
      console.log('[RegisterScreen] STEP 3 — Lưu session vào AuthContext ...');
      await login(loginData.accessToken, {
        userId: loginData.userId,
        email: loginData.email,
        fullName: loginData.fullName,
        roles: loginData.roles,
      });
      console.log('[RegisterScreen] STEP 3 ✓ — Session đã lưu.');

      // ── Bước 4: Điều hướng ──────────────────────────────────────────────────
      console.log('[RegisterScreen] STEP 4 — Chuyển sang màn hình /face-register ...');
      router.push('/face-register');

    } catch (error: any) {
      console.error('[RegisterScreen] ✗ LỖI:', error);
      console.error('[RegisterScreen] error.message:', error?.message);
      console.error('[RegisterScreen] error.stack:', error?.stack);
      showToast(error.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.', 'error');
    } finally {
      setIsLoading(false);
      console.log('──── [RegisterScreen] Kết thúc ────');
    }
  };

  return (
    <LinearGradient colors={['#E8F5E9', '#F8FAFC', '#FFFFFF']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* ── In-app Toast overlay ── */}
        <InAppToast toast={toast} onHide={() => setToast(null)} />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

            {/* Logo Section */}
            <Animated.View entering={FadeInDown.delay(100).duration(800).springify()} style={styles.logoContainer}>
              <Animated.Image
                source={{ uri: 'https://res.cloudinary.com/db3ed4buc/image/upload/v1779356175/logo_v5vc8q.png' }}
                style={styles.logoImage}
                resizeMode="contain"
              />
              <Text style={styles.brandName}>Smart Market Bot</Text>
              <Text style={styles.subtitle}>Tham gia cùng chúng tôi ngay hôm nay</Text>
            </Animated.View>

            {/* Form Card */}
            <Animated.View entering={FadeInUp.delay(300).duration(800).springify()} style={styles.card}>

              {/* Họ và tên */}
              <Animated.View entering={FadeInLeft.delay(400).springify()} style={styles.inputGroup}>
                <Text style={styles.label}>Họ và tên *</Text>
                <View style={styles.inputContainer}>
                  <User color="#9CA3AF" size={20} style={styles.inputIcon} />
                  <TextInput
                    placeholder="Nguyễn Văn A"
                    placeholderTextColor="#9CA3AF"
                    style={styles.input}
                    value={fullName}
                    onChangeText={setFullName}
                  />
                </View>
              </Animated.View>

              {/* Email */}
              <Animated.View entering={FadeInRight.delay(500).springify()} style={styles.inputGroup}>
                <Text style={styles.label}>Email *</Text>
                <View style={styles.inputContainer}>
                  <AtSign color="#9CA3AF" size={20} style={styles.inputIcon} />
                  <TextInput
                    placeholder="example@gmail.com"
                    placeholderTextColor="#9CA3AF"
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </Animated.View>

              {/* Số điện thoại */}
              <Animated.View entering={FadeInLeft.delay(550).springify()} style={styles.inputGroup}>
                <Text style={styles.label}>Số điện thoại (tùy chọn)</Text>
                <View style={styles.inputContainer}>
                  <Phone color="#9CA3AF" size={20} style={styles.inputIcon} />
                  <TextInput
                    placeholder="0912345678"
                    placeholderTextColor="#9CA3AF"
                    style={styles.input}
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                  />
                </View>
              </Animated.View>

              {/* Mật khẩu */}
              <Animated.View entering={FadeInRight.delay(600).springify()} style={styles.inputGroup}>
                <Text style={styles.label}>Mật khẩu *</Text>
                <View style={styles.inputContainer}>
                  <Lock color="#9CA3AF" size={20} style={styles.inputIcon} />
                  <TextInput
                    placeholder="********"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showPassword}
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                    {showPassword ? <Eye color="#9CA3AF" size={20} /> : <EyeOff color="#9CA3AF" size={20} />}
                  </TouchableOpacity>
                </View>
              </Animated.View>

              {/* Xác nhận mật khẩu */}
              <Animated.View entering={FadeInLeft.delay(700).springify()} style={styles.inputGroup}>
                <Text style={styles.label}>Xác nhận mật khẩu *</Text>
                <View style={styles.inputContainer}>
                  <ShieldCheck color="#9CA3AF" size={20} style={styles.inputIcon} />
                  <TextInput
                    placeholder="********"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showPassword}
                    style={styles.input}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                  />
                </View>
              </Animated.View>

              {/* Button */}
              <Animated.View entering={FadeInUp.delay(800).springify()}>
                <AnimatedTouchableOpacity
                  style={[styles.registerBtn, buttonAnimatedStyle, isLoading && { opacity: 0.7 }]}
                  onPressIn={() => scale.value = withSpring(0.95)}
                  onPressOut={() => scale.value = withSpring(1)}
                  onPress={handleRegister}
                  activeOpacity={0.9}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <>
                      <Text style={styles.registerBtnText}>Tiếp tục quét khuôn mặt</Text>
                      <ArrowRight color="white" size={18} strokeWidth={2.5} />
                    </>
                  )}
                </AnimatedTouchableOpacity>
              </Animated.View>
            </Animated.View>

            {/* Footer */}
            <Animated.View entering={FadeInUp.delay(900).duration(800)} style={styles.footerContainer}>
              <Text style={styles.footerText}>Đã có tài khoản?{' '}</Text>
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.footerLink}>Đăng nhập ngay</Text>
              </TouchableOpacity>
            </Animated.View>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, padding: 24 },
  logoContainer: { alignItems: 'center', marginBottom: 32, marginTop: 16 },
  logoImage: {
    width: 80, height: 80, marginBottom: 16, borderRadius: 20,
    shadowColor: '#22C55E', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 8,
  },
  brandName: { fontSize: 24, fontWeight: '700', color: '#1F2937', marginBottom: 8 },
  subtitle: { color: '#6B7280', fontSize: 14 },
  card: {
    backgroundColor: 'white', borderRadius: 24, padding: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05, shadowRadius: 20, elevation: 5, marginBottom: 32,
  },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#4B5563', marginBottom: 8 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FAFAFA',
    borderWidth: 1, borderColor: '#F3F4F6', borderRadius: 16, height: 52, paddingHorizontal: 16,
  },
  inputIcon: { marginRight: 12 },
  eyeIcon: { padding: 4 },
  input: { flex: 1, height: '100%', color: '#1F2937', fontSize: 15 },
  registerBtn: {
    backgroundColor: '#22C55E', borderRadius: 16, height: 52,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 16,
    shadowColor: '#22C55E', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  registerBtnText: { color: 'white', fontSize: 16, fontWeight: '700', marginRight: 8 },
  footerContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingBottom: 20 },
  footerText: { color: '#9CA3AF', fontSize: 14 },
  footerLink: { color: '#22C55E', fontSize: 14, fontWeight: '700' },
});
