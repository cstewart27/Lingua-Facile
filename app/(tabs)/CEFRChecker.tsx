import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, ActivityIndicator, ScrollView, StyleSheet, Modal, TouchableOpacity, Keyboard, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchCEFRLevels, CEFRResponse } from '../../services/cefrService';
import {getVerbData} from "@/services/getVerbData";
import { useCEFRSettings } from '../store/useCEFRSettings';
import SettingsScreen from '../../components/ui/Settings';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import Animated, { FadeIn, FadeOut, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { MotiView } from 'moti';

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export default function CEFRChecker() {
  const { selectedLevels, dynamicCheck, setSelectedLevels, hydrate } = useCEFRSettings();
  const [input, setInput] = useState('');
  const [result, setResult] = useState<CEFRResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<CEFRResponse['analysis'] | null>(null);
  const [analyzedInput, setAnalyzedInput] = useState('');
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(true);
  const [showResults, setShowResults] = useState(true);

  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const getNextLevel = (level: string) => {
    const idx = CEFR_LEVELS.indexOf(level);
    if (idx >= 0 && idx < CEFR_LEVELS.length - 1) {
      return [CEFR_LEVELS[idx + 1]];
    }
    return [];
  };

  const handleCheck = async () => {
    setShowAnalysis(true);
    setShowResults(true);
    setLoading(true);
    setError(null);
    setResult(null);
    setAnalysis(null);
    setAnalyzedInput('');
    try {
      const res = await fetchCEFRLevels(input, selectedLevels, dynamicCheck);
      setResult(res);
      setAnalysis(res.analysis);
      setAnalyzedInput(input); // Save the input that was analyzed
    } catch (e: any) {
      setError(e.message || 'An error occurred');
    } finally {
      setLoading(false);
    }

    console.log(await getVerbData(input));
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <Animated.View entering={FadeIn.duration(600)} exiting={FadeOut.duration(400)} style={[styles.headerRow, { marginBottom: 16 }]}>
        <Text style={[styles.title, { color: theme.text }]}>CEFR Level Checker</Text>
        <TouchableOpacity
          style={{ position: 'absolute', right: 0, top: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', height: 40, paddingHorizontal: 8 }}
          onPress={() => setSettingsVisible(true)}
          accessibilityLabel="Open settings"
        >
          <Ionicons name="settings-outline" size={28} color={theme.icon} />
        </TouchableOpacity>
      </Animated.View>
      <Modal
        visible={settingsVisible}
        animationType="slide"
        onRequestClose={() => setSettingsVisible(false)}
        presentationStyle="formSheet"
      >
        <SettingsScreen onClose={() => setSettingsVisible(false)} />
      </Modal>
      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.background }]} keyboardShouldPersistTaps="handled">
        <Animated.View entering={FadeIn.duration(500)}>
          <TextInput
            style={[styles.input, { color: theme.text, backgroundColor: theme.background, borderColor: theme.icon }]}
            placeholder="Enter a sentence..."
            placeholderTextColor={theme.icon}
            value={input}
            onChangeText={setInput}
            multiline
          />
        </Animated.View>
        <Animated.View entering={FadeIn.delay(100).duration(400)} style={{ alignItems: 'center', marginBottom: 10 }}>
          <View style={{
            backgroundColor: theme.icon + '11',
            borderRadius: 16,
            paddingVertical: 7,
            paddingHorizontal: 18,
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 2,
            borderWidth: 1.5,
            borderColor: theme.icon + '33',
            shadowColor: theme.icon,
            shadowOpacity: 0.08,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: 2 },
            elevation: 2,
          }}>
            <Ionicons name={dynamicCheck ? 'flash-outline' : 'list-outline'} size={18} color={theme.icon} style={{ marginRight: 7 }} />
            <Text style={{ color: theme.icon, fontWeight: 'bold', fontSize: 15, letterSpacing: 0.2 }}>
              {dynamicCheck
                ? 'Dynamic Check: Next Highest Level'
                : `Levels: ${selectedLevels.join(', ')}`}
            </Text>
          </View>
        </Animated.View>
        <Animated.View entering={FadeIn.delay(200).duration(500)}>
          <Pressable
            style={({ pressed }) => [
              styles.prettyButton,
              {
                backgroundColor: (!input.trim() || loading)
                  ? theme.icon + '33'
                  : (pressed ? theme.tint + 'cc' : theme.tint),
                opacity: (!input.trim() || loading) ? 0.6 : 1,
                borderWidth: 1.5,
                borderColor: (!input.trim() || loading) ? theme.icon + '33' : theme.tint,
              },
            ]}
            onPress={() => {
              Keyboard.dismiss();
              handleCheck();
            }}
            disabled={loading || !input.trim()}
            android_ripple={{ color: theme.icon + '22' }}
          >
            <Text style={[styles.prettyButtonText, { color: (!input.trim() || loading) ? theme.icon : theme.background }]}>{loading ? 'Checking...' : 'Check CEFR Levels'}</Text>
          </Pressable>
        </Animated.View>
        {error && <Animated.Text entering={FadeIn.duration(400)} style={[styles.error, { color: '#e74c3c' }]}>{error}</Animated.Text>}
        {analysis && showAnalysis && (
          <Animated.View
            entering={FadeIn.duration(500)}
            exiting={FadeOut.duration(350)}
            style={styles.analysisContainer}
            onExitComplete={() => {
              setInput('');
              setResult(null);
              setAnalysis(null);
              setAnalyzedInput('');
              setError(null);
              // Do not set showAnalysis/showResults here
            }}
          >
            <Text style={[styles.analysisTitle, { color: theme.text }]}>Overall CEFR Level: <Text style={styles.analysisLevel}>{analysis.level}</Text></Text>
            <Text style={[styles.analysisJustificationLabel, { color: theme.icon }]}>Justification:</Text>
            <Text style={[styles.analysisJustification, { color: theme.text }]}>{analysis.justification}</Text>
            <Text style={[styles.analysisInputLabel, { color: theme.icon }]}>Input Analyzed:</Text>
            <Text style={[styles.analysisInput, { color: theme.text }]}>{analyzedInput}</Text>
            <Pressable
              style={({ pressed }) => [
                styles.prettyButton,
                {
                  flexDirection: 'row', // Ensure icon is left of text
                  backgroundColor: pressed ? '#cd6053' : '#ff4d4f', // Tint red
                  marginTop: 18,
                  borderWidth: 1.5,
                  borderColor: '#cd6053',
                  shadowColor: '#cd6053',
                  shadowOpacity: 0.10,
                  shadowRadius: 8,
                  shadowOffset: { width: 0, height: 2 },
                  elevation: 2,
                },
              ]}
              onPress={() => {
                setShowAnalysis(false);
                setShowResults(false);
                setInput(''); // Clear input when hiding analysis
              }}
              android_ripple={{ color: '#e74c3c22' }}
            >
              <Ionicons name="close-circle-outline" size={18} color={theme.background} style={{ marginRight: 7 }} />
              <Text style={[styles.prettyButtonText, { color: theme.background, fontWeight: 'bold', fontSize: 16 }]}>Clear</Text>
            </Pressable>
          </Animated.View>
        )}
        {result && showResults && (
          <Animated.View
            entering={FadeIn.duration(500)}
            exiting={FadeOut.duration(350)}
            style={styles.resultContainer}
            // No need for onExitComplete here, handled by analysis card
          >
            {(
              (dynamicCheck && analysis?.level)
                ? result.results.filter(r => r.level === getNextLevel(analysis.level)[0])
                : result.results.filter(r => selectedLevels.includes(r.level))
            ).map((r, idx) => (
              <Animated.View
                key={idx}
                entering={FadeIn.delay(100 * idx).duration(400)}
                exiting={FadeOut.duration(350)}
                style={styles.levelContainer}
              >
                <Text style={styles.level}>Level: {r.level}</Text>
                <Text style={styles.sentence}>Sentence: {r.sentence}</Text>
                <Text style={styles.explanation}>Explanation: {r.explanation}</Text>
              </Animated.View>
            ))}
          </Animated.View>
        )}
        {loading && (
          <Animated.View entering={FadeIn.duration(400)} style={styles.resultContainer}>
            {(() => {
              // Determine how many placeholders to show
              let count = 1;
              if (!dynamicCheck && selectedLevels.length > 0) count = selectedLevels.length;
              return Array.from({ length: count }).map((_, idx) => (
                <MotiView
                  key={idx}
                  from={{ opacity: 0.4 }}
                  animate={{ opacity: 1 }}
                  transition={{ loop: true, type: 'timing', duration: 900, delay: idx * 120, repeatReverse: true }}
                  style={styles.placeholderCard}
                >
                  <View style={styles.placeholderBarShort} />
                  <View style={styles.placeholderBar} />
                  <View style={styles.placeholderBar} />
                </MotiView>
              ));
            })()}
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    marginTop: 8,
  },
  headerIconButton: {
    marginLeft: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    flexShrink: 0,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#ccc',
    borderRadius: 12,
    padding: 16,
    minHeight: 60,
    marginBottom: 18,
    fontSize: 17,
    backgroundColor: '#f7f7f7',
  },
  error: {
    color: 'red',
    marginTop: 16,
    textAlign: 'center',
  },
  analysisContainer: {
    marginTop: 20,
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#e6f7ee',
    borderRadius: 8,
  },
  analysisTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2a7',
    textAlign: 'center',
  },
  analysisLevel: {
    color: '#1a5',
    fontWeight: 'bold',
    fontSize: 20,
  },
  analysisJustificationLabel: {
    marginTop: 8,
    fontWeight: 'bold',
    color: '#2a7',
    textAlign: 'center',
  },
  analysisJustification: {
    marginTop: 6,
    fontSize: 15,
    color: '#333',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  analysisInputLabel: {
    marginTop: 10,
    fontWeight: 'bold',
    color: '#2a7',
    textAlign: 'center',
  },
  analysisInput: {
    marginTop: 2,
    fontSize: 15,
    color: '#333',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  resultContainer: {
    marginTop: 24,
  },
  resultTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 8,
  },
  levelContainer: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  level: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  sentence: {
    marginTop: 4,
    fontSize: 15,
  },
  explanation: {
    marginTop: 4,
    fontStyle: 'italic',
    color: '#555',
  },
  selectedLevels: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
  },
  settingsButton: {
    position: 'absolute',
    top: 40,
    right: 16,
    padding: 10,
    borderRadius: 8,
    backgroundColor: 'transparent',
    elevation: 0,
  },
  settingsButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  prettyButton: {
    marginTop: 4,
    marginBottom: 8,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2a7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
  prettyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
    letterSpacing: 0.5,
  },
  placeholderCard: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#e0e0e0',
    borderRadius: 12,
    flexDirection: 'column',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    minHeight: 80,
    width: '100%',
  },
  placeholderBar: {
    height: 14,
    width: '80%',
    backgroundColor: '#cccccc',
    borderRadius: 7,
    marginTop: 10,
  },
  placeholderBarShort: {
    height: 14,
    width: '40%',
    backgroundColor: '#cccccc',
    borderRadius: 7,
    marginTop: 0,
  },
});
