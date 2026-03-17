import type { Server } from "./Server.entity.js";

export interface IServerRepository {
  findAll(): Promise<Server[]>;
  findById(id: string): Promise<Server | null>;
  findByPort(port: number): Promise<Server | null>;
  save(server: Server): Promise<void>;
  update(server: Server): Promise<void>;
  delete(id: string): Promise<void>;
}
