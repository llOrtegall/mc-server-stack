import { describe, expect, it, mock } from 'bun:test';
import { getServer } from '../../application/getServer.js';
import * as ServerMother from '../helpers/ServerMother.js';
import * as ServerRepositoryMother from '../helpers/ServerRepositoryMother.js';

describe('getServer (unit)', () => {
  describe('Basic Behaviour', () => {
    it('returns the server from the repository', async () => {
      const expected = ServerMother.create({ id: 'srv-1' });
      const serverRepository = ServerRepositoryMother.create({
        getById: mock(async () => expected),
      });

      const result = await getServer({ serverRepository, id: 'srv-1' });

      expect(result).toBe(expected);
      expect(serverRepository.getById).toHaveBeenCalledWith('srv-1');
    });
  });

  describe('Edge Cases', () => {
    it('rejects when no id is provided', async () => {
      const serverRepository = ServerRepositoryMother.create();

      await expect(getServer({ serverRepository, id: '' })).rejects.toThrow(
        'Id must be provided',
      );
      expect(serverRepository.getById).not.toHaveBeenCalled();
    });
  });

  describe('Error Scenarios', () => {
    it('throws not found when the server does not exist', async () => {
      const serverRepository = ServerRepositoryMother.create({
        getById: mock(async () => null),
      });

      await expect(
        getServer({ serverRepository, id: 'missing' }),
      ).rejects.toThrow('not found');
    });
  });
});
