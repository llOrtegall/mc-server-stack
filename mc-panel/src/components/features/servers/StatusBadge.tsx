import { cn } from "@/lib/utils";
import type { ServerStatus } from "@/types/api";

const STATUS_CONFIG: Record<
  ServerStatus,
  { label: string; dotClass: string; textClass: string }
> = {
  running: {
    label: "En línea",
    dotClass: "bg-green-400 animate-pulse",
    textClass: "text-green-400",
  },
  starting: {
    label: "Iniciando...",
    dotClass: "bg-yellow-400 animate-pulse",
    textClass: "text-yellow-400",
  },
  stopping: {
    label: "Deteniendo...",
    dotClass: "bg-orange-400 animate-pulse",
    textClass: "text-orange-400",
  },
  stopped: {
    label: "Detenido",
    dotClass: "bg-slate-500",
    textClass: "text-slate-400",
  },
  error: {
    label: "Error",
    dotClass: "bg-red-500",
    textClass: "text-red-400",
  },
};

export function StatusBadge({
  status,
  className,
}: {
  status: ServerStatus;
  className?: string;
}) {
  const { label, dotClass, textClass } = STATUS_CONFIG[status];

  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium", className)}>
      <span className={cn("h-2 w-2 rounded-full flex-shrink-0", dotClass)} />
      <span className={textClass}>{label}</span>
    </span>
  );
}
