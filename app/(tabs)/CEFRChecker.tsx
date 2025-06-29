import React, { useState } from 'react';
import { View, Text, TextInput, Button, ActivityIndicator, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchCEFRLevels, CEFRResponse } from '../../services/cefrService';

export default function CEFRChecker() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<CEFRResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<CEFRResponse['analysis'] | null>(null);

  const handleCheck = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setAnalysis(null);
    try {
      const res = await fetchCEFRLevels(input);
      console.log('CEFR API response:', res);
      setResult(res);
      setAnalysis(res.analysis);
    } catch (e: any) {
      setError(e.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>CEFR Level Checker</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter a sentence..."
          value={input}
          onChangeText={setInput}
          multiline
        />
        <Button title="Check CEFR Levels" onPress={handleCheck} disabled={loading || !input.trim()} />
        {loading && <ActivityIndicator style={{ marginTop: 16 }} />}
        {error && <Text style={styles.error}>{error}</Text>}
        {analysis && (
          <View style={styles.analysisContainer}>
            <Text style={styles.analysisTitle}>Overall CEFR Level: <Text style={styles.analysisLevel}>{analysis.level}</Text></Text>
            <Text style={styles.analysisJustificationLabel}>Justification:</Text>
            <Text style={styles.analysisJustification}>{analysis.justification}</Text>
            <Text style={styles.analysisInputLabel}>Input Analyzed:</Text>
            <Text style={styles.analysisInput}>{input}</Text>
          </View>
        )}
        {result && (
          <View style={styles.resultContainer}>
            {result.results.map((r, idx) => (
              <View key={idx} style={styles.levelContainer}>
                <Text style={styles.level}>Level: {r.level}</Text>
                <Text style={styles.sentence}>Sentence: {r.sentence}</Text>
                <Text style={styles.explanation}>Explanation: {r.explanation}</Text>
              </View>
            ))}
          </View>
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
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    minHeight: 60,
    marginBottom: 16,
    fontSize: 16,
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
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
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
});
