import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
// In a real app, you would use: import { UserAgent, Registerer, Inviter, SessionState } from "sip.js";

const API_URL = process.env.VITE_API_URL;

export interface CallLog {
  id: string;
  number: string;
  type: "incoming" | "outgoing" | "missed";
  date: Date;
  duration?: number;
  name?: string;
}

interface SipContextData {
  connect: () => Promise<void>;
  disconnect: () => void;
  makeCall: (number: string) => void;
  hangup: () => void;
  answer: () => void;
  mute: () => void;
  sendDtmf: (tone: string) => void;
  connectionStatus:
    | "Connected"
    | "Disconnected"
    | "Connecting"
    | "Error"
    | "Registered";
  callStatus: "Idle" | "Calling" | "Ringing" | "InCall" | "Holding";
  currentNumber: string;
  callDuration: number;
  recentCalls: CallLog[];
  addCallLog: (log: CallLog) => void;
}

const SipContext = createContext<SipContextData>({} as SipContextData);

export const SipProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // State for UI Simulation
  const [connectionStatus, setConnectionStatus] = useState<any>("Disconnected");
  const [callStatus, setCallStatus] = useState<any>("Idle");
  const [currentNumber, setCurrentNumber] = useState("");
  const [callDuration, setCallDuration] = useState(0);
  const [recentCalls, setRecentCalls] = useState<CallLog[]>([
    {
      id: "1",
      number: "5511999887766",
      type: "incoming",
      date: new Date(Date.now() - 1000 * 60 * 30),
      duration: 120,
      name: "João Silva",
    },
    {
      id: "2",
      number: "5511988776655",
      type: "missed",
      date: new Date(Date.now() - 1000 * 60 * 60 * 2),
      name: "Maria Souza",
    },
    {
      id: "3",
      number: "5511977665544",
      type: "outgoing",
      date: new Date(Date.now() - 1000 * 60 * 60 * 24),
      duration: 45,
      name: "Suporte Técnico",
    },
  ]);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load settings and auto-connect
  useEffect(() => {
    checkSipCredentials();
  }, []);

  const checkSipCredentials = async () => {
    try {
      const res = await fetch(`${API_URL}/api/sip/settings`, {
        headers: { Authorization: "Bearer token" },
      });
      const settings = await res.json();
      if (settings.sipServer && settings.username) {
        connect(); // Auto connect if credentials exist
      }
    } catch (e) {
      console.log("No SIP credentials found");
    }
  };

  const startTimer = () => {
    setCallDuration(0);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  };

  const addCallLog = (log: CallLog) => {
    setRecentCalls((prev) => [log, ...prev]);
  };

  const connect = async () => {
    setConnectionStatus("Connecting");

    // MOCK: Simulation of SIP Registration to Asterisk
    setTimeout(() => {
      setConnectionStatus("Registered"); // or Connected
      console.log("SIP Registered (Mock)");
    }, 1500);
  };

  const disconnect = () => {
    setConnectionStatus("Disconnected");
  };

  const makeCall = async (number: string) => {
    if (connectionStatus !== "Registered" && connectionStatus !== "Connected") {
      alert(
        "Erro: Softphone não registrado. Verifique as credenciais em Integrações."
      );
      return;
    }

    setCurrentNumber(number);
    setCallStatus("Calling");

    // Add to logs immediately as outgoing
    addCallLog({
      id: Date.now().toString(),
      number,
      type: "outgoing",
      date: new Date(),
      name: "Desconhecido", // Em produção buscaria do DB
    });

    // Request Mic Permission (Real browser API)
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (e) {
      console.warn("Mic permission denied");
    }

    // MOCK: Simulate Network Delay and Answer
    setTimeout(() => {
      setCallStatus("InCall");
      startTimer();
    }, 2000);
  };

  const hangup = () => {
    setCallStatus("Idle");
    stopTimer();
    setCallDuration(0);
  };

  const answer = () => {
    setCallStatus("InCall");
    startTimer();
  };

  const mute = () => {
    console.log("Muted");
  };

  const sendDtmf = (tone: string) => {
    console.log(`DTMF Sent: ${tone}`);
  };

  return (
    <SipContext.Provider
      value={{
        connect,
        disconnect,
        makeCall,
        hangup,
        answer,
        mute,
        sendDtmf,
        connectionStatus,
        callStatus,
        currentNumber,
        callDuration,
        recentCalls,
        addCallLog,
      }}
    >
      {children}
    </SipContext.Provider>
  );
};

export const useSip = () => useContext(SipContext);
