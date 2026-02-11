import type { ComponentProps } from 'react';

interface ButtonProps extends ComponentProps<'button'> {
  variant?: 'primary' | 'secondary';
}

export function Button({
  variant = 'primary',
  type = 'button',
  ...props
}: ButtonProps) {
  return <button type={type} data-variant={variant} {...props} />;
}
