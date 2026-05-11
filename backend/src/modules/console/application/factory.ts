import { DockerLogReader } from '../infrastructure/DockerLogReader.js';
import { PostgresConsoleServerRepository } from '../infrastructure/PostgresConsoleServerRepository.js';
import { RconConsoleGateway } from '../infrastructure/RconConsoleGateway.js';
import { getLogs } from './getLogs.js';
import { sendCommand } from './sendCommand.js';

const consoleServerRepository = new PostgresConsoleServerRepository();
const consoleGateway = new RconConsoleGateway();
const logReader = new DockerLogReader();

export const consoleFactory = {
  sendCommand: (serverId: string, command: string) =>
    sendCommand({ consoleServerRepository, consoleGateway, serverId, command }),

  getLogs: (serverId: string, tail: number) =>
    getLogs({ consoleServerRepository, logReader, serverId, tail }),
};
