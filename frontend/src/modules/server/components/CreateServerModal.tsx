import { Plus, X } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { Button } from '../../../shared/components/ui/Button.js';
import { Card } from '../../../shared/components/ui/Card.js';
import { Input, Label } from '../../../shared/components/ui/Field.js';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <Card className="max-h-[90vh] w-full max-w-lg overflow-y-auto">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-zinc-900/80 px-6 py-4 backdrop-blur-xl">
          <h2 className="text-lg font-bold text-white">Nuevo servidor</h2>
          <button
            type="button"
            onClick={() => {
              resetForm();
              onClose();
            }}
            aria-label="Cerrar"
            className="rounded-lg p-1 text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div>
            <Label htmlFor="srv-name">Nombre *</Label>
            <Input
              id="srv-name"
              required
              maxLength={100}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Mi servidor"
            />
          </div>
          <div>
            <Label htmlFor="srv-port">Puerto *</Label>
            <Input
              id="srv-port"
              type="number"
              required
              min={1024}
              max={65534}
              value={port}
              onChange={(e) => setPort(e.target.value)}
              placeholder="25565"
            />
          </div>
          <div>
            <Label htmlFor="srv-version">Version</Label>
            <Input
              id="srv-version"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              placeholder="1.21.4"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="srv-ram">RAM (MB)</Label>
              <Input
                id="srv-ram"
                type="number"
                min={512}
                max={maxRam}
                value={ramMb}
                onChange={(e) => setRamMb(e.target.value)}
                placeholder="1024"
              />
              {hostResources && (
                <p className="mt-1 text-xs text-zinc-500">
                  Host: {hostResources.getMemoryMb()} MB disponibles
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="srv-cpu">CPU Limit</Label>
              <Input
                id="srv-cpu"
                type="number"
                min={0.1}
                max={maxCpu}
                step={0.1}
                value={cpuLimit}
                onChange={(e) => setCpuLimit(e.target.value)}
                placeholder="1.0"
              />
              {hostResources && (
                <p className="mt-1 text-xs text-zinc-500">
                  Host: {hostResources.getCpuCores()} cores disponibles
                </p>
              )}
            </div>
          </div>

          <hr className="border-white/10" />

          <ServerPropertiesForm
            value={properties}
            onChange={setProperties}
            disabled={submitting}
            idPrefix="create"
          />

          {error && (
            <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-1">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                resetForm();
                onClose();
              }}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              <Plus className="h-4 w-4" />
              {submitting ? 'Creando...' : 'Crear servidor'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
