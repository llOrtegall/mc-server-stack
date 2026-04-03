import type { CreateServerInput, Server } from '../types';
import { apiFetch } from './client';

export function listServers(): Promise<Server[]> {
  return apiFetch<Server[]>('/api/servers');
}

export function getServer(id: string): Promise<Server> {
  return apiFetch<Server>(`/api/servers/${id}`);
}

export function createServer(input: CreateServerInput): Promise<Server> {
  return apiFetch<Server>('/api/servers', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function deleteServer(id: string): Promise<void> {
  return apiFetch<void>(`/api/servers/${id}`, { method: 'DELETE' });
}

export function startServer(id: string): Promise<void> {
  return apiFetch<void>(`/api/servers/${id}/start`, { method: 'POST' });
}

export function stopServer(id: string): Promise<void> {
  return apiFetch<void>(`/api/servers/${id}/stop`, { method: 'POST' });
}

export function restartServer(id: string): Promise<void> {
  return apiFetch<void>(`/api/servers/${id}/restart`, { method: 'POST' });
}
