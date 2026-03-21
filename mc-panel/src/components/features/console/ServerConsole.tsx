"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Terminal, Send } from "lucide-react";
import { getSocket } from "@/lib/socket-client";

interface Props {
  serverId: string;
  token: string;
}

interface LogLine {
  line: string;
  timestamp: string;
}

const MAX_LINES = 500;

export function ServerConsole({ serverId, token }: Props) {
  const [lines, setLines] = useState<LogLine[]>([]);
  const [command, setCommand] = useState("");
  const [connected, setConnected] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const socket = getSocket(token);

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("console:join", { serverId });
    });

    socket.on("disconnect", () => setConnected(false));

    socket.on(
      "console:line",
      ({ line, timestamp }: { line: string; timestamp: string }) => {
        setLines((prev) => {
          const next = [...prev, { line, timestamp }];
          return next.length > MAX_LINES ? next.slice(-MAX_LINES) : next;
        });
      }
    );

    socket.on("console:error", ({ message }: { message: string }) => {
      setLines((prev) => [
        ...prev,
        {
          line: `[PANEL] ERROR: ${message}`,
          timestamp: new Date().toISOString(),
        },
      ]);
    });

    return () => {
      socket.off("console:line");
      socket.off("console:error");
      socket.off("connect");
      socket.off("disconnect");
    };
  }, [serverId, token]);

  // Auto-scroll al fondo
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  const sendCommand = useCallback(() => {
    const cmd = command.trim();
    if (!cmd) return;
    const socket = getSocket(token);
    socket.emit("console:command", { serverId, command: cmd });
    setCommand("");
    inputRef.current?.focus();
  }, [command, serverId, token]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") sendCommand();
  }

  function getLineColor(line: string): string {
    if (line.includes("ERROR") || line.includes("FATAL")) return "text-red-400";
    if (line.includes("WARN")) return "text-yellow-400";
    if (line.includes("joined the game")) return "text-green-400";
    if (line.includes("left the game")) return "text-orange-400";
    if (line.includes("[PANEL]")) return "text-blue-400";
    return "text-slate-300";
  }

  return (
    <div className="flex flex-col h-full bg-[#0d1117] rounded-lg border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-card">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Terminal className="h-4 w-4 text-primary" />
          Consola
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <span
            className={`h-2 w-2 rounded-full ${
              connected ? "bg-green-400 animate-pulse" : "bg-red-400"
            }`}
          />
          <span className="text-muted-foreground">
            {connected ? "Conectado" : "Desconectado"}
          </span>
        </div>
      </div>

      {/* Log output */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 space-y-0.5 font-mono text-xs"
        style={{ minHeight: 0 }}
      >
        {lines.length === 0 ? (
          <p className="text-muted-foreground italic">
            Esperando logs del servidor...
          </p>
        ) : (
          lines.map((entry, i) => (
            <div key={i} className={`leading-5 break-all ${getLineColor(entry.line)}`}>
              <span className="text-slate-600 select-none mr-2">
                {new Date(entry.timestamp).toLocaleTimeString()}
              </span>
              {entry.line}
            </div>
          ))
        )}
      </div>

      {/* Command input */}
      <div className="flex gap-2 p-2 border-t border-border bg-card">
        <span className="text-primary font-mono text-sm self-center select-none">
          {">"}
        </span>
        <input
          ref={inputRef}
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe un comando..."
          className="flex-1 bg-transparent font-mono text-sm focus:outline-none placeholder:text-muted-foreground"
        />
        <button
          onClick={sendCommand}
          disabled={!command.trim() || !connected}
          className="p-1.5 rounded text-primary hover:bg-primary/10 disabled:opacity-40 transition-colors"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
