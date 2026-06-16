import type { ProductListItem } from '@michelin/contracts';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';

import {
  productCycleType,
  productName,
  productRange,
  productSize,
  productTags,
} from '../services/product-presenter';
import styles from './product-card.module.css';

interface ProductCardProps {
  product: ProductListItem;
}

export function ProductCard({ product }: ProductCardProps) {
  const name = productName(product);
  const range = productRange(product);
  const cycleType = productCycleType(product);
  const size = productSize(product);
  const tags = productTags(product);

  return (
    <Link href={`/products/${product.id}`} className={styles.card}>
      <div className={styles.media} aria-hidden="true">
        <span className={styles.mediaInitial}>
          {(range ?? name).charAt(0).toUpperCase()}
        </span>
      </div>

      <div className={styles.body}>
        {cycleType && <p className={styles.cycleType}>{cycleType}</p>}
        <h3 className={styles.name}>{name}</h3>
        {range && range !== name && <p className={styles.range}>{range}</p>}
        {size && <p className={styles.size}>{size}</p>}

        {tags.length > 0 && (
          <div className={styles.tags}>
            {tags.map((tag) => (
              <Badge key={tag}>{tag}</Badge>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
