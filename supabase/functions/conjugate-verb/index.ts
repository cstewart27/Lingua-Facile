import { serve as serveConjugate } from "https://deno.land/std@0.192.0/http/server.ts";

console.log('conjugate-verb function file loaded');
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");


const templates: Record<string, string> = {
    english: `Conjugate the English verb "{{infinitive}}" in present simple, past simple, and future simple.

Format response:
{
  "infinitive": "{{infinitive}}",
  "language": "english",
  "conjugation": {
    "present_simple": {
      "1s": "...", "2s": "...", "3s": "...",
      "1p": "...", "2p": "...", "3p": "..."
    },
    "past_simple": { ... },
    "future_simple": { ... }
  }
}
IMPORTANT: Return ONLY a valid JSON object. Do NOT use markdown, do NOT use a code block, do NOT add any explanation or extra text. Only output the JSON object.`,

    italian: `Conjugate the Italian verb "{{infinitive}}" in the following moods and tenses:
- Indicativo: presente, imperfetto, passato prossimo, futuro semplice
- Congiuntivo: presente, imperfetto
- Condizionale: presente
- Imperativo: presente

Format response:
{
  "infinitive": "{{infinitive}}",
  "language": "italian",
  "conjugation": {
    "indicativo": {
      "presente": { "1s": "...", ..., "3p": "..." },
      ...
    },
    "congiuntivo": {
      "presente": { ... },
      "imperfetto": { ... }
    },
    "condizionale": {
      "presente": { ... }
    },
    "imperativo": {
      "presente": { ... }
    }
  }
}
IMPORTANT: Return ONLY a valid JSON object. Do NOT use markdown, do NOT use a code block, do NOT add any explanation or extra text. Only output the JSON object.`,

    spanish: `Conjugate the Spanish verb "{{infinitive}}" in the following:
- Indicativo: presente, pretérito, imperfecto, futuro
- Subjuntivo: presente
- Condicional: simple
- Imperativo: afirmativo

Format response:
{
  "infinitive": "{{infinitive}}",
  "language": "spanish",
  "conjugation": {
    "indicativo": {
      "presente": { ... },
      "pretérito": { ... },
      "imperfecto": { ... },
      "futuro": { ... }
    },
    "subjuntivo": {
      "presente": { ... }
    },
    "condicional": {
      "simple": { ... }
    },
    "imperativo": {
      "afirmativo": { ... }
    }
  }
}
IMPORTANT: Return ONLY a valid JSON object. Do NOT use markdown, do NOT use a code block, do NOT add any explanation or extra text. Only output the JSON object.`,

    french: `Conjugate the French verb "{{infinitive}}" in:
- Indicatif: présent, imparfait, futur simple, passé composé
- Subjonctif: présent
- Conditionnel: présent
- Impératif: présent

Format response:
{
  "infinitive": "{{infinitive}}",
  "language": "french",
  "conjugation": {
    "indicatif": {
      "présent": { ... },
      "imparfait": { ... },
      "futur_simple": { ... },
      "passé_composé": { ... }
    },
    "subjonctif": {
      "présent": { ... }
    },
    "conditionnel": {
      "présent": { ... }
    },
    "impératif": {
      "présent": { ... }
    }
  }
}
IMPORTANT: Return ONLY a valid JSON object. Do NOT use markdown, do NOT use a code block, do NOT add any explanation or extra text. Only output the JSON object.`,

    german: `Conjugate the German verb "{{infinitive}}" in:
- Präsens
- Präteritum
- Perfekt
- Futur I

Format response:
{
  "infinitive": "{{infinitive}}",
  "language": "german",
  "conjugation": {
    "präsens": { ... },
    "präteritum": { ... },
    "perfekt": { ... },
    "futur_I": { ... }
  }
}
IMPORTANT: Return ONLY a valid JSON object. Do NOT use markdown, do NOT use a code block, do NOT add any explanation or extra text. Only output the JSON object.`,

    portuguese: `Conjugate the Portuguese verb "{{infinitive}}" in:
- Presente, pretérito perfeito, imperfeito, futuro
- Subjuntivo: presente
- Condicional: simples
- Imperativo: afirmativo

Format response:
{
  "infinitive": "{{infinitive}}",
  "language": "portuguese",
  "conjugation": {
    "presente": { ... },
    "pretérito_perfeito": { ... },
    "imperfeito": { ... },
    "futuro": { ... },
    "subjuntivo": { "presente": { ... } },
    "condicional": { "simples": { ... } },
    "imperativo": { "afirmativo": { ... } }
  }
}
IMPORTANT: Return ONLY a valid JSON object. Do NOT use markdown, do NOT use a code block, do NOT add any explanation or extra text. Only output the JSON object.`,

    russian: `Conjugate the Russian verb "{{infinitive}}" in:
- Present, past, and future

Format response:
{
  "infinitive": "{{infinitive}}",
  "language": "russian",
  "conjugation": {
    "present": { ... },
    "past": { ... },
    "future": { ... }
  }
}
IMPORTANT: Return ONLY a valid JSON object. Do NOT use markdown, do NOT use a code block, do NOT add any explanation or extra text. Only output the JSON object.`,

    japanese: `Conjugate the Japanese verb "{{infinitive}}" in:
- Present plain: positive, negative
- Past plain: positive, negative

Format response:
{
  "infinitive": "{{infinitive}}",
  "language": "japanese",
  "conjugation": {
    "present_plain": {
      "positive": "...",
      "negative": "..."
    },
    "past_plain": {
      "positive": "...",
      "negative": "..."
    }
  }
}
IMPORTANT: Return ONLY a valid JSON object. Do NOT use markdown, do NOT use a code block, do NOT add any explanation or extra text. Only output the JSON object.`,

    korean: `Conjugate the Korean verb "{{infinitive}}" in:
- Present: formal, informal
- Past: formal, informal

Format response:
{
  "infinitive": "{{infinitive}}",
  "language": "korean",
  "conjugation": {
    "present": {
      "formal": "...",
      "informal": "..."
    },
    "past": {
      "formal": "...",
      "informal": "..."
    }
  }
}
IMPORTANT: Return ONLY a valid JSON object. Do NOT use markdown, do NOT use a code block, do NOT add any explanation or extra text. Only output the JSON object.`,

    chinese: `Conjugate the Mandarin Chinese verb "{{infinitive}}" in:
- Present, past, future

Format response:
{
  "infinitive": "{{infinitive}}",
  "language": "chinese",
  "conjugation": {
    "present": { "form": "..." },
    "past": { "form": "..." },
    "future": { "form": "..." }
  }
}
IMPORTANT: Return ONLY a valid JSON object. Do NOT use markdown, do NOT use a code block, do NOT add any explanation or extra text. Only output the JSON object.`
};

console.log('About to call serveConjugate');
serveConjugate(async (req) => {
    try {
        console.log('Function invoked');
        if (!OPENAI_API_KEY) {
            console.error('OPENAI_API_KEY not set');
            return new Response(JSON.stringify({ error: "OPENAI_API_KEY not set" }), { status: 500 });
        }

        const { infinitive, language } = await req.json();
        console.log('Parsed request:', { infinitive, language });
        if (!infinitive || !language) {
            console.log('Missing infinitive or language');
            return new Response(JSON.stringify({ error: "Missing infinitive or language" }), { status: 400 });
        }

        const template = templates[language.toLowerCase()];
        if (!template) {
            console.log('Unsupported language:', language);
            return new Response(JSON.stringify({ error: "Unsupported language" }), { status: 400 });
        }

        const prompt = template.replace(/{{infinitive}}/g, infinitive);
        console.log('Prompt:', prompt);

        const res = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${OPENAI_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "gpt-4o",
                messages: [
                    { role: "system", content: "You are a verb conjugation engine. Return ONLY a valid JSON object. Do NOT use markdown, do NOT use a code block, do NOT add any explanation or extra text. Only output the JSON object." },
                    { role: "user", content: prompt },
                ],
                temperature: 0,
            }),
        });

        const data = await res.json();
        const content = data.choices?.[0]?.message?.content || "{}";
        return new Response(content, { headers: { "Content-Type": "application/json" } });
    } catch (e) {
        console.error('Conjugate-verb function error:', e);
        return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
    }
});