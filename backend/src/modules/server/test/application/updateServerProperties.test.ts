import { describe, expect, it, mock } from 'bun:test';
import { updateServerProperties } from '../../application/updateServerProperties.js';
import * as ServerActivityTrackerMother from '../helpers/ServerActivityTrackerMother.js';
import * as ServerMother from '../helpers/ServerMother.js';
import * as ServerRepositoryMother from '../helpers/ServerRepositoryMother.js';
import * as ServerRuntimeMother from '../helpers/ServerRuntimeMother.js';

describe('updateServerProperties (unit)', () => {
  describe('Basic Behaviour', () => {
    it('recreates the container with new properties and returns the stopped server', async () => {
      const server = ServerMother.create({ id: 'srv-1', containerId: 'old' });
      const serverRepository = ServerRepositoryMother.create({
        getById: mock(async () => server),
        update: mock(async (s) => s),
      });
      const serverRuntime = ServerRuntimeMother.create({
        provision: mock(async () => 'new-container'),
      });
      const activityTracker = ServerActivityTrackerMother.create();

      const result = await updateServerProperties({
        serverRepository,
        serverRuntime,
        activityTracker,
        id: 'srv-1',
        properties: { difficulty: 'hard', pvp: false },
      });

      expect(serverRuntime.remove).toHaveBeenCalledWith('old');
      expect(activityTracker.reset).toHaveBeenCalledWith('srv-1');
      expect(serverRuntime.provision).toHaveBeenCalled();
      expect(result.toPrimitive().properties.difficulty).toBe('hard');
      expect(result.toPrimitive().properties.pvp).toBe(false);
      expect(result.getContainerId()).toBe('new-container');
      expect(result.toPrimitive().status).toBe('stopped');
    });
  });

  describe('Edge Cases', () => {
    it('skips container removal when the server has no container', async () => {
      const server = ServerMother.create({ id: 'srv-1', containerId: null });
      const serverRepository = ServerRepositoryMother.create({
        getById: mock(async () => server),
      });
      const serverRuntime = ServerRuntimeMother.create({
        provision: mock(async () => 'new-container'),
      });
      const activityTracker = ServerActivityTrackerMother.create();

      await updateServerProperties({
        serverRepository,
        serverRuntime,
        activityTracker,
        id: 'srv-1',
        properties: { motd: 'hello' },
      });

      expect(serverRuntime.remove).not.toHaveBeenCalled();
      expect(serverRuntime.provision).toHaveBeenCalled();
    });
  });

  describe('Error Scenarios', () => {
    it('throws when the server does not exist', async () => {
      const serverRepository = ServerRepositoryMother.create({
        getById: mock(async () => null),
      });
      const serverRuntime = ServerRuntimeMother.create();
      const activityTracker = ServerActivityTrackerMother.create();

      await expect(
        updateServerProperties({
          serverRepository,
          serverRuntime,
          activityTracker,
          id: 'missing',
          properties: {},
        }),
      ).rejects.toThrow('not found');
    });
  });
});
