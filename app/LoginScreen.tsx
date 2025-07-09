import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator, Image, Platform, KeyboardAvoidingView, ScrollView } from 'react-native';
import { supabase } from '../utils/supabase';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Password validation state
  const [passwordValid, setPasswordValid] = useState({
    length: false,
    upper: false,
    lower: false,
    digit: false,
    special: false,
  });

  // Track if password or confirm password field has been touched
  const [passwordTouched, setPasswordTouched] = useState(false);

  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  useEffect(() => {
    setPasswordValid({
      length: password.length >= 8,
      upper: /[A-Z]/.test(password),
      lower: /[a-z]/.test(password),
      digit: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    });
  }, [password]);

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
      if (mode === 'signUp') {
        if (!showPassword && password !== confirmPassword) {
          setLoading(false);
          Alert.alert('Error', 'Passwords do not match.');
          return;
        }
        if (!passwordValid.length || !passwordValid.upper || !passwordValid.lower || !passwordValid.digit || !passwordValid.special) {
          setLoading(false);
          Alert.alert('Error', 'Password does not meet requirements.');
          return;
        }
      }
      result = await supabase.auth.signUp({ email, password });
      setLoading(false);
      if (result.error) {
        Alert.alert('Error', result.error.message);
      } else if (result.data.session) {
        onLogin();
      } else {
        setShowConfirm(true);
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
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View style={{ flex: 1 }}>
          {/* Gradient background behind the form */}
          <LinearGradient
            colors={["#4F8EF7", "#A6C1EE"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: -1 }}
          />
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}>
            <Animated.View
              entering={FadeIn.duration(600)}
              exiting={FadeOut.duration(400)}
              style={[
                {
                  backgroundColor: 'rgba(255,255,255,0.92)',
                  borderRadius: 32,
                  padding: 32,
                  alignItems: 'center',
                  width: '100%',
                  maxWidth: 400,
                  shadowColor: theme.text,
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.18,
                  shadowRadius: 24,
                  elevation: 8,
                },
              ]}
            >
              <Image
                source={require('../assets/images/ios_icon.png')}
                style={{ width: 110, height: 110, marginBottom: 24, borderRadius: 28, borderWidth: 2, borderColor: '#4F8EF7', backgroundColor: '#fff', shadowColor: '#4F8EF7', shadowOpacity: 0.2, shadowRadius: 8 }}
              />
              <Text style={{ color: '#4F8EF7', fontSize: 34, fontWeight: 'bold', marginBottom: 8, letterSpacing: 1.2, textAlign: 'center', fontFamily: 'SpaceMono-Regular' }}>Lingua Facile</Text>
              <Text style={{ color: '#4F8EF7', fontSize: 18, marginBottom: 24, textAlign: 'center', fontWeight: '500', opacity: 0.8 }}>
                {mode === 'signIn' ? 'Sign in to your account' : 'Create a new account'}
              </Text>
              <View style={{ width: '100%' }}>
                <TextInput
                  style={{
                    color: '#4F8EF7',
                    backgroundColor: '#F3F7FB',
                    borderColor: '#A6C1EE',
                    borderWidth: 1.5,
                    borderRadius: 14,
                    padding: 16,
                    marginBottom: 16,
                    fontSize: 17,
                    width: '100%',
                    fontFamily: 'SpaceMono-Regular',
                  }}
                  placeholder="Email"
                  placeholderTextColor="#A6C1EE"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                />
                <View style={{ width: '100%' }}>
                  <TextInput
                    style={{
                      color: '#4F8EF7',
                      backgroundColor: '#F3F7FB',
                      borderColor: '#A6C1EE',
                      borderWidth: 1.5,
                      borderRadius: 14,
                      padding: 16,
                      marginBottom: 12,
                      fontSize: 17,
                      width: '100%',
                      fontFamily: 'SpaceMono-Regular',
                    }}
                    placeholder="Password"
                    placeholderTextColor="#A6C1EE"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={t => { setPassword(t); setPasswordTouched(true); }}
                    onFocus={() => setPasswordTouched(true)}
                  />
                  <Ionicons
                    name={showPassword ? 'eye' : 'eye-off'}
                    size={24}
                    color="#4F8EF7"
                    style={{ position: 'absolute', right: 16, top: 20 }}
                    onPress={() => setShowPassword((v) => !v)}
                  />
                  {/* Password requirements feedback */}
                  {mode === 'signUp' && !showPassword && (
                    <Animated.View
                      entering={FadeIn.duration(400)}
                      exiting={FadeOut.duration(400)}
                    >
                      <TextInput
                        style={{
                          color: '#4F8EF7',
                          backgroundColor: '#F3F7FB',
                          borderColor: '#A6C1EE',
                          borderWidth: 1.5,
                          borderRadius: 14,
                          padding: 16,
                          marginBottom: 12,
                          fontSize: 17,
                          width: '100%',
                          fontFamily: 'SpaceMono-Regular',
                        }}
                        placeholder="Confirm Password"
                        placeholderTextColor="#A6C1EE"
                        secureTextEntry
                        value={confirmPassword}
                        onChangeText={t => { setConfirmPassword(t); setPasswordTouched(true); }}
                        onFocus={() => setPasswordTouched(true)}
                      />
                    </Animated.View>
                  )}
                  {mode === 'signUp' && (
                    <Animated.View
                      entering={FadeIn.duration(400)}
                      exiting={FadeOut.duration(400)}
                    >
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 8 }}>
                        <View style={{ flex: 1 }}>
                          <Text style={{ color: passwordValid.length ? '#1DB954' : (passwordTouched ? '#E53935' : '#A6C1EE'), fontSize: 13 }}>
                            • At least 8 characters
                          </Text>
                          <Text style={{ color: passwordValid.upper ? '#1DB954' : (passwordTouched ? '#E53935' : '#A6C1EE'), fontSize: 13 }}>
                            • Uppercase letter
                          </Text>
                          <Text style={{ color: passwordValid.lower ? '#1DB954' : (passwordTouched ? '#E53935' : '#A6C1EE'), fontSize: 13 }}>
                            • Lowercase letter
                          </Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={{ color: passwordValid.digit ? '#1DB954' : (passwordTouched ? '#E53935' : '#A6C1EE'), fontSize: 13 }}>
                            • Number
                          </Text>
                          <Text style={{ color: passwordValid.special ? '#1DB954' : (passwordTouched ? '#E53935' : '#A6C1EE'), fontSize: 13 }}>
                            • Special character
                          </Text>
                        </View>
                      </View>
                    </Animated.View>
                  )}
                </View>
              </View>
              {loading ? (
                <ActivityIndicator color="#4F8EF7" style={{ marginVertical: 16 }} />
              ) : (
                <View style={{ width: '100%' }}>
                  <Button title={mode === 'signIn' ? 'Sign In' : 'Sign Up'} onPress={handleAuth} color="#4F8EF7" />
                  <View style={{ height: 14 }} />
                  <Button
                    title="Continue as Guest"
                    onPress={handleGuest}
                    color="#A6C1EE"
                  />
                </View>
              )}
              <View style={{ height: 18 }} />
              <Button
                title={mode === 'signIn' ? 'No account? Sign Up' : 'Have an account? Sign In'}
                onPress={() => setMode(mode === 'signIn' ? 'signUp' : 'signIn')}
                color="#A6C1EE"
              />
            </Animated.View>
          </View>
          <View style={{ alignItems: 'center', marginBottom: 24 }}>
            <Text style={{ color: '#A6C1EE', fontSize: 13, opacity: 0.7, fontFamily: 'SpaceMono-Regular' }}>© {new Date().getFullYear()} Lingua Facile</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
