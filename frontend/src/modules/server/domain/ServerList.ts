import { Server, type ServerPrimitives } from './Server.js';

export class ServerList {
  private readonly servers: Server[];

  private constructor(servers: Server[]) {
    this.servers = servers;
  }

  static create(servers: Server[] | null): ServerList {
    return new ServerList(servers ?? []);
  }

  static fromPrimitive(items: ServerPrimitives[] | null): ServerList {
    if (items === null) return ServerList.create(null);
    return ServerList.create(items.map((i) => Server.fromPrimitive(i)));
  }

  getById(id: string): Server | null {
    return this.servers.find((s) => s.getId() === id) ?? null;
  }

  count(): number {
    return this.servers.length;
  }

  isEmpty(): boolean {
    return this.servers.length === 0;
  }

  toArray(): Server[] {
    return [...this.servers];
  }

  toPrimitive(): ServerPrimitives[] {
    return this.servers.map((s) => s.toPrimitive());
  }
}
