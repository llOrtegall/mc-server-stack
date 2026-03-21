"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, RefreshCw, Server } from "lucide-react";
import { toast } from "sonner";
import { servers as serversApi } from "@/lib/api-client";
import { ServerCard } from "@/components/features/servers/ServerCard";
import { CreateServerModal } from "@/components/features/servers/CreateServerModal";
import type { MCServer } from "@/types/api";

export default function DashboardPage() {
  const [serverList, setServerList] = useState<MCServer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const fetchServers = useCallback(async () => {
    try {
      const data = await serversApi.list();
      setServerList(data);
    } catch {
      toast.error("Error al cargar servidores");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServers();
    // Auto-refresh cada 10 segundos para actualizar estados
    const interval = setInterval(fetchServers, 10_000);
    return () => clearInterval(interval);
  }, [fetchServers]);

  const running = serverList.filter((s) => s.status === "running").length;
  const total = serverList.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {running} de {total} servidor{total !== 1 ? "es" : ""} en línea
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchServers}
            className="inline-flex items-center gap-1.5 rounded-md border border-border
                       px-3 py-1.5 text-sm hover:bg-secondary transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground
                       px-3 py-1.5 text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Nuevo servidor
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label="Total"
          value={total}
          icon={<Server className="h-4 w-4" />}
        />
        <StatCard
          label="En línea"
          value={running}
          icon={<span className="h-2 w-2 rounded-full bg-green-400" />}
          valueClass="text-green-400"
        />
        <StatCard
          label="Detenidos"
          value={serverList.filter((s) => s.status === "stopped").length}
          icon={<span className="h-2 w-2 rounded-full bg-slate-500" />}
        />
        <StatCard
          label="Con error"
          value={serverList.filter((s) => s.status === "error").length}
          icon={<span className="h-2 w-2 rounded-full bg-red-500" />}
          valueClass="text-red-400"
        />
      </div>

      {/* Server grid */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">
          Cargando servidores...
        </div>
      ) : serverList.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <Server className="h-12 w-12 mx-auto text-muted-foreground opacity-30" />
          <p className="text-muted-foreground">
            No tienes servidores aún.
          </p>
          <button
            onClick={() => setShowCreate(true)}
            className="text-sm text-primary hover:underline"
          >
            Crear tu primer servidor
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {serverList.map((server) => (
            <ServerCard
              key={server.id}
              server={server}
              onRefresh={fetchServers}
            />
          ))}
        </div>
      )}

      {showCreate && (
        <CreateServerModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            fetchServers();
          }}
        />
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  valueClass = "text-foreground",
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  valueClass?: string;
}) {
  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-1">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className={`text-2xl font-bold ${valueClass}`}>{value}</p>
    </div>
  );
}
