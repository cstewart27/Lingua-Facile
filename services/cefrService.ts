import { supabase } from '../utils/supabase';

const supabaseFunctionUrl = process.env.EXPO_PUBLIC_SUPABASE_OPENAI_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const fetchCEFRLevels = async (sentence: string) => {
    if (!supabaseFunctionUrl) throw new Error('Supabase function URL not set in env');
    if (!supabaseAnonKey) throw new Error('Supabase anon key not set in env');
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
    };
    const response = await fetch(supabaseFunctionUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({ sentence }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch CEFR breakdown: ${errorText}`);
    }
    return await response.json();
};

export interface CEFRAnalysis {
  level: string;
  justification: string;
}

export interface CEFRResult {
  level: string;
  sentence: string;
  explanation: string;
}

export interface CEFRResponse {
  input: string;
  analysis: CEFRAnalysis;
  results: CEFRResult[];
}
