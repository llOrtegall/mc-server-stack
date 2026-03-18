import { ServerModel } from "./schema.js";
import type { IServerRepository } from "../../domain/server/IServerRepository.js";
import { Server, type ServerProps } from "../../domain/server/Server.entity.js";

function modelToEntity(row: ServerModel): Server {
  return Server.reconstitute({
    id: row.id,
    name: row.name,
    version: row.version as ServerProps["version"],
    status: row.status as ServerProps["status"],
    port: row.port,
    rconPort: row.rconPort,
    rconPassword: row.rconPassword,
    memoryMb: row.memoryMb,
    maxPlayers: row.maxPlayers,
    motd: row.motd,
    difficulty: row.difficulty as ServerProps["difficulty"],
    gamemode: row.gamemode as ServerProps["gamemode"],
    onlineMode: row.onlineMode,
    containerId: row.containerId,
    dataPath: row.dataPath,
    autoShutdownEnabled: row.autoShutdownEnabled,
    lastPlayerLeftAt: row.lastPlayerLeftAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}

export class ServerRepository implements IServerRepository {
  async findAll(): Promise<Server[]> {
    const rows = await ServerModel.findAll({ order: [["createdAt", "DESC"]] });
    return rows.map(modelToEntity);
  }

  async findById(id: string): Promise<Server | null> {
    const row = await ServerModel.findByPk(id);
    return row ? modelToEntity(row) : null;
  }

  async findByPort(port: number): Promise<Server | null> {
    const row = await ServerModel.findOne({ where: { port } });
    return row ? modelToEntity(row) : null;
  }

  async save(server: Server): Promise<void> {
    await ServerModel.create({
      id: server.id,
      name: server.name,
      version: server.version,
      status: server.status,
      port: server.port,
      rconPort: server.rconPort,
      rconPassword: server.rconPassword,
      memoryMb: server.memoryMb,
      maxPlayers: server.maxPlayers,
      motd: server.motd,
      difficulty: server.difficulty,
      gamemode: server.gamemode,
      onlineMode: server.onlineMode,
      containerId: server.containerId,
      dataPath: server.dataPath,
      autoShutdownEnabled: server.autoShutdownEnabled,
      lastPlayerLeftAt: server.lastPlayerLeftAt,
    });
  }

  async update(server: Server): Promise<void> {
    await ServerModel.update(
      {
        name: server.name,
        status: server.status,
        memoryMb: server.memoryMb,
        maxPlayers: server.maxPlayers,
        motd: server.motd,
        difficulty: server.difficulty,
        gamemode: server.gamemode,
        onlineMode: server.onlineMode,
        containerId: server.containerId,
        autoShutdownEnabled: server.autoShutdownEnabled,
        lastPlayerLeftAt: server.lastPlayerLeftAt,
      },
      { where: { id: server.id } }
    );
  }

  async delete(id: string): Promise<void> {
    await ServerModel.destroy({ where: { id } });
  }
}
