import { detectLanguageFromEdge } from './detectLanguage';
import { analyzeVerbsFromEdge } from './analyzeVerbs';
import { getFromLocal, getFromSupabase, saveToLocal, saveToSupabase } from './verbCache';
import { conjugateVerbFromEdge, upsertVerbConjugation } from "@/services/conjugateVerbService";

export const getVerbData = async (sentence: string) => {
    const language = await detectLanguageFromEdge(sentence);
    const gptVerbs = await analyzeVerbsFromEdge(sentence, language);
    if (!gptVerbs || gptVerbs.length === 0) {
        console.warn('No verbs found in the sentence:', sentence);
        return { language, results: [] };
    }
    const results = [];

    for (const verb of gptVerbs) {
        const inf = verb.infinitive.toLowerCase();
        let cached = await getFromLocal(inf, language);
        if (cached) {
            console.log(`Found cached verb data for ${inf} in ${language}`);
            results.push(cached);
            continue; // Skip to the next verb if we have a local cache
        }


        if (!cached) {
            cached = await getFromSupabase(inf, language);
            if (cached) {
                await saveToLocal(inf, language, cached);
                console.log(`Found cached verb analysis for ${inf} in ${language} from Supabase`);
                results.push(cached);
                continue; // Skip to the next verb if we have a Supabase cache
            }
        }

        if (!cached) {
            await saveToLocal(inf, language, verb);
            // Always upsert into verb_analysis before upserting conjugation
            await saveToSupabase(inf, language, verb);
            console.log(`Saved verb analysis for ${inf} in ${language} to local storage and Supabase`);

            const conjugationData = await conjugateVerbFromEdge(inf, language);
            console.log(JSON.stringify(conjugationData, null, 2));
            await upsertVerbConjugation(inf, language, conjugationData.conjugation);

            cached = verb;
        }


        results.push(cached);
    }


    return { language, results };
};
