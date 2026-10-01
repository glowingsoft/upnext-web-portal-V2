import { io } from 'socket.io-client';

const SOCKET_BASE_URL = import.meta.env.VITE_SOCKET_WSS_URL;

let socket = null;

// Do not force transports: ['websocket'] — that skips socket.io's normal
// polling-handshake-then-upgrade sequence, and this backend only registers the
// connection for broadcast during that initial polling handshake. A
// websocket-only connection reports "connected" client-side but never
// receives events.
export function connectChatSocket({ subjectId, objectId } = {}) {
  if (!subjectId || !SOCKET_BASE_URL) {
    return null;
  }

  if (socket) {
    socket.disconnect();
    socket = null;
  }

  const socketUrl = `${SOCKET_BASE_URL}chat`;
  const query = objectId ? { subjectId, objectId } : { subjectId };

  socket = io(socketUrl, { query });

  return socket;
}

export function disconnectChatSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function getChatSocket() {
  return socket;
}
