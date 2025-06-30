import { supabase } from '../utils/supabase';

const supabaseFunctionUrl = process.env.EXPO_PUBLIC_SUPABASE_CALL_DETECT_LANGUAGE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const detectLanguageFromEdge = async (sentence: string): Promise<string> => {
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
        console.error('Detect language error:', errorText);
        throw new Error(`Failed to detect language: ${errorText}`);
    }
    const { language } = await res.json();
    return language || 'unknown';
};
