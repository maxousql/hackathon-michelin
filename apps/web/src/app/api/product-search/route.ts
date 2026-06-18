import { NextResponse } from 'next/server';

import { fetchProducts } from '@/features/products/services/products.api';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim() ?? '';

  if (q.length < 2) {
    return NextResponse.json({ items: [] });
  }

  const result = await fetchProducts({
    page: 1,
    productType: 'TYRE',
    q,
    sort: 'range',
  });

  return NextResponse.json({ items: result.items.slice(0, 8) });
}
