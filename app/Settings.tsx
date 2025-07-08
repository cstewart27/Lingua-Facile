import React, { useEffect, useState } from 'react';
import { View, Text, Switch, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCEFRSettings } from './store/useCEFRSettings';
import { supabase } from '../utils/supabase';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useNavigation } from 'expo-router';

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export default function Settings() {
  const { selectedLevels, dynamicCheck, setSelectedLevels, setDynamicCheck, hydrate } = useCEFRSettings();
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<string | null>(null);
  const [availableVoices, setAvailableVoices] = useState<any[]>([]);
  const [voiceMap, setVoiceMap] = useState<{ [lang: string]: string }>({});
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const navigation = useNavigation();

  useEffect(() => {
    // Set the back button title to 'Home' to hide (tabs) as the previous screen
    if (navigation && navigation.setOptions) {
      navigation.setOptions({ headerBackTitle: 'Home' });
    }
  }, [navigation]);

  const translatorLanguages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ru', name: 'Russian' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'zh', name: 'Chinese' },
  ];
  const supportedLanguages = React.useMemo(
    () => translatorLanguages.filter(l => availableVoices.some(v => v.language.startsWith(l.code))),
    [availableVoices, translatorLanguages]
  );

  useEffect(() => {
    hydrate().then(() => setLoading(false));
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setIsGuest((data.user as any).is_anonymous);
        setUserEmail(data.user.email ?? null);
      }
    };
    fetchUser();
  }, [hydrate]);

  useEffect(() => {
    AsyncStorage.getItem('availableVoices').then(json => {
      if (json) setAvailableVoices(JSON.parse(json));
    });
    AsyncStorage.getItem('pronunciationVoice').then(v => {
      if (v) setSelectedVoice(v);
    });
    AsyncStorage.getItem('pronunciationVoiceMap').then(json => {
      if (json) setVoiceMap(JSON.parse(json));
    });
  }, [availableVoices]);

  const toggleLevel = (level: string) => {
    if (selectedLevels.includes(level)) {
      setSelectedLevels(selectedLevels.filter(l => l !== level));
    } else {
      setSelectedLevels([...selectedLevels, level]);
    }
  };

  const toggleDynamicCheck = () => {
    setDynamicCheck(!dynamicCheck);
  };

  if (loading) return <Text>Loading...</Text>;

  return (
      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.background, flexGrow: 1 }]}>
        <View style={{ marginBottom: 24, marginTop: 0 }}>
          <Text style={{ fontSize: 16, color: theme.icon, textAlign: 'center' }}>
            {isGuest
              ? 'Signed in as guest'
              : userEmail
                ? `Signed in as: ${userEmail}`
                : 'Signed in'}
          </Text>
        </View>
        {CEFR_LEVELS.map(level => (
          <View key={level} style={styles.row}>
            <Text style={[styles.label, { color: theme.text }]}>{level}</Text>
            <Switch
              value={selectedLevels.includes(level)}
              onValueChange={() => toggleLevel(level)}
            />
          </View>
        ))}
        <View style={styles.row}>
          <Text style={[styles.label, { color: theme.text }]}>Show only next CEFR level after analysis</Text>
          <Switch value={dynamicCheck} onValueChange={toggleDynamicCheck} />
        </View>
        <View style={{ marginBottom: 16 }}>
          <Text style={{ color: theme.text, marginBottom: 8, fontWeight: '700', fontSize: 24, textAlign: 'left' }}>Modify Language Voice</Text>
          {supportedLanguages.map(langObj => (
            <TouchableOpacity
              key={langObj.code}
              onPress={() => router.push({ pathname: '/voice-picker-screen', params: { langCode: langObj.code } })}
              style={{
                backgroundColor: 'white',
                borderRadius: 8,
                padding: 14,
                marginBottom: 8,
                borderWidth: 1,
                borderColor: '#E6F0FF',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Text style={{ fontSize: 18, color: '#11181C' }}>{langObj.name}</Text>
              <Ionicons name="chevron-forward" size={22} color="#B0B0B0" />
            </TouchableOpacity>
          ))}
        </View>
        <View style={{ flex: 1 }} />
        <TouchableOpacity
          style={[styles.signOutButton, { backgroundColor: '#e74c3c' }]}
          onPress={async () => {
            await supabase.auth.signOut();
            Alert.alert('Signed out', 'You have been signed out.');
          }}
          accessibilityLabel="Sign out"
        >
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  label: { fontSize: 18 },
  signOutButton: {
    backgroundColor: '#e74c3c',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 16,
  },
  signOutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
});
