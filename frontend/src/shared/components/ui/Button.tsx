import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn.js';

type Variant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'danger'
  | 'warning'
  | 'info';
type Size = 'sm' | 'md';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

const base =
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium whitespace-nowrap transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none active:scale-[0.98]';

const variants: Record<Variant, string> = {
  primary:
    'bg-gradient-to-b from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-950/50 hover:from-emerald-400 hover:to-emerald-500 hover:shadow-emerald-700/30',
  danger:
    'bg-gradient-to-b from-red-500 to-red-600 text-white shadow-lg shadow-red-950/50 hover:from-red-400 hover:to-red-500',
  warning:
    'bg-gradient-to-b from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-950/50 hover:from-amber-400 hover:to-amber-500',
  info: 'bg-gradient-to-b from-sky-500 to-sky-600 text-white shadow-lg shadow-sky-950/50 hover:from-sky-400 hover:to-sky-500',
  secondary:
    'bg-white/5 text-zinc-100 border border-white/10 backdrop-blur hover:bg-white/10 hover:border-white/20',
  ghost: 'text-zinc-400 hover:text-white hover:bg-white/5',
};

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
};

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...rest
}: Props) {
  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      {...rest}
    >
      {children}
    </button>
  );
}
