import type { ReactNode } from 'react';

import styles from './layout.module.css';

export default function RepriseLayout({ children }: { children: ReactNode }) {
  return <main className={styles.main}>{children}</main>;
}
