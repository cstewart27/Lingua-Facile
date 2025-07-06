import React from 'react';
import { TextInput, View, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

interface CEFRInputProps {
  input: string;
  setInput: (text: string) => void;
  loading: boolean;
  onSubmit: () => void;
  onFocus: () => void;
  onBlur: () => void;
  inputFocused: boolean;
  hasClipboardContent: boolean;
}

export const CEFRInput: React.FC<CEFRInputProps> = ({
  input,
  setInput,
  loading,
  onSubmit,
  onFocus,
  onBlur,
  inputFocused,
  hasClipboardContent,
}) => {
  return (
    <View style={{ backgroundColor: '#fff', borderRadius: 20, marginBottom: 16, padding: 16, minHeight: 100, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2, width: '100%', maxWidth: 500, position: 'relative' }}>
      {/* Clear button in top right */}
      {!!input && (
        <TouchableOpacity
          onPress={() => setInput('')}
          style={{ position: 'absolute', top: 10, right: 10, zIndex: 2 }}
        >
          <Ionicons name="close-circle" size={24} color="#B0B0B0" />
        </TouchableOpacity>
      )}
      <TextInput
        style={{ fontSize: 20, color: '#11181C', minHeight: 60, marginBottom: 8, fontWeight: '400', width: '100%' }}
        value={input}
        onChangeText={setInput}
        placeholder="Enter a sentence..."
        placeholderTextColor="#B0B0B0"
        multiline
        returnKeyType="done"
        blurOnSubmit={true}
        onFocus={onFocus}
        onBlur={onBlur}
        onSubmitEditing={() => {
          if (input.trim() && !loading) {
            onSubmit();
          }
        }}
      />
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 8 }}>
        {/* Paste button inside input actions */}
        <TouchableOpacity
          onPress={async () => {
            try {
              const text = await Clipboard.getStringAsync();
              if (text) setInput(text);
            } catch (e) {
              // Optionally handle clipboard error
            }
          }}
          disabled={!hasClipboardContent}
          style={{
            backgroundColor: hasClipboardContent ? '#E6F0FF' : '#F0F0F0',
            borderRadius: 12,
            paddingHorizontal: 14,
            paddingVertical: 8,
            flexDirection: 'row',
            alignItems: 'center',
            opacity: hasClipboardContent ? 1 : 0.6,
            marginLeft: 8,
          }}
        >
          <Ionicons name="clipboard-outline" size={18} color={hasClipboardContent ? '#1976FF' : '#B0B0B0'} style={{ marginRight: 6 }} />
          <Text style={{ color: hasClipboardContent ? '#1976FF' : '#B0B0B0', fontWeight: '500' }}>Paste</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
