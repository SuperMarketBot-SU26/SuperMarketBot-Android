import { Stack } from 'expo-router';
import React from 'react';
import { LogBox } from 'react-native';
import { AuthProvider } from '../context/AuthContext';
import { RobotNavigationProvider } from '../context/RobotNavigationContext';

import { AnimatedSplashScreen } from '../components/AnimatedSplashScreen';

LogBox.ignoreLogs([
  "SafeAreaView has been deprecated",
]);

// Tối ưu hiệu năng: Tắt console.log khi chạy trong môi trường Dev/Expo 
// để tránh làm nghẽn JS Bridge gây giật lag toàn app.
if (__DEV__) {
  const noop = () => {};
  console.log = noop;
  console.info = noop;
  console.debug = noop;
}

export default function RootLayout() {
  return (
    <AnimatedSplashScreen>
      <AuthProvider>
          <RobotNavigationProvider>
            <Stack screenOptions={{ 
              headerShown: false
            }}>
              <Stack.Screen name="index" />
            </Stack>
          </RobotNavigationProvider>
      </AuthProvider>
    </AnimatedSplashScreen>
  );
}
