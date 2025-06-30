import { serve as serveAnalyze } from "https://deno.land/std@0.192.0/http/server.ts";

const OPENAI_API_KEY_ANALYZE = Deno.env.get("OPENAI_API_KEY");

serveAnalyze(async (req) => {
    try {
        const { sentence, language } = await req.json();
        if (!sentence || !language) {
            return new Response(JSON.stringify({ error: "Missing sentence or language" }), { status: 400 });
        }

        const prompt = `
For the sentence "${sentence}" in ${language}, return a JSON object with a 'verbs' array. Each verb should include:
- form
- infinitive
- tense
- mood
- person
- number
If there are no verbs, return { "verbs": [] }.
Output only valid JSON, nothing else.

Sample format:
{
  "verbs": [
    {
      "form": "chiami",
      "infinitive": "chiamare",
      "tense": "present",
      "mood": "indicative",
      "person": "second",
      "number": "singular"
    }
  ]
}
`;

        const res = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${OPENAI_API_KEY_ANALYZE}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "gpt-4o",
                messages: [
                    { role: "system", content: "You are a grammar tutor. Output only JSON." },
                    { role: "user", content: prompt },
                ],
                temperature: 0.2,
            }),
        });

        const data = await res.json();
        let verbs = [];
        try {
            let content = data.choices[0].message.content;
            // Remove Markdown code block markers if present
            content = content.replace(/^```[a-zA-Z]*\n?|```$/g, '').trim();
            const parsed = JSON.parse(content);
            verbs = parsed.verbs || [];
            if (!Array.isArray(verbs) || verbs.length === 0) {
                console.warn(`No verbs found in the sentence: ${sentence}`);
                console.warn('Raw OpenAI response:', data.choices[0].message.content);
            }
        } catch (err) {
            console.error('Failed to parse OpenAI response as JSON:', data.choices[0].message.content);
            return new Response(JSON.stringify({ error: 'Failed to parse OpenAI response as JSON' }), { status: 500 });
        }

        return new Response(JSON.stringify({ verbs }), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (e) {
        return new Response(JSON.stringify({ error: "Failed to analyze verbs" }), { status: 500 });
    }
});