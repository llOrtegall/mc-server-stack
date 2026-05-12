import { describe, expect, it, mock } from 'bun:test';
import { getLogs } from '../../application/getLogs.js';
import * as ConsoleServerRepositoryMother from '../helpers/ConsoleServerRepositoryMother.js';
import * as LogReaderMother from '../helpers/LogReaderMother.js';

describe('getLogs (unit)', () => {
  describe('Basic Behaviour', () => {
    it('reads the tail of the container logs', async () => {
      const consoleServerRepository = ConsoleServerRepositoryMother.create({
        findById: mock(async () =>
          ConsoleServerRepositoryMother.consoleServer({
            containerId: 'abc123',
          }),
        ),
      });
      const logReader = LogReaderMother.create({
        getTail: mock(async () => 'two\nlog\nlines'),
      });

      const result = await getLogs({
        consoleServerRepository,
        logReader,
        serverId: 'srv-1',
        tail: 50,
      });

      expect(result).toBe('two\nlog\nlines');
      expect(logReader.getTail).toHaveBeenCalledWith('abc123', 50);
    });
  });

  describe('Error Scenarios', () => {
    it('throws when the server has no container', async () => {
      const consoleServerRepository = ConsoleServerRepositoryMother.create({
        findById: mock(async () =>
          ConsoleServerRepositoryMother.consoleServer({ containerId: null }),
        ),
      });
      const logReader = LogReaderMother.create();

      await expect(
        getLogs({
          consoleServerRepository,
          logReader,
          serverId: 'srv-1',
          tail: 100,
        }),
      ).rejects.toThrow('Server not found or has no container');
      expect(logReader.getTail).not.toHaveBeenCalled();
    });
  });
});
