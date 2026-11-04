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
