import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

const apiUrl = () =>
  (process.env.API_INTERNAL_URL ?? 'http://localhost:3001/api/v1').replace(
    /\/+$/,
    '',
  );

async function getToken() {
  return (await cookies()).get('auth_token')?.value ?? null;
}

export async function GET() {
  const token = await getToken();
  if (!token)
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const res = await fetch(`${apiUrl()}/saved-races`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  return NextResponse.json(await res.json(), { status: res.status });
}

export async function POST(req: NextRequest) {
  const token = await getToken();
  if (!token)
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await req.json();
  const res = await fetch(`${apiUrl()}/saved-races`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error('[saved-races POST] API error', res.status, json);
  }
  return NextResponse.json(json, { status: res.status });
}
