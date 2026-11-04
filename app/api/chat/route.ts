// Sends the prompt to whatever OpenAI-compatible model BASE_URL points at.
// On your laptop that's Ollama. On Vercel it has to be a hosted model (Checkpoint 3).
import { neon } from "@neondatabase/serverless";

const clean = (v: string | undefined, fallback: string) => (v || fallback).split(/\s+#/)[0].trim();

export async function POST(req: Request) {
  const { prompt, run_id } = await req.json();
  const BASE_URL = clean(process.env.BASE_URL, "http://localhost:11434/v1").replace(/\/$/, "");
  const API_KEY = clean(process.env.API_KEY, "ollama");
  const MODEL = clean(process.env.MODEL, "qwen2.5:7b");

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${API_KEY}` },
      body: JSON.stringify({ model: MODEL, messages: [{ role: "user", content: prompt }] }),
    });
  } catch {
    return Response.json(
      {
        error: `Can't reach ${BASE_URL}. If this is running on Vercel, that's expected: Vercel's servers don't have your laptop's Ollama. Do Checkpoint 3 and point BASE_URL at a hosted model.`,
      },
      { status: 502 },
    );
  }
  if (!res.ok) {
    return Response.json({ error: `${res.status} from the model: ${await res.text()}` }, { status: 502 });
  }

  const data = await res.json();
  const output: string = data.choices?.[0]?.message?.content ?? "";

  // After Checkpoint 2, save the answer next to the prompt the page already logged.
  if (process.env.DATABASE_URL && run_id) {
    try {
      const sql = neon(process.env.DATABASE_URL);
      await sql`update runs set output = ${output} where id = ${run_id}`;
    } catch {
      // no runs table yet; that's fine
    }
  }

  return Response.json({ output, model: MODEL });
}
