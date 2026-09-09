import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import * as SplashScreen from 'expo-splash-screen';

// Ngăn màn hình splash mặc định tự động ẩn
SplashScreen.preventAutoHideAsync().catch(() => {});

export function AnimatedSplashScreen({ children }: { children: React.ReactNode }) {
  const [isAppReady, setAppReady] = useState(false);
  const [isSplashAnimationComplete, setAnimationComplete] = useState(false);

  // Shared values cho animations
  const containerOpacity = useSharedValue(1);
  const logoScale = useSharedValue(0.5);
  const logoOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(20);

  useEffect(() => {
    async function prepare() {
      try {
        // Giả lập thời gian chờ để hiệu ứng mượt hơn
        await new Promise(resolve => setTimeout(resolve, 600));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppReady(true);
      }
    }
    prepare();
  }, []);

  useEffect(() => {
    if (isAppReady) {
      // 1. Ẩn màn hình splash mặc định (app.json giờ đã là nền trắng)
      SplashScreen.hideAsync().catch(() => {});

      // 2. Hiệu ứng Logo bật lên thanh lịch (Fade in & Spring scale)
      logoOpacity.value = withTiming(1, { duration: 800 });
      logoScale.value = withSpring(1, { damping: 14, stiffness: 100 });

      // 3. Hiệu ứng Text trượt lên nhẹ nhàng bên dưới logo
      textOpacity.value = withDelay(400, withTiming(1, { duration: 800, easing: Easing.out(Easing.ease) }));
      textTranslateY.value = withDelay(400, withSpring(0, { damping: 14, stiffness: 100 }));

      // 4. Mờ dần toàn bộ màn hình Splash để vào App
      containerOpacity.value = withDelay(
        2500,
        withTiming(0, { duration: 600, easing: Easing.inOut(Easing.ease) }, (finished) => {
          if (finished) {
            runOnJS(setAnimationComplete)(true);
          }
        })
      );
    }
  }, [isAppReady]);

  // Animated styles
  const splashContainerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  return (
    <View style={styles.wrapper}>
      {/* Ứng dụng chính */}
      {children}

      {!isSplashAnimationComplete && (
        <Animated.View style={[styles.splashContainer, splashContainerStyle]}>
          <View style={styles.content}>
            {/* Logo thật của App */}
            <Animated.View style={[styles.logoContainer, logoStyle]}>
              <Image 
                source={require('../../assets/images/logo.png')} 
                style={styles.logoImage} 
                resizeMode="contain" 
              />
            </Animated.View>
            
            <Animated.View style={[styles.textContainer, textStyle]}>
              <Text style={styles.title}>SmartMarketBot</Text>
              <Text style={styles.subtitle}>Siêu thị thông minh của bạn</Text>
            </Animated.View>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  splashContainer: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#FFFFFF', // Nền trắng sạch sẽ tinh tế
    zIndex: 99999,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981', // Bóng màu xanh lá cây nhẹ
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 40,
    padding: 10,
  },
  logoImage: {
    width: 140,
    height: 140,
  },
  textContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#059669', // Xanh lá cây đậm sang trọng
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#6B7280', // Xám nhẹ tinh tế
    letterSpacing: 0.5,
  },
});
