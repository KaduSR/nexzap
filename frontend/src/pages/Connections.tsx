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

const API_URL = process.env.VITE_API_URL;

const Connections: React.FC = () => {
  const [connections, setConnections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showNewModal, setShowNewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingConnection, setEditingConnection] = useState<any | null>(null);

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
      const response = await fetch(`${API_URL}/api/whatsapp`, {
        headers: { Authorization: "Bearer token" },
      });
      if (response.ok) {
        const data = await response.json();
        const adaptedData = data.map((c: any) => ({
          ...c,
          type: "BAILEYS",
          icon: <MessageCircle size={24} className="text-emerald-600" />,
          color: "emerald",
          number: `+${c.id}`,
          updatedAt: "Agora",
        }));
        setConnections(adaptedData);
      }
    } catch (err) {
      console.error("Error fetching connections:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEditModal = (conn: any) => {
    setEditingConnection(conn);
    setShowEditModal(true);
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingConnection) return;

    setIsSaving(true);
    try {
      const response = await fetch(
        `${API_URL}/api/whatsapp/${editingConnection.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer token",
          },
          body: JSON.stringify({
            name: editingConnection.name,
            greetingMessage: editingConnection.greetingMessage,
            farewellMessage: editingConnection.farewellMessage,
            outOfHoursMessage: editingConnection.outOfHoursMessage,
          }),
        }
      );
      if (response.ok) {
        setShowEditModal(false);
        setEditingConnection(null);
        fetchConnections();
      } else {
        alert("Erro ao salvar alterações.");
      }
    } catch (err) {
      console.error("Save error:", err);
      alert("Erro de conexão ao salvar.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRestart = async (id: number) => {
    if (!confirm("Tem certeza que deseja reiniciar esta conexão?")) return;
    try {
      await fetch(`${API_URL}/api/whatsapp/${id}/restart`, {
        method: "POST",
        headers: { Authorization: "Bearer token" },
      });
      alert("Solicitação de reinício enviada.");
      fetchConnections();
    } catch (e) {
      alert("Erro ao reiniciar.");
    }
  };

  const handleDelete = async (id: number) => {
    if (
      !confirm(
        "Tem certeza que deseja EXCLUIR esta conexão? Isso irá parar o bot."
      )
    )
      return;
    try {
      await fetch(`${API_URL}/api/whatsapp/${id}`, {
        method: "DELETE",
        headers: { Authorization: "Bearer token" },
      });
      alert("Conexão excluída.");
      fetchConnections();
    } catch (e) {
      alert("Erro ao excluir.");
    }
  };

  return (
    <div className="p-8 space-y-10 max-w-7xl mx-auto animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-800 dark:text-white">
            Canais de Atendimento
          </h1>
          <p className="text-slate-500 font-medium text-lg mt-1">
            Conecte sua empresa onde seus clientes estão.
          </p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-[24px] font-black text-sm transition-all shadow-xl shadow-indigo-200 dark:shadow-none active:scale-95 shrink-0"
        >
          <Plus size={20} />
          Adicionar Canal
        </button>
      </header>

      {/* Connection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {loading ? (
          <div className="col-span-full py-20 flex justify-center text-indigo-500">
            <Loader2 size={40} className="animate-spin" />
          </div>
        ) : (
          connections.map((channel) => (
            <div
              key={channel.id}
              className="bg-white dark:bg-slate-800 rounded-[40px] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 group flex flex-col"
            >
              <div className="p-8 flex-1">
                <div className="flex items-center justify-between mb-8">
                  <div
                    className={`p-5 bg-${channel.color}-50 dark:bg-${channel.color}-900/20 rounded-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}
                  >
                    {channel.icon}
                  </div>
                  <div className="flex flex-col items-end">
                    <span
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                        channel.status === "CONNECTED"
                          ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                          : channel.status === "ERROR"
                          ? "bg-red-50 text-red-600 border-red-100"
                          : "bg-slate-50 text-slate-400 border-slate-100"
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

                <h3 className="font-black text-xl mb-1">{channel.name}</h3>
                <p className="text-slate-500 font-bold text-sm">
                  {channel.number || channel.username}
                </p>

                <div className="mt-8 flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <ShieldCheck size={14} className="text-indigo-500" />
                  Sincronizado {channel.updatedAt}
                </div>
              </div>

              <div className="bg-slate-50/50 dark:bg-slate-900/50 px-8 py-6 flex gap-3 border-t border-slate-50 dark:border-slate-800">
                <button
                  onClick={() => handleRestart(channel.id)}
                  className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <RefreshCw size={14} />
                  Reiniciar
                </button>
                <button
                  onClick={() => handleOpenEditModal(channel)}
                  className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <Edit2 size={14} />
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(channel.id)}
                  className="w-14 flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-red-500 rounded-2xl hover:bg-red-50 transition-colors shadow-sm"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}

        {/* Info Promotion Card */}
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[40px] p-10 text-white relative overflow-hidden flex flex-col justify-center shadow-2xl shadow-indigo-100 dark:shadow-none">
          <Globe
            size={150}
            className="absolute -right-10 -bottom-10 opacity-10 rotate-12"
          />
          <div className="relative z-10">
            <h3 className="font-black text-2xl mb-4 leading-tight">
              API Oficial Cloud
            </h3>
            <p className="text-indigo-100 font-bold text-sm leading-relaxed mb-8 opacity-80">
              Transforme seu atendimento em uma máquina de vendas com a API
              oficial do WhatsApp, Instagram e Facebook.
            </p>
            <button className="bg-white text-indigo-600 px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all">
              Migrar para Cloud API
            </button>
          </div>
        </div>
      </div>

      {/* Edit Connection Modal */}
      {showEditModal && editingConnection && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xl z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-black tracking-tight">
                  Editar Canal
                </h2>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">
                  {editingConnection.name}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingConnection(null);
                }}
                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-400 hover:text-slate-600"
              >
                <XIcon size={24} />
              </button>
            </div>

            <form onSubmit={handleSaveChanges}>
              <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Nome da Conexão
                  </label>
                  <input
                    type="text"
                    value={editingConnection.name}
                    onChange={(e) =>
                      setEditingConnection({
                        ...editingConnection,
                        name: e.target.value,
                      })
                    }
                    className="w-full mt-2 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Mensagem de Saudação
                  </label>
                  <textarea
                    rows={3}
                    value={editingConnection.greetingMessage || ""}
                    onChange={(e) =>
                      setEditingConnection({
                        ...editingConnection,
                        greetingMessage: e.target.value,
                      })
                    }
                    placeholder="Ex: Olá! Bem-vindo à nossa empresa. Como podemos ajudar?"
                    className="w-full mt-2 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 resize-none text-sm"
                  />
                  <p className="text-[10px] text-slate-500 mt-1 pl-1">
                    Enviada quando um cliente inicia uma nova conversa.
                  </p>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Mensagem de Despedida
                  </label>
                  <textarea
                    rows={3}
                    value={editingConnection.farewellMessage || ""}
                    onChange={(e) =>
                      setEditingConnection({
                        ...editingConnection,
                        farewellMessage: e.target.value,
                      })
                    }
                    placeholder="Ex: Agradecemos seu contato! Tenha um ótimo dia."
                    className="w-full mt-2 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 resize-none text-sm"
                  />
                  <p className="text-[10px] text-slate-500 mt-1 pl-1">
                    Enviada quando um ticket é finalizado.
                  </p>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Mensagem Fora de Expediente
                  </label>
                  <textarea
                    rows={3}
                    value={editingConnection.outOfHoursMessage || ""}
                    onChange={(e) =>
                      setEditingConnection({
                        ...editingConnection,
                        outOfHoursMessage: e.target.value,
                      })
                    }
                    placeholder="Ex: Olá! Nosso horário de atendimento é das 8h às 18h. Retornaremos seu contato em breve."
                    className="w-full mt-2 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 resize-none text-sm"
                  />
                  <p className="text-[10px] text-slate-500 mt-1 pl-1">
                    Enviada para novas conversas fora do horário comercial (se
                    ativado).
                  </p>
                </div>
              </div>

              <div className="p-8 pt-4 flex gap-4 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-4 text-sm font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-[2] py-4 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-2xl shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Save size={18} />
                  )}
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Connection Modal (Original) */}
      {showNewModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xl z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-[64px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-12 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-black tracking-tight">
                  Novo Canal
                </h2>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">
                  Escolha a plataforma
                </p>
              </div>
              <button
                onClick={() => {
                  setShowNewModal(false);
                  setSelectedChannelType(null);
                }}
                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-400 hover:text-slate-600"
              >
                <XIcon size={24} />
              </button>
            </div>

            <div className="p-12 space-y-8">
              {!selectedChannelType ? (
                <div className="grid grid-cols-2 gap-6">
                  {[
                    {
                      id: "WHATSAPP",
                      label: "WhatsApp",
                      icon: <MessageCircle size={32} />,
                      color: "bg-emerald-500",
                      desc: "Baileys or Cloud API",
                    },
                    {
                      id: "TELEGRAM",
                      label: "Telegram Bot",
                      icon: <Send size={32} />,
                      color: "bg-blue-500",
                      desc: "API Token @BotFather",
                    },
                    {
                      id: "INSTAGRAM",
                      label: "Instagram Direct",
                      icon: <Instagram size={32} />,
                      color: "bg-pink-600",
                      desc: "Meta Business API",
                    },
                    {
                      id: "FACEBOOK",
                      label: "Messenger",
                      icon: <Facebook size={32} />,
                      color: "bg-indigo-600",
                      desc: "Facebook Pages",
                    },
                    {
                      id: "X",
                      label: "X (Twitter)",
                      icon: <Activity size={32} />,
                      color: "bg-slate-900",
                      desc: "OAuth 2.0 Enterprise",
                    },
                  ].map((platform) => (
                    <button
                      key={platform.id}
                      onClick={() => setSelectedChannelType(platform.id)}
                      className="p-8 bg-slate-50 dark:bg-slate-900 rounded-[32px] border-2 border-transparent hover:border-indigo-500 hover:bg-white dark:hover:bg-slate-800 transition-all text-left group"
                    >
                      <div
                        className={`w-14 h-14 ${platform.color} text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}
                      >
                        {platform.icon}
                      </div>
                      <h4 className="font-black text-lg mb-1">
                        {platform.label}
                      </h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {platform.desc}
                      </p>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-10 animate-in slide-in-from-right duration-300">
                  <div className="flex items-center gap-4 p-6 bg-slate-50 dark:bg-slate-900 rounded-[28px]">
                    <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-sm">
                      <Zap size={24} className="text-indigo-600" />
                    </div>
                    <div>
                      <h4 className="font-black text-sm">
                        Configurando {selectedChannelType}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        Preencha as credenciais abaixo
                      </p>
                    </div>
                  </div>

                  {selectedChannelType === "TELEGRAM" ? (
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-2">
                          Token do Bot Telegram
                        </label>
                        <div className="bg-slate-50 dark:bg-slate-950 px-8 py-5 rounded-3xl border-2 border-transparent focus-within:border-indigo-500 transition-all shadow-inner">
                          <input
                            type="password"
                            placeholder="123456789:ABCdefGHI..."
                            className="bg-transparent w-full outline-none text-base font-bold"
                          />
                        </div>
                      </div>
                      <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-[28px] border border-blue-100 dark:border-blue-900/30 flex items-start gap-4">
                        <AlertCircle
                          size={20}
                          className="text-blue-600 shrink-0"
                        />
                        <p className="text-[11px] text-blue-700 dark:text-blue-400 font-bold leading-relaxed">
                          Crie um bot no <b>@BotFather</b> para obter seu token.
                          Não é necessário QR Code para este canal.
                        </p>
                      </div>
                    </div>
                  ) : selectedChannelType === "WHATSAPP" ? (
                    <div className="space-y-6">
                      <button className="w-full p-8 bg-indigo-600 text-white rounded-[32px] flex items-center justify-between group shadow-2xl shadow-indigo-200">
                        <div className="text-left">
                          <h4 className="font-black text-lg">
                            WhatsApp Web (Baileys)
                          </h4>
                          <p className="text-indigo-100 text-xs font-bold opacity-80">
                            Conexão via Leitura de QR Code
                          </p>
                        </div>
                        <QrCode
                          size={40}
                          className="group-hover:rotate-12 transition-transform"
                        />
                      </button>
                      <button className="w-full p-8 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[32px] flex items-center justify-between group">
                        <div className="text-left">
                          <h4 className="font-black text-lg">Meta Cloud API</h4>
                          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                            Oficial Enterprise
                          </p>
                        </div>
                        <Globe
                          size={40}
                          className="text-slate-200 group-hover:scale-110 transition-transform"
                        />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-10 space-y-6">
                      <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 mx-auto">
                        <Lock size={32} />
                      </div>
                      <div>
                        <h4 className="font-black text-xl">
                          Requer Configuração Global
                        </h4>
                        <p className="text-slate-500 font-bold text-sm max-w-xs mx-auto mt-2">
                          Para {selectedChannelType}, você deve primeiro
                          configurar seu App no Facebook Developers em
                          "Integrações".
                        </p>
                      </div>
                      <button className="text-indigo-600 font-black text-xs uppercase tracking-widest hover:underline flex items-center justify-center gap-2 mx-auto">
                        Ir para Integrações <ExternalLink size={14} />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-12 pt-0 flex gap-6">
              <button
                onClick={() => {
                  setSelectedChannelType(null);
                  if (!selectedChannelType) setShowNewModal(false);
                }}
                className="flex-1 py-5 text-sm font-black text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-3xl transition-all"
              >
                {selectedChannelType ? "Voltar" : "Cancelar"}
              </button>
              {selectedChannelType && (
                <button className="flex-[2] py-5 bg-indigo-600 text-white rounded-3xl text-sm font-black shadow-2xl shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all">
                  Validar Canal
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Connections;
