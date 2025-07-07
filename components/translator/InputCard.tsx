import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

interface InputCardProps {
  draftInputText: string;
  setDraftInputText: (v: string) => void;
  inputFocused: boolean;
  setInputFocused: (v: boolean) => void;
  setInputText: (v: string) => void;
  hasClipboardContent: boolean;
  languages: { code: string; name: string }[];
  sourceLang: string | null;
  handleTranslate?: () => void;
}

export const InputCard: React.FC<InputCardProps> = ({
  draftInputText,
  setDraftInputText,
  inputFocused,
  setInputFocused,
  setInputText,
  hasClipboardContent,
  languages,
  sourceLang,
  handleTranslate,
}) => (
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
          if (text) {
            setDraftInputText(text);
            if (!inputFocused) {
              setInputText(text);
              if (handleTranslate) handleTranslate();
            }
          }
        }}
        disabled={!hasClipboardContent}
        style={{
          backgroundColor: hasClipboardContent ? '#E6F0FF' : '#F0F0F0',
          borderRadius: 12,
          paddingHorizontal: 14,
          paddingVertical: 8,
          alignSelf: 'center',
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
);
