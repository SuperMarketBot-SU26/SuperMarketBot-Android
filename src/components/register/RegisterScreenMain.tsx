import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ArrowLeft, Leaf, User, AtSign, Lock, Eye, EyeOff, ShieldCheck, ArrowRight, Smile } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp, FadeInLeft, FadeInRight, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export default function RegisterScreen() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const scale = useSharedValue(1);
  const buttonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }]
    };
  });

  return (
    <LinearGradient colors={['#E8F5E9', '#F8FAFC', '#FFFFFF']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
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

              {/* Name Input */}
              <Animated.View entering={FadeInLeft.delay(400).springify()} style={styles.inputGroup}>
                <Text style={styles.label}>Họ và tên</Text>
                <View style={styles.inputContainer}>
                  <User color="#9CA3AF" size={20} style={styles.inputIcon} />
                  <TextInput
                    placeholder="Nguyễn Văn A"
                    placeholderTextColor="#9CA3AF"
                    style={styles.input}
                  />
                </View>
              </Animated.View>

              {/* Email/Phone Input */}
              <Animated.View entering={FadeInRight.delay(500).springify()} style={styles.inputGroup}>
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

              {/* Password Input */}
              <Animated.View entering={FadeInLeft.delay(600).springify()} style={styles.inputGroup}>
                <Text style={styles.label}>Mật khẩu</Text>
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

              {/* Confirm Password Input */}
              <Animated.View entering={FadeInRight.delay(700).springify()} style={styles.inputGroup}>
                <Text style={styles.label}>Xác nhận mật khẩu</Text>
                <View style={styles.inputContainer}>
                  <ShieldCheck color="#9CA3AF" size={20} style={styles.inputIcon} />
                  <TextInput
                    placeholder="********"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showPassword}
                    style={styles.input}
                  />
                </View>
              </Animated.View>

              {/* Next Step Button */}
              <Animated.View entering={FadeInUp.delay(800).springify()}>
                <AnimatedTouchableOpacity
                  style={[styles.registerBtn, buttonAnimatedStyle]}
                  onPressIn={() => scale.value = withSpring(0.95)}
                  onPressOut={() => scale.value = withSpring(1)}
                  onPress={() => router.push('/face-register')}
                  activeOpacity={0.9}
                >
                  <Text style={styles.registerBtnText}>Tiếp tục quét khuôn mặt</Text>
                  <ArrowRight color="white" size={18} strokeWidth={2.5} />
                </AnimatedTouchableOpacity>
              </Animated.View>
            </Animated.View>

            {/* Footer Link */}
            <Animated.View entering={FadeInUp.delay(900).duration(800)} style={styles.footerContainer}>
              <Text style={styles.footerText}>
                Đã có tài khoản?{' '}
              </Text>
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
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  topBar: {
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoImage: {
    width: 80,
    height: 80,
    marginBottom: 16,
    borderRadius: 20,
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  brandName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    color: '#6B7280',
    fontSize: 14,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 5,
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#F3F4F6',
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
  registerBtn: {
    backgroundColor: '#22C55E',
    borderRadius: 16,
    height: 52,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  registerBtnText: {
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
    marginTop: 12,
  },
  faceLoginText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '600',
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
  },
  footerText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  footerLink: {
    color: '#22C55E',
    fontSize: 14,
    fontWeight: '700',
  }
});
