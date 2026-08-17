import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { AlertCircle, ArrowRight, AtSign, Eye, EyeOff, Lock, Smile } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, {
  Easing,
  FadeInLeft, FadeInRight, FadeInUp,
  SlideInUp, SlideOutUp,
  useAnimatedStyle, useSharedValue, withSpring
} from 'react-native-reanimated';
import { useAuth } from '../../context/AuthContext';
import { AuthService } from '../../services/AuthService';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

// ─── Inline Toast ─────────────────────────────────────────────────────────────
type ToastType = 'error' | 'success' | 'warning';

function InlineToast({ message, type }: { message: string; type: ToastType }) {
  const bgColor = type === 'error' ? '#FEF2F2'
    : type === 'success' ? '#F0FDF4'
      : '#FFFBEB';
  const borderColor = type === 'error' ? '#FECACA'
    : type === 'success' ? '#BBF7D0'
      : '#FDE68A';
  const textColor = type === 'error' ? '#DC2626'
    : type === 'success' ? '#16A34A'
      : '#D97706';

  return (
    <Animated.View
      entering={SlideInUp.duration(280).easing(Easing.out(Easing.back(1.2)))}
      exiting={SlideOutUp.duration(200)}
      style={[styles.toast, { backgroundColor: bgColor, borderColor }]}
    >
      <AlertCircle color={textColor} size={16} style={{ marginRight: 8, flexShrink: 0 }} />
      <Text style={[styles.toastText, { color: textColor }]} numberOfLines={3}>
        {message}
      </Text>
    </Animated.View>
  );
}

export default function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const scale = useSharedValue(1);

  // Forgot password state
  const [isForgotModalVisible, setForgotModalVisible] = useState(false);
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [forgotEmail, setForgotEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isForgotLoading, setIsForgotLoading] = useState(false);

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const showToast = (message: string, type: ToastType = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      showToast('Vui lòng nhập email và mật khẩu', 'warning');
      return;
    }

    setIsLoading(true);
    setToast(null);
    try {
      const data = await AuthService.login(email, password);

      if (!data.roles || !data.roles.includes('Member')) {
        showToast('Tài khoản không có quyền truy cập ứng dụng này (Chỉ dành cho Member).', 'error');
        return;
      }

      await login(data.accessToken, {
        userId: data.userId,
        email: data.email,
        fullName: data.fullName,
        roles: data.roles,
      });

      const onboardingCompleted = await SecureStore.getItemAsync('onboardingCompleted');

      showToast('Đăng nhập thành công!', 'success');
      setTimeout(() => {
        if (onboardingCompleted === 'true') {
          router.replace('/home');
        } else {
          router.replace('/onboarding/diet-preferences');
        }
      }, 600);
    } catch (error: any) {
      // Hiển thị đúng message từ BE
      showToast(error.message || 'Đã có lỗi xảy ra, vui lòng thử lại.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail) {
      showToast('Vui lòng nhập email', 'warning');
      return;
    }
    setIsForgotLoading(true);
    try {
      await AuthService.forgotPassword(forgotEmail);
      showToast('Đã gửi mã OTP đến email của bạn!', 'success');
      setForgotStep(2);
    } catch (error: any) {
      showToast(error.message || 'Lỗi gửi yêu cầu', 'error');
    } finally {
      setIsForgotLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!otpCode || !newPassword) {
      showToast('Vui lòng nhập đầy đủ mã OTP và mật khẩu mới', 'warning');
      return;
    }
    setIsForgotLoading(true);
    try {
      await AuthService.resetPassword(forgotEmail, otpCode, newPassword);
      showToast('Đổi mật khẩu thành công!', 'success');
      setForgotModalVisible(false);
      setForgotStep(1);
      setForgotEmail('');
      setOtpCode('');
      setNewPassword('');
    } catch (error: any) {
      showToast(error.message || 'Lỗi đặt lại mật khẩu', 'error');
    } finally {
      setIsForgotLoading(false);
    }
  };

  return (
    <Animated.View entering={FadeInUp.delay(200).duration(600).easing(Easing.out(Easing.exp))} style={styles.card}>
      <Animated.Text entering={FadeInRight.delay(300).duration(500).easing(Easing.out(Easing.exp))} style={styles.cardTitle}>
        Chào mừng trở lại
      </Animated.Text>
      <Animated.Text entering={FadeInRight.delay(350).duration(500).easing(Easing.out(Easing.exp))} style={styles.cardSubtitle}>
        Đăng nhập để tiếp tục trải nghiệm mua sắm
      </Animated.Text>

      {/* ── Toast ── */}
      {toast && <InlineToast message={toast.message} type={toast.type} />}

      {/* ── Email ── */}
      <Animated.View entering={FadeInLeft.delay(400).duration(500).easing(Easing.out(Easing.exp))} style={styles.inputGroup}>
        <Text style={styles.label}>Email</Text>
        <View style={styles.inputContainer}>
          <AtSign color="#9CA3AF" size={20} style={styles.inputIcon} />
          <TextInput
            placeholder="example@gmail.com"
            placeholderTextColor="#9CA3AF"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>
      </Animated.View>

      {/* ── Password ── */}
      <Animated.View entering={FadeInRight.delay(450).duration(500).easing(Easing.out(Easing.exp))} style={styles.inputGroup}>
        <View style={styles.labelRow}>
          <Text style={styles.label}>Mật khẩu</Text>
        </View>
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
            {showPassword ? <EyeOff color="#9CA3AF" size={20} /> : <Eye color="#9CA3AF" size={20} />}
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* ── Login button ── */}
      <Animated.View entering={FadeInUp.delay(500).duration(500).easing(Easing.out(Easing.exp))}>
        <AnimatedTouchableOpacity
          style={[styles.loginBtn, buttonAnimatedStyle, isLoading && { opacity: 0.7 }]}
          onPressIn={() => scale.value = withSpring(0.95)}
          onPressOut={() => scale.value = withSpring(1)}
          onPress={handleLogin}
          activeOpacity={0.9}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Text style={styles.loginBtnText}>Đăng nhập</Text>
              <ArrowRight color="white" size={18} strokeWidth={2.5} />
            </>
          )}
        </AnimatedTouchableOpacity>
      </Animated.View>

      {/* ── Face login ── */}
      <Animated.View entering={FadeInUp.delay(550).duration(500).easing(Easing.out(Easing.exp))}>
        <AnimatedTouchableOpacity
          style={styles.faceLoginBtn}
          activeOpacity={0.7}
          onPress={() => router.push('/face-login')}
        >
          <Smile color="#6B7280" size={20} style={{ marginRight: 8 }} />
          <Text style={styles.faceLoginText}>Đăng nhập bằng khuôn mặt</Text>
        </AnimatedTouchableOpacity>
      </Animated.View>
      {/* Forgot Password Modal */}
      <Modal visible={isForgotModalVisible} transparent animationType="fade" onRequestClose={() => setForgotModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {forgotStep === 1 ? (
              <>
                <Text style={styles.modalSubtitle}>Nhập email của bạn để nhận mã OTP khôi phục mật khẩu.</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Email"
                  value={forgotEmail}
                  onChangeText={setForgotEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
                <TouchableOpacity style={styles.modalBtnPrimary} onPress={handleForgotPassword} disabled={isForgotLoading}>
                  {isForgotLoading ? <ActivityIndicator color="white" /> : <Text style={styles.modalBtnPrimaryText}>Gửi mã OTP</Text>}
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.modalSubtitle}>Nhập mã OTP và mật khẩu mới của bạn.</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Mã OTP"
                  value={otpCode}
                  onChangeText={setOtpCode}
                  keyboardType="number-pad"
                />
                <TextInput
                  style={styles.modalInput}
                  placeholder="Mật khẩu mới"
                  secureTextEntry
                  value={newPassword}
                  onChangeText={setNewPassword}
                />
                <TouchableOpacity style={styles.modalBtnPrimary} onPress={handleResetPassword} disabled={isForgotLoading}>
                  {isForgotLoading ? <ActivityIndicator color="white" /> : <Text style={styles.modalBtnPrimaryText}>Đặt lại mật khẩu</Text>}
                </TouchableOpacity>
              </>
            )}
            <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setForgotModalVisible(false)} disabled={isForgotLoading}>
              <Text style={styles.modalBtnCancelText}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 6,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  // ── Toast ──────────────────────────────────────────
  toast: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  toastText: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
    lineHeight: 19,
  },
  // ── Inputs ─────────────────────────────────────────
  inputGroup: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 8,
  },
  forgotPassword: {
    fontSize: 13,
    fontWeight: '600',
    color: '#22C55E',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    height: 52,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  eyeIcon: {
    padding: 4,
  },
  input: {
    flex: 1,
    height: '100%',
    color: '#1F2937',
    fontSize: 15,
  },
  // ── Buttons ────────────────────────────────────────
  loginBtn: {
    backgroundColor: '#22C55E',
    borderRadius: 16,
    height: 52,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },
  faceLoginBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FAFAFA',
  },
  faceLoginText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    width: '100%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    marginBottom: 16,
  },
  modalBtnPrimary: {
    backgroundColor: '#00A550',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  modalBtnPrimaryText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  modalBtnCancel: {
    padding: 16,
    alignItems: 'center',
  },
  modalBtnCancelText: {
    color: '#6B7280',
    fontWeight: '500',
    fontSize: 15,
  }
});
