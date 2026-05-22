import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInDown, ZoomIn, Easing } from 'react-native-reanimated';

export default function LoginHeader() {
  return (
    <Animated.View entering={FadeInDown.delay(100).duration(600).easing(Easing.out(Easing.exp))} style={styles.logoContainer}>
      <Animated.Image
        entering={ZoomIn.delay(200).duration(500).easing(Easing.out(Easing.back(1.5)))}
        source={{ uri: 'https://res.cloudinary.com/db3ed4buc/image/upload/v1779356175/logo_v5vc8q.png' }}
        style={styles.logoImage}
        resizeMode="contain"
      />
      <Animated.Text entering={FadeInDown.delay(300).duration(500).easing(Easing.out(Easing.exp))} style={styles.brandName}>
        <Text style={styles.brandFresh}>Smart</Text>
        <Text style={styles.brandData}>MarketBot</Text>
      </Animated.Text>
      <Animated.Text entering={FadeInDown.delay(400).duration(500).easing(Easing.out(Easing.exp))} style={styles.subtitle}>
        Ứng dụng nâng cao trải nghiệm mua sắm của bạn
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  logoContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
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
    fontSize: 32,
    fontWeight: '800',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  brandFresh: {
    color: '#22C55E',
  },
  brandData: {
    color: '#4ADE80',
  },
  subtitle: {
    color: '#9CA3AF',
    fontSize: 13,
  },
});
