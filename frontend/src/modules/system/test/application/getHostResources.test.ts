import { getHostResources } from '../../application/getHostResources.js';
import * as HostResourcesMother from '../helpers/HostResourcesMother.js';
import * as HostResourcesRepositoryMother from '../helpers/HostResourcesRepositoryMother.js';

describe('getHostResources (unit)', () => {
  describe('Basic Behaviour', () => {
    it('returns the host resources from the repository', async () => {
      const expected = HostResourcesMother.create();
      const hostResourcesRepository = HostResourcesRepositoryMother.create({
        get: vi.fn(async () => expected),
      });

      const result = await getHostResources({ hostResourcesRepository });

      expect(result).toBe(expected);
      expect(hostResourcesRepository.get).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Scenarios', () => {
    it('propagates a repository failure', async () => {
      const hostResourcesRepository = HostResourcesRepositoryMother.create({
        get: vi.fn(async () => {
          throw new Error('network error');
        }),
      });

      await expect(
        getHostResources({ hostResourcesRepository }),
      ).rejects.toThrow('network error');
    });
  });
});
