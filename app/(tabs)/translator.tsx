import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { translateWithDeepL, DeepLTranslationError } from '@/services/deeplService';

export default function TranslatorScreen() {
  const colorScheme = useColorScheme();
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('es');
  const [showSourceDropdown, setShowSourceDropdown] = useState(false);
  const [showTargetDropdown, setShowTargetDropdown] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const languages = [
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

  const handleTranslate = async () => {
    if (!inputText.trim()) return;

    setIsLoading(true);
    setError(null);
    setTranslatedText('');

    try {
      const result = await translateWithDeepL({
        text: inputText,
        sourceLanguage: sourceLang,
        targetLanguage: targetLang,
      });

      setTranslatedText(result.translatedText);

      // If source language was detected and different from selected, could show info
      if (result.detectedSourceLanguage && result.detectedSourceLanguage !== sourceLang) {
        console.log(`Detected source language: ${result.detectedSourceLanguage}`);
      }
    } catch (error) {
      console.error('Translation error:', error);

      if (error instanceof DeepLTranslationError) {
        setError(error.message);
        Alert.alert('Translation Error', error.message);
      } else {
        const errorMessage = 'Translation failed. Please try again.';
        setError(errorMessage);
        Alert.alert('Translation Error', errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const swapLanguages = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setInputText(translatedText);
    setTranslatedText(inputText);
  };

  const selectSourceLanguage = (langCode: string) => {
    setSourceLang(langCode);
    setShowSourceDropdown(false);
  };

  const selectTargetLanguage = (langCode: string) => {
    setTargetLang(langCode);
    setShowTargetDropdown(false);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors[colorScheme ?? 'light'].background,
    },
    content: {
      flex: 1,
      padding: 16,
    },
    header: {
      fontSize: 28,
      fontWeight: 'bold',
      color: Colors[colorScheme ?? 'light'].text,
      marginBottom: 24,
      textAlign: 'center',
    },
    languageContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    languagePicker: {
      flex: 1,
      padding: 12,
      backgroundColor: Colors[colorScheme ?? 'light'].background,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: Colors[colorScheme ?? 'light'].tabIconDefault,
    },
    languageText: {
      color: Colors[colorScheme ?? 'light'].text,
      fontSize: 16,
    },
    swapButton: {
      marginHorizontal: 16,
      padding: 8,
    },
    swapButtonText: {
      fontSize: 24,
      color: Colors[colorScheme ?? 'light'].tint,
    },
    inputContainer: {
      marginBottom: 16,
    },
    textInput: {
      minHeight: 120,
      padding: 16,
      backgroundColor: Colors[colorScheme ?? 'light'].background,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: Colors[colorScheme ?? 'light'].tabIconDefault,
      color: Colors[colorScheme ?? 'light'].text,
      fontSize: 16,
      textAlignVertical: 'top',
    },
    translateButton: {
      backgroundColor: Colors[colorScheme ?? 'light'].tint,
      paddingVertical: 14,
      paddingHorizontal: 24,
      borderRadius: 8,
      alignItems: 'center',
      marginBottom: 16,
    },
    translateButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
    },
    resultContainer: {
      flex: 1,
      padding: 16,
      backgroundColor: Colors[colorScheme ?? 'light'].background,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: Colors[colorScheme ?? 'light'].tabIconDefault,
      minHeight: 120,
    },
    resultText: {
      color: Colors[colorScheme ?? 'light'].text,
      fontSize: 16,
      lineHeight: 24,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    dropdownContainer: {
      position: 'relative',
      flex: 1,
    },
    dropdown: {
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      backgroundColor: Colors[colorScheme ?? 'light'].background,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: Colors[colorScheme ?? 'light'].tabIconDefault,
      maxHeight: 200,
      zIndex: 1000,
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    dropdownItem: {
      padding: 12,
      borderBottomWidth: 1,
      borderBottomColor: Colors[colorScheme ?? 'light'].tabIconDefault,
    },
    dropdownItemLast: {
      borderBottomWidth: 0,
    },
    dropdownItemText: {
      color: Colors[colorScheme ?? 'light'].text,
      fontSize: 16,
    },
    languagePickerTouchable: {
      flex: 1,
      padding: 12,
      backgroundColor: Colors[colorScheme ?? 'light'].background,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: Colors[colorScheme ?? 'light'].tabIconDefault,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    dropdownArrow: {
      color: Colors[colorScheme ?? 'light'].tabIconDefault,
      fontSize: 12,
    },
    errorText: {
      color: '#ff4444',
      fontStyle: 'italic',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.header}>Translator</Text>

        <View style={styles.languageContainer}>
          <View style={styles.dropdownContainer}>
            <TouchableOpacity 
              style={styles.languagePickerTouchable}
              onPress={() => {
                setShowTargetDropdown(false);
                setShowSourceDropdown(!showSourceDropdown);
              }}
            >
              <Text style={styles.languageText}>
                {languages.find(lang => lang.code === sourceLang)?.name || 'English'}
              </Text>
              <Text style={styles.dropdownArrow}>▼</Text>
            </TouchableOpacity>

            {showSourceDropdown && (
              <ScrollView style={styles.dropdown}>
                {languages.filter(lang => lang.code !== targetLang).map((language, index, filteredArray) => (
                  <TouchableOpacity
                    key={language.code}
                    style={[
                      styles.dropdownItem,
                      index === filteredArray.length - 1 && styles.dropdownItemLast
                    ]}
                    onPress={() => selectSourceLanguage(language.code)}
                  >
                    <Text style={styles.dropdownItemText}>{language.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>

          <TouchableOpacity style={styles.swapButton} onPress={swapLanguages}>
            <Text style={styles.swapButtonText}>⇄</Text>
          </TouchableOpacity>

          <View style={styles.dropdownContainer}>
            <TouchableOpacity 
              style={styles.languagePickerTouchable}
              onPress={() => {
                setShowSourceDropdown(false);
                setShowTargetDropdown(!showTargetDropdown);
              }}
            >
              <Text style={styles.languageText}>
                {languages.find(lang => lang.code === targetLang)?.name || 'Spanish'}
              </Text>
              <Text style={styles.dropdownArrow}>▼</Text>
            </TouchableOpacity>

            {showTargetDropdown && (
              <ScrollView style={styles.dropdown}>
                {languages.filter(lang => lang.code !== sourceLang).map((language, index, filteredArray) => (
                  <TouchableOpacity
                    key={language.code}
                    style={[
                      styles.dropdownItem,
                      index === filteredArray.length - 1 && styles.dropdownItemLast
                    ]}
                    onPress={() => selectTargetLanguage(language.code)}
                  >
                    <Text style={styles.dropdownItemText}>{language.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Enter text to translate..."
            placeholderTextColor={Colors[colorScheme ?? 'light'].tabIconDefault}
            value={inputText}
            onChangeText={setInputText}
            onFocus={() => {
              setShowSourceDropdown(false);
              setShowTargetDropdown(false);
            }}
            multiline
          />
        </View>

        <TouchableOpacity 
          style={styles.translateButton} 
          onPress={() => {
            Keyboard.dismiss();
            setShowSourceDropdown(false);
            setShowTargetDropdown(false);
            handleTranslate();
          }}
          disabled={isLoading || !inputText.trim()}
        >
          <Text style={styles.translateButtonText}>
            {isLoading ? 'Translating...' : 'Translate'}
          </Text>
        </TouchableOpacity>

        <View style={styles.resultContainer}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].tint} />
            </View>
          ) : error ? (
            <Text style={[styles.resultText, styles.errorText]}>
              {error}
            </Text>
          ) : (
            <Text style={styles.resultText}>
              {translatedText || 'Translation will appear here...'}
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
