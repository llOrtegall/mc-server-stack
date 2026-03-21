"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { servers as serversApi } from "@/lib/api-client";
import { Cpu, MemoryStick } from "lucide-react";

interface DataPoint {
  time: string;
  cpu: number;
  memory: number;
}

const MAX_POINTS = 30;

export function MetricsChart({
  serverId,
  memoryLimitMb,
}: {
  serverId: string;
  memoryLimitMb: number;
}) {
  const [data, setData] = useState<DataPoint[]>([]);
  const [current, setCurrent] = useState({ cpu: 0, memory: 0 });

  useEffect(() => {
    async function poll() {
      try {
        const metrics = await serversApi.metrics(serverId);
        const point: DataPoint = {
          time: new Date().toLocaleTimeString(),
          cpu: metrics.cpuPercent,
          memory: metrics.memoryUsedMb,
        };
        setCurrent({ cpu: metrics.cpuPercent, memory: metrics.memoryUsedMb });
        setData((prev) => {
          const next = [...prev, point];
          return next.length > MAX_POINTS ? next.slice(-MAX_POINTS) : next;
        });
      } catch {
        // Servidor puede estar apagado
      }
    }

    poll();
    const interval = setInterval(poll, 5000);
    return () => clearInterval(interval);
  }, [serverId]);

  return (
    <div className="space-y-4">
      {/* Valores actuales */}
      <div className="grid grid-cols-2 gap-3">
        <MetricCard
          icon={<Cpu className="h-4 w-4 text-blue-400" />}
          label="CPU"
          value={`${current.cpu.toFixed(1)}%`}
          percent={current.cpu}
          color="blue"
        />
        <MetricCard
          icon={<MemoryStick className="h-4 w-4 text-purple-400" />}
          label="RAM"
          value={`${current.memory} / ${memoryLimitMb} MB`}
          percent={(current.memory / memoryLimitMb) * 100}
          color="purple"
        />
      </div>

      {/* Gráfica histórica */}
      {data.length > 1 && (
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-3">Últimos 30 registros</p>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(217.2 32.6% 17.5%)" />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 10, fill: "hsl(215 20.2% 65.1%)" }}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 10, fill: "hsl(215 20.2% 65.1%)" }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(222.2 84% 6%)",
                  border: "1px solid hsl(217.2 32.6% 17.5%)",
                  borderRadius: "6px",
                  fontSize: "12px",
                }}
              />
              <Line
                type="monotone"
                dataKey="cpu"
                name="CPU %"
                stroke="#60a5fa"
                strokeWidth={1.5}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="memory"
                name="RAM MB"
                stroke="#a78bfa"
                strokeWidth={1.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  percent,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  percent: number;
  color: "blue" | "purple";
}) {
  const barColor = color === "blue" ? "bg-blue-500" : "bg-purple-500";
  const safePercent = Math.min(100, Math.max(0, percent));

  return (
    <div className="bg-card border border-border rounded-lg p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-medium">
          {icon}
          {label}
        </div>
        <span className="text-xs text-muted-foreground">{value}</span>
      </div>
      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
        <div
          className={`h-full ${barColor} rounded-full transition-all duration-500`}
          style={{ width: `${safePercent}%` }}
        />
      </div>
    </div>
  );
}
