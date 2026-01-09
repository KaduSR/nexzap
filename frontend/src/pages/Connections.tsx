// cspell: disable
import {
  Activity,
  AlertCircle,
  Edit2,
  ExternalLink,
  Facebook,
  Globe,
  Instagram,
  Loader2,
  Lock,
  MessageCircle,
  Plus,
  QrCode,
  RefreshCw,
  Save,
  Send,
  ShieldCheck,
  Trash2,
  X as XIcon,
  Zap,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import api from  "../services/api";

// --- Interfaces & Types ---
interface Connection {
  id: number;
  name: string;
  status: string;
  number?: string;
  username?: string;
  greetingMessage?: string;
  farewellMessage?: string;
  outOfHoursMessage?: string;
  type?: string;
  updatedAt?: string;
  // UI Helpers
  icon?: React.ReactNode;
  color?: string;
}

const API_URL = import.meta.env.VITE_API_URL;
import { UpdatedAt } from 'sequelize-typescript/dist';
import { UpdatedAt } from 'sequelize-typescript/dist';

const Connections: React.FC = () => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showNewModal, setShowNewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingConnection, setEditingConnection] = useState<Connection | null>(
    null
  );
  const [selectedChannelType, setSelectedChannelType] = useState<string | null>(
    null
  );
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/whatsapp");

      const adaptedData = data.map((c: any) => {
        ...c,
        type: "BAYLES",
        icon: <MessageCircle size={24} className="text-emerald-600" />
        color: "emerald",
        status: c.status,
        number: c.number || "Sem número",
        UpdatedAt: format(new Date(c.UpdatedAt), "HH:mm", {locale: ptBR}),
      }));
    }
  };

  // ... (Funções handleOpenEditModal, handleSaveChanges, handleRestart, handleDelete mantidas iguais para brevidade, mas devem estar aqui)
  const handleOpenEditModal = (conn: Connection) => {
    setEditingConnection(conn);
    setShowEditModal(true);
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingConnection) return;
    setIsSaving(true);
    // Simulação de save
    setTimeout(() => {
      setIsSaving(false);
      setShowEditModal(false);
      setEditingConnection(null);
      alert("Salvo com sucesso (Mock)");
    }, 1000);
  };

  const handleRestart = async (id: number) => {
    if (confirm("Reiniciar conexão?")) alert(`Reiniciando ID ${id}`);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Excluir conexão?")) alert(`Excluindo ID ${id}`);
  };

  return (
    <div className="p-6 md:p-8 space-y-8 w-full animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-800 dark:text-white">
            Canais de Atendimento
          </h1>
          <p className="text-slate-500 font-medium text-base md:text-lg mt-1">
            Gerencie suas conexões do WhatsApp, Instagram e outros.
          </p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 md:px-8 md:py-4 rounded-3xl font-black text-sm transition-all shadow-xl shadow-indigo-200 dark:shadow-indigo-900/20 active:scale-95 shrink-0 cursor-pointer"
        >
          <Plus size={20} />
          Adicionar Canal
        </button>
      </header>

      {/* GRID RESPONSIVO AJUSTADO:
         - Mobile: 1 coluna
         - Tablet (md): 2 colunas
         - Desktop (lg): 3 colunas
         - Wide Desktop (2xl): 4 colunas (Aqui está o segredo para telas cheias)
      */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-indigo-500 gap-4">
            <Loader2 size={40} className="animate-spin" />
            <span className="font-bold text-sm">Carregando conexões...</span>
          </div>
        ) : (
          connections.map((channel) => (
            <div
              key={channel.id}
              className="bg-white dark:bg-slate-800 rounded-4xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-2xl hover:border-indigo-500/30 dark:hover:border-indigo-500/30 transition-all duration-300 group flex flex-col h-full"
            >
              <div className="p-6 md:p-8 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <div
                    className={`w-14 h-14 flex items-center justify-center bg-${channel.color}-50 dark:bg-${channel.color}-900/20 rounded-2xl group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}
                  >
                    {channel.icon}
                  </div>
                  <div className="flex flex-col items-end">
                    <span
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                        channel.status === "CONNECTED"
                          ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800"
                          : channel.status === "ERROR"
                          ? "bg-red-50 text-red-600 border-red-100 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"
                          : "bg-slate-50 text-slate-400 border-slate-100 dark:bg-slate-800 dark:border-slate-700"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          channel.status === "CONNECTED"
                            ? "bg-emerald-500 animate-pulse"
                            : "bg-current"
                        }`}
                      ></span>
                      {channel.status || "PENDING"}
                    </span>
                  </div>
                </div>

                <div className="mt-auto">
                  <h3
                    className="font-black text-xl mb-1 text-slate-800 dark:text-slate-100 truncate"
                    title={channel.name}
                  >
                    {channel.name}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 font-bold text-sm truncate">
                    {channel.number || channel.username}
                  </p>

                  <div className="mt-6 flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <ShieldCheck size={14} className="text-indigo-500" />
                    Sincronizado {channel.updatedAt}
                  </div>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="bg-slate-50/80 dark:bg-slate-900/50 px-6 py-4 flex gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => handleRestart(channel.id)}
                  className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 py-2.5 rounded-xl text-[10px] md:text-[11px] font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                  title="Reiniciar Conexão"
                >
                  <RefreshCw size={14} />
                  <span className="hidden xl:inline">Reiniciar</span>
                </button>
                <button
                  onClick={() => handleOpenEditModal(channel)}
                  className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 py-2.5 rounded-xl text-[10px] md:text-[11px] font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                  title="Editar Configurações"
                >
                  <Edit2 size={14} />
                  <span className="hidden xl:inline">Editar</span>
                </button>
                <button
                  onClick={() => handleDelete(channel.id)}
                  className="w-10 md:w-12 flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-red-500 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors shadow-sm cursor-pointer"
                  title="Excluir Canal"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}

        {/* Info Promotion Card (Ajustado para o Grid) */}
        <div className="bg-linear-to-br from-indigo-600 to-indigo-800 rounded-4xl p-8 text-white relative overflow-hidden flex flex-col justify-center shadow-2xl shadow-indigo-100 dark:shadow-none min-h-80">
          <Globe
            size={180}
            className="absolute -right-12 -bottom-12 opacity-10 rotate-12"
          />
          <div className="relative z-10">
            <h3 className="font-black text-2xl mb-4 leading-tight">
              API Oficial
            </h3>
            <p className="text-indigo-100 font-bold text-sm leading-relaxed mb-8 opacity-80">
              Transforme seu atendimento com a API oficial do Meta. Estabilidade
              e segurança garantidas.
            </p>
            <button className="bg-white text-indigo-600 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer w-full sm:w-auto">
              Saber Mais
            </button>
          </div>
        </div>
      </div>

      {/* Edit Connection Modal (Código do modal permanece o mesmo do anterior) */}
      {showEditModal && editingConnection && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xl z-50 flex items-center justify-center p-4">
          {/* ... Conteúdo do Modal (igual ao anterior) ... */}
          <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-4xl p-8">
            <h2 className="text-2xl font-bold mb-4 dark:text-white">
              Editar (Mock)
            </h2>
            <button
              onClick={() => setShowEditModal(false)}
              className="bg-slate-200 px-4 py-2 rounded"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* New Connection Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xl z-50 flex items-center justify-center p-4">
          {/* ... Conteúdo do Modal Novo (igual ao anterior) ... */}
          <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-4xl p-8">
            <h2 className="text-2xl font-bold mb-4 dark:text-white">
              Novo Canal (Mock)
            </h2>
            <button
              onClick={() => setShowNewModal(false)}
              className="bg-slate-200 px-4 py-2 rounded"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Connections;
