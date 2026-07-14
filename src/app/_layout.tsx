import { Stack } from 'expo-router';
import React from 'react';
import { LogBox } from 'react-native';
import { AuthProvider } from '../context/AuthContext';
import { NotificationProvider } from '../context/NotificationContext';

LogBox.ignoreLogs([
  "SafeAreaView has been deprecated",
]);

export default function RootLayout() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Stack screenOptions={{ 
          headerShown: false
        }}>
          <Stack.Screen name="index" />
        </Stack>
      </NotificationProvider>
    </AuthProvider>
  );
}
