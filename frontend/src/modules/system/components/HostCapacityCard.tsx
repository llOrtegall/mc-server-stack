import { Cpu, MemoryStick, Server } from 'lucide-react';
import type { HostResources } from '../domain/HostResources.js';

interface Props {
  resources: HostResources;
}

export function HostCapacityCard({ resources }: Props) {
  return (
    <section
      aria-label="Capacidad del host"
      className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-2xl border border-white/10 bg-zinc-900/60 px-5 py-4 shadow-lg shadow-black/30 backdrop-blur-xl"
    >
      <div className="flex items-center gap-2 text-zinc-400">
        <Server className="h-4 w-4 text-emerald-400" />
        <span className="text-xs font-medium uppercase tracking-wide">
          Capacidad del host
        </span>
      </div>
      <div className="flex items-center gap-2 text-sm text-zinc-300">
        <Cpu className="h-4 w-4 text-zinc-500" />
        <span className="font-semibold text-white">
          {resources.getCpuCores()}
        </span>{' '}
        cores
      </div>
      <div className="flex items-center gap-2 text-sm text-zinc-300">
        <MemoryStick className="h-4 w-4 text-zinc-500" />
        <span className="font-semibold text-white">
          {resources.getMemoryMb()}
        </span>{' '}
        MB RAM
      </div>
    </section>
  );
}
