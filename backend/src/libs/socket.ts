
import { Server as SocketIo } from "socket.io";
import { Server as HttpServer } from "http";

let io: SocketIo;

export const initIO = (httpServer: HttpServer): SocketIo => {
  io = new SocketIo(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE"]
    }
  });

  io.on("connection", (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);
    
    socket.on("joinChatBox", (ticketId: string) => {
      console.log(`[Socket] Joined Ticket: ${ticketId}`);
      socket.join(ticketId);
    });

    socket.on("disconnect", () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = (): SocketIo => {
  if (!io) {
    throw new Error("Socket IO not initialized");
  }
  return io;
};
