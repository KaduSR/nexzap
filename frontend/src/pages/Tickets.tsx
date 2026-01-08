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
import TransferTicketModal from "../components/TransferTicketModal";
import { useSip } from "../context/SipContext";
import { useSocket } from "../context/SocketContext";

// --- URL INTELIGENTE (Mantida) ---
const getBaseUrl = () => {
  let url = import.meta.env.VITE_API_URL || "http://localhost:8081";
  if (url.includes(":8080")) url = url.replace(":8080", ":8081");
  if (url.endsWith("/")) url = url.slice(0, -1);
  return url.endsWith("/api") ? url : `${url}/api`;
};

const API_URL = getBaseUrl();

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

const Tickets: React.FC = () => {
  const { socket } = useSocket();
  const { makeCall } = useSip(); // 🔥 SIP ESTÁ AQUI
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [currentMessages, setCurrentMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [isPrivateMode, setIsPrivateMode] = useState(false);
  const [showIxcPanel, setShowIxcPanel] = useState(false);
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [showServicesModal, setShowServicesModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [copiedPix, setCopiedPix] = useState<string | null>(null);
  const [isResolving, setIsResolving] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [isScheduling, setIsScheduling] = useState(false);
  const [showOsModal, setShowOsModal] = useState(false);
  const [isCreatingOs, setIsCreatingOs] = useState(false);
  const [osData, setOsData] = useState({
    subject: "1",
    department: "101",
    description: "",
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [statusFilter, setStatusFilter] = useState<
    "open" | "pending" | "closed"
  >("open");
  const [ixcInvoices, setIxcInvoices] = useState<any[]>([]);
  const [loadingIxc, setLoadingIxc] = useState(false);
  const [unlockStatus, setUnlockStatus] = useState<
    "idle" | "loading" | "success"
  >("idle");
  const [autoTranscribeAudio, setAutoTranscribeAudio] = useState(false);

  // --- BUSCA HÍBRIDA (Mantida) ---
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        console.log(`🚀 Buscando tickets em: ${API_URL}/tickets`);
        const res = await fetch(`${API_URL}/tickets`, {
          method: "GET",
          headers: {
            Authorization: "Bearer token",
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) throw new Error(`Erro na API: ${res.status}`);
        const data = await res.json();
        const listaDoBackend = Array.isArray(data) ? data : data.tickets || [];

        const ticketsFormatados = listaDoBackend.map((t: any) => ({
          id: t.id?.toString(),
          name: t.name || t.contact?.name || "Sem Nome",
          lastMsg: t.lastMsg || t.lastMessage || "Nova conversa",
          time:
            t.time ||
            (t.updatedAt
              ? new Date(t.updatedAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : ""),
          unread: t.unread !== undefined ? t.unread : t.unreadMessages || 0,
          status: t.status,
          ixcCustomer: t.ixcCustomer || false,
          profilePicUrl: t.profilePicUrl || t.contact?.profilePicUrl,
          number: t.number || t.contact?.number,
        }));
        setTickets(ticketsFormatados);
      } catch (error) {
        console.error("❌ Erro ao buscar tickets:", error);
      }
    };
    fetchTickets();
  }, []);

  // Socket Listener (Mantido)
  useEffect(() => {
    if (!socket) return;
    const companyId = 1;
    const onTicketEvent = (data: any) => {
      if (data.action === "update" || data.action === "create") {
        const t = data.ticket;
        setTickets((prevState) => {
          const filtered = prevState.filter(
            (ticket) => ticket.id !== t.id.toString()
          );
          const updatedTicket: Ticket = {
            id: t.id.toString(),
            name: t.name || t.contact?.name || "Sem Nome",
            lastMsg: t.lastMsg || t.lastMessage || "",
            time:
              t.time ||
              new Date(t.updatedAt || new Date()).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
            unread: t.unread !== undefined ? t.unread : t.unreadMessages || 0,
            status: t.status,
            ixcCustomer: false,
            address: "",
            profilePicUrl: t.profilePicUrl || t.contact?.profilePicUrl,
            number: t.contact?.number,
          };
          return [updatedTicket, ...filtered];
        });
      }
      if (data.action === "delete") {
        const ticketId = data.ticketId.toString();
        setTickets((prevState) => prevState.filter((t) => t.id !== ticketId));
      }
    };
    socket.on(`company-${companyId}-ticket`, onTicketEvent);
    return () => {
      socket.off(`company-${companyId}-ticket`, onTicketEvent);
    };
  }, [socket]);

  // Settings (Mantido)
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${API_URL}/settings`, {
          headers: { Authorization: "Bearer token" },
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            const setting = data.find(
              (s: any) => s.key === "ai_auto_transcribe_audio"
            );
            if (setting && setting.value === "true")
              setAutoTranscribeAudio(true);
          }
        }
      } catch (error) {}
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 🔥 [RESTAURADO] Lógica do Painel IXC
  useEffect(() => {
    if (selectedTicket?.ixcCustomer && showIxcPanel) {
      setLoadingIxc(true);
      // Simulação de busca no ERP (IXC)
      setTimeout(() => {
        setIxcInvoices([
          {
            id: 101,
            vencimento: "10/11/2024",
            valor: "99,90",
            status: "Aberto",
            link: "#",
            pix: "000201...",
          },
        ]);
        setLoadingIxc(false);
      }, 1000);
    }
  }, [selectedTicket, showIxcPanel]);

  const handleSelectedTicket = async (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setCurrentMessages([]);
    try {
      const res = await fetch(`${API_URL}/messages/${ticket.id}?pageNumber=1`, {
        headers: { Authorization: "Bearer token" },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.messages && Array.isArray(data.messages)) {
          const formattedMessages = data.messages.map((backendMsg: any) => ({
            id: backendMsg.id,
            fromMe: backendMsg.fromMe,
            text: backendMsg.body,
            time: new Date(backendMsg.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            mediaType: backendMsg.mediaType,
            mediaUrl: backendMsg.mediaUrl,
            isPrivate: backendMsg.isPrivate || false,
          }));
          setCurrentMessages(formattedMessages.reverse());
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedTicket) return;
    const msgText = message;
    setMessage("");
    setIsPrivateMode(false);
    try {
      const res = await fetch(`${API_URL}/messages/${selectedTicket.id}`, {
        method: "POST",
        headers: {
          Authorization: "Bearer token",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          body: msgText,
          fromMe: true,
          read: true,
          isPrivate: isPrivateMode,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const msgRetornada = data.message || data;
        const novaMensagemNaTela: Message = {
          id: msgRetornada.id || Math.random().toString(),
          fromMe: true,
          text: msgRetornada.body || msgText,
          mediaType: "chat",
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          isPrivate: isPrivateMode,
        };
        setCurrentMessages((listaAntiga) => [
          ...listaAntiga,
          novaMensagemNaTela,
        ]);
      } else {
        throw new Error("Erro");
      }
    } catch (error) {
      alert("Falha ao enviar");
      setMessage(msgText);
    }
  };

  const handleScheduleMessage = (e: any) => {
    e.preventDefault();
    setIsScheduleModalOpen(false);
    alert("Simulação: Agendado!");
  };
  const handleCreateOS = (e: any) => {
    e.preventDefault();
    setShowOsModal(false);
    alert("Simulação: O.S Criada!");
  };
  const handleUnlock = () => alert("Simulação: Desbloqueio enviado!");
  const handleCopyPix = (c: string) => {};
  const handleResolveTicket = () => {
    alert("Simulação: Ticket Resolvido!");
  };

  const filteredTickets = tickets.filter((t) => t.status === statusFilter);

  return (
    <div className="w-full flex flex-1 h-screen overflow-hidden bg-slate-50 dark:bg-slate-900 animate-in fade-in duration-500">
      <div
        className={`${
          isMobile && selectedTicket ? "hidden" : "flex"
        } flex-1 lg:w-95 border-r border-slate-200 dark:border-slate-800 flex-col bg-white dark:bg-slate-900 shrink-0`}
      >
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
              placeholder="Buscar..."
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

        <div className="w-full overflow-y-auto custom-scrollbar px-3 pb-3 space-y-1">
          {filteredTickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center opacity-50 p-8">
              <MessageSquare size={24} className="text-slate-400 mb-4" />
              <p className="text-sm font-bold text-slate-600 dark:text-slate-400">
                Nenhum ticket encontrado.
              </p>
            </div>
          ) : (
            filteredTickets.map((ticket) => (
              <div
                key={ticket.id}
                onClick={() => handleSelectedTicket(ticket)}
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

      <div
        className={`w-full flex-col bg-slate-50 dark:bg-slate-900 ${
          isMobile && !selectedTicket ? "hidden" : "flex"
        }`}
      >
        {selectedTicket ? (
          <>
            <header className="w-full px-6 py-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 flex items-center justify-between z-20 sticky top-0">
              <div className="flex items-center gap-4">
                {isMobile && (
                  <button
                    onClick={() => setSelectedTicket(null)}
                    className="p-2"
                  >
                    <ArrowLeft />
                  </button>
                )}
                <div className="w-11 h-11 rounded-2xl bg-indigo-100 dark:bg-slate-800 overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700">
                  <img
                    src={`https://picsum.photos/seed/${selectedTicket.id}/100/100`}
                    className="w-full h-full object-cover"
                    alt=""
                  />
                </div>
                <div>
                  <h2 className="font-bold text-base text-slate-800 dark:text-white leading-tight">
                    {selectedTicket.name}
                  </h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-md">
                      Online
                    </span>
                  </div>
                </div>
              </div>

              {/* 🔥 [RESTAURADO] BARRA DE AÇÕES (SIP e IXC) */}
              <div className="flex items-center gap-2">
                {/* 1. Botão de Ligar (SIP) - Só aparece se tiver número */}
                {selectedTicket.number && (
                  <button
                    onClick={() => makeCall(selectedTicket.number!)}
                    className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                    title="Ligar"
                  >
                    <Phone size={20} />
                  </button>
                )}

                {/* 2. Botão do IXC (Banco de Dados) - Só aparece se for cliente IXC */}
                {selectedTicket.ixcCustomer && (
                  <button
                    onClick={() => setShowIxcPanel(!showIxcPanel)}
                    className={`p-2 rounded-xl transition-all ${
                      showIxcPanel
                        ? "bg-indigo-100 text-indigo-600"
                        : "text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                    title="Integração ERP"
                  >
                    <Database size={20} />
                  </button>
                )}

                <button
                  onClick={() => setShowServicesModal(true)}
                  className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                  title="Serviços"
                >
                  <Tag size={20} />
                </button>
                <button
                  onClick={() => setShowTransferModal(true)}
                  className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                  title="Transferir"
                >
                  <ArrowRightLeft size={20} />
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
                  )}{" "}
                  <span className="hidden sm:inline">Resolver</span>
                </button>
                <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                  <MoreVertical size={20} />
                </button>
              </div>
            </header>

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
                        <Lock size={10} /> Nota Interna
                      </div>
                    )}
                    <div
                      className={`p-4 rounded-3xl shadow-sm relative text-sm ${
                        msg.isPrivate
                          ? "bg-amber-100 dark:bg-amber-900/30 text-amber-900 dark:text-amber-200 border border-amber-200 rounded-br-none"
                          : msg.fromMe
                          ? "bg-linear-to-br from-indigo-600 to-blue-600 text-white rounded-br-none shadow-indigo-500/20"
                          : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-bl-none border border-slate-200"
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

            {/* FOOTER (Mantido) */}
            <footer
              className={`p-4 md:p-6 bg-slate-50 dark:bg-slate-950 z-20 ${
                isPrivateMode ? "border-t-2 border-amber-400" : ""
              }`}
            >
              <div
                className={`bg-white dark:bg-slate-900 rounded-3xl p-2 flex items-end gap-2 shadow-xl shadow-slate-200/50 dark:shadow-black/20 border transition-all ${
                  isPrivateMode
                    ? "border-amber-400 dark:border-amber-600 ring-amber-200 bg-amber-50 dark:bg-amber-900/10"
                    : "border-slate-200 dark:border-slate-800"
                }`}
              >
                <button
                  onClick={() => setIsPrivateMode(!isPrivateMode)}
                  className={`p-3 rounded-xl transition-colors ${
                    isPrivateMode
                      ? "bg-amber-100 text-amber-600"
                      : "text-slate-400 hover:text-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                  title="Privado"
                >
                  {isPrivateMode ? <Lock size={20} /> : <Unlock size={20} />}
                </button>
                <button
                  onClick={() => setShowOsModal(true)}
                  className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors hidden sm:block"
                  title="OS"
                >
                  <Wrench size={20} />
                </button>
                <div className="flex-1 py-3 max-h-32 overflow-y-auto custom-scrollbar">
                  <textarea
                    placeholder={
                      isPrivateMode
                        ? "Nota interna..."
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
                    <button
                      onClick={() => setIsScheduleModalOpen(true)}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                    >
                      <Clock size={20} />
                    </button>
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
                Selecione um ticket na lista lateral.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* MODAIS (IXC Panel, OS, Schedule, etc) */}
      {showOsModal && (
        <div
          className="fixed inset-0 bg-black/50 z-50"
          onClick={() => setShowOsModal(false)}
        ></div>
      )}
      {isScheduleModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50"
          onClick={() => setIsScheduleModalOpen(false)}
        ></div>
      )}

      {/* 🔥 [RESTAURADO] MODAL DO IXC (PAINEL LATERAL) */}
      {showIxcPanel && selectedTicket && (
        <>
          {isMobile && (
            <div
              onClick={() => setShowIxcPanel(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-30 lg:hidden"
            ></div>
          )}
          <div
            className={`${
              isMobile ? "fixed inset-y-0 right-0 z-40" : "relative shrink-0"
            } w-96 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 overflow-y-auto custom-scrollbar flex flex-col shadow-2xl`}
          >
            <div className="p-6 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 shrink-0">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-widest">
                  <Database size={14} /> Integração ERP
                </div>
                <button
                  onClick={() => setShowIxcPanel(false)}
                  className="p-1 bg-slate-200 dark:bg-slate-800 rounded-lg text-slate-500"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="flex flex-col items-center text-center">
                <h3 className="font-black text-xl leading-tight text-slate-800 dark:text-white">
                  {selectedTicket.name}
                </h3>
                <p className="text-slate-500 text-xs font-mono mt-1 bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded-md">
                  CPF: 123.***.***-00
                </p>
              </div>
            </div>
            <div className="p-6 space-y-8 flex-1">
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
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleUnlock}
                    className="py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex flex-col items-center justify-center gap-2"
                  >
                    <LockOpen size={18} className="text-indigo-500" />{" "}
                    Desbloqueio
                  </button>
                  <button className="py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex flex-col items-center justify-center gap-2">
                    <RefreshCw size={18} className="text-blue-500" /> Resetar
                    Porta
                  </button>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  Faturas
                </h4>
                {loadingIxc ? (
                  <Loader2 className="animate-spin mx-auto text-indigo-600" />
                ) : (
                  ixcInvoices.map((inv) => (
                    <div
                      key={inv.id}
                      className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex flex-col gap-2"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-sm text-slate-700 dark:text-slate-200">
                          R$ {inv.valor}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-600">
                          {inv.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {showServicesModal && (
        <ServicePriceList onClose={() => setShowServicesModal(false)} />
      )}
      {showTransferModal && selectedTicket && (
        <TransferTicketModal
          ticketId={selectedTicket.id}
          onClose={() => setShowTransferModal(false)}
          onSuccess={() => {
            alert("Transferido!");
            setSelectedTicket(null);
          }}
        />
      )}
      {showAiPanel && selectedTicket && (
        <div
          className={`${
            isMobile ? "fixed inset-y-0 right-0 z-40" : "relative shrink-0"
          } w-96 shadow-2xl flex flex-col`}
        >
          <TicketAiPanel
            ticketId={selectedTicket.id}
            onClose={() => setShowAiPanel(false)}
          />
        </div>
      )}
    </div>
  );
};

export default Tickets;
