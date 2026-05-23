import { describe, expect, it, mock } from 'bun:test';
import { getHostResources } from '../../application/getHostResources.js';
import * as HostResourcesMother from '../helpers/HostResourcesMother.js';
import * as HostResourcesRepositoryMother from '../helpers/HostResourcesRepositoryMother.js';

describe('getHostResources (unit)', () => {
  describe('Basic Behaviour', () => {
    it('returns the host resources from the repository', async () => {
      // Arrange
      const expected = HostResourcesMother.create();
      const hostResourcesRepository = HostResourcesRepositoryMother.create({
        get: mock(async () => expected),
      });

      // Act
      const result = await getHostResources({ hostResourcesRepository });

      // Assert
      expect(result).toBe(expected);
      expect(hostResourcesRepository.get).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Scenarios', () => {
    it('propagates a repository failure', async () => {
      // Arrange
      const hostResourcesRepository = HostResourcesRepositoryMother.create({
        get: mock(async () => {
          throw new Error('docker info failed');
        }),
      });

      // Act + Assert
      await expect(
        getHostResources({ hostResourcesRepository }),
      ).rejects.toThrow('docker info failed');
    });
  });
});
