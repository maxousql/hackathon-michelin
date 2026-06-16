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
    `https://www.strava.com/api/v3/routes/${id}/export_gpx`,
    { headers: { Authorization: `Bearer ${token}` } },
  );

  if (!res.ok) {
    const body = await res.text();
    return NextResponse.json(
      { error: 'strava_error', detail: body },
      { status: res.status },
    );
  }

  const gpx = await res.text();
  return new NextResponse(gpx, {
    headers: { 'Content-Type': 'application/gpx+xml' },
  });
}
