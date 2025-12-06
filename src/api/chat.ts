import OpenAI from "openai";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: "Missing prompt" });
        }

        const client = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        const completion = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.2
        });

        return res.status(200).json({
            text: completion.choices[0].message.content
        });
    } catch (err: any) {
        console.error("Chat API error:", err);
        return res.status(500).json({
            error: err?.message || "Unknown server error"
        });
    }
}
