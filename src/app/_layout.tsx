import { Stack } from 'expo-router';
import React from 'react';
import { LogBox } from 'react-native';

LogBox.ignoreLogs([
  "SafeAreaView has been deprecated",
]);

export default function RootLayout() {
  return (
    <Stack screenOptions={{ 
      headerShown: false,
      animation: 'slide_from_right'
    }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}
