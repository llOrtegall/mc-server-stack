import { AlertTriangle, Save, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../../../shared/components/ui/Button.js';
import { Card } from '../../../shared/components/ui/Card.js';
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
    <Card
      aria-label="Propiedades del servidor"
      className="mt-6 p-6"
      role="region"
    >
      <div className="mb-4 flex items-center gap-2">
        <SlidersHorizontal className="h-5 w-5 text-emerald-400" />
        <h2 className="text-lg font-bold text-white">Propiedades</h2>
      </div>

      <p className="mb-5 flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        Guardar recrea el contenedor: el servidor se detiene y arranca con las
        nuevas propiedades. Los datos del mundo se conservan.
      </p>

      <ServerPropertiesForm
        value={properties}
        onChange={setProperties}
        disabled={saving}
        idPrefix="edit"
      />

      {error && (
        <p className="mt-3 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      )}
      {message && (
        <p className="mt-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">
          {message}
        </p>
      )}

      <Button onClick={handleSave} disabled={saving} className="mt-4">
        <Save className="h-4 w-4" />
        {saving ? 'Guardando...' : 'Guardar propiedades'}
      </Button>
    </Card>
  );
}
