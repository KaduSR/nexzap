// cspell: disable
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRightLeft,
  Calendar,
  Check,
  CheckCheck,
  Clock,
  Copy,
  Database,
  FileText,
  Filter,
  Loader2,
  Lock,
  LockOpen,
  MessageSquare,
  Mic,
  MoreVertical,
  Phone,
  RefreshCw,
  Search,
  Send,
  Smile,
  Sparkles,
  Tag,
  Unlock,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import AudioPlayer from "../components/AudioPlayer";
import ServicePriceList from "../components/ServicePriceList";
import TicketAiPanel from "../components/TicketAiPanel";
import TransferTicketModal from "../components/TransferTicketModal"; // Import
import { useSip } from "../context/SipContext";

const API_URL = import.meta.env.VITE_API_URL;

// --- Types ---
interface Ticket {
  id: string;
  name: string;
  lastMsg: string;
  time: string;
  unread: number;
  status: string;
  ixcCustomer: boolean;
  address: string;
  profilePicUrl?: string;
  messages?: Message[];
  number?: string;
}

interface Message {
  id: string;
  fromMe: boolean;
  text?: string;
  mediaUrl?: string;
  mediaType?: "image" | "audio" | "video" | "pdf" | "chat";
  time: string;
  isPrivate?: boolean;
}

// --- DUMMY DATA ---
const DUMMY_TICKETS: Ticket[] = [
  {
    id: "1",
    name: "João Silva",
    lastMsg: "Segue o comprovante...",
    time: "10:45",
    unread: 2,
    status: "open",
    ixcCustomer: true,
    address: "Rua das Flores, 123",
    number: "5511999887766",
  },
  {
    id: "2",
    name: "Maria Souza",
    lastMsg: "Obrigado!",
    time: "Ontem",
    unread: 0,
    status: "pending",
    ixcCustomer: false,
    address: "Av. Paulista, 1000",
    number: "5511988776655",
  },
  {
    id: "3",
    name: "Empresa Alpha",
    lastMsg: "Atendimento finalizado com sucesso.",
    time: "12/10",
    unread: 0,
    status: "closed",
    ixcCustomer: true,
    address: "Rua Empresarial, 500",
    number: "5511977665544",
  },
];

const INITIAL_MESSAGES: Message[] = [
  { id: "m1", fromMe: false, text: "Olá, como posso ajudar?", time: "10:40" },
  {
    id: "m2",
    fromMe: true,
    text: "Gostaria de ver minha fatura de internet.",
    time: "10:42",
  },
  {
    id: "m3",
    fromMe: false,
    text: "Claro! Aqui está o áudio explicando como acessar o portal:",
    time: "10:44",
  },
  {
    id: "m4",
    fromMe: false,
    mediaType: "audio",
    mediaUrl: "https://wavesurfer.xyz/wavesurfer-code/examples/audio/audio.wav",
    time: "10:44",
  },
  {
    id: "m5",
    fromMe: true,
    text: "Nota Interna: Cliente reclama de lentidão recorrente. Verificar sinal.",
    time: "10:46",
    isPrivate: true,
  },
];

// --- COMPONENTS ---

const Tickets: React.FC = () => {
  const { makeCall } = useSip(); // Hook SIP
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [currentMessages, setCurrentMessages] =
    useState<Message[]>(INITIAL_MESSAGES);
  const [message, setMessage] = useState("");
  const [isPrivateMode, setIsPrivateMode] = useState(false); // Internal Note Mode
  const [showIxcPanel, setShowIxcPanel] = useState(false);
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [showServicesModal, setShowServicesModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false); // Transfer Modal State
  const [copiedId, setCopiedId] = useState(false);
  const [copiedPix, setCopiedPix] = useState<string | null>(null);
  const [isResolving, setIsResolving] = useState(false);

  // Schedule Modal State
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [isScheduling, setIsScheduling] = useState(false);

  // OS Modal State
  const [showOsModal, setShowOsModal] = useState(false);
  const [isCreatingOs, setIsCreatingOs] = useState(false);
  const [osData, setOsData] = useState({
    subject: "1",
    department: "101",
    description: "",
  });

  // Responsive State
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  // Status Filter State
  const [statusFilter, setStatusFilter] = useState<
    "open" | "pending" | "closed"
  >("open");

  // IXC States
  const [ixcInvoices, setIxcInvoices] = useState<any[]>([]);
  const [loadingIxc, setLoadingIxc] = useState(false);
  const [unlockStatus, setUnlockStatus] = useState<
    "idle" | "loading" | "success"
  >("idle");

  // AI Settings State
  const [autoTranscribeAudio, setAutoTranscribeAudio] = useState(false);

  // Set initial ticket for non-mobile
  useEffect(() => {
    if (window.innerWidth >= 1024) {
      setSelectedTicket(DUMMY_TICKETS[0]);
    }
  }, []);

  // Fetch AI settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${API_URL}/api/settings`, {
          headers: { Authorization: "Bearer token" },
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            const setting = data.find(
              (s: any) => s.key === "ai_auto_transcribe_audio"
            );
            if (setting && setting.value === "true") {
              setAutoTranscribeAudio(true);
            }
          }
        }
      } catch (error) {
        console.debug("Backend settings unavailable, using defaults.");
      }
    };
    fetchSettings();
  }, []);

  // Responsive listener
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Load IXC Data
  useEffect(() => {
    if (selectedTicket?.ixcCustomer && showIxcPanel) {
      fetchIxcData();
    }
  }, [selectedTicket, showIxcPanel]);

  const fetchIxcData = async () => {
    setLoadingIxc(true);
    try {
      await new Promise((r) => setTimeout(r, 1000)); // Delay

      setIxcInvoices([
        {
          id: 101,
          vencimento: "10/11/2024",
          valor: "99,90",
          status: "Aberto",
          link: "#",
          pix: "00020126580014br.gov.bcb.pix0136123e4567-e89b-12d3-a456-426614174000520400005303986540599.905802BR5913Internet Provider6008Sao Paulo",
        },
        {
          id: 102,
          vencimento: "10/10/2024",
          valor: "99,90",
          status: "Pago",
          link: "#",
          pix: "",
        },
      ]);
    } catch (error) {
      console.error("Failed to load IXC data");
    } finally {
      setLoadingIxc(false);
    }
  };

  const handleUnlock = async () => {
    if (!confirm("Confirmar desbloqueio de confiança para este cliente?"))
      return;
    setUnlockStatus("loading");
    setTimeout(() => {
      setUnlockStatus("success");
      alert(
        "Desbloqueio realizado com sucesso! O cliente deve reiniciar o equipamento."
      );
      setTimeout(() => setUnlockStatus("idle"), 3000);
    }, 2000);
  };

  const handleCopyPix = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedPix(code);
    setTimeout(() => setCopiedPix(null), 2000);
  };

  const handleResolveTicket = async () => {
    if (!selectedTicket) return;
    if (!confirm("Tem certeza que deseja finalizar este atendimento?")) return;

    setIsResolving(true);
    try {
      // Call backend to update status to 'closed' which triggers NPS
      await fetch(`${API_URL}/api/tickets/${selectedTicket.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer token",
        },
        body: JSON.stringify({ status: "closed" }),
      });

      // Local Update
      alert("Ticket finalizado! Pesquisa de satisfação enviada.");
      setSelectedTicket(null);
    } catch (error) {
      alert("Erro ao finalizar ticket.");
    } finally {
      setIsResolving(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedTicket) return;

    // Mock sending message to UI instantly
    const newMessage: Message = {
      id: `temp_${Date.now()}`,
      fromMe: true,
      text: message,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isPrivate: isPrivateMode,
    };
    setCurrentMessages([...currentMessages, newMessage]);
    setMessage("");
    setIsPrivateMode(false); // Reset mode after send

    // In real app, call API here: POST /messages/:ticketId { body: message, isPrivate: isPrivateMode }
  };

  const handleScheduleMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !message.trim() || !scheduleDate || !scheduleTime)
      return;

    setIsScheduling(true);
    try {
      const sendAt = `${scheduleDate}T${scheduleTime}:00.000Z`; // Simple ISO format construction

      const response = await fetch(
        `${API_URL}/api/tickets/${selectedTicket.id}/schedules`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer token",
          },
          body: JSON.stringify({
            body: message,
            sendAt: sendAt,
          }),
        }
      );

      if (response.ok) {
        alert("Mensagem agendada com sucesso!");
        setIsScheduleModalOpen(false);
        setMessage("");
        setScheduleDate("");
        setScheduleTime("");
      } else {
        alert("Erro ao agendar.");
      }
    } catch (error) {
      console.error(error);
      alert("Erro de conexão.");
    } finally {
      setIsScheduling(false);
    }
  };

  const handleCreateOS = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingOs(true);
    try {
      const res = await fetch(`${API_URL}/api/ixc/os`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer token",
        },
        body: JSON.stringify({
          subjectId: osData.subject,
          departmentId: osData.department,
          priority: "M",
          description: osData.description,
          contractId: "123", // Mock
          address: selectedTicket?.address,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        alert(`O.S. Criada com sucesso! Protocolo: ${data.id_oss}`);
        setShowOsModal(false);
        setOsData({ subject: "1", department: "101", description: "" });
      } else {
        alert("Erro ao criar O.S.");
      }
    } catch (e) {
      alert("Erro de conexão.");
    } finally {
      setIsCreatingOs(false);
    }
  };

  const filteredTickets = DUMMY_TICKETS.filter(
    (t) => t.status === statusFilter
  );

  return (
    <div className="w-full flex flex-1 h-screen overflow-hidden bg-slate-50 dark:bg-slate-900 animate-in fade-in duration-500">
      {/* Sidebar List */}
      <div
        className={`
        ${isMobile && selectedTicket ? "hidden" : "flex"}
        flex-1 lg:w-95 border-r border-slate-200 dark:border-slate-800 flex-col bg-white dark:bg-slate-900 shrink-0
      `}
      >
        {/* Sidebar Header */}
        <div className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black tracking-tight text-slate-800 dark:text-white">
              Atendimento
            </h2>
            <div className="flex gap-2">
              <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-500">
                <Filter size={20} />
              </button>
            </div>
          </div>

          <div className="relative group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors"
              size={18}
            />
            <input
              type="text"
              placeholder="Buscar conversas, protocolos..."
              className="w-full pl-12 pr-4 py-3 bg-slate-100 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl text-sm font-medium outline-none transition-all"
            />
          </div>

          <div className="flex gap-1 p-1.5 bg-slate-100 dark:bg-slate-800/50 rounded-2xl">
            {["open", "pending", "closed"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status as any)}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all capitalize ${
                  statusFilter === status
                    ? "bg-white dark:bg-slate-700 text-indigo-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-white"
                }`}
              >
                {status === "open"
                  ? "Abertos"
                  : status === "pending"
                  ? "Fila"
                  : "Resolvidos"}
              </button>
            ))}
          </div>
        </div>

        {/* Chats List */}
        <div className="w-full overflow-y-auto custom-scrollbar px-3 pb-3 space-y-1">
          {filteredTickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center opacity-50 p-8">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <MessageSquare size={24} className="text-slate-400" />
              </div>
              <p className="text-sm font-bold text-slate-600 dark:text-slate-400">
                Nenhum ticket encontrado.
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Aguardando novos contatos.
              </p>
            </div>
          ) : (
            filteredTickets.map((ticket) => (
              <div
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket)}
                className={`p-4 flex gap-4 cursor-pointer transition-all rounded-2xl group ${
                  selectedTicket?.id === ticket.id
                    ? "bg-indigo-600 shadow-lg shadow-indigo-500/20"
                    : "hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <div className="relative shrink-0">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center overflow-hidden border-2 ${
                      selectedTicket?.id === ticket.id
                        ? "border-white/20"
                        : "border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    <img
                      src={`https://picsum.photos/seed/${ticket.id}/100/100`}
                      alt={ticket.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {ticket.ixcCustomer && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-sm">
                      <Database size={10} className="text-white" />
                    </div>
                  )}
                </div>
                <div className="w-full min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3
                      className={`font-bold text-sm truncate ${
                        selectedTicket?.id === ticket.id
                          ? "text-white"
                          : "text-slate-800 dark:text-white"
                      }`}
                    >
                      {ticket.name}
                    </h3>
                    <span
                      className={`text-[10px] font-bold whitespace-nowrap ml-2 ${
                        selectedTicket?.id === ticket.id
                          ? "text-indigo-200"
                          : "text-slate-400"
                      }`}
                    >
                      {ticket.time}
                    </span>
                  </div>
                  <p
                    className={`text-xs truncate leading-relaxed ${
                      selectedTicket?.id === ticket.id
                        ? "text-indigo-100"
                        : "text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {ticket.lastMsg}
                  </p>
                </div>
                {ticket.unread > 0 && (
                  <div
                    className={`text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-full self-center shadow-sm ${
                      selectedTicket?.id === ticket.id
                        ? "bg-white text-indigo-600"
                        : "bg-indigo-600 text-white"
                    }`}
                  >
                    {ticket.unread}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Panel (Chat or Empty) */}
      <div
        className={`
        w-full flex-col bg-slate-50 dark:bg-slate-900
        ${isMobile && !selectedTicket ? "hidden" : "flex"}
      `}
      >
        {selectedTicket ? (
          <>
            {/* Chat Header */}
            <header className="w-full px-6 py-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 flex items-center justify-between z-20 sticky top-0">
              <div className="w-fullflex items-center gap-4">
                {isMobile && (
                  <button
                    onClick={() => setSelectedTicket(null)}
                    className="p-2 -ml-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <ArrowLeft size={20} />
                  </button>
                )}
                <div className="w-11 h-11 rounded-2xl bg-indigo-100 dark:bg-slate-800 overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700">
                  <img
                    src={`https://picsum.photos/seed/${selectedTicket.id}/100/100`}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h2 className="font-bold text-base text-slate-800 dark:text-white leading-tight">
                    {selectedTicket.name}
                  </h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-md">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                      Online
                    </span>
                    {selectedTicket.ixcCustomer && (
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-md">
                        Assinante
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Services Button */}
                <button
                  onClick={() => setShowServicesModal(true)}
                  className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                  title="Tabela de Serviços"
                >
                  <Tag size={20} />
                </button>

                {/* TRANSFER BUTTON (NEW) */}
                <button
                  onClick={() => setShowTransferModal(true)}
                  className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                  title="Transferir Ticket"
                >
                  <ArrowRightLeft size={20} />
                </button>

                {/* CLICK TO CALL BUTTON */}
                {selectedTicket.number && (
                  <button
                    onClick={() => makeCall(selectedTicket.number || "")}
                    className="p-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                    title="Ligar (VoIP)"
                  >
                    <Phone size={18} fill="currentColor" />
                  </button>
                )}

                <button
                  onClick={() => {
                    setShowAiPanel(!showAiPanel);
                    setShowIxcPanel(false); // Close other panel
                  }}
                  className={`hidden md:flex items-center gap-2 px-3 py-2 rounded-xl transition-all text-xs font-bold ${
                    showAiPanel
                      ? "bg-violet-600 text-white shadow-lg shadow-violet-500/30"
                      : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                  }`}
                  title="Copiloto IA"
                >
                  <Sparkles size={16} />
                  <span className="hidden lg:inline">Copiloto</span>
                </button>

                <button
                  onClick={() => {
                    setShowIxcPanel(!showIxcPanel);
                    setShowAiPanel(false); // Close other panel
                  }}
                  className={`hidden md:flex items-center gap-2 px-3 py-2 rounded-xl transition-all text-xs font-bold ${
                    showIxcPanel
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                      : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                  }`}
                >
                  <Database size={16} />
                  <span className="hidden lg:inline">Dados ERP</span>
                </button>

                <button
                  onClick={handleResolveTicket}
                  disabled={isResolving}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                >
                  {isResolving ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <CheckCheck size={16} />
                  )}
                  <span className="hidden sm:inline">Resolver</span>
                </button>

                <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                  <MoreVertical size={20} />
                </button>
              </div>
            </header>

            {/* Messages Area - Removed the Doodle BG */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 custom-scrollbar bg-slate-50 dark:bg-slate-950 w-full">
              <div className="flex justify-center my-4">
                <span className="text-[10px] font-bold px-4 py-1.5 bg-slate-200 dark:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 uppercase tracking-widest shadow-sm border border-slate-300 dark:border-slate-700">
                  Hoje
                </span>
              </div>

              {currentMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.fromMe ? "justify-end" : "justify-start"
                  } group animate-in slide-in-from-bottom-2 duration-300`}
                >
                  {/* Avatar for receiver */}
                  {!msg.fromMe && !msg.isPrivate && (
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 mr-2 mt-auto overflow-hidden hidden sm:block">
                      <img
                        src={`https://picsum.photos/seed/${selectedTicket.id}/100/100`}
                        className="w-full h-full"
                        alt=""
                      />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] md:max-w-[65%] relative ${
                      msg.fromMe ? "order-2" : ""
                    }`}
                  >
                    {msg.isPrivate && (
                      <div className="flex items-center gap-1 text-[10px] text-amber-500 font-bold mb-1 justify-end">
                        <Lock size={10} /> Nota Interna (Invisível para o
                        cliente)
                      </div>
                    )}
                    <div
                      className={`p-4 rounded-3xl shadow-sm relative text-sm ${
                        msg.isPrivate
                          ? "bg-amber-100 dark:bg-amber-900/30 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-700/50 rounded-br-none"
                          : msg.fromMe
                          ? "bg-linear-to-br from-indigo-600 to-blue-600 text-white rounded-br-none shadow-indigo-500/20"
                          : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-bl-none border border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      {msg.mediaType === "audio" ? (
                        <div className="py-1">
                          <AudioPlayer
                            src={msg.mediaUrl || ""}
                            autoTranscribe={autoTranscribeAudio}
                          />
                        </div>
                      ) : (
                        <p className="leading-relaxed whitespace-pre-wrap">
                          {msg.text}
                        </p>
                      )}
                    </div>

                    <div
                      className={`flex items-center gap-1 mt-1 px-1 ${
                        msg.fromMe ? "justify-end" : "justify-start"
                      }`}
                    >
                      <span className="text-[10px] font-bold text-slate-400">
                        {msg.time}
                      </span>
                      {msg.fromMe && !msg.isPrivate && (
                        <CheckCheck size={12} className="text-indigo-500" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Input Footer */}
            <footer
              className={`p-4 md:p-6 bg-slate-50 dark:bg-slate-950 z-20 ${
                isPrivateMode ? "border-t-2 border-amber-400" : ""
              }`}
            >
              <div
                className={`
                  bg-white dark:bg-slate-900 rounded-3xl p-2 flex items-end gap-2 shadow-xl shadow-slate-200/50 dark:shadow-black/20 border transition-all focus-within:ring-2 
                  ${
                    isPrivateMode
                      ? "border-amber-400 dark:border-amber-600 ring-amber-200 bg-amber-50 dark:bg-amber-900/10"
                      : "border-slate-200 dark:border-slate-800 focus-within:ring-indigo-500/20 focus-within:border-indigo-500"
                  }
              `}
              >
                <button
                  onClick={() => setIsPrivateMode(!isPrivateMode)}
                  className={`p-3 rounded-xl transition-colors ${
                    isPrivateMode
                      ? "bg-amber-100 text-amber-600"
                      : "text-slate-400 hover:text-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                  title="Nota Interna (Privado)"
                >
                  {isPrivateMode ? <Lock size={20} /> : <Unlock size={20} />}
                </button>

                <button
                  onClick={() => setShowOsModal(true)}
                  className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors hidden sm:block"
                  title="Abrir O.S."
                >
                  <Wrench size={20} />
                </button>

                <div className="flex-1 py-3 max-h-32 overflow-y-auto custom-scrollbar">
                  <textarea
                    placeholder={
                      isPrivateMode
                        ? "Escrever nota interna (cliente não verá)..."
                        : "Digite sua mensagem..."
                    }
                    className={`w-full bg-transparent border-none outline-none text-sm font-medium resize-none placeholder-slate-400 h-6 max-h-24 ${
                      isPrivateMode
                        ? "text-amber-800 dark:text-amber-200 placeholder-amber-400/70"
                        : "text-slate-800 dark:text-slate-200"
                    }`}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    rows={1}
                    style={{ minHeight: "24px" }}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = "auto";
                      target.style.height = `${Math.min(
                        target.scrollHeight,
                        120
                      )}px`;
                    }}
                  />
                </div>

                <div className="flex gap-1 pb-1">
                  {!message.trim() && (
                    <>
                      <button
                        onClick={() => setIsScheduleModalOpen(true)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                        title="Agendar Mensagem"
                      >
                        <Clock size={20} />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors">
                        <Smile size={20} />
                      </button>
                    </>
                  )}
                  {message.trim() ? (
                    <button
                      onClick={handleSendMessage}
                      className={`p-2.5 text-white rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95 ${
                        isPrivateMode
                          ? "bg-amber-500 shadow-amber-500/30"
                          : "bg-indigo-600 shadow-indigo-500/30"
                      }`}
                    >
                      <Send size={18} fill="currentColor" />
                    </button>
                  ) : (
                    <button className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 rounded-xl transition-all">
                      <Mic size={20} />
                    </button>
                  )}
                </div>
              </div>
              {isPrivateMode && (
                <div className="text-center mt-2 text-[10px] font-bold text-amber-500 flex items-center justify-center gap-1 animate-pulse">
                  <AlertTriangle size={10} /> MODO PRIVADO ATIVO: O cliente NÃO
                  receberá esta mensagem.
                </div>
              )}
            </footer>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 space-y-6 animate-in zoom-in-95 duration-500">
            <div className="w-32 h-32 bg-linear-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/10 dark:to-blue-900/10 rounded-4xl flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-2xl rotate-3">
              <MessageSquare size={48} className="text-indigo-300" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200">
                Nenhuma conversa selecionada
              </h3>
              <p className="text-sm font-medium text-slate-500 max-w-xs mx-auto">
                Selecione um ticket na lista lateral para iniciar o atendimento.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* SCHEDULE MODAL */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-4xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900">
              <h3 className="font-black text-lg flex items-center gap-2">
                <Clock className="text-indigo-600" size={20} /> Agendar Mensagem
              </h3>
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl text-slate-400"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleScheduleMessage} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">
                  Mensagem
                </label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Digite o conteúdo da mensagem..."
                  className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 text-sm resize-none"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    Data
                  </label>
                  <input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 font-bold text-sm"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    Hora
                  </label>
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 font-bold text-sm"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isScheduling}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
              >
                {isScheduling ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Calendar size={18} />
                )}
                Confirmar Agendamento
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SERVICE PRICE LIST MODAL (NEW) */}
      {showServicesModal && (
        <ServicePriceList onClose={() => setShowServicesModal(false)} />
      )}

      {/* TRANSFER TICKET MODAL (NEW) */}
      {showTransferModal && selectedTicket && (
        <TransferTicketModal
          ticketId={selectedTicket.id}
          onClose={() => setShowTransferModal(false)}
          onSuccess={() => {
            alert("Ticket transferido com sucesso!");
            setSelectedTicket(null); // Go back to list
          }}
        />
      )}

      {/* IXC Panel - Slide Over */}
      {showIxcPanel && selectedTicket && (
        <>
          {isMobile && (
            <div
              onClick={() => setShowIxcPanel(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-30 animate-in fade-in lg:hidden"
            ></div>
          )}
          <div
            className={`
          ${isMobile ? "fixed inset-y-0 right-0 z-40" : "relative shrink-0"}
          w-96 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 overflow-y-auto 
          custom-scrollbar flex flex-col animate-in slide-in-from-right-full lg:slide-in-from-right-0 duration-300 shadow-2xl
        `}
          >
            {/* Header */}
            <div className="p-6 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 shrink-0">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-widest">
                  <Database size={14} /> Integração ERP
                </div>
                <button
                  onClick={() => setShowIxcPanel(false)}
                  className="lg:hidden p-1 bg-slate-200 dark:bg-slate-800 rounded-lg text-slate-500"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-2xl bg-white dark:bg-slate-800 p-1 shadow-lg mb-3">
                  <img
                    src={`https://picsum.photos/seed/${selectedTicket.id}/100/100`}
                    className="w-full h-full rounded-xl object-cover"
                    alt=""
                  />
                </div>
                <h3 className="font-black text-xl leading-tight text-slate-800 dark:text-white">
                  {selectedTicket.name}
                </h3>
                <p className="text-slate-500 text-xs font-mono mt-1 bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded-md">
                  CPF: 123.***.***-00
                </p>
              </div>
            </div>

            <div className="p-6 space-y-8 flex-1">
              {/* Status Card */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  Status da Conexão
                </h4>
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                      <Zap size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-emerald-700 dark:text-emerald-400">
                        Conectado
                      </p>
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-500 font-medium">
                        Fibra 500MB • PPPoE
                      </p>
                    </div>
                  </div>
                  <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleUnlock}
                    disabled={unlockStatus !== "idle"}
                    className="py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex flex-col items-center justify-center gap-2"
                  >
                    {unlockStatus === "loading" ? (
                      <Loader2
                        size={18}
                        className="animate-spin text-indigo-600"
                      />
                    ) : (
                      <LockOpen size={18} className="text-indigo-500" />
                    )}
                    Desbloqueio
                  </button>

                  <button className="py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex flex-col items-center justify-center gap-2">
                    <RefreshCw size={18} className="text-blue-500" />
                    Resetar Porta
                  </button>
                </div>
              </div>

              {/* Invoices List */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex justify-between items-center">
                  Faturas em Aberto
                  <span className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded">
                    {ixcInvoices.length}
                  </span>
                </h4>

                {loadingIxc ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="animate-spin text-indigo-600" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {ixcInvoices.map((inv) => (
                      <div
                        key={inv.id}
                        className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex flex-col gap-2"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-sm text-slate-700 dark:text-slate-200">
                            R$ {inv.valor}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              inv.status === "Pago"
                                ? "bg-emerald-100 text-emerald-600"
                                : "bg-red-100 text-red-600"
                            }`}
                          >
                            {inv.status}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs text-slate-500">
                          <span>Venc: {inv.vencimento}</span>
                          <div className="flex gap-2">
                            <button
                              className="hover:text-indigo-600"
                              title="Ver Boleto"
                            >
                              <FileText size={14} />
                            </button>
                            {inv.pix && (
                              <button
                                onClick={() => handleCopyPix(inv.pix)}
                                className={`hover:text-emerald-500 transition-colors ${
                                  copiedPix === inv.pix
                                    ? "text-emerald-500"
                                    : ""
                                }`}
                                title="Copiar Pix"
                              >
                                {copiedPix === inv.pix ? (
                                  <Check size={14} />
                                ) : (
                                  <Copy size={14} />
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* AI Copilot Panel - Slide Over */}
      {showAiPanel && selectedTicket && (
        <>
          {isMobile && (
            <div
              onClick={() => setShowAiPanel(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-30 animate-in fade-in lg:hidden"
            ></div>
          )}
          <div
            className={`
          ${isMobile ? "fixed inset-y-0 right-0 z-40" : "relative shrink-0"}
          w-96 shadow-2xl flex flex-col
        `}
          >
            <TicketAiPanel
              ticketId={selectedTicket.id}
              onClose={() => setShowAiPanel(false)}
            />
          </div>
        </>
      )}

      {/* OS MODAL */}
      {showOsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-4xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900">
              <h3 className="font-black text-lg flex items-center gap-2">
                <Wrench className="text-indigo-600" size={20} /> Nova Ordem de
                Serviço
              </h3>
              <button
                onClick={() => setShowOsModal(false)}
                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl text-slate-400"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateOS} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">
                  Assunto
                </label>
                <select
                  className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 text-sm font-bold"
                  value={osData.subject}
                  onChange={(e) =>
                    setOsData({ ...osData, subject: e.target.value })
                  }
                >
                  <option value="1">Suporte Técnico</option>
                  <option value="2">Instalação</option>
                  <option value="3">Retirada</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">
                  Departamento
                </label>
                <select
                  className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 text-sm font-bold"
                  value={osData.department}
                  onChange={(e) =>
                    setOsData({ ...osData, department: e.target.value })
                  }
                >
                  <option value="101">Nível 1</option>
                  <option value="102">Nível 2</option>
                  <option value="103">Técnicos de Campo</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">
                  Descrição do Problema
                </label>
                <textarea
                  rows={3}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 text-sm resize-none"
                  placeholder="Descreva o que o cliente relatou..."
                  value={osData.description}
                  onChange={(e) =>
                    setOsData({ ...osData, description: e.target.value })
                  }
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isCreatingOs}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
              >
                {isCreatingOs ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Check size={18} />
                )}
                Abrir O.S.
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tickets;
