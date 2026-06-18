import type { ProductListItem } from '@michelin/contracts';
import Image from 'next/image';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';

import {
  productCycleType,
  productImageSrc,
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
  const imageSrc = productImageSrc(product);

  return (
    <Link href={`/products/${product.id}`} className={styles.card}>
      <div className={styles.media} aria-hidden="true">
        <Image
          className={styles.mediaImage}
          src={imageSrc}
          alt=""
          fill
          sizes="(min-width: 1180px) 18rem, (min-width: 720px) 40vw, 100vw"
        />
      </div>

      <div className={styles.body}>
        {cycleType && <p className={styles.cycleType}>{cycleType}</p>}
        <h3 className={styles.name}>{name}</h3>
        {range && range !== name && <p className={styles.range}>{range}</p>}
        {size && <p className={styles.size}>{size}</p>}

        {tags.length > 0 && (
          <div className={styles.tags}>
            {tags.map((tag) => (
              <Badge key={tag} tone="brand">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
