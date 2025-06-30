import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { franc } from "npm:franc";

// GPT API key (set this in your Supabase project secrets!)
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

const isoToLang: Record<string, string> = {
    eng: "english",
    spa: "spanish",
    fra: "french",
    deu: "german",
    ita: "italian",
    por: "portuguese",
    rus: "russian",
    jpn: "japanese",
    kor: "korean",
    cmn: "chinese"
};

async function detectWithGPT(sentence: string): Promise<string> {
    const prompt = `
                            Detect the language of this sentence. Only return the lowercase name, like "italian", "french", etc.
                            
                            Sentence: "${sentence}"
                            `;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "You are a language detector. Return only the language name in lowercase." },
                { role: "user", content: prompt },
            ],
            temperature: 0,
        }),
    });

    const data = await response.json();
    return data.choices[0]?.message?.content?.trim().toLowerCase() || "unknown";
}

serve(async (req) => {
    try {
        const { sentence } = await req.json();
        if (!sentence || sentence.length < 3) {
            return new Response(JSON.stringify({ error: "Sentence too short" }), { status: 400 });
        }

        const langCode = franc(sentence);
        let language = isoToLang[langCode];

        if (!language) {
            console.warn(`Language code "${langCode}" not recognized, using GPT for detection.`);
            language = await detectWithGPT(sentence);
        }
        else {
            console.log(`Detected language from franc: ${language}`);
        }

        return new Response(JSON.stringify({ language }), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (e) {
        console.error("Error:", e);
        return new Response(JSON.stringify({ error: "Failed to detect language" }), { status: 500 });
    }
});
