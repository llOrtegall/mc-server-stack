import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn.js';

interface Props extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

/** Glass surface: translucent zinc, soft border, blur and depth. */
export function Card({ className, children, ...rest }: Props) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-white/10 bg-zinc-900/60 shadow-xl shadow-black/40 backdrop-blur-xl',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
