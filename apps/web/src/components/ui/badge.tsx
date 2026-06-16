import type { ReactNode } from 'react';

import styles from './badge.module.css';

type Tone = 'neutral' | 'brand' | 'success';

interface BadgeProps {
  children: ReactNode;
  tone?: Tone;
}

export function Badge({ children, tone = 'neutral' }: BadgeProps) {
  return (
    <span className={styles.badge} data-tone={tone}>
      {children}
    </span>
  );
}
