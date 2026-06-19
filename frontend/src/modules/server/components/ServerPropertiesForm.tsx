import {
  Input,
  Label,
  Select,
  Textarea,
} from '../../../shared/components/ui/Field.js';
import {
  DIFFICULTIES,
  GAMEMODES,
  type ServerPropertiesInput,
} from '../domain/ServerProperties.js';

interface Props {
  value: ServerPropertiesInput;
  onChange: (value: ServerPropertiesInput) => void;
  disabled?: boolean;
  idPrefix?: string;
  edition?: 'java' | 'bedrock';
}

export function ServerPropertiesForm({
  value,
  onChange,
  disabled = false,
  idPrefix = 'sp',
  edition = 'java',
}: Props) {
  // Bedrock has no clean env mapping for PvP/Hardcore or a per-name whitelist,
  // so those fields are hidden for Bedrock servers.
  const isBedrock = edition === 'bedrock';
  function set<K extends keyof ServerPropertiesInput>(
    key: K,
    v: ServerPropertiesInput[K],
  ) {
    onChange({ ...value, [key]: v });
  }

  function numberOrUndefined(raw: string): number | undefined {
    return raw === '' ? undefined : Number(raw);
  }

  return (
    <fieldset disabled={disabled} className="m-0 space-y-4 border-0 p-0">
      <legend className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">
        Propiedades de Minecraft
      </legend>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor={`${idPrefix}-difficulty`}>Dificultad</Label>
          <Select
            id={`${idPrefix}-difficulty`}
            value={value.difficulty ?? 'easy'}
            onChange={(e) => set('difficulty', e.target.value as never)}
          >
            {DIFFICULTIES.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor={`${idPrefix}-gamemode`}>Modo de juego</Label>
          <Select
            id={`${idPrefix}-gamemode`}
            value={value.gamemode ?? 'survival'}
            onChange={(e) => set('gamemode', e.target.value as never)}
          >
            {GAMEMODES.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor={`${idPrefix}-maxPlayers`}>Máx. jugadores</Label>
          <Input
            id={`${idPrefix}-maxPlayers`}
            type="number"
            min={1}
            max={1000}
            value={value.maxPlayers ?? ''}
            onChange={(e) =>
              set('maxPlayers', numberOrUndefined(e.target.value))
            }
            placeholder="20"
          />
        </div>
        <div>
          <Label htmlFor={`${idPrefix}-viewDistance`}>
            Distancia de visión
          </Label>
          <Input
            id={`${idPrefix}-viewDistance`}
            type="number"
            min={3}
            max={32}
            value={value.viewDistance ?? ''}
            onChange={(e) =>
              set('viewDistance', numberOrUndefined(e.target.value))
            }
            placeholder="10"
          />
        </div>
      </div>

      <div>
        <Label htmlFor={`${idPrefix}-motd`}>
          {isBedrock ? 'Nombre del servidor' : 'MOTD'}
        </Label>
        <Input
          id={`${idPrefix}-motd`}
          maxLength={150}
          value={value.motd ?? ''}
          onChange={(e) => set('motd', e.target.value)}
          placeholder="A Minecraft Server"
        />
      </div>

      <div>
        <Label htmlFor={`${idPrefix}-seed`}>Semilla (seed)</Label>
        <Input
          id={`${idPrefix}-seed`}
          maxLength={100}
          value={value.seed ?? ''}
          onChange={(e) => set('seed', e.target.value)}
          placeholder="aleatoria"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        {!isBedrock && (
          <Checkbox
            id={`${idPrefix}-pvp`}
            label="PvP"
            checked={value.pvp ?? true}
            onChange={(c) => set('pvp', c)}
          />
        )}
        {!isBedrock && (
          <Checkbox
            id={`${idPrefix}-hardcore`}
            label="Hardcore"
            checked={value.hardcore ?? false}
            onChange={(c) => set('hardcore', c)}
          />
        )}
        <Checkbox
          id={`${idPrefix}-onlineMode`}
          label="Modo online"
          checked={value.onlineMode ?? true}
          onChange={(c) => set('onlineMode', c)}
        />
        <Checkbox
          id={`${idPrefix}-whitelistEnabled`}
          label={isBedrock ? 'Allow list activa' : 'Whitelist activa'}
          checked={value.whitelistEnabled ?? false}
          onChange={(c) => set('whitelistEnabled', c)}
        />
      </div>

      {!isBedrock && (
        <div>
          <Label htmlFor={`${idPrefix}-whitelist`}>
            Whitelist (un usuario por línea)
          </Label>
          <Textarea
            id={`${idPrefix}-whitelist`}
            rows={3}
            value={(value.whitelist ?? []).join('\n')}
            onChange={(e) =>
              set(
                'whitelist',
                e.target.value
                  .split(/[\n,]/)
                  .map((name) => name.trim())
                  .filter((name) => name.length > 0),
              )
            }
            placeholder="Notch&#10;jeb_"
          />
        </div>
      )}
    </fieldset>
  );
}

function Checkbox({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-white/10 bg-zinc-950/40 px-3 py-2 text-sm text-zinc-300 transition-colors hover:border-white/20"
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-white/20 bg-zinc-800 text-emerald-500 accent-emerald-500 focus:ring-emerald-500"
      />
      {label}
    </label>
  );
}
