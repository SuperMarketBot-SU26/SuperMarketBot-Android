import { Stack } from 'expo-router';
import React from 'react';
import { LogBox } from 'react-native';
import { AuthProvider } from '../context/AuthContext';
import { NotificationProvider } from '../context/NotificationContext';
import { RobotNavigationProvider } from '../context/RobotNavigationContext';

LogBox.ignoreLogs([
  "SafeAreaView has been deprecated",
]);

export default function RootLayout() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <RobotNavigationProvider>
          <Stack screenOptions={{ 
            headerShown: false
          }}>
            <Stack.Screen name="index" />
          </Stack>
        </RobotNavigationProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}
