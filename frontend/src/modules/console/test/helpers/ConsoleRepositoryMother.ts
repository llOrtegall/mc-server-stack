import type { ConsoleRepository } from '../../domain/ConsoleRepository.js';

export function create(
  overrides: Partial<ConsoleRepository> = {},
): ConsoleRepository {
  return {
    getLogs: vi.fn(async () => 'log output'),
    sendCommand: vi.fn(async () => 'command response'),
    openStream: vi.fn(() => ({ close: vi.fn() })),
    ...overrides,
  };
}
