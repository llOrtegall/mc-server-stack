"use client";

import Link from "next/link";
import { Play, Square, RotateCcw, Trash2, Server } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { servers as serversApi } from "@/lib/api-client";
import { StatusBadge } from "./StatusBadge";
import type { MCServer } from "@/types/api";

interface Props {
  server: MCServer;
  onRefresh: () => void;
}

export function ServerCard({ server, onRefresh }: Props) {
  const [loading, setLoading] = useState<string | null>(null);

  async function action(fn: () => Promise<unknown>, label: string) {
    setLoading(label);
    try {
      await fn();
      toast.success(`${label} ejecutado`);
      onRefresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(null);
    }
  }

  const isRunning = server.status === "running";
  const isStopped = server.status === "stopped";
  const isBusy = server.status === "starting" || server.status === "stopping";

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-3 hover:border-primary/40 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Server className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <Link
            href={`/servers/${server.id}`}
            className="font-semibold text-sm truncate hover:text-primary transition-colors"
          >
            {server.name}
          </Link>
        </div>
        <StatusBadge status={server.status} className="flex-shrink-0" />
      </div>

      {/* Meta */}
      <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
        <span>v{server.version}</span>
        <span className="text-right">:{server.port}</span>
        <span>{server.memoryMb} MB RAM</span>
        <span className="text-right">{server.maxPlayers} jugadores</span>
      </div>

      {/* Acciones */}
      <div className="flex gap-2 pt-1">
        {isStopped && (
          <ActionButton
            onClick={() => action(() => serversApi.start(server.id), "Inicio")}
            loading={loading === "Inicio"}
            icon={<Play className="h-3.5 w-3.5" />}
            label="Iniciar"
            variant="success"
          />
        )}
        {isRunning && (
          <>
            <ActionButton
              onClick={() => action(() => serversApi.stop(server.id), "Parada")}
              loading={loading === "Parada"}
              icon={<Square className="h-3.5 w-3.5" />}
              label="Detener"
              variant="warning"
            />
            <ActionButton
              onClick={() => action(() => serversApi.restart(server.id), "Reinicio")}
              loading={loading === "Reinicio"}
              icon={<RotateCcw className="h-3.5 w-3.5" />}
              label="Reiniciar"
              variant="secondary"
            />
          </>
        )}
        {isBusy && (
          <span className="text-xs text-muted-foreground italic">
            {server.status === "starting" ? "Iniciando..." : "Deteniendo..."}
          </span>
        )}
        <div className="flex-1" />
        <ActionButton
          onClick={() =>
            action(async () => {
              if (!confirm(`¿Eliminar ${server.name}? Esta acción no se puede deshacer.`)) return;
              await serversApi.delete(server.id);
            }, "Eliminación")
          }
          loading={loading === "Eliminación"}
          icon={<Trash2 className="h-3.5 w-3.5" />}
          label=""
          variant="danger"
        />
      </div>
    </div>
  );
}

function ActionButton({
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
  variant: "success" | "warning" | "danger" | "secondary";
}) {
  const variantClasses = {
    success: "bg-green-600/20 text-green-400 hover:bg-green-600/30 border-green-600/30",
    warning: "bg-orange-600/20 text-orange-400 hover:bg-orange-600/30 border-orange-600/30",
    danger: "bg-red-600/20 text-red-400 hover:bg-red-600/30 border-red-600/30",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 border-border",
  };

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium
                  border transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                  ${variantClasses[variant]}`}
    >
      {loading ? (
        <span className="h-3.5 w-3.5 border border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        icon
      )}
      {label}
    </button>
  );
}
