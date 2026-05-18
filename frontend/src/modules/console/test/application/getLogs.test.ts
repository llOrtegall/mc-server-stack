import { getLogs } from '../../application/getLogs.js';
import * as ConsoleRepositoryMother from '../helpers/ConsoleRepositoryMother.js';

describe('getLogs (unit)', () => {
  describe('Basic Behaviour', () => {
    it('reads the tail from the repository', async () => {
      const consoleRepository = ConsoleRepositoryMother.create({
        getLogs: vi.fn(async () => 'two\nlines'),
      });

      const result = await getLogs({
        consoleRepository,
        serverId: 'srv-1',
        tail: 50,
      });

      expect(result).toBe('two\nlines');
      expect(consoleRepository.getLogs).toHaveBeenCalledWith('srv-1', 50);
    });
  });
});
