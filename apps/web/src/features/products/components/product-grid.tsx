import type { ProductListItem } from '@michelin/contracts';

import { ProductCard } from './product-card';
import styles from './product-grid.module.css';

interface ProductGridProps {
  items: ProductListItem[];
}

export function ProductGrid({ items }: ProductGridProps) {
  return (
    <div className={styles.grid}>
      {items.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
