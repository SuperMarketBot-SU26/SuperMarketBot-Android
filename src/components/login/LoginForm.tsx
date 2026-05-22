import { useRouter } from 'expo-router';
import { ArrowRight, AtSign, Eye, EyeOff, Lock, Smile } from 'lucide-react-native';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInLeft, FadeInRight, FadeInUp, useAnimatedStyle, useSharedValue, withSpring, Easing } from 'react-native-reanimated';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export default function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const scale = useSharedValue(1);

  const buttonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }]
    };
  });

  return (
    <Animated.View entering={FadeInUp.delay(200).duration(600).easing(Easing.out(Easing.exp))} style={styles.card}>
      <Animated.Text entering={FadeInRight.delay(300).duration(500).easing(Easing.out(Easing.exp))} style={styles.cardTitle}>Chào mừng trở lại</Animated.Text>
      <Animated.Text entering={FadeInRight.delay(350).duration(500).easing(Easing.out(Easing.exp))} style={styles.cardSubtitle}>Đăng nhập để tiếp tục trải nghiệm mua sắm</Animated.Text>

      <Animated.View entering={FadeInLeft.delay(400).duration(500).easing(Easing.out(Easing.exp))} style={styles.inputGroup}>
        <Text style={styles.label}>Email</Text>
        <View style={styles.inputContainer}>
          <AtSign color="#9CA3AF" size={20} style={styles.inputIcon} />
          <TextInput
            placeholder="example@gmail.com"
            placeholderTextColor="#9CA3AF"
            style={styles.input}
          />
        </View>
      </Animated.View>

      <Animated.View entering={FadeInRight.delay(450).duration(500).easing(Easing.out(Easing.exp))} style={styles.inputGroup}>
        <View style={styles.labelRow}>
          <Text style={styles.label}>Mật khẩu</Text>
          <TouchableOpacity><Text style={styles.forgotPassword}>Quên mật khẩu?</Text></TouchableOpacity>
        </View>
        <View style={styles.inputContainer}>
          <Lock color="#9CA3AF" size={20} style={styles.inputIcon} />
          <TextInput
            placeholder="********"
            placeholderTextColor="#9CA3AF"
            secureTextEntry={!showPassword}
            style={styles.input}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
            {showPassword ? <EyeOff color="#9CA3AF" size={20} /> : <Eye color="#9CA3AF" size={20} />}
          </TouchableOpacity>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(500).duration(500).easing(Easing.out(Easing.exp))}>
        <AnimatedTouchableOpacity
          style={[styles.loginBtn, buttonAnimatedStyle]}
          onPressIn={() => scale.value = withSpring(0.95)}
          onPressOut={() => scale.value = withSpring(1)}
          onPress={() => router.push('/onboarding/diet-preferences')}
          activeOpacity={0.9}
        >
          <Text style={styles.loginBtnText}>Đăng nhập</Text>
          <ArrowRight color="white" size={18} strokeWidth={2.5} />
        </AnimatedTouchableOpacity>
      </Animated.View>

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
    marginBottom: 24,
  },
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
});
