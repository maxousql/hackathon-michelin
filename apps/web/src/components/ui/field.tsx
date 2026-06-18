import type { HTMLAttributes, LabelHTMLAttributes } from 'react';

import styles from './field.module.css';

function joinClasses(...classes: Array<string | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

interface FieldProps extends HTMLAttributes<HTMLDivElement> {
  orientation?: 'vertical' | 'horizontal' | 'responsive';
}

export function Field({
  className,
  orientation = 'vertical',
  ...props
}: FieldProps) {
  return (
    <div
      className={joinClasses(styles.field, className)}
      data-orientation={orientation}
      role="group"
      {...props}
    />
  );
}

export function FieldLabel({
  className,
  ...props
}: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={joinClasses(styles.fieldLabel, className)}
      data-slot="field-label"
      {...props}
    />
  );
}
