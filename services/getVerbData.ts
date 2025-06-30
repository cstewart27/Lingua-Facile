import { detectLanguageFromEdge } from './detectLanguage';
import { analyzeVerbsFromEdge } from './analyzeVerbs';
import { getFromLocal, getFromSupabase, saveToLocal, saveToSupabase } from './verbCache';
import {conjugateVerbFromEdge} from "@/services/conjugateVerbService";

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


        if (!cached) {
            cached = await getFromSupabase(inf, language);
            if (cached) await saveToLocal(inf, language, cached);
        }

        if (!cached) {
            await saveToLocal(inf, language, verb);
            await saveToSupabase(inf, language, verb);
            cached = verb;
        }

        console.log(JSON.stringify(await conjugateVerbFromEdge(inf, language), null, 2));

        results.push(cached);
    }


    return { language, results };
};
