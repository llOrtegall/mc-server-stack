import { describe, expect, it } from 'bun:test';
import { ServerProperties } from '../../domain/ServerProperties.js';

describe('ServerProperties (unit)', () => {
  describe('Basic Behaviour', () => {
    it('fills defaults when no input is provided', () => {
      const props = ServerProperties.create().toPrimitive();

      expect(props.difficulty).toBe('easy');
      expect(props.gamemode).toBe('survival');
      expect(props.maxPlayers).toBe(20);
      expect(props.pvp).toBe(true);
      expect(props.onlineMode).toBe(true);
      expect(props.whitelist).toEqual([]);
    });

    it('overrides only the provided fields', () => {
      const props = ServerProperties.create({
        difficulty: 'hard',
        maxPlayers: 8,
      }).toPrimitive();

      expect(props.difficulty).toBe('hard');
      expect(props.maxPlayers).toBe(8);
      expect(props.gamemode).toBe('survival');
    });
  });

  describe('Error Scenarios', () => {
    it('rejects an invalid difficulty', () => {
      expect(() =>
        ServerProperties.create({ difficulty: 'extreme' as never }),
      ).toThrow('Invalid difficulty');
    });

    it('rejects a view distance out of range', () => {
      expect(() => ServerProperties.create({ viewDistance: 1 })).toThrow(
        'viewDistance',
      );
    });

    it('rejects a non-positive max players', () => {
      expect(() => ServerProperties.create({ maxPlayers: 0 })).toThrow(
        'maxPlayers',
      );
    });
  });
});
