import express from "express";
import cors from "cors";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
if (!apiKey) {
  console.error("Missing OPENAI_API_KEY or VITE_OPENAI_API_KEY in environment");
}

const client = new OpenAI({ apiKey });

app.post("/api/chat", async (req, res) => {
  try {
    const { prompt, model = "gpt-4o-mini" } = req.body;
    if (!prompt) return res.status(400).json({ error: "Missing prompt in request body" });

    const completion = await client.chat.completions.create({
      model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    });

    const text = completion.choices?.[0]?.message?.content || "";
    return res.json({ text });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "OpenAI request failed" });
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`OpenAI proxy server listening on http://localhost:${port}`));
