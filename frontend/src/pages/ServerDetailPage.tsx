import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import * as serversApi from '../api/servers';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { StatusBadge } from '../components/StatusBadge';
import type { Server } from '../types';

export function ServerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [server, setServer] = useState<Server | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showDelete, setShowDelete] = useState(false);

  const fetchServer = useCallback(async () => {
    if (!id) return;
    try {
      const data = await serversApi.getServer(id);
      setServer(data);
      setError('');
    } catch (err) {
      if (!server) {
        setError(
          err instanceof Error ? err.message : 'Error al cargar servidor',
        );
      }
    } finally {
      setLoading(false);
    }
  }, [id, server]);

  useEffect(() => {
    fetchServer();
  }, [fetchServer]);

  // Poll while in transitional state
  useEffect(() => {
    if (
      !server ||
      (server.status !== 'starting' && server.status !== 'stopping')
    )
      return;
    const interval = setInterval(fetchServer, 3000);
    return () => clearInterval(interval);
  }, [server?.status, fetchServer, server]);

  async function handleAction(action: 'start' | 'stop' | 'restart') {
    if (!id) return;
    setActionLoading(action);
    try {
      if (action === 'start') await serversApi.startServer(id);
      else if (action === 'stop') await serversApi.stopServer(id);
      else await serversApi.restartServer(id);
      await fetchServer();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error en accion');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDelete() {
    if (!id) return;
    setShowDelete(false);
    setActionLoading('delete');
    try {
      await serversApi.deleteServer(id);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar');
      setActionLoading(null);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-600 border-t-green-500" />
      </div>
    );
  }

  if (error && !server) {
    return (
      <div className="text-center py-16">
        <p className="text-red-400 mb-4">{error}</p>
        <Link to="/" className="text-green-400 hover:text-green-300 underline">
          Volver al dashboard
        </Link>
      </div>
    );
  }

  if (!server) return null;

  const isTransitioning =
    server.status === 'starting' || server.status === 'stopping';

  return (
    <div>
      <Link
        to="/"
        className="text-sm text-gray-400 hover:text-gray-300 mb-4 inline-block"
      >
        &larr; Volver
      </Link>

      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">{server.name}</h1>
            <p className="text-sm text-gray-400 mt-1">ID: {server.id}</p>
          </div>
          <StatusBadge status={server.status} />
        </div>

        {error && <p className="text-sm text-red-400 mb-4">{error}</p>}

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
          <InfoItem label="Version" value={server.version} />
          <InfoItem label="Puerto" value={String(server.port)} />
          <InfoItem label="Puerto RCON" value={String(server.rcon_port)} />
          <InfoItem label="RAM" value={`${server.ram_mb} MB`} />
          <InfoItem label="CPU Limit" value={String(server.cpu_limit)} />
          <InfoItem
            label="Creado"
            value={new Date(server.created_at).toLocaleDateString()}
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => handleAction('start')}
            disabled={
              actionLoading !== null ||
              (server.status !== 'stopped' && server.status !== 'error')
            }
            className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {actionLoading === 'start' ||
            (isTransitioning && server.status === 'starting')
              ? 'Iniciando...'
              : 'Iniciar'}
          </button>
          <button
            type="button"
            onClick={() => handleAction('stop')}
            disabled={actionLoading !== null || server.status !== 'running'}
            className="rounded-md bg-yellow-600 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {actionLoading === 'stop' ||
            (isTransitioning && server.status === 'stopping')
              ? 'Deteniendo...'
              : 'Detener'}
          </button>
          <button
            type="button"
            onClick={() => handleAction('restart')}
            disabled={actionLoading !== null || server.status !== 'running'}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {actionLoading === 'restart' ? 'Reiniciando...' : 'Reiniciar'}
          </button>
          <button
            type="button"
            onClick={() => setShowDelete(true)}
            disabled={actionLoading !== null}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors ml-auto"
          >
            {actionLoading === 'delete' ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={showDelete}
        title="Eliminar servidor"
        message={`Se eliminara "${server.name}" y su contenedor Docker. Esta accion no se puede deshacer.`}
        confirmLabel="Eliminar"
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
        destructive
      />
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-xs text-gray-500">{label}</span>
      <p className="text-sm text-gray-300">{value}</p>
    </div>
  );
}
