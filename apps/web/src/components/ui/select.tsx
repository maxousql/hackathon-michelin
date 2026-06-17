import type { SelectHTMLAttributes } from 'react';

import styles from './select.module.css';

function joinClasses(...classes: Array<string | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

export function Select({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={joinClasses(styles.select, className)} {...props}>
      {children}
    </select>
  );
}
