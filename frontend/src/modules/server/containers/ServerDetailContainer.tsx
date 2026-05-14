import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog.js';
import { Spinner } from '../../../shared/components/Spinner.js';
import { ServerDetail } from '../components/ServerDetail.js';
import { useServer } from '../hooks/useServer.js';

export function ServerDetailContainer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { server, loading, error, actionLoading, runAction, removeServer } =
    useServer(id ?? '');
  const [showDelete, setShowDelete] = useState(false);

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
      <ServerDetail
        server={server}
        error={error}
        actionLoading={actionLoading}
        onAction={runAction}
        onRequestDelete={() => setShowDelete(true)}
      />

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
