import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const token = (await cookies()).get('strava_at')?.value;
  if (!token)
    return NextResponse.json({ error: 'not_connected' }, { status: 401 });

  const res = await fetch(
    'https://www.strava.com/api/v3/athlete/routes?per_page=20&page=1',
    { headers: { Authorization: `Bearer ${token}` } },
  );

  if (!res.ok)
    return NextResponse.json({ error: 'strava_error' }, { status: res.status });

  const data = await res.json();
  return NextResponse.json(data);
}
