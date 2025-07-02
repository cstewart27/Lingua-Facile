import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Keyboard,
  Alert,
  TouchableWithoutFeedback,
  Modal,
  FlatList,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { translateWithDeepL, DeepLTranslationError } from '@/services/deeplService';
import * as Clipboard from 'expo-clipboard';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {  MotiView } from 'moti';

export default function TranslatorScreen() {
  const [inputText, setInputText] = useState('');
  const [draftInputText, setDraftInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sourceLang, setSourceLang] = useState<string | null>(null);
  const [targetLang, setTargetLang] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedInput, setCopiedInput] = useState(false);
  const [copiedOutput, setCopiedOutput] = useState(false);
  const [prefsLoaded, setPrefsLoaded] = useState(false);
  const [hasClipboardContent, setHasClipboardContent] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [activeTab, setActiveTab] = useState<'examples' | 'synonyms' | 'tone'>('examples');
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [languageModalType, setLanguageModalType] = useState<'source' | 'target' | null>(null);

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

  useEffect(() => {
    (async () => {
      try {
        const savedSource = await AsyncStorage.getItem('translator_sourceLang');
        const savedTarget = await AsyncStorage.getItem('translator_targetLang');
        setSourceLang(savedSource || 'en'); // default input: English
        setTargetLang(savedTarget || 'it'); // default target: Italian
      } catch (e) {
        setSourceLang('en');
        setTargetLang('it');
      } finally {
        setPrefsLoaded(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (prefsLoaded && sourceLang) {
      AsyncStorage.setItem('translator_sourceLang', sourceLang);
    }
  }, [sourceLang, prefsLoaded]);

  useEffect(() => {
    if (prefsLoaded && targetLang) {
      AsyncStorage.setItem('translator_targetLang', targetLang);
    }
  }, [targetLang, prefsLoaded]);

  // Always check clipboard every second, regardless of input focus
  useEffect(() => {
    const interval = setInterval(async () => {
      const text = await Clipboard.getStringAsync();
      setHasClipboardContent(!!text);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Add useEffect to trigger translation when inputText changes and is not empty
  useEffect(() => {
    if (inputText.trim() !== '') {
      handleTranslate();
    }
    // Only run when inputText changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputText]);

  const handleTranslate = async () => {
    if (!inputText.trim() || !sourceLang || !targetLang) return;

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

  const openLanguageModal = (type: 'source' | 'target') => {
    setLanguageModalType(type);
    setLanguageModalVisible(true);
  };

  const closeLanguageModal = () => {
    setLanguageModalVisible(false);
    setLanguageModalType(null);
  };

  const selectLanguage = (code: string) => {
    if (languageModalType === 'source') {
      setSourceLang(code);
    } else if (languageModalType === 'target') {
      setTargetLang(code);
    }
    closeLanguageModal();
  };

  // Handler to clear all translation fields
  const handleNewTranslation = () => {
    setInputText('');
    setDraftInputText('');
    setTranslatedText(''); // Ensure output is cleared
    setError(null);
    setCopiedInput(false);
    setCopiedOutput(false);
    setActiveTab('examples');
    setTimeout(() => {
      scrollRef?.current?.scrollTo({ y: 0, animated: true });
    }, 100);
  };

  // Add a ref for the ScrollView
  const scrollRef = React.useRef<ScrollView>(null);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F6F7FB' }}>


        <View style={{ flex: 1 }}>

            {/* Header Bar */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8, backgroundColor: '#F6F7FB' }}>
                <TouchableOpacity onPress={() => Alert.alert('History pressed')}>
                    <Ionicons name="refresh" size={22} color="#0a7ea4" style={{ transform: [{ rotate: '-90deg' }] }} />
                </TouchableOpacity>
                <Text style={{ fontSize: 20, fontWeight: '600', color: '#11181C' }}>Translator</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => Alert.alert('Settings pressed')}>
                        <Ionicons name="settings-outline" size={22} color="#0a7ea4" />
                    </TouchableOpacity>
                </View>
            </View>
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={{ paddingBottom: 100 }} // Reduced padding to minimize gap above tab bar
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >


            {/* Language Selector */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 8, marginBottom: 8 }}>
              <View style={{ backgroundColor: 'white', borderRadius: 16, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, elevation: 2 }}>
                <TouchableOpacity onPress={() => openLanguageModal('source')}>
                  <Text style={{ fontSize: 18, fontWeight: '500', color: '#11181C', marginRight: 8 }}>{languages.find(l => l.code === sourceLang)?.name || 'Italian'}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={swapLanguages} style={{ marginHorizontal: 8 }}>
                  <Ionicons name="swap-horizontal" size={24} color="#1976FF" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => openLanguageModal('target')}>
                  <Text style={{ fontSize: 18, fontWeight: '500', color: '#11181C', marginLeft: 8 }}>{languages.find(l => l.code === targetLang)?.name || 'English'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Language Modal */}
            <Modal
              visible={languageModalVisible}
              transparent
              animationType="slide"
              onRequestClose={closeLanguageModal}
            >
              <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' }}>
                <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 24, width: '80%' }}>
                  <Text style={{ fontSize: 20, fontWeight: '600', marginBottom: 16, textAlign: 'center' }}>
                    Select {languageModalType === 'source' ? 'Input' : 'Target'} Language
                  </Text>
                  <FlatList
                    data={
                      languageModalType === 'source'
                        ? languages.filter(l => l.code !== targetLang)
                        : languages.filter(l => l.code !== sourceLang)
                    }
                    keyExtractor={item => item.code}
                    renderItem={({ item }) => (
                      <Pressable
                        onPress={() => selectLanguage(item.code)}
                        style={({ pressed }) => ({
                          paddingVertical: 12,
                          paddingHorizontal: 8,
                          backgroundColor: pressed ? '#E6F0FF' : 'white',
                          borderRadius: 8,
                          marginBottom: 4,
                        })}
                      >
                        <Text style={{ fontSize: 18, color: '#11181C' }}>{item.name}</Text>
                      </Pressable>
                    )}
                    style={{ maxHeight: 300 }}
                  />
                  <TouchableOpacity onPress={closeLanguageModal} style={{ marginTop: 16, alignSelf: 'center' }}>
                    <Text style={{ color: '#1976FF', fontWeight: '600', fontSize: 16 }}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

            {/* Input Card */}
            <View style={{ backgroundColor: 'white', borderRadius: 20, marginHorizontal: 12, marginBottom: 16, padding: 16, minHeight: 180, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Text style={{ fontWeight: '600', color: '#11181C', fontSize: 16 }}>{languages.find(l => l.code === sourceLang)?.name || 'Italian'}</Text>
                <Ionicons name="arrow-down-circle-outline" size={18} color="#1976FF" style={{ marginLeft: 6 }} />
              </View>
              <TextInput
                style={{ fontSize: 24, color: '#11181C', minHeight: 60, marginBottom: 8, fontWeight: '400' }}
                value={draftInputText}
                onChangeText={setDraftInputText}
                placeholder="Enter your text"
                placeholderTextColor="#B0B0B0"
                multiline
                returnKeyType="done"
                blurOnSubmit={true}
                onSubmitEditing={() => setInputText(draftInputText)}
                onFocus={() => setInputFocused(true)}
                onBlur={() => { setInputFocused(false); setInputText(draftInputText); }}
              />

              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                  <TouchableOpacity
                    onPress={async () => {
                      const text = await Clipboard.getStringAsync();
                      setHasClipboardContent(!!text);
                      if (text) {
                        setDraftInputText(text);
                        if (!inputFocused) {
                          setInputText(text); // trigger translation if not editing
                        }
                      }
                    }}
                    disabled={!hasClipboardContent}
                    style={{
                      backgroundColor: hasClipboardContent ? '#E6F0FF' : '#F0F0F0',
                      borderRadius: 12,
                      paddingHorizontal: 14,
                      paddingVertical: 8,
                      alignSelf: 'center', // changed from 'flex-start' to 'center'
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginBottom: 8,
                      opacity: hasClipboardContent ? 1 : 0.5,
                    }}
                  >
                    <Ionicons name="clipboard-outline" size={18} color={hasClipboardContent ? '#1976FF' : '#B0B0B0'} style={{ marginRight: 6 }} />
                    <Text style={{ color: hasClipboardContent ? '#1976FF' : '#B0B0B0', fontWeight: '600', fontSize: 16 }}>Paste</Text>
                  </TouchableOpacity>
                  <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => Alert.alert('Camera pressed')} style={{ backgroundColor: '#1976FF', borderRadius: 20, padding: 10, marginRight: 8, alignItems: 'center', justifyContent: 'center' }}>
                      <Ionicons name="camera-outline" size={22} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => Alert.alert('Mic pressed')} style={{ backgroundColor: '#1976FF', borderRadius: 20, padding: 10, alignItems: 'center', justifyContent: 'center' }}>
                      <Ionicons name="mic-outline" size={22} color="white" />
                    </TouchableOpacity>
                  </View>
              </View>
            </View>

            {/* Translation Card */}
            {(isLoading || translatedText !== '') && (
              <Animated.View
                entering={FadeIn}
                exiting={FadeOut}
                style={{ backgroundColor: 'white', borderRadius: 20, marginHorizontal: 12, marginBottom: 16, padding: 16, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}
                onStartShouldSetResponder={() => true}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, justifyContent: 'space-between' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ fontWeight: '600', color: '#11181C', fontSize: 16 }}>{languages.find(l => l.code === targetLang)?.name || 'English'}</Text>
                    <Ionicons name="play-circle-outline" size={18} color="#1976FF" style={{ marginLeft: 6 }} />
                  </View>
                  <TouchableOpacity onPress={() => Alert.alert('Close translation pressed')} style={{ backgroundColor: '#F6F7FB', borderRadius: 16, padding: 4 }}>
                    <Ionicons name="close" size={18} color="#B0B0B0" />
                  </TouchableOpacity>
                </View>
                {isLoading ? (
                  <>
                    <MotiView
                      from={{ opacity: 0.3 }}
                      animate={{ opacity: 1 }}
                      transition={{ loop: true, type: 'timing', duration: 900 }}
                      style={{ width: '60%', height: 32, borderRadius: 8, backgroundColor: '#E6EAF2', marginBottom: 8, alignSelf: 'flex-start' }}
                    />
                    <MotiView
                      from={{ opacity: 0.3 }}
                      animate={{ opacity: 1 }}
                      transition={{ loop: true, type: 'timing', duration: 900, delay: 150 }}
                      style={{ width: '40%', height: 18, borderRadius: 6, backgroundColor: '#E6EAF2', marginBottom: 8, alignSelf: 'flex-start' }}
                    />
                    <MotiView
                      from={{ opacity: 0.3 }}
                      animate={{ opacity: 1 }}
                      transition={{ loop: true, type: 'timing', duration: 900, delay: 300 }}
                      style={{ width: 70, height: 16, borderRadius: 5, backgroundColor: '#E6EAF2', marginBottom: 8, alignSelf: 'flex-start' }}
                    />
                    <MotiView
                      from={{ opacity: 0.3 }}
                      animate={{ opacity: 1 }}
                      transition={{ loop: true, type: 'timing', duration: 900, delay: 450 }}
                      style={{ width: '90%', height: 20, borderRadius: 7, backgroundColor: '#E6EAF2', marginBottom: 12, alignSelf: 'flex-start' }}
                    />
                  </>
                ) : (
                  <>
                    <Text style={{ fontSize: 24, color: '#1976FF', fontWeight: '700', marginBottom: 4 }}>{translatedText}</Text>
                    <Text style={{ color: '#B0B0B0', fontSize: 16, marginBottom: 8 }}>wot-is-yor-neim</Text>
                    <Text style={{ color: '#B0B0B0', fontWeight: '600', marginBottom: 2 }}>MEANING</Text>
                    <Text style={{ color: '#11181C', fontSize: 15, marginBottom: 12 }}>This phrase is used to inquire about someone's name in a friendly and informal manner.</Text>
                  </>
                )}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <TouchableOpacity onPress={() => Alert.alert('Like pressed')} style={{ marginRight: 16 }}>
                    <Ionicons name="thumbs-up-outline" size={22} color="#1976FF" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => Alert.alert('Dislike pressed')} style={{ marginRight: 16 }}>
                    <Ionicons name="thumbs-down-outline" size={22} color="#1976FF" />
                  </TouchableOpacity>
                </View>
              </Animated.View>
            )}

            {/* Tabs for Examples, Synonyms, Tone */}
            <View style={{ flexDirection: 'row', marginHorizontal: 12, marginBottom: 8, backgroundColor: 'white', borderRadius: 16, padding: 4, zIndex: 2 }}>
              <TouchableOpacity onPress={() => setActiveTab('examples')} style={{ flex: 1, alignItems: 'center', paddingVertical: 10, backgroundColor: activeTab === 'examples' ? '#E6F0FF' : 'transparent', borderRadius: 12 }}>
                <Ionicons name="list-outline" size={20} color={activeTab === 'examples' ? '#1976FF' : '#B0B0B0'} />
                <Text style={{ color: activeTab === 'examples' ? '#1976FF' : '#B0B0B0', fontWeight: '600', fontSize: 14 }}>Examples</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setActiveTab('synonyms')} style={{ flex: 1, alignItems: 'center', paddingVertical: 10, backgroundColor: activeTab === 'synonyms' ? '#E6F0FF' : 'transparent', borderRadius: 12 }}>
                <Ionicons name="git-compare-outline" size={20} color={activeTab === 'synonyms' ? '#1976FF' : '#B0B0B0'} />
                <Text style={{ color: activeTab === 'synonyms' ? '#1976FF' : '#B0B0B0', fontWeight: '600', fontSize: 14 }}>Synonyms</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setActiveTab('tone')} style={{ flex: 1, alignItems: 'center', paddingVertical: 10, backgroundColor: activeTab === 'tone' ? '#E6F0FF' : 'transparent', borderRadius: 12 }}>
                <Ionicons name="person-outline" size={20} color={activeTab === 'tone' ? '#1976FF' : '#B0B0B0'} />
                <Text style={{ color: activeTab === 'tone' ? '#1976FF' : '#B0B0B0', fontWeight: '600', fontSize: 14 }}>Tone</Text>
              </TouchableOpacity>
            </View>

            {/* Everything below the tabs is wrapped in a View to ensure it is part of the ScrollView and scrollable */}
            <View>
              {/* Tab Content Visual Only */}
              <View
                style={{ backgroundColor: 'white', borderRadius: 16, marginHorizontal: 12, marginBottom: 50, padding: 16 }}
                onStartShouldSetResponder={() => true}
              >
                {activeTab === 'examples' && (
                  <Text style={{ color: '#11181C', fontSize: 15 }} selectable>{`Come ti chiami? Io sono felice di conoscerti.\nWhat is your name? I am happy to meet you.`}</Text>
                )}
                {activeTab === 'synonyms' && (
                  <Text style={{ color: '#11181C', fontSize: 15 }} selectable>Synonyms visual placeholder</Text>
                )}
                {activeTab === 'tone' && (
                  <Text style={{ color: '#11181C', fontSize: 15 }} selectable>Tone visual placeholder</Text>
                )}
              </View>

            </View>
          </ScrollView>
          {/* New translation button - now above the tab bar and always visible */}
          <TouchableOpacity
            onPress={handleNewTranslation}
            style={{ position: 'absolute', left: 24, right: 24, bottom: 80, backgroundColor: '#1976FF', borderRadius: 16, paddingVertical: 16, alignItems: 'center', elevation: 4, shadowColor: '#1976FF', shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, zIndex: 20 }}
          >
            <Text style={{ color: 'white', fontWeight: '700', fontSize: 18 }}>+  New translation</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}
