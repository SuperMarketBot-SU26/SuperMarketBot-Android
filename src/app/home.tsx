import React, { useEffect } from 'react';
import HomeScreenMain from '../components/home/HomeScreenMain';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'expo-router';

export default function Home() {
  const { needsOnboarding } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (needsOnboarding) {
      router.replace('/onboarding/diet-preferences');
    }
  }, [needsOnboarding]);

  if (needsOnboarding) return null;

  return <HomeScreenMain />;
}
