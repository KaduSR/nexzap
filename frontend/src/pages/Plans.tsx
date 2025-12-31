import {
  CreditCard,
  Edit2,
  Loader2,
  Plus,
  Save,
  Settings2,
  Trash2,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";

const API_URL = process.env.VITE_API_URL;

interface Plan {
  id: number;
  name: string;
  users: number;
  connections: number;
  queues: number;
  stripePriceId: string;
  useCampaigns: boolean;
  useSchedules: boolean;
  useInternalChat: boolean;
  useExternalApi: boolean;
  useKanban: boolean;
  useOpenAi: boolean;
  useIntegrations: boolean;
  useFieldService: boolean;
}

const Plans: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const initialPlanState: Partial<Plan> = {
    name: "",
    users: 1,
    connections: 1,
    queues: 1,
    stripePriceId: "",
    useCampaigns: false,
    useSchedules: false,
    useInternalChat: false,
    useExternalApi: false,
    useKanban: false,
    useOpenAi: false,
    useIntegrations: false,
    useFieldService: false,
  };

  const [currentPlan, setCurrentPlan] =
    useState<Partial<Plan>>(initialPlanState);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/plans`, {
        headers: { Authorization: "Bearer token" },
      });
      if (res.ok) {
        setPlans(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (plan?: Plan) => {
    setCurrentPlan(plan || initialPlanState);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const method = currentPlan.id ? "PUT" : "POST";
      const url = currentPlan.id
        ? `${API_URL}/api/plans/${currentPlan.id}`
        : `${API_URL}/api/plans`;

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer token",
        },
        body: JSON.stringify(currentPlan),
      });

      if (res.ok) {
        setShowModal(false);
        fetchPlans();
        alert(
          currentPlan.id ? "Plano atualizado!" : "Plano criado com sucesso!"
        );
      } else {
        alert("Erro ao salvar plano.");
      }
    } catch (err) {
      alert("Erro de conexão.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este plano?")) return;
    try {
      await fetch(`${API_URL}/api/plans/${id}`, {
        method: "DELETE",
        headers: { Authorization: "Bearer token" },
      });
      fetchPlans();
    } catch (err) {
      alert("Erro ao excluir.");
    }
  };

  const ToggleSwitch = ({
    label,
    checked,
    onChange,
  }: {
    label: string;
    checked: boolean;
    onChange: (val: boolean) => void;
  }) => (
    <div
      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
        checked
          ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500"
          : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
      }`}
      onClick={() => onChange(!checked)}
    >
      <span
        className={`text-xs font-bold uppercase tracking-wide ${
          checked ? "text-indigo-700 dark:text-indigo-300" : "text-slate-500"
        }`}
      >
        {label}
      </span>
      <div
        className={`w-10 h-5 rounded-full relative transition-colors ${
          checked ? "bg-indigo-500" : "bg-slate-300 dark:bg-slate-700"
        }`}
      >
        <div
          className={`absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm transition-all ${
            checked ? "left-6" : "left-1"
          }`}
        ></div>
      </div>
    </div>
  );

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-800 dark:text-white flex items-center gap-3">
            <Settings2 className="text-indigo-500" size={32} />
            Gestor de Planos & Preços
          </h1>
          <p className="text-slate-500">
            Defina os limites, recursos e preços dos planos do seu SaaS.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95"
        >
          <Plus size={20} /> Novo Plano
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 flex justify-center">
            <Loader2 size={40} className="animate-spin text-indigo-500" />
          </div>
        ) : (
          plans.map((plan) => (
            <div
              key={plan.id}
              className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm relative group hover:border-indigo-500 transition-colors"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="font-black text-xl text-slate-800 dark:text-white">
                    {plan.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    {plan.stripePriceId ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full uppercase tracking-widest">
                        <CreditCard size={10} /> Stripe Ativo
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full uppercase tracking-widest">
                        Manual
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleOpenModal(plan)}
                    className="p-2 bg-slate-100 dark:bg-slate-700 hover:bg-indigo-100 hover:text-indigo-600 rounded-xl transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(plan.id)}
                    className="p-2 bg-slate-100 dark:bg-slate-700 hover:bg-red-100 hover:text-red-600 rounded-xl transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded-xl">
                    <p className="text-[10px] text-slate-400 font-black uppercase">
                      Usuários
                    </p>
                    <p className="font-bold text-slate-700 dark:text-slate-200">
                      {plan.users === 0 ? "∞" : plan.users}
                    </p>
                  </div>
                  <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded-xl">
                    <p className="text-[10px] text-slate-400 font-black uppercase">
                      Whats
                    </p>
                    <p className="font-bold text-slate-700 dark:text-slate-200">
                      {plan.connections === 0 ? "∞" : plan.connections}
                    </p>
                  </div>
                  <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded-xl">
                    <p className="text-[10px] text-slate-400 font-black uppercase">
                      Filas
                    </p>
                    <p className="font-bold text-slate-700 dark:text-slate-200">
                      {plan.queues === 0 ? "∞" : plan.queues}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {plan.useCampaigns && (
                    <Badge label="Campanhas" color="indigo" />
                  )}
                  {plan.useSchedules && (
                    <Badge label="Agendamentos" color="blue" />
                  )}
                  {plan.useKanban && <Badge label="Kanban" color="purple" />}
                  {plan.useOpenAi && <Badge label="IA" color="emerald" />}
                  {plan.useIntegrations && <Badge label="ISP" color="cyan" />}
                  {plan.useFieldService && (
                    <Badge label="App Técnico" color="orange" />
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900 shrink-0">
              <h3 className="font-black text-lg">
                {currentPlan.id ? "Editar Plano" : "Novo Plano"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl text-slate-400"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSave}
              className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-6"
            >
              <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-2">
                  Informações Básicas
                </h4>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    Nome do Plano
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm outline-none focus:border-indigo-500"
                    value={currentPlan.name}
                    onChange={(e) =>
                      setCurrentPlan({ ...currentPlan, name: e.target.value })
                    }
                    placeholder="Ex: Basic, Pro, Enterprise"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    ID do Preço Stripe
                  </label>
                  <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 focus-within:border-indigo-500 transition-colors">
                    <CreditCard size={16} className="text-slate-400" />
                    <input
                      type="text"
                      className="w-full py-3 bg-transparent border-none outline-none font-medium text-sm"
                      value={currentPlan.stripePriceId}
                      onChange={(e) =>
                        setCurrentPlan({
                          ...currentPlan,
                          stripePriceId: e.target.value,
                        })
                      }
                      placeholder="price_123456789..."
                    />
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Copie do dashboard do Stripe para ativar a cobrança
                    automática.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">
                      Usuários
                    </label>
                    <input
                      type="number"
                      className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold"
                      value={currentPlan.users}
                      onChange={(e) =>
                        setCurrentPlan({
                          ...currentPlan,
                          users: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">
                      Conexões
                    </label>
                    <input
                      type="number"
                      className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold"
                      value={currentPlan.connections}
                      onChange={(e) =>
                        setCurrentPlan({
                          ...currentPlan,
                          connections: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">
                      Filas
                    </label>
                    <input
                      type="number"
                      className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold"
                      value={currentPlan.queues}
                      onChange={(e) =>
                        setCurrentPlan({
                          ...currentPlan,
                          queues: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-2">
                  Módulos & Recursos
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <ToggleSwitch
                    label="Campanhas Massivas"
                    checked={!!currentPlan.useCampaigns}
                    onChange={(v) =>
                      setCurrentPlan({ ...currentPlan, useCampaigns: v })
                    }
                  />
                  <ToggleSwitch
                    label="Agendamentos"
                    checked={!!currentPlan.useSchedules}
                    onChange={(v) =>
                      setCurrentPlan({ ...currentPlan, useSchedules: v })
                    }
                  />
                  <ToggleSwitch
                    label="Chat Interno"
                    checked={!!currentPlan.useInternalChat}
                    onChange={(v) =>
                      setCurrentPlan({ ...currentPlan, useInternalChat: v })
                    }
                  />
                  <ToggleSwitch
                    label="API Externa"
                    checked={!!currentPlan.useExternalApi}
                    onChange={(v) =>
                      setCurrentPlan({ ...currentPlan, useExternalApi: v })
                    }
                  />
                  <ToggleSwitch
                    label="Kanban (CRM)"
                    checked={!!currentPlan.useKanban}
                    onChange={(v) =>
                      setCurrentPlan({ ...currentPlan, useKanban: v })
                    }
                  />
                  <ToggleSwitch
                    label="Integração (ISP)"
                    checked={!!currentPlan.useIntegrations}
                    onChange={(v) =>
                      setCurrentPlan({ ...currentPlan, useIntegrations: v })
                    }
                  />
                  <ToggleSwitch
                    label="Inteligência Artificial"
                    checked={!!currentPlan.useOpenAi}
                    onChange={(v) =>
                      setCurrentPlan({ ...currentPlan, useOpenAi: v })
                    }
                  />
                  <ToggleSwitch
                    label="App do Técnico (OS)"
                    checked={!!currentPlan.useFieldService}
                    onChange={(v) =>
                      setCurrentPlan({ ...currentPlan, useFieldService: v })
                    }
                  />
                </div>
              </div>
            </form>

            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 shrink-0">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
              >
                {isSaving ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Save size={18} />
                )}{" "}
                Salvar Plano
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Badge = ({ label, color }: { label: string; color: string }) => {
  const colors: any = {
    indigo:
      "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300",
    blue: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300",
    purple:
      "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300",
    emerald:
      "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300",
    cyan: "bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-300",
    orange:
      "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-300",
  };
  return (
    <span
      className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${
        colors[color] || colors.indigo
      }`}
    >
      {label}
    </span>
  );
};

export default Plans;
