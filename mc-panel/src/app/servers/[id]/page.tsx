"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Terminal,
  FolderOpen,
  Settings,
  Database,
  Users,
  ArrowLeft,
  Play,
  Square,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { servers as serversApi } from "@/lib/api-client";
import { StatusBadge } from "@/components/features/servers/StatusBadge";
import { ServerConsole } from "@/components/features/console/ServerConsole";
import { MetricsChart } from "@/components/features/metrics/MetricsChart";
import { FileManager } from "@/components/features/file-manager/FileManager";
import { PlayersPanel } from "@/components/features/players/PlayersPanel";
import { BackupsPanel } from "@/components/features/backups/BackupsPanel";
import type { MCServer } from "@/types/api";

type Tab = "console" | "files" | "settings" | "backups" | "players";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "console", label: "Consola", icon: <Terminal className="h-4 w-4" /> },
  { id: "files", label: "Archivos", icon: <FolderOpen className="h-4 w-4" /> },
  { id: "settings", label: "Configuración", icon: <Settings className="h-4 w-4" /> },
  { id: "backups", label: "Backups", icon: <Database className="h-4 w-4" /> },
  { id: "players", label: "Jugadores", icon: <Users className="h-4 w-4" /> },
];

// Token se obtiene de la cookie — en producción usar next-auth o middleware
function getToken(): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(/token=([^;]+)/);
  return match?.[1] ?? "";
}

export default function ServerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [server, setServer] = useState<MCServer | null>(null);
  const [tab, setTab] = useState<Tab>("console");
  const [loading, setLoading] = useState<string | null>(null);

  const fetchServer = useCallback(async () => {
    try {
      const data = await serversApi.get(id);
      setServer(data);
    } catch {
      toast.error("Error al cargar servidor");
    }
  }, [id]);

  useEffect(() => {
    fetchServer();
    const interval = setInterval(fetchServer, 8000);
    return () => clearInterval(interval);
  }, [fetchServer]);

  async function action(fn: () => Promise<unknown>, label: string) {
    setLoading(label);
    try {
      await fn();
      toast.success(`${label} ejecutado`);
      fetchServer();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(null);
    }
  }

  if (!server) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Cargando...
      </div>
    );
  }

  const token = getToken();

  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* Breadcrumb + header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold">{server.name}</h1>
            <StatusBadge status={server.status} />
          </div>
          <p className="text-xs text-muted-foreground">
            Minecraft {server.version} · Puerto {server.port} · {server.memoryMb} MB
          </p>
        </div>

        {/* Acciones rápidas */}
        <div className="flex gap-2 flex-shrink-0">
          {server.status === "stopped" && (
            <ServerActionBtn
              onClick={() => action(() => serversApi.start(id), "Inicio")}
              loading={loading === "Inicio"}
              icon={<Play className="h-4 w-4" />}
              label="Iniciar"
              variant="success"
            />
          )}
          {server.status === "running" && (
            <>
              <ServerActionBtn
                onClick={() => action(() => serversApi.stop(id), "Parada")}
                loading={loading === "Parada"}
                icon={<Square className="h-4 w-4" />}
                label="Detener"
                variant="warning"
              />
              <ServerActionBtn
                onClick={() => action(() => serversApi.restart(id), "Reinicio")}
                loading={loading === "Reinicio"}
                icon={<RotateCcw className="h-4 w-4" />}
                label="Reiniciar"
                variant="secondary"
              />
            </>
          )}
        </div>
      </div>

      {/* Métricas (solo si running) */}
      {server.status === "running" && (
        <MetricsChart serverId={id} memoryLimitMb={server.memoryMb} />
      )}

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex gap-0">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm border-b-2 transition-colors ${
                tab === t.id
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 min-h-0">
        {tab === "console" && (
          <div className="h-[500px]">
            <ServerConsole serverId={id} token={token} />
          </div>
        )}
        {tab === "files" && <FileManager serverId={id} />}
        {tab === "settings" && <ServerSettings server={server} onSaved={fetchServer} />}
        {tab === "backups" && <BackupsPanel serverId={id} />}
        {tab === "players" && (
          <PlayersPanel serverId={id} isRunning={server.status === "running"} />
        )}
      </div>
    </div>
  );
}

function ServerActionBtn({
  onClick,
  loading,
  icon,
  label,
  variant,
}: {
  onClick: () => void;
  loading: boolean;
  icon: React.ReactNode;
  label: string;
  variant: string;
}) {
  const colors = {
    success: "bg-green-600/20 text-green-400 hover:bg-green-600/30 border-green-600/30",
    warning: "bg-orange-600/20 text-orange-400 hover:bg-orange-600/30 border-orange-600/30",
    secondary: "bg-secondary text-foreground hover:bg-secondary/80 border-border",
  }[variant] ?? "";

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium
                  transition-colors disabled:opacity-50 ${colors}`}
    >
      {loading ? (
        <span className="h-4 w-4 border border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        icon
      )}
      {label}
    </button>
  );
}

function ServerSettings({
  server,
  onSaved,
}: {
  server: MCServer;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    name: server.name,
    maxPlayers: server.maxPlayers,
    motd: server.motd,
    difficulty: server.difficulty,
    gamemode: server.gamemode,
    onlineMode: server.onlineMode,
    autoShutdownEnabled: server.autoShutdownEnabled,
  });
  const [saving, setSaving] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await serversApi.update(server.id, form);
      toast.success("Configuración guardada");
      onSaved();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  const set = (key: string, value: unknown) =>
    setForm((f) => ({ ...f, [key]: value }));

  const inputClass =
    "w-full rounded-md border border-input bg-background px-3 py-2 text-sm " +
    "focus:outline-none focus:ring-2 focus:ring-ring transition";

  return (
    <form onSubmit={handleSave} className="max-w-lg space-y-4 pt-2">
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">Nombre</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          className={inputClass}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Jugadores máx.</label>
          <input
            type="number"
            min={1}
            max={100}
            value={form.maxPlayers}
            onChange={(e) => set("maxPlayers", parseInt(e.target.value))}
            className={inputClass}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Dificultad</label>
          <select
            value={form.difficulty}
            onChange={(e) => set("difficulty", e.target.value)}
            className={inputClass}
          >
            {["peaceful", "easy", "normal", "hard"].map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Modo de juego</label>
          <select
            value={form.gamemode}
            onChange={(e) => set("gamemode", e.target.value)}
            className={inputClass}
          >
            {["survival", "creative", "adventure", "spectator"].map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">MOTD</label>
        <input
          type="text"
          value={form.motd}
          onChange={(e) => set("motd", e.target.value)}
          maxLength={100}
          className={inputClass}
        />
      </div>
      <div className="flex gap-6 text-sm">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.onlineMode}
            onChange={(e) => set("onlineMode", e.target.checked)}
            className="accent-primary"
          />
          Modo online
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
      <button
        type="submit"
        disabled={saving}
        className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium
                   hover:bg-primary/90 disabled:opacity-50 transition-colors"
      >
        {saving ? "Guardando..." : "Guardar cambios"}
      </button>
    </form>
  );
}
