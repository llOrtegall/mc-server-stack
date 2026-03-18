import { Rcon } from "minecraft-rcon";
import { logger } from "../logger.js";

export interface PlayerListResult {
  count: number;
  max: number;
  players: string[];
}

/**
 * Servicio RCON — se comunica con el servidor Minecraft para:
 * - Verificar jugadores online (auto-shutdown)
 * - Ejecutar comandos (whitelist, ban, etc.)
 *
 * RCON corre dentro de la red Docker interna (contenedor a contenedor).
 */
export class RconService {
  async executeCommand(
    host: string,
    port: number,
    password: string,
    command: string
  ): Promise<string> {
    const rcon = new Rcon(host, port, password);
    try {
      await rcon.connect();
      const response = await rcon.command(command);
      return response;
    } finally {
      rcon.disconnect();
    }
  }

  async getPlayerList(
    host: string,
    port: number,
    password: string
  ): Promise<PlayerListResult> {
    try {
      const response = await this.executeCommand(host, port, password, "list");
      // Respuesta típica: "There are 2 of a max of 20 players online: Player1, Player2"
      const match = response.match(/There are (\d+) of a max of (\d+) players online:?(.*)/);
      if (!match) {
        return { count: 0, max: 20, players: [] };
      }
      const count = parseInt(match[1], 10);
      const max = parseInt(match[2], 10);
      const playerStr = match[3]?.trim() ?? "";
      const players = playerStr
        ? playerStr.split(",").map((p) => p.trim()).filter(Boolean)
        : [];
      return { count, max, players };
    } catch (err) {
      logger.debug(`RCON no disponible (servidor puede estar iniciando): ${err}`);
      return { count: 0, max: 20, players: [] };
    }
  }

  async addToWhitelist(
    host: string,
    port: number,
    password: string,
    playerName: string
  ): Promise<string> {
    return this.executeCommand(host, port, password, `whitelist add ${playerName}`);
  }

  async removeFromWhitelist(
    host: string,
    port: number,
    password: string,
    playerName: string
  ): Promise<string> {
    return this.executeCommand(host, port, password, `whitelist remove ${playerName}`);
  }

  async banPlayer(
    host: string,
    port: number,
    password: string,
    playerName: string,
    reason?: string
  ): Promise<string> {
    const cmd = reason
      ? `ban ${playerName} ${reason}`
      : `ban ${playerName}`;
    return this.executeCommand(host, port, password, cmd);
  }

  async pardonPlayer(
    host: string,
    port: number,
    password: string,
    playerName: string
  ): Promise<string> {
    return this.executeCommand(host, port, password, `pardon ${playerName}`);
  }
}
