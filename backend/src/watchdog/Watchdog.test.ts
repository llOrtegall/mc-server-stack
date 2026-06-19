import { describe, expect, it, mock } from 'bun:test';
import * as ConsoleGatewayMother from '../modules/console/test/helpers/ConsoleGatewayMother.js';
import { ServerList } from '../modules/server/domain/ServerList.js';
import * as ServerMother from '../modules/server/test/helpers/ServerMother.js';
import * as ServerRepositoryMother from '../modules/server/test/helpers/ServerRepositoryMother.js';
import * as ServerRuntimeMother from '../modules/server/test/helpers/ServerRuntimeMother.js';
import { Watchdog } from './Watchdog.js';

const runningServer = (id: string) =>
  ServerMother.create({ id, status: 'running', containerId: `c-${id}` });

const empty = ConsoleGatewayMother.create({
  sendCommand: mock(async () => 'There are 0 of a max of 20 players online:'),
});

describe('Watchdog (unit)', () => {
  describe('Basic Behaviour', () => {
    it('auto-stops a server after the inactivity limit of empty checks', async () => {
      const serverRepository = ServerRepositoryMother.create({
        getAll: mock(async () => ServerList.create([runningServer('srv-1')])),
      });
      const serverRuntime = ServerRuntimeMother.create();
      const watchdog = new Watchdog({
        serverRepository,
        serverRuntime,
        consoleGateway: empty,
      });

      for (let i = 0; i < 4; i++) await watchdog.tick();
      expect(serverRuntime.stop).not.toHaveBeenCalled();

      await watchdog.tick(); // 5th empty check crosses the limit

      expect(serverRuntime.stop).toHaveBeenCalledWith('c-srv-1');
      expect(serverRepository.update).toHaveBeenCalledTimes(1);
    });

    it('keeps a server running while players are online', async () => {
      const serverRepository = ServerRepositoryMother.create({
        getAll: mock(async () => ServerList.create([runningServer('srv-1')])),
      });
      const serverRuntime = ServerRuntimeMother.create();
      const consoleGateway = ConsoleGatewayMother.create({
        sendCommand: mock(
          async () => 'There are 3 of a max of 20 players online',
        ),
      });
      const watchdog = new Watchdog({
        serverRepository,
        serverRuntime,
        consoleGateway,
      });

      for (let i = 0; i < 6; i++) await watchdog.tick();

      expect(serverRuntime.stop).not.toHaveBeenCalled();
    });
  });

  describe('Error Scenarios', () => {
    it('never polls or stops a bedrock server (no RCON)', async () => {
      const bedrock = ServerMother.create({
        id: 'srv-bedrock',
        edition: 'bedrock',
        status: 'running',
        containerId: 'c-srv-bedrock',
      });
      const serverRepository = ServerRepositoryMother.create({
        getAll: mock(async () => ServerList.create([bedrock])),
      });
      const serverRuntime = ServerRuntimeMother.create();
      const consoleGateway = ConsoleGatewayMother.create();
      const watchdog = new Watchdog({
        serverRepository,
        serverRuntime,
        consoleGateway,
      });

      for (let i = 0; i < 6; i++) await watchdog.tick();

      expect(consoleGateway.sendCommand).not.toHaveBeenCalled();
      expect(serverRuntime.stop).not.toHaveBeenCalled();
    });

    it('skips a server whose RCON is unreachable', async () => {
      const serverRepository = ServerRepositoryMother.create({
        getAll: mock(async () => ServerList.create([runningServer('srv-1')])),
      });
      const serverRuntime = ServerRuntimeMother.create();
      const consoleGateway = ConsoleGatewayMother.create({
        sendCommand: mock(async () => {
          throw new Error('ECONNREFUSED');
        }),
      });
      const watchdog = new Watchdog({
        serverRepository,
        serverRuntime,
        consoleGateway,
      });

      for (let i = 0; i < 6; i++) await watchdog.tick();

      expect(serverRuntime.stop).not.toHaveBeenCalled();
    });
  });

  describe('reset', () => {
    it('clears an inactivity streak so the count starts over', async () => {
      const serverRepository = ServerRepositoryMother.create({
        getAll: mock(async () => ServerList.create([runningServer('srv-1')])),
      });
      const serverRuntime = ServerRuntimeMother.create();
      const watchdog = new Watchdog({
        serverRepository,
        serverRuntime,
        consoleGateway: empty,
      });

      for (let i = 0; i < 4; i++) await watchdog.tick();
      watchdog.reset('srv-1');
      await watchdog.tick(); // would have been the 5th, but streak was reset

      expect(serverRuntime.stop).not.toHaveBeenCalled();
    });
  });
});
