import Constants from 'expo-constants';

const supabaseFunctionUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_CALL_ANALYZE_VERBS_URL;
const supabaseAnonKey = Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const analyzeVerbsFromEdge = async (sentence: string, language: string) => {
    if(language === 'unknown') {
        console.error('Language is unknown, cannot analyze verbs');
        throw new Error('Language must be specified for verb analysis');
    }
    if (!supabaseFunctionUrl) throw new Error('Supabase CALL-ANALYZE-VERBS function URL not set in env');
    if (!supabaseAnonKey) throw new Error('Supabase anon key not set in env');
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
    };
    const res = await fetch(supabaseFunctionUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({ sentence, language }),
    });
    const { verbs } = await res.json();
    return verbs || [];
};
