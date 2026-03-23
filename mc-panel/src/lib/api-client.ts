import type {
  MCServer,
  ServerMetrics,
  Backup,
  PlayerList,
  FileEntry,
} from "@/types/api";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new ApiError(res.status, body.error ?? res.statusText);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// ── Auth ─────────────────────────────────────────────────────────────────────
export const auth = {
  login: (username: string, password: string) =>
    request<{ token: string; username: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),
  logout: () => request("/auth/logout", { method: "POST" }),
};

// ── Servers ───────────────────────────────────────────────────────────────────
export const servers = {
  list: () => request<MCServer[]>("/servers"),
  get: (id: string) => request<MCServer>(`/servers/${id}`),
  create: (data: Partial<MCServer>) =>
    request<MCServer>("/servers", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<MCServer>) =>
    request<MCServer>(`/servers/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: string) =>
    request(`/servers/${id}`, { method: "DELETE" }),
  start: (id: string) =>
    request(`/servers/${id}/start`, { method: "POST" }),
  stop: (id: string) =>
    request(`/servers/${id}/stop`, { method: "POST" }),
  restart: (id: string) =>
    request(`/servers/${id}/restart`, { method: "POST" }),
  metrics: (id: string) => request<ServerMetrics>(`/servers/${id}/metrics`),
};

// ── Backups ───────────────────────────────────────────────────────────────────
export const backups = {
  list: (serverId: string) => request<Backup[]>(`/servers/${serverId}/backups`),
  create: (serverId: string) =>
    request<Backup>(`/servers/${serverId}/backups`, { method: "POST" }),
  delete: (serverId: string, backupId: string) =>
    request(`/servers/${serverId}/backups/${backupId}`, { method: "DELETE" }),
};

// ── Files ─────────────────────────────────────────────────────────────────────
export const files = {
  list: (serverId: string, path = "/") =>
    request<FileEntry[]>(`/servers/${serverId}/files?path=${encodeURIComponent(path)}`),
  read: (serverId: string, path: string) =>
    request<{ content: string }>(
      `/servers/${serverId}/files/content?path=${encodeURIComponent(path)}`
    ),
  write: (serverId: string, path: string, content: string) =>
    request(`/servers/${serverId}/files/content`, {
      method: "PUT",
      body: JSON.stringify({ path, content }),
    }),
  delete: (serverId: string, path: string) =>
    request(`/servers/${serverId}/files`, {
      method: "DELETE",
      body: JSON.stringify({ path }),
    }),
  rename: (serverId: string, from: string, to: string) =>
    request(`/servers/${serverId}/files/rename`, {
      method: "POST",
      body: JSON.stringify({ from, to }),
    }),
  downloadUrl: (serverId: string, path: string) =>
    `${BASE_URL}/servers/${serverId}/files/download?path=${encodeURIComponent(path)}`,
  upload: (serverId: string, path: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    form.append("path", path);
    return fetch(`${BASE_URL}/servers/${serverId}/files/upload`, {
      method: "POST",
      body: form,
      credentials: "include",
    });
  },
};

// ── Players ───────────────────────────────────────────────────────────────────
export const players = {
  list: (serverId: string) => request<PlayerList>(`/servers/${serverId}/players`),
  addWhitelist: (serverId: string, playerName: string) =>
    request(`/servers/${serverId}/players/whitelist`, {
      method: "POST",
      body: JSON.stringify({ playerName }),
    }),
  removeWhitelist: (serverId: string, playerName: string) =>
    request(`/servers/${serverId}/players/whitelist/${playerName}`, { method: "DELETE" }),
  ban: (serverId: string, playerName: string, reason?: string) =>
    request(`/servers/${serverId}/players/ban`, {
      method: "POST",
      body: JSON.stringify({ playerName, reason }),
    }),
  unban: (serverId: string, playerName: string) =>
    request(`/servers/${serverId}/players/unban/${playerName}`, { method: "POST" }),
};

export { ApiError };
