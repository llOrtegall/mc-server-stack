import { resetCounter } from '../../../watchdog/watchdog.service.js';
import type { ServerActivityTracker } from '../domain/ServerActivityTracker.js';

export class WatchdogServerActivityTracker implements ServerActivityTracker {
  reset(serverId: string): void {
    resetCounter(serverId);
  }
}
