// cspell: disable
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";

interface SocketContextData {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextData>({} as SocketContextData);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  // O Ref serve para manter o objeto socket vivo sem causar re-renderizações
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // 🛡️ Prevenção de duplicidade: Se já existe um socket ATIVO, não recria.
    // Mas se ele existe e está desconectado (culpa do Strict Mode), deixamos recriar.
    if (socketRef.current && socketRef.current.connected) {
      return;
    }

    // 1. Definição da URL (Forçando IPv4 para evitar problemas de DNS no Node 17+)
    const socketUrl = "http://127.0.0.1:8080";

    console.log("🔌 Inicializando Socket em:", socketUrl);

    // 2. Criação da Instância
    const socketInstance = io(socketUrl, {
      transports: ["websocket", "polling"], // Fallback essencial
      autoConnect: false, // Controle manual
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000, // Timeout generoso para o handshake inicial
    });

    socketRef.current = socketInstance;

    // 3. Listeners
    socketInstance.on("connect", () => {
      console.log("✅ Socket Conectado! ID:", socketInstance.id);
      setIsConnected(true);
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("⚠️ Socket Desconectado:", reason);
      setIsConnected(false);
    });

    socketInstance.on("connect_error", (err) => {
      console.error(`❌ Erro Socket (${err.message}). Detalhes:`, err);
      // Dica: Se der erro de CORS aqui, verifique o backend
    });

    // 4. Salva no estado para a aplicação usar
    setSocket(socketInstance);

    // 5. Conecta de fato
    socketInstance.connect();

    // 6. Cleanup Function (CORRIGIDA)
    return () => {
      if (socketRef.current) {
        console.log("🧹 Limpando conexão socket...");
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
        // CRUCIAL: Zeramos o ref. Isso permite que, se o componente remontar,
        // ele saiba que precisa criar uma nova conexão limpa.
        socketRef.current = null;
      }
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
