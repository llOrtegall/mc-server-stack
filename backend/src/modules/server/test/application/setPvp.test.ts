import { describe, expect, it, mock } from 'bun:test';
import { setPvp } from '../../application/setPvp.js';
import * as ServerMother from '../helpers/ServerMother.js';
import * as ServerRepositoryMother from '../helpers/ServerRepositoryMother.js';
import * as ServerRuntimeMother from '../helpers/ServerRuntimeMother.js';

describe('setPvp (unit)', () => {
  describe('Basic Behaviour', () => {
    it('runs the pvp gamerule on the running container and persists the toggle', async () => {
      const server = ServerMother.create({
        id: 'srv-1',
        edition: 'bedrock',
        containerId: 'c-1',
        status: 'running',
        pvp: true,
      });
      const serverRepository = ServerRepositoryMother.create({
        getById: mock(async () => server),
        update: mock(async (s) => s),
      });
      const serverRuntime = ServerRuntimeMother.create({
        setGameRule: mock(async () => {}),
      });

      const result = await setPvp({
        serverRepository,
        serverRuntime,
        id: 'srv-1',
        enabled: false,
      });

      expect(serverRuntime.setGameRule).toHaveBeenCalledWith(
        'c-1',
        'pvp',
        false,
      );
      expect(serverRepository.update).toHaveBeenCalledTimes(1);
      expect(result.getPvp()).toBe(false);
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
        setPvp({
          serverRepository,
          serverRuntime,
          id: 'srv-1',
          enabled: false,
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
        setPvp({
          serverRepository,
          serverRuntime,
          id: 'srv-1',
          enabled: false,
        }),
      ).rejects.toThrow('not running');
      expect(serverRuntime.setGameRule).not.toHaveBeenCalled();
    });
  });
});
