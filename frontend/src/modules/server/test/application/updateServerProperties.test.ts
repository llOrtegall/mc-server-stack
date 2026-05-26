import { updateServerProperties } from '../../application/updateServerProperties.js';
import * as ServerMother from '../helpers/ServerMother.js';
import * as ServerRepositoryMother from '../helpers/ServerRepositoryMother.js';

describe('updateServerProperties (unit)', () => {
  describe('Basic Behaviour', () => {
    it('delegates to the repository and returns the updated server', async () => {
      const updated = ServerMother.create();
      const serverRepository = ServerRepositoryMother.create({
        update: vi.fn(async () => updated),
      });
      const properties = { difficulty: 'hard' as const };

      const result = await updateServerProperties({
        serverRepository,
        id: 'srv-1',
        properties,
      });

      expect(result).toBe(updated);
      expect(serverRepository.update).toHaveBeenCalledWith('srv-1', properties);
    });
  });

  describe('Error Scenarios', () => {
    it('throws when the id is missing', async () => {
      const serverRepository = ServerRepositoryMother.create();

      await expect(
        updateServerProperties({ serverRepository, id: '', properties: {} }),
      ).rejects.toThrow('Id must be provided');
      expect(serverRepository.update).not.toHaveBeenCalled();
    });
  });
});
