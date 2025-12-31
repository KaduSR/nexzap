import { Calendar, Loader2, Plus, Search, Send, X } from "lucide-react";
import React, { useState } from "react";

const API_URL = process.env.VITE_API_URL;

const Campaigns: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // State for form
  const [formData, setFormData] = useState({
    name: "",
    message1: "",
    date: "",
    time: "",
  });

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const scheduledAt = `${formData.date}T${formData.time}:00.000Z`;

      const res = await fetch(`${API_URL}/api/campaigns`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer token",
        },
        body: JSON.stringify({
          name: formData.name,
          message1: formData.message1,
          scheduledAt,
          status: "SCHEDULED",
        }),
      });

      if (res.ok) {
        alert("Campanha agendada com sucesso!");
        setShowModal(false);
        setFormData({ name: "", message1: "", date: "", time: "" });
      } else {
        alert("Erro ao criar campanha.");
      }
    } catch (err) {
      alert("Erro de conexão.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-6xl mx-auto relative">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Campanhas</h1>
          <p className="text-slate-500">
            Envios em massa e agendamentos recorrentes.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="w-full md:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-indigo-100 dark:shadow-none"
        >
          <Plus size={20} />
          Criar Campanha
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border dark:border-slate-700 flex items-center gap-3">
            <Search className="text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Filtrar campanhas..."
              className="bg-transparent border-none flex-1 outline-none text-sm"
            />
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl border dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left min-w-[600px]">
                <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-bold border-b dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-4">Nome da Campanha</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Envios</th>
                    <th className="px-6 py-4">Data</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-slate-700">
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4 font-semibold">
                      Promoção Black Friday 2024
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-full border border-emerald-100">
                        Finalizada
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">2,450 / 2,500</td>
                    <td className="px-6 py-4 text-slate-500">22 Nov, 14:00</td>
                    <td className="px-6 py-4">
                      <button className="text-indigo-600 hover:underline font-bold text-xs">
                        Detalhes
                      </button>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4 font-semibold">
                      Aviso de Renovação (Recorrente)
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded-full border border-indigo-100">
                        Agendada
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">--</td>
                    <td className="px-6 py-4 text-slate-500">
                      Todo dia, 09:00
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-indigo-600 hover:underline font-bold text-xs">
                        Editar
                      </button>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4 font-semibold">
                      Webinar Novos Recursos
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-amber-50 text-amber-600 text-[10px] font-bold rounded-full border border-amber-100">
                        Enviando...
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">412 / 800</td>
                    <td className="px-6 py-4 text-slate-500">Hoje, 16:30</td>
                    <td className="px-6 py-4">
                      <button className="text-amber-600 hover:underline font-bold text-xs">
                        Pausar
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border dark:border-slate-700 shadow-sm">
            <h3 className="font-bold mb-4">Métricas Globais</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500">Taxa de Abertura</span>
                  <span className="font-bold">68%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full w-[68%]"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500">Taxa de Resposta</span>
                  <span className="font-bold">24%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full w-[24%]"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 rounded-2xl p-6 text-white">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Calendar className="text-indigo-400" size={20} />
              Dica Pro
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Campanhas agendadas em horários comerciais (09:00 - 18:00) tendem
              a ter 40% mais engajamento.
            </p>
          </div>
        </div>
      </div>

      {/* New Campaign Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[32px] shadow-2xl p-8 border border-slate-200 dark:border-slate-800 animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Nova Campanha</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">
                  Nome da Campanha
                </label>
                <input
                  type="text"
                  placeholder="Ex: Promoção de Natal"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-sm outline-none focus:border-indigo-500"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">
                  Mensagem
                </label>
                <textarea
                  rows={4}
                  placeholder="Olá {{name}}, temos uma oferta especial..."
                  className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium outline-none focus:border-indigo-500 resize-none"
                  value={formData.message1}
                  onChange={(e) =>
                    setFormData({ ...formData, message1: e.target.value })
                  }
                  required
                />
                <p className="text-[10px] text-slate-500 pl-1">
                  Use <b>{"{{name}}"}</b> para substituir pelo nome do cliente.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">
                    Data de Envio
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold outline-none focus:border-indigo-500"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">
                    Hora
                  </label>
                  <input
                    type="time"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold outline-none focus:border-indigo-500"
                    value={formData.time}
                    onChange={(e) =>
                      setFormData({ ...formData, time: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">
                  Público Alvo
                </label>
                <select className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold outline-none focus:border-indigo-500 text-slate-500">
                  <option>Todos os Contatos</option>
                  <option>Tag: Clientes VIP</option>
                  <option>Tag: Novos Leads</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Send size={20} />
                )}
                Agendar Disparo
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Campaigns;
