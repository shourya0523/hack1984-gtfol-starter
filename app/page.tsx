"use client";

import { useEffect, useState } from "react";

type Run = { id: number; prompt: string; output: string | null; created_at: string };

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [runs, setRuns] = useState<Run[] | null>(null); // null = no /api/runs yet

  async function loadRuns() {
    try {
      const res = await fetch("/api/runs", { cache: "no-store" });
      setRuns(res.ok ? await res.json() : null);
    } catch {
      setRuns(null);
    }
  }

  useEffect(() => {
    loadRuns();
  }, []);

  async function ask(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim()) return;
    setBusy(true);
    setError("");
    setAnswer("");

    // Checkpoint 2: log the prompt to Neon, if app/api/runs/route.ts exists.
    let run_id: number | undefined;
    try {
      const saved = await fetch("/api/runs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (saved.ok) run_id = (await saved.json()).id;
    } catch {}

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, run_id }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error);
      else setAnswer(data.output);
    } catch (err) {
      setError(String(err));
    }
    setBusy(false);
    loadRuns();
  }

  return (
    <main>
      <span className="kicker">HACK1984 / GTFOL</span>
      <h1>
        Off <span>localhost</span>.
      </h1>
      <p className="lede">If a judge can open this on their phone, you shipped.</p>

      <form onSubmit={ask}>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="roast my laptop"
          aria-label="Prompt"
        />
        <button disabled={busy}>{busy ? "..." : "Ask"}</button>
      </form>

      <div className={`out ${error ? "err" : ""}`} aria-live="polite">
        {error || answer || <span className="hint">The answer shows up here.</span>}
      </div>

      <h2>Runs</h2>
      {runs === null ? (
        <p className="hint">
          No database yet. Checkpoint 2 adds <code>app/api/runs/route.ts</code> and every prompt lands here.
        </p>
      ) : runs.length === 0 ? (
        <p className="hint">Connected to Neon. Ask something.</p>
      ) : (
        <ul>
          {runs.map((r) => (
            <li key={r.id}>
              <span>{r.prompt}</span>
              <time>{new Date(r.created_at).toLocaleTimeString()}</time>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
