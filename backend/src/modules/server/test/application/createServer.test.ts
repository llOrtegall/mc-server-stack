import { describe, expect, it, mock } from 'bun:test';
import { createServer } from '../../application/createServer.js';
import type { Server } from '../../domain/Server.js';
import * as ServerMother from '../helpers/ServerMother.js';
import * as ServerRepositoryMother from '../helpers/ServerRepositoryMother.js';
import * as ServerRuntimeMother from '../helpers/ServerRuntimeMother.js';

describe('createServer (unit)', () => {
  describe('Basic Behaviour', () => {
    it('persists the server, provisions its runtime and stores the container id', async () => {
      // Arrange
      const persisted = ServerMother.create({ id: 'srv-1', containerId: null });
      const serverRepository = ServerRepositoryMother.create({
        create: mock(async () => persisted),
        update: mock(async (server) => server),
      });
      const serverRuntime = ServerRuntimeMother.create({
        provision: mock(async () => 'container-abc'),
      });

      // Act
      const result = await createServer({
        serverRepository,
        serverRuntime,
        name: 'My Server',
        port: 25565,
      });

      // Assert
      expect(result.getId()).toBe('srv-1');
      expect(result.getContainerId()).toBe('container-abc');
      expect(serverRepository.create).toHaveBeenCalledTimes(1);
      expect(serverRuntime.provision).toHaveBeenCalledWith(persisted);
      expect(serverRepository.update).toHaveBeenCalledTimes(1);
    });

    it('derives the rcon port as minecraft port + 1', async () => {
      const serverRepository = ServerRepositoryMother.create({
        create: mock(async (server) => server.withId('srv-2')),
      });
      const provision = mock(async (_server: Server) => 'c1');
      const serverRuntime = ServerRuntimeMother.create({ provision });

      await createServer({
        serverRepository,
        serverRuntime,
        name: 'Srv',
        port: 30000,
      });

      const provisioned = provision.mock.calls[0]?.[0];
      expect(provisioned?.toPrimitive().rconPort).toBe(30001);
    });

    it('provisions a bedrock server defaulting its version to LATEST', async () => {
      const serverRepository = ServerRepositoryMother.create({
        create: mock(async (server) => server.withId('srv-bedrock')),
      });
      const provision = mock(async (_server: Server) => 'c-bedrock');
      const serverRuntime = ServerRuntimeMother.create({ provision });

      await createServer({
        serverRepository,
        serverRuntime,
        name: 'Bedrock Srv',
        edition: 'bedrock',
        port: 19132,
      });

      const provisioned = provision.mock.calls[0]?.[0]?.toPrimitive();
      expect(provisioned?.edition).toBe('bedrock');
      expect(provisioned?.version).toBe('LATEST');
    });

    it('defaults the edition to java', async () => {
      const serverRepository = ServerRepositoryMother.create({
        create: mock(async (server) => server.withId('srv-java')),
      });
      const provision = mock(async (_server: Server) => 'c-java');
      const serverRuntime = ServerRuntimeMother.create({ provision });

      await createServer({
        serverRepository,
        serverRuntime,
        name: 'Java Srv',
        port: 25565,
      });

      expect(provision.mock.calls[0]?.[0]?.toPrimitive().edition).toBe('java');
    });
  });

  describe('Error Scenarios', () => {
    it('propagates a repository failure and does not provision', async () => {
      const serverRepository = ServerRepositoryMother.create({
        create: mock(async () => {
          throw new Error('DB error');
        }),
      });
      const serverRuntime = ServerRuntimeMother.create();

      await expect(
        createServer({
          serverRepository,
          serverRuntime,
          name: 'X',
          port: 25565,
        }),
      ).rejects.toThrow('DB error');
      expect(serverRuntime.provision).not.toHaveBeenCalled();
    });

    it('rejects an invalid port at the domain boundary', async () => {
      const serverRepository = ServerRepositoryMother.create();
      const serverRuntime = ServerRuntimeMother.create();

      await expect(
        createServer({
          serverRepository,
          serverRuntime,
          name: 'X',
          port: 70000,
        }),
      ).rejects.toThrow('Port must be between');
      expect(serverRepository.create).not.toHaveBeenCalled();
    });
  });
});
