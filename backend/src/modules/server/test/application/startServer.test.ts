import { describe, expect, it, mock } from 'bun:test';
import { startServer } from '../../application/startServer.js';
import * as ServerMother from '../helpers/ServerMother.js';
import * as ServerRepositoryMother from '../helpers/ServerRepositoryMother.js';
import * as ServerRuntimeMother from '../helpers/ServerRuntimeMother.js';

describe('startServer (unit)', () => {
  describe('Basic Behaviour', () => {
    it('transitions to running and starts the container', async () => {
      const server = ServerMother.create({ id: 'srv-1', containerId: 'c1' });
      const serverRepository = ServerRepositoryMother.create({
        getById: mock(async () => server),
      });
      const serverRuntime = ServerRuntimeMother.create();

      await startServer({ serverRepository, serverRuntime, id: 'srv-1' });

      expect(serverRuntime.start).toHaveBeenCalledWith('c1');
      const statuses = (
        serverRepository.update as ReturnType<typeof mock>
      ).mock.calls.map(([s]) => s.toPrimitive().status);
      expect(statuses).toEqual(['starting', 'running']);
    });
  });

  describe('Error Scenarios', () => {
    it('rejects when the server has no container', async () => {
      const server = ServerMother.create({ id: 'srv-1', containerId: null });
      const serverRepository = ServerRepositoryMother.create({
        getById: mock(async () => server),
      });
      const serverRuntime = ServerRuntimeMother.create();

      await expect(
        startServer({ serverRepository, serverRuntime, id: 'srv-1' }),
      ).rejects.toThrow('has no container');
      expect(serverRuntime.start).not.toHaveBeenCalled();
    });

    it('marks the server as error when the runtime fails to start', async () => {
      const server = ServerMother.create({ id: 'srv-1', containerId: 'c1' });
      const serverRepository = ServerRepositoryMother.create({
        getById: mock(async () => server),
      });
      const serverRuntime = ServerRuntimeMother.create({
        start: mock(async () => {
          throw new Error('docker down');
        }),
      });

      await expect(
        startServer({ serverRepository, serverRuntime, id: 'srv-1' }),
      ).rejects.toThrow('docker down');

      const statuses = (
        serverRepository.update as ReturnType<typeof mock>
      ).mock.calls.map(([s]) => s.toPrimitive().status);
      expect(statuses).toEqual(['starting', 'error']);
    });
  });
});
