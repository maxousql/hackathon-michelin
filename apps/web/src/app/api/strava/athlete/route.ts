import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const token = (await cookies()).get('strava_at')?.value;
  if (!token)
    return NextResponse.json({ error: 'not_connected' }, { status: 401 });

  const res = await fetch('https://www.strava.com/api/v3/athlete', {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  if (!res.ok) {
    return NextResponse.json({ error: 'strava_error' }, { status: res.status });
  }

  return NextResponse.json(await res.json());
}
