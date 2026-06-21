import type { ReactNode } from 'react';
import { cn } from '../../lib/cn.js';

export interface TabItem {
  id: string;
  label: string;
  icon?: ReactNode;
}

interface Props {
  tabs: TabItem[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
}

/** Segmented tab bar in the glass theme. Controlled: parent owns the active id. */
export function Tabs({ tabs, active, onChange, className }: Props) {
  return (
    <div
      role="tablist"
      className={cn(
        'inline-flex gap-1 rounded-xl border border-white/10 bg-zinc-900/60 p-1 backdrop-blur-xl',
        className,
      )}
    >
      {tabs.map((tab) => {
        const selected = tab.id === active;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(tab.id)}
            className={cn(
              'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60',
              selected
                ? 'bg-white/10 text-white shadow-sm'
                : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200',
            )}
          >
            {tab.icon && (
              <span className="[&>svg]:h-4 [&>svg]:w-4">{tab.icon}</span>
            )}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
