"use client";

import { useEffect, useState, useCallback } from "react";
import { Database, Plus, Trash2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { backups as backupsApi } from "@/lib/api-client";
import { formatBytes } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import type { Backup } from "@/types/api";

export function BackupsPanel({ serverId }: { serverId: string }) {
  const [backupList, setBackupList] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const fetchBackups = useCallback(async () => {
    try {
      const data = await backupsApi.list(serverId);
      setBackupList(data);
    } catch {
      toast.error("Error al cargar backups");
    } finally {
      setLoading(false);
    }
  }, [serverId]);

  useEffect(() => {
    fetchBackups();
  }, [fetchBackups]);

  async function createBackup() {
    setCreating(true);
    try {
      await backupsApi.create(serverId);
      toast.success("Backup creado y subido a R2");
      fetchBackups();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error al crear backup");
    } finally {
      setCreating(false);
    }
  }

  async function deleteBackup(backupId: string, filename: string) {
    if (!confirm(`¿Eliminar backup "${filename}"?`)) return;
    try {
      await backupsApi.delete(serverId, backupId);
      toast.success("Backup eliminado");
      fetchBackups();
    } catch {
      toast.error("Error al eliminar backup");
    }
  }

  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">
          Backups en Cloudflare R2 ({backupList.length})
        </h3>
        <div className="flex gap-2">
          <button
            onClick={fetchBackups}
            className="inline-flex items-center gap-1.5 rounded-md border border-border
                       px-3 py-1.5 text-xs hover:bg-secondary transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={createBackup}
            disabled={creating}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground
                       px-3 py-1.5 text-xs font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {creating ? (
              <span className="h-3.5 w-3.5 border border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Plus className="h-3.5 w-3.5" />
            )}
            {creating ? "Creando..." : "Crear backup"}
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Cargando...</p>
      ) : backupList.length === 0 ? (
        <div className="text-center py-12 space-y-2">
          <Database className="h-10 w-10 mx-auto text-muted-foreground opacity-30" />
          <p className="text-sm text-muted-foreground">
            No hay backups. Los automáticos se crean cada domingo a las 3 AM.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {backupList.map((backup) => (
            <div
              key={backup.id}
              className="flex items-center justify-between bg-card border border-border
                         rounded-lg px-4 py-3 gap-4"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{backup.filename}</p>
                <p className="text-xs text-muted-foreground">
                  {formatBytes(backup.sizeBytes)} ·{" "}
                  {formatDistanceToNow(new Date(backup.createdAt), {
                    addSuffix: true,
                    locale: es,
                  })}
                </p>
              </div>
              <button
                onClick={() => deleteBackup(backup.id, backup.filename)}
                className="p-1.5 rounded text-red-400 hover:bg-red-500/10 transition-colors flex-shrink-0"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
