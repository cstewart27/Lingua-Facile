import React, { useEffect, useState } from 'react';
import { View, Text, Switch, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCEFRSettings } from '../../app/store/useCEFRSettings';
import { supabase } from '../../utils/supabase';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

function SettingsScreen({ onClose }: { onClose?: () => void }) {
  const { selectedLevels, dynamicCheck, setSelectedLevels, setDynamicCheck, hydrate } = useCEFRSettings();
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  useEffect(() => {
    hydrate().then(() => setLoading(false));
    // Get current user info from supabase
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        // Supabase anonymous users have user.is_anonymous === true
        setIsGuest((data.user as any).is_anonymous === true);
        setUserEmail(data.user.email);
      }
    };
    fetchUser();
  }, [hydrate]);

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
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      {onClose && (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8, minHeight: 48, position: 'relative' }}>
          <Text style={[styles.title, { flex: 1, textAlign: 'center', marginBottom: 0, color: theme.text }]}>Settings</Text>
          <TouchableOpacity onPress={onClose} style={{ position: 'absolute', right: 0, top: 0, bottom: 0, justifyContent: 'center', padding: 4, height: '100%' }} accessibilityLabel="Close settings">
            <Ionicons name="close-outline" size={28} color={theme.icon} />
          </TouchableOpacity>
        </View>
      )}
      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}>
        {/* Show user info at the top */}
        <View style={{ marginBottom: 24 }}>
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
        <View style={{ flex: 1 }} />
        <TouchableOpacity
          style={[styles.signOutButton, { backgroundColor: '#e74c3c' }]}
          onPress={async () => {
            await supabase.auth.signOut();
            if (onClose) onClose();
            Alert.alert('Signed out', 'You have been signed out.');
          }}
          accessibilityLabel="Sign out"
        >
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
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
    marginTop: 32,
    marginBottom: 16,
  },
  signOutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default SettingsScreen;
