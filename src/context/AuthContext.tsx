import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { ProfileService, ProfileDto } from '../services/ProfileService';
import { PersonalizationService } from '../services/PersonalizationService';

let globalAvatarVersion = Date.now();

export const updateGlobalAvatarVersion = () => {
  globalAvatarVersion = Date.now();
};

type User = {
  userId: number | string;
  email: string;
  fullName: string | null;
  roles: string[];
};

type AuthContextType = {
  user: User | null;
  profile: ProfileDto | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  needsOnboarding: boolean;
  completeOnboarding: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileDto | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  const completeOnboarding = async () => {
    setNeedsOnboarding(false);
    await SecureStore.setItemAsync('onboardingCompleted', 'true');
  };

  const refreshProfile = async () => {
    try {
      const p = await ProfileService.getProfile();
      if (p.facePath) {
        // Bypass image cache without flickering on every focus
        p.facePath = `${p.facePath}?v=${globalAvatarVersion}`;
      }
      setProfile(p);

      // Check if user needs onboarding
      const onboardingCompleted = await SecureStore.getItemAsync('onboardingCompleted');
      if (onboardingCompleted !== 'true') {
        try {
          const healthPrefs = await PersonalizationService.getHealthPreferences();
          const hasPreferences = healthPrefs.allergies?.length > 0 || healthPrefs.avoids?.length > 0 || healthPrefs.preferreds?.length > 0;
          const hasBudget = p.spendingLimit !== null && p.spendingLimit !== undefined;

          if (!hasPreferences && !hasBudget) {
            setNeedsOnboarding(true);
          } else {
            // Already configured on another device
            completeOnboarding();
          }
        } catch (prefsError) {
          console.warn('Failed to fetch health preferences for onboarding check', prefsError);
          setNeedsOnboarding(true);
        }
      }
    } catch (e: any) {
      console.warn('Failed to refresh profile', e);
      if (e.message && (e.message.includes('401') || e.message.includes('404'))) {
        console.log('Phiên đăng nhập không hợp lệ hoặc tài khoản đã bị xoá, tiến hành logout...');
        await logout();
      }
    }
  };

  useEffect(() => {
    // Load stored token and user info on app start
    const loadAuthData = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync('userToken');
        const storedUser = await SecureStore.getItemAsync('userInfo');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (e) {
        console.error('Failed to load auth data', e);
      } finally {
        setIsLoading(false);
      }
    };

    loadAuthData();
  }, []);

  useEffect(() => {
    if (token) {
      refreshProfile();
    } else {
      setProfile(null);
    }
  }, [token]);

  const login = async (newToken: string, newUser: User) => {
    try {
      await SecureStore.setItemAsync('userToken', newToken);
      await SecureStore.setItemAsync('userInfo', JSON.stringify(newUser));
      setToken(newToken);
      setUser(newUser);
    } catch (e) {
      console.error('Failed to save auth data', e);
    }
  };

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync('userToken');
      await SecureStore.deleteItemAsync('userInfo');
      setToken(null);
      setUser(null);
    } catch (e) {
      console.error('Failed to clear auth data', e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, token, isLoading, login, logout, refreshProfile, needsOnboarding, completeOnboarding }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
