import { io, type Socket } from "socket.io-client";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "http://localhost:3001";

let socket: Socket | null = null;

export function getSocket(token: string): Socket {
  if (!socket || !socket.connected) {
    socket = io(WS_URL, {
      path: "/ws",
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });
  }
  return socket;
}

export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
}
