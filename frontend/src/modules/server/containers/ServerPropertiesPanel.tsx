import { useState } from 'react';
import { serverFactory } from '../application/factory.js';
import { ServerPropertiesForm } from '../components/ServerPropertiesForm.js';
import type { Server } from '../domain/Server.js';
import type { ServerPropertiesInput } from '../domain/ServerProperties.js';

interface Props {
  server: Server;
  onUpdated?: () => void;
}

export function ServerPropertiesPanel({ server, onUpdated }: Props) {
  const [properties, setProperties] = useState<ServerPropertiesInput>(
    server.getProperties(),
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleSave() {
    setSaving(true);
    setError('');
    setMessage('');
    try {
      await serverFactory.updateServerProperties(server.getId(), properties);
      setMessage(
        'Propiedades guardadas. El contenedor se recreó y el servidor quedó detenido.',
      );
      onUpdated?.();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al guardar propiedades',
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section
      aria-label="Propiedades del servidor"
      className="mt-6 bg-gray-800 rounded-lg border border-gray-700 p-6"
    >
      <h2 className="text-lg font-bold text-white mb-2">Propiedades</h2>
      <p className="text-xs text-yellow-400 mb-4">
        Guardar recrea el contenedor: el servidor se detiene y arranca con las
        nuevas propiedades. Los datos del mundo se conservan.
      </p>

      <ServerPropertiesForm
        value={properties}
        onChange={setProperties}
        disabled={saving}
        idPrefix="edit"
      />

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
      {message && <p className="mt-3 text-sm text-green-400">{message}</p>}

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="mt-4 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
      >
        {saving ? 'Guardando...' : 'Guardar propiedades'}
      </button>
    </section>
  );
}
