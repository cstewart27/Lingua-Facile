// supabase/functions/call-openai/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Prompt templates for clarity
const dynamicPromptTemplate = (sentence: string) => `
You will receive a sentence from a user. Return ONLY a valid JSON object (no markdown, no code block, no explanation, no extra text) with:
- the original input
- an analysis field with the overall CEFR level of the input sentence (A1, A2, B1, B2, C1, or C2) and a short justification
- rewritten versions for the analysis level and the next CEFR level up (if any)
- a short explanation of why each matches its CEFR level

Format:
{
  "input": "<original>",
  "analysis": {
    "level": "<overall CEFR level>",
    "justification": "<short justification>"
  },
  "results": [
    { "level": "<analysis level>", "sentence": "...", "explanation": "..." },
    { "level": "<next level>", "sentence": "...", "explanation": "..." }
  ]
}

IMPORTANT: Only return the analysis level and the next level up in the 'results' array. Do NOT include other levels. If the analysis level is the highest, only include that one.
Sentence: ${sentence}
`;

const fullLevelsPromptTemplate = (sentence: string, levelsStr: string) => `
You will receive a sentence from a user. Return ONLY a valid JSON object (no markdown, no code block, no explanation, no extra text) with:
- the original input
- an analysis field with the overall CEFR level of the input sentence (A1, A2, B1, B2, C1, or C2) and a short justification
- rewritten versions for each of these CEFR levels: ${levelsStr}
- a short explanation of why each matches its CEFR level

Format:
{
  "input": "<original>",
  "analysis": {
    "level": "<overall CEFR level>",
    "justification": "<short justification>"
  },
  "results": [
    { "level": "A1", "sentence": "...", "explanation": "..." },
    ...
    { "level": "C2", "sentence": "...", "explanation": "..." }
  ]
}

Only include these levels: ${levelsStr}
Sentence: ${sentence}
`;

// Helper to hash the prompt
async function hashPrompt(prompt: string): Promise<string> {
  const data = new TextEncoder().encode(prompt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

serve(async (req) => {
    try {
        const { sentence, levels, dynamic } = await req.json();
        const levelsList = Array.isArray(levels) && levels.length > 0 ? levels : ['A1','A2','B1','B2','C1','C2'];
        const levelsStr = levelsList.join(', ');
        let prompt = '';
        if (dynamic) {
            prompt = dynamicPromptTemplate(sentence);
        } else {
            prompt = fullLevelsPromptTemplate(sentence, levelsStr);
        }

        // Hash the prompt
        const prompt_hash = await hashPrompt(prompt);

        // Supabase client for DB access
        const supabase = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));

        // Check cache and validate timestamp (must be within last 30 days)
        const { data: cacheHit, error: cacheError } = await supabase
          .from('openai_cache')
          .select('response, created_at')
          .eq('prompt_hash', prompt_hash)
          .maybeSingle();
        if (cacheHit && cacheHit.response && cacheHit.created_at) {
          const createdAt = new Date(cacheHit.created_at);
          const now = new Date();
          const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
          if (now.getTime() - createdAt.getTime() < THIRTY_DAYS_MS) {
            console.log('[CACHE HIT]', prompt_hash);
            return new Response(JSON.stringify(cacheHit.response), {
              headers: { "Content-Type": "application/json" }
            });
          } else {
            console.log('[CACHE EXPIRED] - calling OPENAI', prompt_hash);
          }
        }


        const apiKey = Deno.env.get("OPENAI_API_KEY");
        const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "gpt-4o-mini-2024-07-18",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.7
            })
        });
        const data = await openaiRes.json();
        const content = data.choices?.[0]?.message?.content;
        let parsedContent;
        try {
            parsedContent = JSON.parse(content);
        } catch (e) {
            return new Response(JSON.stringify({ error: 'Failed to parse OpenAI response as JSON', raw: content }), {
                status: 500,
                headers: { "Content-Type": "application/json" }
            });
        }

        // Insert or update cache (upsert)
        await supabase.from('openai_cache').upsert({
          prompt_hash,
          prompt,
          response: parsedContent,
          created_at: new Date().toISOString()
        }, { onConflict: 'prompt_hash' });

        // Log the parsed content that will be sent to the client
        console.log(JSON.stringify(parsedContent));

        return new Response(JSON.stringify(parsedContent), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
});
