import { apiFetch } from '../../../api/client.js';
import type {
  ConsoleRepository,
  ConsoleStream,
} from '../domain/ConsoleRepository.js';

const TOKEN_KEY = 'token';

/**
 * Same-origin WebSocket URL. In production nginx proxies /ws -> backend:3000.
 * NOTE: the Vite dev proxy only forwards /api, not /ws, so the live stream does
 * not work through `vite dev` — only the GET /logs seed does.
 */
function streamUrl(serverId: string): string {
  const token = localStorage.getItem(TOKEN_KEY) ?? '';
  const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
  return `${proto}://${window.location.host}/ws/servers/${serverId}?token=${encodeURIComponent(token)}`;
}

export class HttpConsoleRepository implements ConsoleRepository {
  async getLogs(serverId: string, tail: number): Promise<string> {
    const data = await apiFetch<{ logs: string }>(
      `/api/servers/${serverId}/console/logs?tail=${tail}`,
    );
    return data.logs;
  }

  async sendCommand(serverId: string, command: string): Promise<string> {
    const data = await apiFetch<{ response: string }>(
      `/api/servers/${serverId}/console/command`,
      { method: 'POST', body: JSON.stringify({ command }) },
    );
    return data.response;
  }

  openStream(
    serverId: string,
    onMessage: (text: string) => void,
  ): ConsoleStream {
    const socket = new WebSocket(streamUrl(serverId));
    socket.onmessage = (event) => {
      if (typeof event.data === 'string') onMessage(event.data);
    };
    return { close: () => socket.close() };
  }
}
