import { Save } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { Button } from '../../../shared/components/ui/Button.js';
import { Input, Label, Select } from '../../../shared/components/ui/Field.js';
import {
  BACKUP_LOCATIONS,
  type BackupLocationValue,
  LOCATION_LABELS,
} from '../domain/BackupLocation.js';
import type { SaveScheduleInput } from '../domain/BackupRepository.js';
import {
  BACKUP_FREQUENCIES,
  type BackupFrequencyValue,
  type BackupSchedule,
  FREQUENCY_LABELS,
} from '../domain/BackupSchedule.js';

interface Props {
  schedule: BackupSchedule;
  cloudEnabled: boolean;
  saving: boolean;
  error: string;
  message: string;
  onSave: (input: SaveScheduleInput) => void;
}

export function BackupScheduleForm({
  schedule,
  cloudEnabled,
  saving,
  error,
  message,
  onSave,
}: Props) {
  const [enabled, setEnabled] = useState(schedule.isEnabled());
  const [frequency, setFrequency] = useState<BackupFrequencyValue>(
    schedule.getFrequency(),
  );
  const [retention, setRetention] = useState(String(schedule.getRetention()));
  const [location, setLocation] = useState<BackupLocationValue>(
    schedule.getLocation(),
  );

  const locations = BACKUP_LOCATIONS.filter(
    (l) => l === 'local' || cloudEnabled,
  );
  const lastRun = schedule.getLastRunAt();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSave({
      enabled,
      frequency,
      retention: Number(retention) || 1,
      location,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label
        htmlFor="auto-enabled"
        className="flex cursor-pointer items-center gap-2.5 text-sm text-zinc-200"
      >
        <input
          id="auto-enabled"
          type="checkbox"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
          className="h-4 w-4 rounded border-white/20 bg-zinc-800 text-emerald-500 accent-emerald-500 focus:ring-emerald-500"
        />
        Activar backups automáticos
      </label>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="auto-frequency">Frecuencia</Label>
          <Select
            id="auto-frequency"
            value={frequency}
            onChange={(e) =>
              setFrequency(e.target.value as BackupFrequencyValue)
            }
          >
            {BACKUP_FREQUENCIES.map((f) => (
              <option key={f} value={f}>
                {FREQUENCY_LABELS[f]}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="auto-retention">Conservar (últimos N)</Label>
          <Input
            id="auto-retention"
            type="number"
            min={1}
            max={50}
            value={retention}
            onChange={(e) => setRetention(e.target.value)}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="auto-location">Destino</Label>
        <Select
          id="auto-location"
          value={location}
          onChange={(e) => setLocation(e.target.value as BackupLocationValue)}
        >
          {locations.map((l) => (
            <option key={l} value={l}>
              {LOCATION_LABELS[l]}
            </option>
          ))}
        </Select>
      </div>

      {lastRun && (
        <p className="text-xs text-zinc-500">
          Último backup automático: {new Date(lastRun).toLocaleString()}
        </p>
      )}
      {error && (
        <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      )}
      {message && (
        <p className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">
          {message}
        </p>
      )}

      <Button type="submit" disabled={saving}>
        <Save className="h-4 w-4" />
        {saving ? 'Guardando...' : 'Guardar plan'}
      </Button>
    </form>
  );
}
