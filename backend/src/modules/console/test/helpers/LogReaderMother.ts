import { mock } from 'bun:test';
import type { LogReader } from '../../domain/LogReader.js';

export function create(overrides: Partial<LogReader> = {}): LogReader {
  return {
    getTail: mock(async () => 'log line'),
    ...overrides,
  };
}
