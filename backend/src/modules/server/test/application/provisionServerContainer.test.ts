import { describe, expect, it, mock } from 'bun:test';
import { provisionServerContainer } from '../../application/provisionServerContainer.js';
import * as ServerMother from '../helpers/ServerMother.js';
import * as ServerRepositoryMother from '../helpers/ServerRepositoryMother.js';
import * as ServerRuntimeMother from '../helpers/ServerRuntimeMother.js';

describe('provisionServerContainer (unit)', () => {
  describe('Basic Behaviour', () => {
    it('provisions the runtime and stores the container id with a `stopped` status', async () => {
      const server = ServerMother.create({
        id: 'srv-1',
        containerId: null,
        status: 'provisioning',
      });
      const serverRepository = ServerRepositoryMother.create({
        update: mock(async (s) => s),
      });
      const serverRuntime = ServerRuntimeMother.create({
        provision: mock(async () => 'container-abc'),
      });

      await provisionServerContainer({
        serverRepository,
        serverRuntime,
        server,
      });

      expect(serverRuntime.provision).toHaveBeenCalledWith(server);
      expect(serverRepository.update).toHaveBeenCalledTimes(1);
      const updated = (serverRepository.update as ReturnType<typeof mock>).mock
        .calls[0]?.[0];
      expect(updated.getContainerId()).toBe('container-abc');
      expect(updated.toPrimitive().status).toBe('stopped');
    });
  });

  describe('Error Scenarios', () => {
    it('marks the server as `error` when the runtime fails and does not reject', async () => {
      const server = ServerMother.create({
        id: 'srv-1',
        containerId: null,
        status: 'provisioning',
      });
      const serverRepository = ServerRepositoryMother.create({
        update: mock(async (s) => s),
      });
      const serverRuntime = ServerRuntimeMother.create({
        provision: mock(async () => {
          throw new Error('image pull failed');
        }),
      });

      await expect(
        provisionServerContainer({ serverRepository, serverRuntime, server }),
      ).resolves.toBeUndefined();

      expect(serverRepository.update).toHaveBeenCalledTimes(1);
      const updated = (serverRepository.update as ReturnType<typeof mock>).mock
        .calls[0]?.[0];
      expect(updated.getContainerId()).toBeNull();
      expect(updated.toPrimitive().status).toBe('error');
    });
  });
});
