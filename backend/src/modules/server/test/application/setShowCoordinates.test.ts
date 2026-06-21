import { describe, expect, it, mock } from 'bun:test';
import { setShowCoordinates } from '../../application/setShowCoordinates.js';
import * as ServerMother from '../helpers/ServerMother.js';
import * as ServerRepositoryMother from '../helpers/ServerRepositoryMother.js';
import * as ServerRuntimeMother from '../helpers/ServerRuntimeMother.js';

describe('setShowCoordinates (unit)', () => {
  describe('Basic Behaviour', () => {
    it('runs the gamerule on the running container and persists the toggle', async () => {
      const server = ServerMother.create({
        id: 'srv-1',
        edition: 'bedrock',
        containerId: 'c-1',
        status: 'running',
        showCoordinates: false,
      });
      const serverRepository = ServerRepositoryMother.create({
        getById: mock(async () => server),
        update: mock(async (s) => s),
      });
      const serverRuntime = ServerRuntimeMother.create({
        setGameRule: mock(async () => {}),
      });

      const result = await setShowCoordinates({
        serverRepository,
        serverRuntime,
        id: 'srv-1',
        enabled: true,
      });

      expect(serverRuntime.setGameRule).toHaveBeenCalledWith(
        'c-1',
        'showcoordinates',
        true,
      );
      expect(serverRepository.update).toHaveBeenCalledTimes(1);
      expect(result.getShowCoordinates()).toBe(true);
    });
  });

  describe('Error Scenarios', () => {
    it('rejects a Java server', async () => {
      const server = ServerMother.create({
        id: 'srv-1',
        edition: 'java',
        containerId: 'c-1',
        status: 'running',
      });
      const serverRepository = ServerRepositoryMother.create({
        getById: mock(async () => server),
      });
      const serverRuntime = ServerRuntimeMother.create();

      await expect(
        setShowCoordinates({
          serverRepository,
          serverRuntime,
          id: 'srv-1',
          enabled: true,
        }),
      ).rejects.toThrow('only supported on Bedrock');
      expect(serverRuntime.setGameRule).not.toHaveBeenCalled();
    });

    it('rejects when the server is not running', async () => {
      const server = ServerMother.create({
        id: 'srv-1',
        edition: 'bedrock',
        containerId: 'c-1',
        status: 'stopped',
      });
      const serverRepository = ServerRepositoryMother.create({
        getById: mock(async () => server),
      });
      const serverRuntime = ServerRuntimeMother.create();

      await expect(
        setShowCoordinates({
          serverRepository,
          serverRuntime,
          id: 'srv-1',
          enabled: true,
        }),
      ).rejects.toThrow('not running');
      expect(serverRuntime.setGameRule).not.toHaveBeenCalled();
    });

    it('rejects a server without a container', async () => {
      const server = ServerMother.create({
        id: 'srv-1',
        edition: 'bedrock',
        containerId: null,
        status: 'running',
      });
      const serverRepository = ServerRepositoryMother.create({
        getById: mock(async () => server),
      });
      const serverRuntime = ServerRuntimeMother.create();

      await expect(
        setShowCoordinates({
          serverRepository,
          serverRuntime,
          id: 'srv-1',
          enabled: true,
        }),
      ).rejects.toThrow('has no container');
    });
  });
});
