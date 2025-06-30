import AsyncStorage from '@react-native-async-storage/async-storage';
import {supabase} from "@/utils/supabase";

export const getFromLocal = async (infinitive: string, language: string) => {
    const key = `verb:${language}:${infinitive.toLowerCase()}`;
    const cached = await AsyncStorage.getItem(key);
    return cached ? JSON.parse(cached) : null;
};

export const saveToLocal = async (infinitive: string, language: string, data: any) => {
    const key = `verb:${language}:${infinitive.toLowerCase()}`;
    await AsyncStorage.setItem(key, JSON.stringify(data));
};

export const getFromSupabase = async (infinitive: string, language: string) => {
    const { data, error } = await supabase
        .from('verb_analysis')
        .select('analysis')
        .eq('infinitive', infinitive.toLowerCase())
        .eq('language', language)
        .single();

    return error || !data ? null : data.analysis;
};

export const saveToSupabase = async (infinitive: string, language: string, analysis: any) => {
    await supabase.from('verb_analysis').upsert({
        infinitive: infinitive.toLowerCase(),
        language,
        analysis,
    });
};
