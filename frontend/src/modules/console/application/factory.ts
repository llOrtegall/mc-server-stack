import type { ConsoleStream } from '../domain/ConsoleRepository.js';
import { HttpConsoleRepository } from '../infrastructure/HttpConsoleRepository.js';
import { getLogs } from './getLogs.js';
import { sendCommand } from './sendCommand.js';

const consoleRepository = new HttpConsoleRepository();

export const consoleFactory = {
  getLogs: (serverId: string, tail: number) =>
    getLogs({ consoleRepository, serverId, tail }),
  sendCommand: (serverId: string, command: string) =>
    sendCommand({ consoleRepository, serverId, command }),
  openStream: (
    serverId: string,
    onMessage: (text: string) => void,
  ): ConsoleStream => consoleRepository.openStream(serverId, onMessage),
};
