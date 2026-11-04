# hack1984-gtfol-starter

Starter app for the **HACK1984 GTFOL** workshop (get the f\*ck off localhost), Sat Nov 7, 300 Mass Ave, Boston. A tiny Next.js app with a prompt box: you deploy it to Vercel, give it a Neon Postgres database, and point it at a hosted model so it works somewhere other than your laptop.

## You need

- A GitHub account and a [Vercel](https://vercel.com/signup) account (sign up with GitHub)
- Node.js 20 or newer, git, and the Vercel CLI: `npm i -g vercel`

## Checkpoint 1: get a URL

1. Fork this repo.
2. Go to [vercel.com/new](https://vercel.com/new) and import your fork.
3. Hit **Deploy**. Don't change anything.
4. Open the URL on your phone. Asking a question fails for now, because Vercel can't reach the Ollama on your laptop. That's Checkpoint 3.

## Checkpoint 2: give it a memory

1. In your Vercel project, open the **Storage** tab, **Create Database**, pick **Neon**, and connect it. `DATABASE_URL` is added to your env.
2. In the Neon SQL editor, run:

   ```sql
   create table runs (
     id serial primary key,
     prompt text not null,
     output text,
     created_at timestamptz default now()
   );
   ```

3. Clone your fork, then link and pull the env:

   ```bash
   git clone https://github.com/<you>/hack1984-gtfol-starter && cd hack1984-gtfol-starter
   npm install
   vercel link
   vercel env pull .env.local
   ```

4. Create `app/api/runs/route.ts`:

   ```ts
   import { neon } from "@neondatabase/serverless";
   const sql = neon(process.env.DATABASE_URL!);

   export async function GET() {
     const rows = await sql`select * from runs order by created_at desc limit 20`;
     return Response.json(rows);
   }

   export async function POST(req: Request) {
     const { prompt } = await req.json();
     const [row] = await sql`insert into runs (prompt) values (${prompt}) returning *`;
     return Response.json(row);
   }
   ```

5. `git add -A && git commit -m "runs" && git push`. Vercel redeploys on its own, and the page starts listing runs.

Behind? `git checkout checkpoint-2` has this file already.

## Checkpoint 3: evict the local model

In Vercel, **Settings → Environment Variables**, set:

```
BASE_URL=https://api.groq.com/openai/v1
API_KEY=<the shared key on the whiteboard>
MODEL=llama-3.3-70b-versatile
```

Then redeploy (**Deployments → ⋯ → Redeploy**). Never commit the key. The shared key is revoked after closing on Sunday, so get your own at [console.groq.com](https://console.groq.com/keys) if you keep building.

## Run it locally

```bash
cp .env.example .env.local   # or vercel env pull .env.local
npm install
npm run dev                  # http://localhost:3000, talks to Ollama by default
```
