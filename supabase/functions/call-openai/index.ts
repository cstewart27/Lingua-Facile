// supabase/functions/call-openai/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

serve(async (req) => {
    try {
        const { sentence, levels } = await req.json();
        const levelsList = Array.isArray(levels) && levels.length > 0 ? levels : ['A1','A2','B1','B2','C1','C2'];
        const levelsStr = levelsList.join(', ');
        const prompt = `
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

        // Parse the content string as JSON before returning
        let parsedContent;
        try {
            parsedContent = JSON.parse(content);
        } catch (e) {
            return new Response(JSON.stringify({ error: 'Failed to parse OpenAI response as JSON', raw: content }), {
                status: 500,
                headers: { "Content-Type": "application/json" }
            });
        }

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
