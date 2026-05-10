/**
 * Reads a snapshot of a container's most recent logs. The live WebSocket stream
 * is separate infrastructure plumbing, not a use case.
 */
export interface LogReader {
  getTail: (containerId: string, tail: number) => Promise<string>;
}
