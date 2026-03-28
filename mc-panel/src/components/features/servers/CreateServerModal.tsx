"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { servers as serversApi } from "@/lib/api-client";

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

export function CreateServerModal({ onClose, onCreated }: Props) {
  const [versions, setVersions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    version: "",
    port: 25565,
    memoryMb: 1024,
    maxPlayers: 20,
    motd: "Un servidor Minecraft",
    difficulty: "normal",
    gamemode: "survival",
    onlineMode: true,
    autoShutdownEnabled: true,
  });

  useEffect(() => {
    serversApi.versions().then((v) => {
      setVersions(v);
      setForm((f) => ({ ...f, version: v[0] ?? "" }));
    }).catch(() => toast.error("No se pudieron cargar las versiones"));
  }, []);

  const set = (key: string, value: unknown) =>
    setForm((f) => ({ ...f, [key]: value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await serversApi.create(form);
      toast.success(`Servidor "${form.name}" creado`);
      onCreated();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error al crear servidor");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-lg shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-semibold">Nuevo servidor Minecraft</h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-secondary transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Nombre del servidor" className="col-span-2">
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Mi servidor"
                className={inputClass}
              />
            </Field>

            <Field label="Versión">
              <select
                value={form.version}
                onChange={(e) => set("version", e.target.value)}
                disabled={versions.length === 0}
                className={inputClass}
              >
                {versions.length === 0 && (
                  <option value="">Cargando...</option>
                )}
                {versions.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </Field>

            <Field label="Puerto">
              <input
                type="number"
                required
                min={25500}
                max={25600}
                value={form.port}
                onChange={(e) => set("port", parseInt(e.target.value))}
                className={inputClass}
              />
            </Field>

            <Field label="RAM (MB)">
              <select
                value={form.memoryMb}
                onChange={(e) => set("memoryMb", parseInt(e.target.value))}
                className={inputClass}
              >
                {[512, 1024, 2048, 3072, 4096].map((mb) => (
                  <option key={mb} value={mb}>
                    {mb >= 1024 ? `${mb / 1024} GB` : `${mb} MB`}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Jugadores máx.">
              <input
                type="number"
                min={1}
                max={100}
                value={form.maxPlayers}
                onChange={(e) => set("maxPlayers", parseInt(e.target.value))}
                className={inputClass}
              />
            </Field>

            <Field label="Dificultad">
              <select
                value={form.difficulty}
                onChange={(e) => set("difficulty", e.target.value)}
                className={inputClass}
              >
                {["peaceful", "easy", "normal", "hard"].map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </Field>

            <Field label="Modo de juego">
              <select
                value={form.gamemode}
                onChange={(e) => set("gamemode", e.target.value)}
                className={inputClass}
              >
                {["survival", "creative", "adventure", "spectator"].map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="MOTD">
            <input
              type="text"
              value={form.motd}
              onChange={(e) => set("motd", e.target.value)}
              maxLength={100}
              className={inputClass}
            />
          </Field>

          <div className="flex gap-4 text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.onlineMode}
                onChange={(e) => set("onlineMode", e.target.checked)}
                className="accent-primary"
              />
              Modo online (cuentas originales)
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.autoShutdownEnabled}
                onChange={(e) => set("autoShutdownEnabled", e.target.checked)}
                className="accent-primary"
              />
              Apagado automático
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-border px-4 py-2 text-sm hover:bg-secondary transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium
                         hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {loading ? "Creando..." : "Crear servidor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm " +
  "focus:outline-none focus:ring-2 focus:ring-ring transition";

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`space-y-1 ${className ?? ""}`}>
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}
