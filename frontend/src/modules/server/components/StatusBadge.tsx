import type { ServerStatusValue } from '../domain/ServerStatus.js';

const styles: Record<ServerStatusValue, { wrap: string; dot: string }> = {
  provisioning: {
    wrap: 'bg-sky-500/10 text-sky-400 ring-sky-500/30',
    dot: 'bg-sky-400 animate-pulse',
  },
  running: {
    wrap: 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/30',
    dot: 'bg-emerald-400 shadow-[0_0_8px_2px_rgba(52,211,153,0.7)]',
  },
  stopped: {
    wrap: 'bg-zinc-500/10 text-zinc-400 ring-zinc-500/30',
    dot: 'bg-zinc-500',
  },
  starting: {
    wrap: 'bg-amber-500/10 text-amber-400 ring-amber-500/30',
    dot: 'bg-amber-400 animate-pulse',
  },
  stopping: {
    wrap: 'bg-amber-500/10 text-amber-400 ring-amber-500/30',
    dot: 'bg-amber-400 animate-pulse',
  },
  error: {
    wrap: 'bg-red-500/10 text-red-400 ring-red-500/30',
    dot: 'bg-red-400 shadow-[0_0_8px_2px_rgba(248,113,113,0.6)]',
  },
};

// Most statuses read fine as-is; `provisioning` gets a friendlier label since it
// is what the user sees right after creating a server (while the image pulls).
const labels: Partial<Record<ServerStatusValue, string>> = {
  provisioning: 'creando',
};

export function StatusBadge({ status }: { status: ServerStatusValue }) {
  const s = styles[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${s.wrap}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {labels[status] ?? status}
    </span>
  );
}
