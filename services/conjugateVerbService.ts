import Constants from 'expo-constants';
import { supabase } from '../utils/supabase';

const supabaseFunctionUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_CONJUGATE_VERB_URL;
const supabaseAnonKey = Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export interface ConjugationResponse {
  infinitive: string;
  language: string;
  conjugation: Record<string, any>;
}

export const conjugateVerbFromEdge = async (
  infinitive: string,
  language: string
): Promise<ConjugationResponse> => {
  if (!supabaseFunctionUrl) {
    console.error('Supabase conjugate-verb function URL not set in env');
    throw new Error('Supabase conjugate-verb function URL not set in env');
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
    body: JSON.stringify({ infinitive, language }),
  });
  if (!res.ok) {
    const errorText = await res.text();
    console.error('Conjugate verb error:', errorText);
    throw new Error(`Failed to conjugate verb: ${errorText}`);
  }
  // Ensure the response matches the format in the function's index.ts
  const data = await res.json();
  if (!data.infinitive || !data.language || !data.conjugation) {
    console.error('Unexpected conjugate-verb response format:', data);
    throw new Error('Unexpected conjugate-verb response format');
  }

  return data;
};

export const upsertVerbConjugation = async (
  infinitive: string,
  language: string,
  conjugation: any,
  source: string = 'manual'
) => {
  const { data, error } = await supabase
    .from('verb_conjugations')
    .upsert([
      {
        infinitive,
        language,
        conjugation,
        source,
      }
    ], { onConflict: ['infinitive', 'language'] });

  if (error) {
    console.error('Upsert verb_conjugations error:', error);
    throw error;
  }
  return data;
};
