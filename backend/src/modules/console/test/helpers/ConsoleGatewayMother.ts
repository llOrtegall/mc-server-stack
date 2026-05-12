import { mock } from 'bun:test';
import type { ConsoleGateway } from '../../domain/ConsoleGateway.js';

export function create(
  overrides: Partial<ConsoleGateway> = {},
): ConsoleGateway {
  return {
    sendCommand: mock(async () => 'ok'),
    ...overrides,
  };
}
