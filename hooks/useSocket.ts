// FIX FE-7 — This file previously contained a duplicate socket implementation
// with a hardcoded private IP and no JWT auth token in the handshake.
// Socket management is now handled entirely by services/socket.ts.
// This file is kept as a re-export for any legacy imports.
export { disconnectSocket, getSocket, initSocket } from "../services/socket";
