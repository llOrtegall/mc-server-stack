import { Rcon } from 'rcon-client';
import type { ConsoleGateway, RconTarget } from '../domain/ConsoleGateway.js';

export class RconConsoleGateway implements ConsoleGateway {
  async sendCommand(target: RconTarget, command: string): Promise<string> {
    const rcon = new Rcon({
      host: '127.0.0.1',
      port: target.rconPort,
      password: target.rconPassword,
    });

    await rcon.connect();
    try {
      return await rcon.send(command);
    } finally {
      await rcon.end();
    }
  }
}
