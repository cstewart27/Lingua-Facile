import Constants from 'expo-constants';

const supabaseFunctionUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_CALL_OPENAI_URL;
const supabaseAnonKey = Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const fetchCEFRLevels = async (sentence: string, levels: string[], dynamicCheck: boolean) => {
    if (!supabaseFunctionUrl) throw new Error('Supabase function URL not set in env');
    if (!supabaseAnonKey) throw new Error('Supabase anon key not set in env');
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
    };
    const body: any = { sentence, levels, dynamic: dynamicCheck };
    const response = await fetch(supabaseFunctionUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
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
