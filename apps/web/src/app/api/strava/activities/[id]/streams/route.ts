import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const token = (await cookies()).get('strava_at')?.value;
  if (!token)
    return NextResponse.json({ error: 'not_connected' }, { status: 401 });

  const { id } = await params;

  const res = await fetch(
    `https://www.strava.com/api/v3/activities/${id}/streams?keys=latlng,altitude,distance&key_by_type=true`,
    { headers: { Authorization: `Bearer ${token}` } },
  );

  if (!res.ok)
    return NextResponse.json({ error: 'strava_error' }, { status: res.status });

  const data = await res.json();
  return NextResponse.json(data);
}
