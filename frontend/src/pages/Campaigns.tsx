// cspell:disable
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Calendar,
  CheckCircle,
  Clock,
  Loader2,
  Mail,
  MessageSquare,
  Play,
  Plus,
  Search,
  Trash2,
  X,
  Variable, // Importei um ícone novo se tiver, senão use Tag ou similar
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL;

interface Campaign {
  id: number;
  name: string;
  status: "PENDING" | "SCHEDULED" | "PROCESSING" | "FINISHED" | "CANCELED";
  scheduledAt: string;
  completedAt?: string;
  message1?: string;
  contactsCount?: number;
  wasSent?: boolean;
}

const Campaigns: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    message1: "",
    scheduledAt: "",
  });

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await window.fetch(`${API_URL}/campaigns`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.campaigns || [];
        setCampaigns(list);
      }
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar campanhas.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      const payload = {
        name: formData.name,
        message1: formData.message1,
        scheduledAt: formData.scheduledAt
          ? new Date(formData.scheduledAt).toISOString()
          : null,
        status: formData.scheduledAt ? "SCHEDULED" : "PENDING",
      };

      const res = await window.fetch(`${API_URL}/campaigns`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success("Campanha criada com sucesso!");
        setShowModal(false);
        setFormData({ name: "", message1: "", scheduledAt: "" });
        fetchCampaigns();
      } else {
        throw new Error("Falha ao criar");
      }
    } catch (err) {
      toast.error("Erro ao criar campanha.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Deseja realmente excluir esta campanha?")) return;
    try {
      const token = localStorage.getItem("token");
      await window.fetch(`${API_URL}/campaigns/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Campanha removida.");
      fetchCampaigns();
    } catch (err) {
      toast.error("Erro ao excluir.");
    }
  };

  const filteredCampaigns = campaigns.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: campaigns.length,
    finished: campaigns.filter((c) => c.status === "FINISHED").length,
    processing: campaigns.filter((c) => c.status === "PROCESSING").length,
    scheduled: campaigns.filter((c) => c.status === "SCHEDULED").length,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "FINISHED":
        return (
          <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-200 flex items-center gap-1 w-fit">
            <CheckCircle size={10} /> Finalizada
          </span>
        );
      case "PROCESSING":
        return (
          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-full border border-blue-200 flex items-center gap-1 w-fit">
            <Loader2 size={10} className="animate-spin" /> Enviando
          </span>
        );
      case "SCHEDULED":
        return (
          <span className="px-2 py-1 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full border border-amber-200 flex items-center gap-1 w-fit">
            <Clock size={10} /> Agendada
          </span>
        );
      case "CANCELED":
        return (
          <span className="px-2 py-1 bg-red-100 text-red-700 text-[10px] font-bold rounded-full border border-red-200 w-fit">
            Cancelada
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-full border border-slate-200 w-fit">
            Pendente
          </span>
        );
    }
  };

  // Função auxiliar para adicionar variável no cursor
  const addVariable = (variable: string) => {
    setFormData((prev) => ({ ...prev, message1: prev.message1 + variable }));
  };

  return (
    <div className="p-6 md:p-8 space-y-8 w-full animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-white flex items-center gap-3">
            <Mail className="text-indigo-500" size={32} />
            Campanhas
          </h1>
          <p className="text-slate-500">
            Envios em massa e agendamentos recorrentes no WhatsApp.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 active:scale-95 cursor-pointer"
        >
          <Plus size={20} /> Nova Campanha
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
        <div className="lg:col-span-2 2xl:col-span-3 space-y-4">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-3 shadow-sm">
            <Search className="text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Filtrar campanhas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none flex-1 outline-none text-sm text-slate-700 dark:text-slate-200 font-medium"
            />
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
            {loading ? (
              <div className="p-12 flex justify-center items-center">
                <Loader2 className="animate-spin text-indigo-500" size={32} />
              </div>
            ) : filteredCampaigns.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                Nenhuma campanha encontrada.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left min-w-150">
                  <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-700 uppercase tracking-wider text-xs">
                    <tr>
                      <th className="px-6 py-4">Nome</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Data / Agendamento</th>
                      <th className="px-6 py-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-slate-700 dark:text-slate-300">
                    {filteredCampaigns.map((camp) => (
                      <tr
                        key={camp.id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <p className="font-bold text-base">{camp.name}</p>
                          {camp.message1 && (
                            <p className="text-xs text-slate-500 line-clamp-1 max-w-50">
                              {camp.message1}
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(camp.status)}
                        </td>
                        <td className="px-6 py-4 text-slate-500">
                          {camp.scheduledAt ? (
                            <div className="flex items-center gap-1.5 text-xs">
                              <Calendar size={14} />
                              {format(
                                new Date(camp.scheduledAt),
                                "dd/MM/yyyy HH:mm"
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 italic">
                              Envio Imediato
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDelete(camp.id)}
                            className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                            title="Excluir"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <h3 className="font-bold mb-6 text-slate-800 dark:text-white flex items-center gap-2">
              <Play size={18} className="text-indigo-500" /> Visão Geral
            </h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-xs mb-1.5 text-slate-500 font-bold uppercase">
                  <span>Concluídas</span>
                  <span className="text-slate-700 dark:text-white">
                    {stats.finished} / {stats.total}
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${
                        stats.total > 0
                          ? (stats.finished / stats.total) * 100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1.5 text-slate-500 font-bold uppercase">
                  <span>Processando</span>
                  <span className="text-slate-700 dark:text-white">
                    {stats.processing}
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-500 h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${
                        stats.total > 0
                          ? (stats.processing / stats.total) * 100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1.5 text-slate-500 font-bold uppercase">
                  <span>Agendadas</span>
                  <span className="text-slate-700 dark:text-white">
                    {stats.scheduled}
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${
                        stats.total > 0
                          ? (stats.scheduled / stats.total) * 100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-4xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900">
              <h2 className="text-xl font-black text-slate-800 dark:text-white">
                Nova Campanha
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl text-slate-400 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">
                  Nome da Campanha
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Ex: Promoção de Natal"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm outline-none focus:border-indigo-500 text-slate-800 dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">
                  Agendamento (Opcional)
                </label>
                <input
                  type="datetime-local"
                  value={formData.scheduledAt}
                  onChange={(e) =>
                    setFormData({ ...formData, scheduledAt: e.target.value })
                  }
                  className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm outline-none focus:border-indigo-500 text-slate-800 dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">
                  Mensagem
                </label>
                <textarea
                  rows={5}
                  required
                  value={formData.message1}
                  onChange={(e) =>
                    setFormData({ ...formData, message1: e.target.value })
                  }
                  placeholder="Olá {nome}, confira..."
                  className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium outline-none focus:border-indigo-500 resize-none text-slate-800 dark:text-white"
                />

                {/* --- NOVAS VARIÁVEIS AQUI --- */}
                <div className="flex flex-wrap gap-2 pt-2">
                  <VariableChip
                    label="{nome}"
                    onClick={() => addVariable("{nome}")}
                  />
                  <VariableChip
                    label="{email}"
                    onClick={() => addVariable("{email}")}
                  />
                  <VariableChip
                    label="{telefone}"
                    onClick={() => addVariable("{telefone}")}
                  />
                  <VariableChip
                    label="{saudacao}"
                    onClick={() => addVariable("{saudacao}")}
                  />
                  <VariableChip
                    label="{data}"
                    onClick={() => addVariable("{data}")}
                  />
                  <VariableChip
                    label="{hora}"
                    onClick={() => addVariable("{hora}")}
                  />
                </div>
                <p className="text-[10px] text-slate-400 pl-1 pt-1">
                  * Saudação muda conforme o horário (Bom dia/tarde/noite).
                </p>
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSaving ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    <MessageSquare size={18} /> Criar Campanha
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente simples para os Chips
const VariableChip = ({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) => (
  <span
    onClick={onClick}
    className="px-2.5 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-[11px] font-bold rounded-lg cursor-pointer border border-indigo-100 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
  >
    {label}
  </span>
);

export default Campaigns;
