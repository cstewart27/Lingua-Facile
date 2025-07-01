import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '../utils/supabase';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

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
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>{mode === 'signIn' ? 'Sign In' : 'Sign Up'}</Text>
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
      {loading ? <ActivityIndicator color={theme.tint} /> : (
        <>
          <Button title={mode === 'signIn' ? 'Sign In' : 'Sign Up'} onPress={handleAuth} color={theme.tint} />
          <Button
            title="Continue as Guest"
            onPress={handleGuest}
            color={theme.icon}
          />
        </>
      )}
      <Button
        title={mode === 'signIn' ? 'No account? Sign Up' : 'Have an account? Sign In'}
        onPress={() => setMode(mode === 'signIn' ? 'signUp' : 'signIn')}
        color={theme.icon}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    marginBottom: 24,
  },
  input: {
    width: '100%',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 16,
  },
});
