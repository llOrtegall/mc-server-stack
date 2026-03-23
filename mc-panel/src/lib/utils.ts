import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ServerStatus } from "@/types/api";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function statusColor(status: ServerStatus): string {
  return {
    running: "text-green-400",
    starting: "text-yellow-400",
    stopping: "text-orange-400",
    stopped: "text-slate-400",
    error: "text-red-400",
  }[status];
}

export function statusBadgeVariant(
  status: ServerStatus
): "default" | "secondary" | "destructive" | "outline" {
  return (
    {
      running: "default",
      starting: "secondary",
      stopping: "secondary",
      stopped: "outline",
      error: "destructive",
    } as const
  )[status];
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function formatUptime(startedAt: Date): string {
  const diff = Date.now() - startedAt.getTime();
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}
