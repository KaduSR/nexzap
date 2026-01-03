// cspell: disable
import { Server as HttpServer } from "http";
import { Server as SocketIo } from "socket.io";

let ioInstance: SocketIo | null = null; // Renomeado para evitar confusão

export const initIO = (httpServer: HttpServer): SocketIo => {
  if (ioInstance) {
    console.warn(
      "⚠️ [Socket] initIO chamado novamente, mas já está inicializado. Retornando instância existente."
    );
    return ioInstance;
  }

  console.log("🔌 Inicializando Socket.IO...");

  ioInstance = new SocketIo(httpServer, {
    cors: {
      origin: [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        process.env.FRONTEND_URL,
      ].filter((origin) => !!origin) as string[],
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE"],
    },
    transports: ["websocket", "polling"],
  });

  ioInstance.on("connection", (socket) => {
    console.log(`⚡ [Socket] Client connected: ${socket.id}`);
    socket.on("joinChatBox", (ticketId: string) => {
      console.log(`🎫 [Socket] Joined Ticket: ${ticketId}`);
      socket.join(ticketId);
    });
    socket.on("disconnect", (reason) => {
      console.log(
        `❌ [Socket] Client disconnected: ${socket.id} | Reason: ${reason}`
      );
    });
  });

  console.log("✅ Socket.IO inicializado e aguardando conexões");
  return ioInstance;
};

export const getIO = (): SocketIo => {
  if (!ioInstance) {
    throw new Error("Socket IO not initialized");
  }
  return ioInstance;
};
