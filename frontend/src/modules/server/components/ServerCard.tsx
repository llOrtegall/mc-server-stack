import { Boxes, Cpu, MemoryStick, Plug, Tag } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import type { Server } from '../domain/Server.js';
import { StatusBadge } from './StatusBadge.js';

export function ServerCard({ server }: { server: Server }) {
  return (
    <Link
      to={`/servers/${server.getId()}`}
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/60 p-5 shadow-lg shadow-black/30 backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-500/30 hover:shadow-emerald-950/30"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-emerald-500/5 blur-2xl transition-opacity duration-300 group-hover:bg-emerald-500/10"
      />
      <div className="relative mb-4 flex items-start justify-between gap-3">
        <h3 className="truncate text-lg font-semibold text-white">
          {server.getName()}
        </h3>
        <StatusBadge status={server.getStatus().toPrimitive()} />
      </div>
      <div className="relative grid grid-cols-3 gap-3 text-sm">
        <Stat
          icon={<Tag className="h-3.5 w-3.5" />}
          value={server.getVersion()}
        />
        <Stat
          icon={<Plug className="h-3.5 w-3.5" />}
          value={String(server.getPort())}
        />
        <Stat
          icon={<MemoryStick className="h-3.5 w-3.5" />}
          value={`${server.getRamMb()} MB`}
        />
      </div>
      <div className="relative mt-3 flex items-center gap-3 text-xs text-zinc-500">
        <span className="flex items-center gap-1.5">
          <Cpu className="h-3.5 w-3.5" />
          {server.getCpuLimit()} {server.getCpuLimit() === 1 ? 'core' : 'cores'}
        </span>
        <span className="flex items-center gap-1.5">
          <Boxes className="h-3.5 w-3.5" />
          {server.isBedrock() ? 'Bedrock' : 'Java'}
        </span>
      </div>
    </Link>
  );
}

function Stat({ icon, value }: { icon: ReactNode; value: string }) {
  return (
    <div className="flex items-center gap-1.5 text-zinc-300">
      <span className="text-zinc-500">{icon}</span>
      <span className="truncate">{value}</span>
    </div>
  );
}
