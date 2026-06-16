import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';

import { ProductDetail } from '@/features/products/components/product-detail';
import { fetchProduct } from '@/features/products/services/products.api';
import { productName } from '@/features/products/services/product-presenter';

export const dynamic = 'force-dynamic';

// Mémoïse la lecture sur la durée de la requête : generateMetadata et la page
// partagent le même appel à l'API.
const loadProduct = cache((id: number) => fetchProduct(id));

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

function parseId(raw: string): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const id = parseId((await params).id);
  if (id === null) return { title: 'Produit introuvable — MICHELIN Ride ID' };

  const product = await loadProduct(id);
  if (!product) return { title: 'Produit introuvable — MICHELIN Ride ID' };

  return { title: `${productName(product)} — MICHELIN Ride ID` };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const id = parseId((await params).id);
  if (id === null) notFound();

  const product = await loadProduct(id);
  if (!product) notFound();

  return <ProductDetail product={product} />;
}
