import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import Animated, { FadeInUp, Easing } from 'react-native-reanimated';

import { useRouter } from 'expo-router';

export default function LoginFooter() {
  const router = useRouter();
  
  return (
    <>
      {/* Register Link */}
      <Animated.View entering={FadeInUp.delay(600).duration(500).easing(Easing.out(Easing.exp))} style={styles.registerContainer}>
        <Text style={styles.registerText}>
          Chưa có tài khoản?{' '}
          <Text style={styles.registerLink} onPress={() => router.push('/register')}>
            Đăng ký tài khoản.
          </Text>
        </Text>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  registerContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  registerText: {
    color: '#6B7280',
    fontSize: 13,
  },
  registerLink: {
    color: '#4B5563',
    fontWeight: '600',
  },
  imagesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 32,
    gap: 12,
  },
  bottomImage: {
    flex: 1,
    height: 70,
    borderRadius: 16,
  },
});
