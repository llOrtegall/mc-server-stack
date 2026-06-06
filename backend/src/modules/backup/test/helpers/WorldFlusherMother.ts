import { mock } from 'bun:test';
import type { WorldFlusher } from '../../domain/WorldFlusher.js';

export function create(overrides: Partial<WorldFlusher> = {}): WorldFlusher {
  return {
    flush: mock(async () => {}),
    resume: mock(async () => {}),
    ...overrides,
  };
}
