import {
  Archive,
  ChevronLeft,
  SlidersHorizontal,
  Terminal,
} from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog.js';
import { Spinner } from '../../../shared/components/Spinner.js';
import { Tabs } from '../../../shared/components/ui/Tabs.js';
import { BackupsPanel } from '../../backup/containers/BackupsPanel.js';
import { ConsolePanel } from '../../console/containers/ConsolePanel.js';
import { ServerDetail } from '../components/ServerDetail.js';
import { useServer } from '../hooks/useServer.js';
import { ServerPropertiesPanel } from './ServerPropertiesPanel.js';

type Tab = 'data' | 'console' | 'backups';

const TABS = [
  { id: 'data', label: 'Datos', icon: <SlidersHorizontal /> },
  { id: 'console', label: 'Consola', icon: <Terminal /> },
  { id: 'backups', label: 'Backups', icon: <Archive /> },
];

export function ServerDetailContainer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    server,
    loading,
    error,
    actionLoading,
    runAction,
    removeServer,
    refresh,
  } = useServer(id ?? '');
  const [showDelete, setShowDelete] = useState(false);
  const [tab, setTab] = useState<Tab>('data');

  if (loading) return <Spinner />;

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

  async function handleConfirmDelete() {
    setShowDelete(false);
    if (await removeServer()) navigate('/');
  }

  return (
    <>
      <Link
        to="/"
        className="inline-flex items-center gap-1 text-sm text-zinc-400 transition-colors hover:text-zinc-200 px-4"
      >
        <ChevronLeft className="h-4 w-4" />
        Volver
      </Link>

      <Tabs
        tabs={TABS}
        active={tab}
        onChange={(id) => setTab(id as Tab)}
        className="mt-3 mb-6 flex"
      />

      {tab === 'data' && (
        <>
          <ServerDetail
            server={server}
            error={error}
            actionLoading={actionLoading}
            onAction={runAction}
            onRequestDelete={() => setShowDelete(true)}
          />
          <ServerPropertiesPanel server={server} onUpdated={refresh} />
        </>
      )}

      {tab === 'console' && (
        <ConsolePanel serverId={server.getId()} readOnly={server.isBedrock()} />
      )}

      {tab === 'backups' && <BackupsPanel serverId={server.getId()} />}

      <ConfirmDialog
        open={showDelete}
        title="Eliminar servidor"
        message={`Se eliminara "${server.getName()}" y su contenedor Docker. Esta accion no se puede deshacer.`}
        confirmLabel="Eliminar"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDelete(false)}
        destructive
      />
    </>
  );
}
