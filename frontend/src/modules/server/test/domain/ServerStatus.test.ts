import { ServerStatus } from '../../domain/ServerStatus.js';

describe('ServerStatus (unit)', () => {
  describe('Basic Behaviour', () => {
    it('treats only "running" as running', () => {
      expect(ServerStatus.create('running').isRunning()).toBe(true);
      expect(ServerStatus.create('stopped').isRunning()).toBe(false);
    });

    it('treats provisioning, starting and stopping as transitioning', () => {
      expect(ServerStatus.create('provisioning').isTransitioning()).toBe(true);
      expect(ServerStatus.create('starting').isTransitioning()).toBe(true);
      expect(ServerStatus.create('stopping').isTransitioning()).toBe(true);
      expect(ServerStatus.create('running').isTransitioning()).toBe(false);
    });

    it('flags only provisioning as provisioning', () => {
      expect(ServerStatus.create('provisioning').isProvisioning()).toBe(true);
      expect(ServerStatus.create('stopped').isProvisioning()).toBe(false);
    });

    it('allows start only from stopped or error', () => {
      expect(ServerStatus.create('stopped').canStart()).toBe(true);
      expect(ServerStatus.create('error').canStart()).toBe(true);
      expect(ServerStatus.create('running').canStart()).toBe(false);
      expect(ServerStatus.create('provisioning').canStart()).toBe(false);
    });

    it('allows stop/restart only while running', () => {
      expect(ServerStatus.create('running').canStopOrRestart()).toBe(true);
      expect(ServerStatus.create('stopped').canStopOrRestart()).toBe(false);
    });
  });

  describe('Error Scenarios', () => {
    it('rejects an unknown status', () => {
      expect(() => ServerStatus.fromPrimitive('frozen')).toThrow(
        'Invalid server status',
      );
    });
  });
});
