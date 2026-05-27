import type {
  InputHTMLAttributes,
  LabelHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';
import { cn } from '../../lib/cn.js';

export const fieldClass =
  'w-full rounded-lg bg-zinc-950/50 border border-white/10 px-3 py-2 text-sm text-white placeholder-zinc-500 transition-colors focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50';

export function Label({
  className,
  children,
  ...rest
}: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: generic primitive; callers pass htmlFor to bind the control
    <label
      className={cn(
        'mb-1.5 block text-xs font-medium text-zinc-400',
        className,
      )}
      {...rest}
    >
      {children}
    </label>
  );
}

export function Input({
  className,
  ...rest
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(fieldClass, className)} {...rest} />;
}

export function Textarea({
  className,
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(fieldClass, className)} {...rest} />;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  children: ReactNode;
}

export function Select({ className, children, ...rest }: SelectProps) {
  return (
    <select className={cn(fieldClass, 'cursor-pointer', className)} {...rest}>
      {children}
    </select>
  );
}
