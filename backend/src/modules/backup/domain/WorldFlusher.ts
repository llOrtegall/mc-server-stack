/**
 * Flushes a running server's world to disk for a consistent backup. No-op when
 * the server is not running. Implemented in infrastructure (RCON save-* commands).
 */
export interface WorldFlusher {
  /** Disables auto-save and flushes pending writes (`save-off`, `save-all flush`). */
  flush: (serverId: string) => Promise<void>;
  /** Re-enables auto-save (`save-on`). Safe to call even if flush was a no-op. */
  resume: (serverId: string) => Promise<void>;
}
