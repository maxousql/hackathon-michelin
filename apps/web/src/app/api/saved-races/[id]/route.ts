import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const apiUrl = () =>
  (process.env.API_INTERNAL_URL ?? 'http://localhost:3001/api/v1').replace(
    /\/+$/,
    '',
  );

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const token = (await cookies()).get('auth_token')?.value;
  if (!token)
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const res = await fetch(`${apiUrl()}/saved-races/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 204) return new NextResponse(null, { status: 204 });
  return NextResponse.json(await res.json(), { status: res.status });
}
