import { Server, type ServerPrimitives } from './Server.js';

export class ServerList {
  private constructor(private readonly servers: Server[]) {}

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

  add(server: Server): ServerList {
    return ServerList.create([...this.servers, server]);
  }

  remove(id: string): ServerList {
    return ServerList.create(this.servers.filter((s) => s.getId() !== id));
  }

  count(): number {
    return this.servers.length;
  }

  toPrimitive(): ServerPrimitives[] {
    return this.servers.map((s) => s.toPrimitive());
  }

  toPublic(): Omit<ServerPrimitives, 'rconPassword'>[] {
    return this.servers.map((s) => s.toPublic());
  }
}
