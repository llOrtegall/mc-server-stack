import { describe, expect, it } from 'bun:test';
import * as BackupScheduleMother from '../helpers/BackupScheduleMother.js';

describe('BackupSchedule (unit)', () => {
  describe('isDue', () => {
    it('is due when enabled and never run', () => {
      const schedule = BackupScheduleMother.create({
        enabled: true,
        lastRunAt: null,
      });
      expect(schedule.isDue(Date.parse('2026-01-01T00:00:00Z'))).toBe(true);
    });

    it('is not due when disabled', () => {
      const schedule = BackupScheduleMother.create({
        enabled: false,
        lastRunAt: null,
      });
      expect(schedule.isDue(Date.parse('2026-01-01T00:00:00Z'))).toBe(false);
    });

    it('is due once the frequency interval elapsed', () => {
      const now = Date.parse('2026-01-02T00:00:00Z');
      const lastRunAt = new Date(now - 25 * 60 * 60 * 1000).toISOString();
      const schedule = BackupScheduleMother.create({
        enabled: true,
        frequency: 'daily',
        lastRunAt,
      });
      expect(schedule.isDue(now)).toBe(true);
    });

    it('is not due before the interval elapses', () => {
      const now = Date.parse('2026-01-02T00:00:00Z');
      const lastRunAt = new Date(now - 60 * 60 * 1000).toISOString();
      const schedule = BackupScheduleMother.create({
        enabled: true,
        frequency: 'daily',
        lastRunAt,
      });
      expect(schedule.isDue(now)).toBe(false);
    });
  });

  describe('Error Scenarios', () => {
    it('rejects an out-of-range retention', () => {
      expect(() => BackupScheduleMother.create({ retention: 0 })).toThrow(
        'Retention',
      );
    });
  });
});
