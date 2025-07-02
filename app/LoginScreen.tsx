import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator, Image, Platform } from 'react-native';
import { supabase } from '../utils/supabase';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

export default function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn');

  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const handleAuth = async () => {
    setLoading(true);
    let result;
    if (mode === 'signIn') {
      result = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (result.error) {
        Alert.alert('Error', result.error.message);
      } else {
        onLogin();
      }
    } else {
      result = await supabase.auth.signUp({ email, password });
      setLoading(false);
      if (result.error) {
        Alert.alert('Error', result.error.message);
      } else if (result.data.session) {
        // User is signed in immediately (no email confirmation required)
        onLogin();
      } else {
        Alert.alert('Check your email', 'Please confirm your email address to complete sign up.');
      }
    }
  };

  const handleGuest = async () => {
    setLoading(true);
    const result = await supabase.auth.signInAnonymously();
    setLoading(false);
    if (result.error) {
      Alert.alert('Error', result.error.message);
    } else if (result.data.session) {
      onLogin();
    }
  };

  return (
    <View style={[styles.outer, { backgroundColor: theme.background }]}>
      <Animated.View entering={FadeIn.duration(600)} exiting={FadeOut.duration(400)} style={[styles.card, { backgroundColor: theme.card, shadowColor: theme.text }]}>
        <Image source={require('../assets/images/icon.png')} style={styles.logo} />
        <Text style={[styles.title, { color: theme.text }]}>{mode === 'signIn' ? 'Sign In' : 'Sign Up'}</Text>
        <Animated.View style={{ width: '100%' }}>
          <TextInput
            style={[styles.input, { color: theme.text, backgroundColor: theme.background, borderColor: theme.icon }]}
            placeholder="Email"
            placeholderTextColor={theme.icon}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={[styles.input, { color: theme.text, backgroundColor: theme.background, borderColor: theme.icon }]}
            placeholder="Password"
            placeholderTextColor={theme.icon}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </Animated.View>
        {loading ? <ActivityIndicator color={theme.tint} /> : (
          <Animated.View style={{ width: '100%' }}>
            <Button title={mode === 'signIn' ? 'Sign In' : 'Sign Up'} onPress={handleAuth} color={theme.tint} />
            <View style={{ height: 12 }} />
            <Button
              title="Continue as Guest"
              onPress={handleGuest}
              color={theme.icon}
            />
          </Animated.View>
        )}
        <View style={{ height: 16 }} />
        <Animated.View>
          <Button
            title={mode === 'signIn' ? 'No account? Sign Up' : 'Have an account? Sign In'}
            onPress={() => setMode(mode === 'signIn' ? 'signUp' : 'signIn')}
            color={theme.icon}
          />
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  card: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    // Only apply elevation on iOS (no shadow on Android)
    elevation: Platform.OS === 'ios' ? 8 : 0,
  },
  logo: {
    width: 64,
    height: 64,
    marginBottom: 24,
    borderRadius: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    letterSpacing: 1.2,
  },
  input: {
    width: '100%',
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#ccc',
    borderRadius: 12,
    marginBottom: 18,
    backgroundColor: '#f7f7f7',
    fontSize: 16,
  },
});
