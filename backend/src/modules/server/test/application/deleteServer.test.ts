import { describe, expect, it, mock } from 'bun:test';
import { deleteServer } from '../../application/deleteServer.js';
import * as ServerActivityTrackerMother from '../helpers/ServerActivityTrackerMother.js';
import * as ServerMother from '../helpers/ServerMother.js';
import * as ServerRepositoryMother from '../helpers/ServerRepositoryMother.js';
import * as ServerRuntimeMother from '../helpers/ServerRuntimeMother.js';

describe('deleteServer (unit)', () => {
  describe('Basic Behaviour', () => {
    it('removes the container, resets the watchdog counter and deletes the record', async () => {
      const server = ServerMother.create({ id: 'srv-1', containerId: 'c1' });
      const serverRepository = ServerRepositoryMother.create({
        getById: mock(async () => server),
      });
      const serverRuntime = ServerRuntimeMother.create();
      const activityTracker = ServerActivityTrackerMother.create();

      await deleteServer({
        serverRepository,
        serverRuntime,
        activityTracker,
        id: 'srv-1',
      });

      expect(serverRuntime.remove).toHaveBeenCalledWith('c1');
      expect(activityTracker.reset).toHaveBeenCalledWith('srv-1');
      expect(serverRepository.delete).toHaveBeenCalledWith('srv-1');
    });
  });

  describe('Edge Cases', () => {
    it('skips runtime removal when the server has no container', async () => {
      const server = ServerMother.create({ id: 'srv-1', containerId: null });
      const serverRepository = ServerRepositoryMother.create({
        getById: mock(async () => server),
      });
      const serverRuntime = ServerRuntimeMother.create();
      const activityTracker = ServerActivityTrackerMother.create();

      await deleteServer({
        serverRepository,
        serverRuntime,
        activityTracker,
        id: 'srv-1',
      });

      expect(serverRuntime.remove).not.toHaveBeenCalled();
      expect(serverRepository.delete).toHaveBeenCalledWith('srv-1');
    });
  });
});
