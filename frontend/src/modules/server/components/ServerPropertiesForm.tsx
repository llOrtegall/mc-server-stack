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
}

const inputClass =
  'w-full rounded-md bg-gray-700 border border-gray-600 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500';
const labelClass = 'block text-sm text-gray-300 mb-1';

export function ServerPropertiesForm({
  value,
  onChange,
  disabled = false,
  idPrefix = 'sp',
}: Props) {
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
    <fieldset disabled={disabled} className="space-y-3 border-0 p-0 m-0">
      <legend className="text-sm font-medium text-gray-200 mb-1">
        Propiedades de Minecraft
      </legend>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor={`${idPrefix}-difficulty`} className={labelClass}>
            Dificultad
          </label>
          <select
            id={`${idPrefix}-difficulty`}
            value={value.difficulty ?? 'easy'}
            onChange={(e) => set('difficulty', e.target.value as never)}
            className={inputClass}
          >
            {DIFFICULTIES.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={`${idPrefix}-gamemode`} className={labelClass}>
            Modo de juego
          </label>
          <select
            id={`${idPrefix}-gamemode`}
            value={value.gamemode ?? 'survival'}
            onChange={(e) => set('gamemode', e.target.value as never)}
            className={inputClass}
          >
            {GAMEMODES.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor={`${idPrefix}-maxPlayers`} className={labelClass}>
            Máx. jugadores
          </label>
          <input
            id={`${idPrefix}-maxPlayers`}
            type="number"
            min={1}
            max={1000}
            value={value.maxPlayers ?? ''}
            onChange={(e) =>
              set('maxPlayers', numberOrUndefined(e.target.value))
            }
            placeholder="20"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor={`${idPrefix}-viewDistance`} className={labelClass}>
            Distancia de visión
          </label>
          <input
            id={`${idPrefix}-viewDistance`}
            type="number"
            min={3}
            max={32}
            value={value.viewDistance ?? ''}
            onChange={(e) =>
              set('viewDistance', numberOrUndefined(e.target.value))
            }
            placeholder="10"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor={`${idPrefix}-motd`} className={labelClass}>
          MOTD
        </label>
        <input
          id={`${idPrefix}-motd`}
          maxLength={150}
          value={value.motd ?? ''}
          onChange={(e) => set('motd', e.target.value)}
          placeholder="A Minecraft Server"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor={`${idPrefix}-seed`} className={labelClass}>
          Semilla (seed)
        </label>
        <input
          id={`${idPrefix}-seed`}
          maxLength={100}
          value={value.seed ?? ''}
          onChange={(e) => set('seed', e.target.value)}
          placeholder="aleatoria"
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Checkbox
          id={`${idPrefix}-pvp`}
          label="PvP"
          checked={value.pvp ?? true}
          onChange={(c) => set('pvp', c)}
        />
        <Checkbox
          id={`${idPrefix}-hardcore`}
          label="Hardcore"
          checked={value.hardcore ?? false}
          onChange={(c) => set('hardcore', c)}
        />
        <Checkbox
          id={`${idPrefix}-onlineMode`}
          label="Modo online"
          checked={value.onlineMode ?? true}
          onChange={(c) => set('onlineMode', c)}
        />
        <Checkbox
          id={`${idPrefix}-whitelistEnabled`}
          label="Whitelist activa"
          checked={value.whitelistEnabled ?? false}
          onChange={(c) => set('whitelistEnabled', c)}
        />
      </div>

      <div>
        <label htmlFor={`${idPrefix}-whitelist`} className={labelClass}>
          Whitelist (un usuario por línea)
        </label>
        <textarea
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
          className={inputClass}
        />
      </div>
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
      className="flex items-center gap-2 text-sm text-gray-300"
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-green-600 focus:ring-green-500"
      />
      {label}
    </label>
  );
}
