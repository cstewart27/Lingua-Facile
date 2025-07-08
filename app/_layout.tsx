import React, { useEffect, useState } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import * as Speech from 'expo-speech';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { supabase } from '../utils/supabase';

import { useColorScheme } from '@/hooks/useColorScheme';
import LoginScreen from './LoginScreen';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const [authChecked, setAuthChecked] = useState(false);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setAuthChecked(true);
    };
    getSession();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // Fetch and store available voices on startup
  useEffect(() => {
    const fetchAndStoreVoices = async () => {
      try {
        const voices = await Speech.getAvailableVoicesAsync();
        await AsyncStorage.setItem('availableVoices', JSON.stringify(voices));
      } catch (e) {
        // Optionally handle error
      }
    };
    fetchAndStoreVoices();
  }, []);

  if (!loaded || !authChecked) {
    return null;
  }

  if (!session) {
    return <LoginScreen onLogin={() => {
      supabase.auth.getSession().then(({ data }) => setSession(data.session));
    }} />;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
