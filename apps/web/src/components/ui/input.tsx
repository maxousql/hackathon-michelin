import type { InputHTMLAttributes } from 'react';

import styles from './input.module.css';

function joinClasses(...classes: Array<string | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={joinClasses(styles.input, className)}
      data-slot="input"
      {...props}
    />
  );
}
