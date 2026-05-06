import { mock } from 'bun:test';
import type { ServerActivityTracker } from '../../domain/ServerActivityTracker.js';

export function create(
  overrides: Partial<ServerActivityTracker> = {},
): ServerActivityTracker {
  return {
    reset: mock(() => {}),
    ...overrides,
  };
}
