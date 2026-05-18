import { sendCommand } from '../../application/sendCommand.js';
import * as ConsoleRepositoryMother from '../helpers/ConsoleRepositoryMother.js';

describe('sendCommand (unit)', () => {
  describe('Basic Behaviour', () => {
    it('forwards the command and returns the reply', async () => {
      const consoleRepository = ConsoleRepositoryMother.create({
        sendCommand: vi.fn(async () => 'There are 0 players'),
      });

      const result = await sendCommand({
        consoleRepository,
        serverId: 'srv-1',
        command: 'list',
      });

      expect(result).toBe('There are 0 players');
      expect(consoleRepository.sendCommand).toHaveBeenCalledWith(
        'srv-1',
        'list',
      );
    });
  });

  describe('Error Scenarios', () => {
    it('throws when the command is empty', async () => {
      const consoleRepository = ConsoleRepositoryMother.create();

      await expect(
        sendCommand({ consoleRepository, serverId: 'srv-1', command: '' }),
      ).rejects.toThrow('Command must be provided');
      expect(consoleRepository.sendCommand).not.toHaveBeenCalled();
    });
  });
});
