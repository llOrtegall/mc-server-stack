import { createServer } from '../../application/createServer.js';
import * as ServerMother from '../helpers/ServerMother.js';
import * as ServerRepositoryMother from '../helpers/ServerRepositoryMother.js';

describe('createServer (unit)', () => {
  describe('Basic Behaviour', () => {
    it('forwards the input to the repository and returns the server', async () => {
      const created = ServerMother.create();
      const serverRepository = ServerRepositoryMother.create({
        create: vi.fn(async () => created),
      });
      const input = { name: 'My Server', port: 25565 };

      const result = await createServer({ serverRepository, input });

      expect(result).toBe(created);
      expect(serverRepository.create).toHaveBeenCalledWith(input);
    });
  });

  describe('Error Scenarios', () => {
    it('throws when the name is empty', async () => {
      const serverRepository = ServerRepositoryMother.create();

      await expect(
        createServer({ serverRepository, input: { name: '', port: 25565 } }),
      ).rejects.toThrow('Name must be provided');
      expect(serverRepository.create).not.toHaveBeenCalled();
    });
  });
});
