import React, { useEffect, useState } from 'react';
import { View, Text, Switch, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCEFRSettings } from '../../app/store/useCEFRSettings';

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

function SettingsScreen({ onClose }: { onClose?: () => void }) {
  const { selectedLevels, dynamicNextLevel, setSelectedLevels, setDynamicNextLevel, hydrate } = useCEFRSettings();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    hydrate().then(() => setLoading(false));
  }, [hydrate]);

  const toggleLevel = (level: string) => {
    if (selectedLevels.includes(level)) {
      setSelectedLevels(selectedLevels.filter(l => l !== level));
    } else {
      setSelectedLevels([...selectedLevels, level]);
    }
  };

  const toggleDynamicNextLevel = () => {
    setDynamicNextLevel(!dynamicNextLevel);
  };

  if (loading) return <Text>Loading...</Text>;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      {onClose && (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8, minHeight: 48, position: 'relative' }}>
          <Text style={[styles.title, { flex: 1, textAlign: 'center', marginBottom: 0 }]}>Settings</Text>
          <TouchableOpacity onPress={onClose} style={{ position: 'absolute', right: 0, top: 0, bottom: 0, justifyContent: 'center', padding: 4, height: '100%' }} accessibilityLabel="Close settings">
            <Ionicons name="close-outline" size={28} color="#333" />
          </TouchableOpacity>
        </View>
      )}
      <ScrollView contentContainerStyle={styles.container}>
        {CEFR_LEVELS.map(level => (
          <View key={level} style={styles.row}>
            <Text style={styles.label}>{level}</Text>
            <Switch
              value={selectedLevels.includes(level)}
              onValueChange={() => toggleLevel(level)}
            />
          </View>
        ))}
        <View style={styles.row}>
          <Text style={styles.label}>Show only next CEFR level after analysis</Text>
          <Switch value={dynamicNextLevel} onValueChange={toggleDynamicNextLevel} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  label: { fontSize: 18 },
});

export default SettingsScreen;
