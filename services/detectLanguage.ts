import Constants from 'expo-constants';
import { supabase } from '../utils/supabase';

const supabaseFunctionUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_CALL_DETECT_LANGUAGE_URL;
const supabaseAnonKey = Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const detectLanguageFromEdge = async (sentence: string): Promise<string> => {
    if (!sentence || sentence.trim().length < 5) {
        throw new Error('Input is too short for language detection.');
    }
    if (!supabaseFunctionUrl) {
        console.error('Supabase Detect Language function URL not set in env');
        throw new Error('Supabase Detect Language function URL not set in env');
    }
    if (!supabaseAnonKey) {
        console.error('Supabase anon key not set in env');
        throw new Error('Supabase anon key not set in env');
    }
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
    };
    const res = await fetch(supabaseFunctionUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({ sentence }),
    });
    if (!res.ok) {
        const errorText = await res.text();
        console.warn('sentence:', sentence);
        console.error('Detect language error:', errorText);
        throw new Error(`Failed to detect language: ${errorText}`);
    }
    const { language } = await res.json();
    console.log('Detected language:', language);
    return language || 'unknown';
};
