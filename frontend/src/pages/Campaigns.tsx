// cspell: disable
import { Calendar, Plus, Search } from "lucide-react";
import React, { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

const Campaigns: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    message1: "",
    date: "",
    time: "",
  });

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    // Mock save
    setTimeout(() => {
      setIsSaving(false);
      setShowModal(false);
      alert("Campanha Criada (Mock)");
    }, 1000);
  };

  return (
    // FIX: w-full e removido max-w-6xl
    <div className="p-8 space-y-8 w-full relative animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-white">
            Campanhas
          </h1>
          <p className="text-slate-500">
            Envios em massa e agendamentos recorrentes.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="w-full md:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg"
        >
          <Plus size={20} /> Criar Campanha
        </button>
      </header>

      {/* Grid Layout Adjusted for Full Width */}
      <div className="grid grid-cols-1 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
        {/* Table Section takes 2 or 3 cols */}
        <div className="lg:col-span-2 2xl:col-span-3 space-y-4">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-3">
            <Search className="text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Filtrar campanhas..."
              className="bg-transparent border-none flex-1 outline-none text-sm text-slate-700 dark:text-slate-200"
            />
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left min-w-150">
                <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-4">Nome da Campanha</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Envios</th>
                    <th className="px-6 py-4">Data</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-slate-700 dark:text-slate-300">
                  {/* Mock Rows */}
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4 font-semibold">
                      Promoção Black Friday
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
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <h3 className="font-bold mb-4 text-slate-800 dark:text-white">
              Métricas Globais
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1 text-slate-500">
                  <span>Taxa de Abertura</span>
                  <span className="font-bold text-slate-700 dark:text-white">
                    68%
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full w-[68%]"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1 text-slate-500">
                  <span>Taxa de Resposta</span>
                  <span className="font-bold text-slate-700 dark:text-white">
                    24%
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full w-[24%]"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Calendar className="text-indigo-400" size={20} /> Dica Pro
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Campanhas agendadas em horários comerciais (09:00 - 18:00) tendem
              a ter 40% mais engajamento.
            </p>
          </div>
        </div>
      </div>

      {/* Modal - Mantido igual, apenas classes de container */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-4xl p-8 border dark:border-slate-800">
            <h2 className="text-2xl font-bold mb-6 dark:text-white">
              Nova Campanha (Mock)
            </h2>
            <button
              onClick={() => setShowModal(false)}
              className="w-full py-3 bg-slate-200 dark:bg-slate-800 rounded-xl font-bold"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Campaigns;
