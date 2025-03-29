import type { ServerStatus } from '../types';

const statusStyles: Record<ServerStatus, string> = {
  running: 'bg-green-500/20 text-green-400',
  stopped: 'bg-gray-500/20 text-gray-400',
  starting: 'bg-yellow-500/20 text-yellow-400 animate-pulse',
  stopping: 'bg-yellow-500/20 text-yellow-400 animate-pulse',
  error: 'bg-red-500/20 text-red-400',
};

export function StatusBadge({ status }: { status: ServerStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[status]}`}
    >
      {status}
    </span>
  );
}
