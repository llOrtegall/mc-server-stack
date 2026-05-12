import { describe, expect, it, mock } from 'bun:test';
import { sendCommand } from '../../application/sendCommand.js';
import * as ConsoleGatewayMother from '../helpers/ConsoleGatewayMother.js';
import * as ConsoleServerRepositoryMother from '../helpers/ConsoleServerRepositoryMother.js';

describe('sendCommand (unit)', () => {
  describe('Basic Behaviour', () => {
    it('forwards the command to the RCON endpoint and returns the reply', async () => {
      const consoleServerRepository = ConsoleServerRepositoryMother.create({
        findById: mock(async () =>
          ConsoleServerRepositoryMother.consoleServer({
            rconPort: 25576,
            rconPassword: 'secret',
            status: 'running',
          }),
        ),
      });
      const consoleGateway = ConsoleGatewayMother.create({
        sendCommand: mock(async () => 'There are 0 players'),
      });

      const result = await sendCommand({
        consoleServerRepository,
        consoleGateway,
        serverId: 'srv-1',
        command: 'list',
      });

      expect(result).toBe('There are 0 players');
      expect(consoleGateway.sendCommand).toHaveBeenCalledWith(
        { rconPort: 25576, rconPassword: 'secret' },
        'list',
      );
    });
  });

  describe('Error Scenarios', () => {
    it('throws when the command is empty', async () => {
      const consoleServerRepository = ConsoleServerRepositoryMother.create();
      const consoleGateway = ConsoleGatewayMother.create();

      await expect(
        sendCommand({
          consoleServerRepository,
          consoleGateway,
          serverId: 'srv-1',
          command: '',
        }),
      ).rejects.toThrow('Command must be provided');
      expect(consoleGateway.sendCommand).not.toHaveBeenCalled();
    });

    it('throws when the server does not exist', async () => {
      const consoleServerRepository = ConsoleServerRepositoryMother.create({
        findById: mock(async () => null),
      });
      const consoleGateway = ConsoleGatewayMother.create();

      await expect(
        sendCommand({
          consoleServerRepository,
          consoleGateway,
          serverId: 'missing',
          command: 'list',
        }),
      ).rejects.toThrow('Server not found');
      expect(consoleGateway.sendCommand).not.toHaveBeenCalled();
    });

    it('throws when the server is not running', async () => {
      const consoleServerRepository = ConsoleServerRepositoryMother.create({
        findById: mock(async () =>
          ConsoleServerRepositoryMother.consoleServer({ status: 'stopped' }),
        ),
      });
      const consoleGateway = ConsoleGatewayMother.create();

      await expect(
        sendCommand({
          consoleServerRepository,
          consoleGateway,
          serverId: 'srv-1',
          command: 'list',
        }),
      ).rejects.toThrow('Server is not running');
      expect(consoleGateway.sendCommand).not.toHaveBeenCalled();
    });
  });
});
