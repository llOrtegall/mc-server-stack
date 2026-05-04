/**
 * Tracks per-server inactivity used by the auto-stop watchdog. Use cases that
 * take a server out of the running state must reset its counter so the in-memory
 * watchdog state stays consistent. Implemented in infrastructure.
 */
export interface ServerActivityTracker {
  reset: (serverId: string) => void;
}
