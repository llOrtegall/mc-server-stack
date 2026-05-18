import { getServer } from '../../application/getServer.js';
import * as ServerMother from '../helpers/ServerMother.js';
import * as ServerRepositoryMother from '../helpers/ServerRepositoryMother.js';

describe('getServer (unit)', () => {
  describe('Basic Behaviour', () => {
    it('returns the server from the repository', async () => {
      const expected = ServerMother.create();
      const serverRepository = ServerRepositoryMother.create({
        getById: vi.fn(async () => expected),
      });

      const result = await getServer({
        serverRepository,
        id: expected.getId(),
      });

      expect(result).toBe(expected);
      expect(serverRepository.getById).toHaveBeenCalledWith(expected.getId());
    });
  });

  describe('Error Scenarios', () => {
    it('throws when no id is provided', async () => {
      const serverRepository = ServerRepositoryMother.create();

      await expect(getServer({ serverRepository, id: '' })).rejects.toThrow(
        'Id must be provided',
      );
    });

    it('throws when the server does not exist', async () => {
      const serverRepository = ServerRepositoryMother.create({
        getById: vi.fn(async () => null),
      });

      await expect(
        getServer({ serverRepository, id: 'missing' }),
      ).rejects.toThrow('not found');
    });
  });
});
