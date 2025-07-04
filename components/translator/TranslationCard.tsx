import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

interface TranslationCardProps {
  isLoading: boolean;
  translatedText: string;
  copiedOutput: boolean;
  setCopiedOutput: (v: boolean) => void;
  targetLang: string | null;
  languages: { code: string; name: string }[];
}

export const TranslationCard: React.FC<TranslationCardProps> = ({
  isLoading,
  translatedText,
  copiedOutput,
  setCopiedOutput,
  targetLang,
  languages,
}) => {
  return (
    <View style={{ backgroundColor: 'white', borderRadius: 20, marginHorizontal: 12, marginBottom: 16, padding: 16, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}>
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
        <Text style={{ color: '#B0B0B0', fontSize: 16 }}>Translating...</Text>
      ) : (
        <>
          <Text style={{ fontSize: 24, color: '#1976FF', fontWeight: '700', marginBottom: 4 }}>{translatedText}</Text>
          <Text style={{ color: '#B0B0B0', fontSize: 16, marginBottom: 8 }}>wot-is-yor-neim</Text>
          <Text style={{ color: '#B0B0B0', fontWeight: '600', marginBottom: 2 }}>MEANING</Text>
          <Text style={{ color: '#11181C', fontSize: 15, marginBottom: 12 }}>{`This phrase is used to inquire about someone's name in a friendly and informal manner.`}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity onPress={() => Alert.alert('Like pressed')} style={{ marginRight: 16 }}>
                <Ionicons name="thumbs-up-outline" size={22} color="#1976FF" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => Alert.alert('Dislike pressed')} style={{ marginRight: 16 }}>
                <Ionicons name="thumbs-down-outline" size={22} color="#1976FF" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={async () => {
                if (translatedText) {
                  await Clipboard.setStringAsync(translatedText);
                  setCopiedOutput(true);
                  setTimeout(() => setCopiedOutput(false), 1200);
                }
              }}
              style={{
                backgroundColor: '#E6F0FF',
                borderRadius: 12,
                paddingHorizontal: 10,
                paddingVertical: 6,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Ionicons name={copiedOutput ? 'checkmark-outline' : 'clipboard-outline'} size={18} color={copiedOutput ? '#43B581' : '#1976FF'} style={{ marginRight: 4 }} />
              <Text style={{ color: copiedOutput ? '#43B581' : '#1976FF', fontWeight: '600', fontSize: 15 }}>{copiedOutput ? 'Copied!' : 'Copy'}</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

