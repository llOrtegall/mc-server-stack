import { Link } from 'react-router';
import type { Server } from '../types';
import { StatusBadge } from './StatusBadge';

export function ServerCard({ server }: { server: Server }) {
  return (
    <Link
      to={`/servers/${server.id}`}
      className="block bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-white">{server.name}</h3>
        <StatusBadge status={server.status} />
      </div>
      <div className="grid grid-cols-3 gap-2 text-sm text-gray-400">
        <div>
          <span className="text-gray-500">Version</span>
          <p className="text-gray-300">{server.version}</p>
        </div>
        <div>
          <span className="text-gray-500">Puerto</span>
          <p className="text-gray-300">{server.port}</p>
        </div>
        <div>
          <span className="text-gray-500">RAM</span>
          <p className="text-gray-300">{server.ram_mb} MB</p>
        </div>
      </div>
    </Link>
  );
}
