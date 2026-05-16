/** Handle to a live console stream; call close() to disconnect. */
export interface ConsoleStream {
  close: () => void;
}

export interface ConsoleRepository {
  getLogs: (serverId: string, tail: number) => Promise<string>;
  sendCommand: (serverId: string, command: string) => Promise<string>;
  /** Opens a live log stream, invoking onMessage with each text chunk. */
  openStream: (
    serverId: string,
    onMessage: (text: string) => void,
  ) => ConsoleStream;
}
