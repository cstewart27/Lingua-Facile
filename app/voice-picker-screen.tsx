import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams } from 'expo-router';
import * as Speech from 'expo-speech';

const VoicePickerScreen = () => {
  const { langCode } = useLocalSearchParams();
  const [availableVoices, setAvailableVoices] = useState<any[]>([]);
  const [voiceMap, setVoiceMap] = useState<{ [lang: string]: string }>({});
  const [selectedVoice, setSelectedVoice] = useState<string>('');

  useEffect(() => {
    AsyncStorage.getItem('availableVoices').then(json => {
      if (json) setAvailableVoices(JSON.parse(json));
    });
    AsyncStorage.getItem('pronunciationVoiceMap').then(json => {
      let map: Record<string, string> = {};
      if (json) {
        map = JSON.parse(json);
      }
      // If no voice is set for this language, default to the first available voice
      AsyncStorage.getItem('availableVoices').then(jsonVoices => {
        let voices: any[] = [];
        if (jsonVoices) voices = JSON.parse(jsonVoices);
        const voicesForLang = voices.filter(v => v.language.startsWith(langCode as string));
        let defaultVoice = '';
          if (!map[langCode as string] && voicesForLang.length > 0) {
          defaultVoice = voicesForLang[0].identifier;
          map[langCode as string] = defaultVoice;
          AsyncStorage.setItem('pronunciationVoiceMap', JSON.stringify(map));
        }
        setVoiceMap(map);
        setSelectedVoice(map[langCode as string] || '');
      });
    });
  }, [langCode]);

  // Default phrases for each language
  const getDefaultPhrase = (voiceName: string) => {
    const phrases: Record<string, string> = {
      en: `Hi, my name is ${voiceName}.`,
      es: `Hola, me llamo ${voiceName}.`,
      fr: `Bonjour, je m’appelle ${voiceName}.`,
      de: `Hallo, ich heiße ${voiceName}.`,
      it: `Ciao, mi chiamo ${voiceName}.`,
      pt: `Olá, meu nome é ${voiceName}.`,
      ru: `Привет, меня зовут ${voiceName}.`,
      ja: `こんにちは、私の名前は${voiceName}です。`,
      ko: `안녕하세요, 제 이름은 ${voiceName}입니다.`,
      zh: `你好，我叫${voiceName}。`,
    };
    return phrases[langCode as string] || `Hi, my name is ${voiceName}.`;
  };

  const handleVoiceChange = async (voiceId: string) => {
    setSelectedVoice(voiceId);
    const newMap = { ...voiceMap, [langCode as string]: voiceId };
    setVoiceMap(newMap);
    await AsyncStorage.setItem('pronunciationVoiceMap', JSON.stringify(newMap));
    // Stop any ongoing speech before speaking the new one
    Speech.stop();
    // Speak the default phrase using the selected voice's name
    const selected = availableVoices.find(v => v.identifier === voiceId);
    const phrase = getDefaultPhrase(selected?.name || 'Lingua Facile');
    if (selected) {
      Speech.speak(phrase, { voice: selected.identifier, language: selected.language });
    } else {
      Speech.speak(phrase);
    }
  };

  const voicesForLang = availableVoices.filter(v => v.language.startsWith(langCode as string));

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 48 }} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Select Voice</Text>
        {voicesForLang.length === 0 ? (
          <Text style={{ textAlign: 'center', marginTop: 24 }}>No voices available for this language.</Text>
        ) : (
          voicesForLang.map(voice => (
            <TouchableOpacity
              key={voice.identifier}
              style={[
                styles.voiceOption,
                selectedVoice === voice.identifier && styles.voiceOptionSelected
              ]}
              onPress={() => handleVoiceChange(voice.identifier)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: selectedVoice === voice.identifier }}
              activeOpacity={0.7}
            >
              <View style={styles.checkboxOuter}>
                {selectedVoice === voice.identifier && <View style={styles.checkboxInner} />}
              </View>
              <Text style={styles.voiceLabel}>{voice.name}</Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  voiceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E6F0FF',
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  voiceOptionSelected: {
    borderColor: '#1976FF',
    backgroundColor: '#E6F0FF',
  },
  checkboxOuter: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#1976FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    backgroundColor: '#fff',
  },
  checkboxInner: {
    width: 12,
    height: 12,
    borderRadius: 3,
    backgroundColor: '#1976FF',
  },
  voiceLabel: {
    fontSize: 18,
    color: '#11181C',
  },
});

export default VoicePickerScreen;
