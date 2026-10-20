import { connection } from 'next/server';

/** Load balancer health check. Rendered per request so it proves the server process is up. */
export async function GET() {
  await connection();
  return Response.json({ status: 'ok' });
}
