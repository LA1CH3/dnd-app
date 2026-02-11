import type { ComponentProps } from 'react';

interface TextFieldProps extends Omit<ComponentProps<'input'>, 'id'> {
  label: string;
  name: string;
}

export function TextField({ label, name, ...inputProps }: TextFieldProps) {
  return (
    <div>
      <label htmlFor={name}>{label}</label>
      <input id={name} name={name} {...inputProps} />
    </div>
  );
}
