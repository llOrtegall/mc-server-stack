import type { HostResources } from '../domain/HostResources.js';

interface Props {
  resources: HostResources;
}

export function HostCapacityCard({ resources }: Props) {
  return (
    <section
      aria-label="Capacidad del host"
      className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-3"
    >
      <h2 className="text-xs font-medium uppercase tracking-wide text-gray-400">
        Capacidad del host
      </h2>
      <p className="mt-1 text-sm text-gray-200">
        <span className="font-semibold text-white">
          {resources.getCpuCores()}
        </span>{' '}
        cores ·{' '}
        <span className="font-semibold text-white">
          {resources.getMemoryMb()}
        </span>{' '}
        MB RAM
      </p>
    </section>
  );
}
