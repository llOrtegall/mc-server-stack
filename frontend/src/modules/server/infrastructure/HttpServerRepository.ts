import { apiFetch } from '../../../api/client.js';
import type { CreateServerInput } from '../domain/CreateServerInput.js';
import { Server, type ServerPrimitives } from '../domain/Server.js';
import { ServerList } from '../domain/ServerList.js';
import type { ServerPropertiesInput } from '../domain/ServerProperties.js';
import type { ServerRepository } from '../domain/ServerRepository.js';

export class HttpServerRepository implements ServerRepository {
  async getAll(): Promise<ServerList> {
    const data = await apiFetch<ServerPrimitives[]>('/api/servers');
    return ServerList.fromPrimitive(data);
  }

  async getById(id: string): Promise<Server | null> {
    const data = await apiFetch<ServerPrimitives>(`/api/servers/${id}`);
    return data ? Server.fromPrimitive(data) : null;
  }

  async create(input: CreateServerInput): Promise<Server> {
    const data = await apiFetch<ServerPrimitives>('/api/servers', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return Server.fromPrimitive(data);
  }

  async update(id: string, properties: ServerPropertiesInput): Promise<Server> {
    const data = await apiFetch<ServerPrimitives>(`/api/servers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ properties }),
    });
    return Server.fromPrimitive(data);
  }

  async start(id: string): Promise<void> {
    await apiFetch<void>(`/api/servers/${id}/start`, { method: 'POST' });
  }

  async stop(id: string): Promise<void> {
    await apiFetch<void>(`/api/servers/${id}/stop`, { method: 'POST' });
  }

  async restart(id: string): Promise<void> {
    await apiFetch<void>(`/api/servers/${id}/restart`, { method: 'POST' });
  }

  async delete(id: string): Promise<boolean> {
    await apiFetch<void>(`/api/servers/${id}`, { method: 'DELETE' });
    return true;
  }
}
