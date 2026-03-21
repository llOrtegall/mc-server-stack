"use client";

import { useEffect, useState, useCallback } from "react";
import { UserPlus, UserX, RefreshCw, Users } from "lucide-react";
import { toast } from "sonner";
import { players as playersApi } from "@/lib/api-client";
import type { PlayerList } from "@/types/api";

export function PlayersPanel({
  serverId,
  isRunning,
}: {
  serverId: string;
  isRunning: boolean;
}) {
  const [data, setData] = useState<PlayerList | null>(null);
  const [loading, setLoading] = useState(false);
  const [playerInput, setPlayerInput] = useState("");
  const [banReason, setBanReason] = useState("");

  const fetch_ = useCallback(async () => {
    if (!isRunning) return;
    setLoading(true);
    try {
      const result = await playersApi.list(serverId);
      setData(result);
    } catch {
      // Servidor puede no tener RCON listo aún
    } finally {
      setLoading(false);
    }
  }, [serverId, isRunning]);

  useEffect(() => {
    fetch_();
    const interval = setInterval(fetch_, 15_000);
    return () => clearInterval(interval);
  }, [fetch_]);

  async function handleWhitelist(add: boolean) {
    const name = playerInput.trim();
    if (!name) return;
    try {
      if (add) {
        await playersApi.addWhitelist(serverId, name);
        toast.success(`${name} añadido a la whitelist`);
      } else {
        await playersApi.removeWhitelist(serverId, name);
        toast.success(`${name} eliminado de la whitelist`);
      }
      setPlayerInput("");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error");
    }
  }

  async function handleBan() {
    const name = playerInput.trim();
    if (!name) return;
    try {
      await playersApi.ban(serverId, name, banReason || undefined);
      toast.success(`${name} baneado`);
      setPlayerInput("");
      setBanReason("");
      fetch_();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error");
    }
  }

  if (!isRunning) {
    return (
      <div className="text-center py-12">
        <Users className="h-10 w-10 mx-auto text-muted-foreground opacity-30 mb-2" />
        <p className="text-sm text-muted-foreground">
          El servidor debe estar en línea para gestionar jugadores.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-2">
      {/* Jugadores online */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">
            Jugadores en línea
            {data && (
              <span className="text-muted-foreground ml-2">
                ({data.count}/{data.max})
              </span>
            )}
          </h3>
          <button
            onClick={fetch_}
            disabled={loading}
            className="p-1.5 rounded border border-border hover:bg-secondary transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {data?.players.length === 0 && (
          <p className="text-sm text-muted-foreground">No hay jugadores conectados.</p>
        )}
        {data?.players.map((player) => (
          <div
            key={player}
            className="flex items-center justify-between bg-card border border-border
                       rounded-lg px-4 py-2"
          >
            <span className="text-sm font-medium">{player}</span>
            <button
              onClick={() => playersApi.ban(serverId, player)}
              className="text-xs text-red-400 hover:underline"
            >
              Banear
            </button>
          </div>
        ))}
      </div>

      {/* Gestión */}
      <div className="bg-card border border-border rounded-lg p-4 space-y-3">
        <h3 className="text-sm font-medium">Gestión de jugadores</h3>

        <div className="flex gap-2">
          <input
            type="text"
            value={playerInput}
            onChange={(e) => setPlayerInput(e.target.value)}
            placeholder="Nombre del jugador"
            className="flex-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm
                       focus:outline-none focus:ring-2 focus:ring-ring transition"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleWhitelist(true)}
            className="inline-flex items-center gap-1.5 rounded-md border border-green-600/30
                       bg-green-600/10 text-green-400 hover:bg-green-600/20 px-3 py-1.5 text-xs transition-colors"
          >
            <UserPlus className="h-3.5 w-3.5" />
            Añadir whitelist
          </button>
          <button
            onClick={() => handleWhitelist(false)}
            className="inline-flex items-center gap-1.5 rounded-md border border-orange-600/30
                       bg-orange-600/10 text-orange-400 hover:bg-orange-600/20 px-3 py-1.5 text-xs transition-colors"
          >
            <UserX className="h-3.5 w-3.5" />
            Quitar whitelist
          </button>
        </div>

        {/* Ban con razón */}
        <div className="border-t border-border pt-3 space-y-2">
          <p className="text-xs text-muted-foreground">Banear jugador:</p>
          <input
            type="text"
            value={banReason}
            onChange={(e) => setBanReason(e.target.value)}
            placeholder="Razón (opcional)"
            className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm
                       focus:outline-none focus:ring-2 focus:ring-ring transition"
          />
          <button
            onClick={handleBan}
            className="inline-flex items-center gap-1.5 rounded-md border border-red-600/30
                       bg-red-600/10 text-red-400 hover:bg-red-600/20 px-3 py-1.5 text-xs transition-colors"
          >
            <UserX className="h-3.5 w-3.5" />
            Banear
          </button>
        </div>
      </div>
    </div>
  );
}
