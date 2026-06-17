import { describe, expect, it } from 'bun:test';
import { ServerEdition } from '../../domain/ServerEdition.js';

describe('ServerEdition (unit)', () => {
  describe('Basic Behaviour', () => {
    it('defaults to java when no edition is given', () => {
      expect(ServerEdition.create().toPrimitive()).toBe('java');
      expect(ServerEdition.create(null).toPrimitive()).toBe('java');
    });

    it('accepts the bedrock edition', () => {
      const edition = ServerEdition.create('bedrock');
      expect(edition.toPrimitive()).toBe('bedrock');
      expect(edition.isBedrock()).toBe(true);
    });

    it('reports java as not bedrock', () => {
      expect(ServerEdition.create('java').isBedrock()).toBe(false);
    });

    it('compares by value', () => {
      expect(
        ServerEdition.create('bedrock').equals(ServerEdition.create('bedrock')),
      ).toBe(true);
      expect(
        ServerEdition.create('bedrock').equals(ServerEdition.create('java')),
      ).toBe(false);
    });
  });

  describe('Error Scenarios', () => {
    it('rejects an unknown edition', () => {
      expect(() => ServerEdition.create('pocket')).toThrow('Invalid edition');
    });
  });
});
