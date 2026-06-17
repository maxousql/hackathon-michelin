import type {
  OptionHTMLAttributes,
  OptgroupHTMLAttributes,
  SelectHTMLAttributes,
} from 'react';

import styles from './native-select.module.css';

function joinClasses(...classes: Array<string | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

export function NativeSelect({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={joinClasses(styles.nativeSelect, className)}
      data-slot="native-select"
      {...props}
    >
      {children}
    </select>
  );
}

export function NativeSelectOption({
  ...props
}: OptionHTMLAttributes<HTMLOptionElement>) {
  return <option data-slot="native-select-option" {...props} />;
}

export function NativeSelectOptGroup({
  ...props
}: OptgroupHTMLAttributes<HTMLOptGroupElement>) {
  return <optgroup data-slot="native-select-optgroup" {...props} />;
}
