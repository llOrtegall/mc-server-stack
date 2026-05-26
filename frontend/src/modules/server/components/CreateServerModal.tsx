import { type FormEvent, useState } from 'react';
import type { HostResources } from '../../system/domain/HostResources.js';
import type { CreateServerInput } from '../domain/CreateServerInput.js';
import type { ServerPropertiesInput } from '../domain/ServerProperties.js';
import { ServerPropertiesForm } from './ServerPropertiesForm.js';

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: CreateServerInput) => Promise<void>;
  hostResources?: HostResources | null;
}

export function CreateServerModal({
  open,
  onClose,
  onSubmit,
  hostResources,
}: Props) {
  const [name, setName] = useState('');
  const [port, setPort] = useState('');
  const [version, setVersion] = useState('');
  const [ramMb, setRamMb] = useState('');
  const [cpuLimit, setCpuLimit] = useState('');
  const [properties, setProperties] = useState<ServerPropertiesInput>({});
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const maxCpu = hostResources?.getCpuCores() ?? 8;
  const maxRam = hostResources?.getMemoryMb() ?? 16384;

  function resetForm() {
    setName('');
    setPort('');
    setVersion('');
    setRamMb('');
    setCpuLimit('');
    setProperties({});
    setError('');
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await onSubmit({
        name,
        port: Number(port),
        version: version || undefined,
        ramMb: ramMb ? Number(ramMb) : undefined,
        cpuLimit: cpuLimit ? Number(cpuLimit) : undefined,
        properties,
      });
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear servidor');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-4">Nuevo servidor</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label
              htmlFor="srv-name"
              className="block text-sm text-gray-300 mb-1"
            >
              Nombre *
            </label>
            <input
              id="srv-name"
              required
              maxLength={100}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md bg-gray-700 border border-gray-600 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label
              htmlFor="srv-port"
              className="block text-sm text-gray-300 mb-1"
            >
              Puerto *
            </label>
            <input
              id="srv-port"
              type="number"
              required
              min={1024}
              max={65534}
              value={port}
              onChange={(e) => setPort(e.target.value)}
              placeholder="25565"
              className="w-full rounded-md bg-gray-700 border border-gray-600 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label
              htmlFor="srv-version"
              className="block text-sm text-gray-300 mb-1"
            >
              Version
            </label>
            <input
              id="srv-version"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              placeholder="1.21.4"
              className="w-full rounded-md bg-gray-700 border border-gray-600 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="srv-ram"
                className="block text-sm text-gray-300 mb-1"
              >
                RAM (MB)
              </label>
              <input
                id="srv-ram"
                type="number"
                min={512}
                max={maxRam}
                value={ramMb}
                onChange={(e) => setRamMb(e.target.value)}
                placeholder="1024"
                className="w-full rounded-md bg-gray-700 border border-gray-600 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              {hostResources && (
                <p className="mt-1 text-xs text-gray-400">
                  Host: {hostResources.getMemoryMb()} MB disponibles
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="srv-cpu"
                className="block text-sm text-gray-300 mb-1"
              >
                CPU Limit
              </label>
              <input
                id="srv-cpu"
                type="number"
                min={0.1}
                max={maxCpu}
                step={0.1}
                value={cpuLimit}
                onChange={(e) => setCpuLimit(e.target.value)}
                placeholder="1.0"
                className="w-full rounded-md bg-gray-700 border border-gray-600 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              {hostResources && (
                <p className="mt-1 text-xs text-gray-400">
                  Host: {hostResources.getCpuCores()} cores disponibles
                </p>
              )}
            </div>
          </div>

          <hr className="border-gray-700" />

          <ServerPropertiesForm
            value={properties}
            onChange={setProperties}
            disabled={submitting}
            idPrefix="create"
          />

          {error && <p className="text-sm text-red-400">{error}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="rounded-md px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {submitting ? 'Creando...' : 'Crear servidor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
