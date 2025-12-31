// cspell:disable
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { io, Socket } from "socket.io-client";

interface SocketContextValue {
  socket: Socket | null;
  emit: (event: string, data?: any) => void;
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  emit: () => {},
});

// URL do backend
const socketUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";

// 🔔 função para tocar som
const playNotificationSound = () => {
  const audio = new Audio(
    "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3"
  );
  audio.play().catch(() => {});
};

// 🔔 função para notificar push
const sendBrowserNotification = (data: any) => {
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  new Notification(`Nova mensagem de ${data.contact.name}`, {
    body: data.message.body,
    icon: data.contact.profilePicUrl || "/favicon.ico",
    tag: "new-message",
  });
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Permissão de notificação
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    // 👇 evita múltiplas conexões
    if (!socketRef.current) {
      socketRef.current = io(socketUrl, {
        transports: ["websocket", "polling"],
        withCredentials: true,
      });
    }

    const socket = socketRef.current;

    socket.on("connect", () => console.log("🔌 Socket conectado:", socket.id));
    socket.on("disconnect", () => console.log("❌ Socket desconectado"));

    // Evento do seu app
    socket.on("appMessage", (data: any) => {
      if (data.action === "create" && !data.message.fromMe) {
        playNotificationSound();
        sendBrowserNotification(data);
      }
    });

    return () => {
      socket.off("appMessage");
    };
  }, []);

  // Callback para emitir eventos
  const emit = useCallback((event: string, data?: any) => {
    socketRef.current?.emit(event, data);
  }, []);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, emit }}>
      {children}
    </SocketContext.Provider>
  );
};

// 🔌 Hook para acessar socket
export const useSocket = () => useContext(SocketContext);
