import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  MapPin,
  Plus,
  RefreshCcw,
  ShieldAlert,
} from "lucide-react";
import React, { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

interface Tag {
  id: number;
  name: string;
}

interface Incident {
  id: number;
  title: string;
  description: string;
  isActive: boolean;
  tagId: number;
  tag?: Tag;
}

const Incidents: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newIncident, setNewIncident] = useState({
    title: "",
    description: "",
    tagId: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [incRes, tagRes] = await Promise.all([
        fetch(`${API_URL}/api/incidents`, {
          headers: { Authorization: "Bearer token" },
        }),
        fetch(`${API_URL}/api/tags`, {
          headers: { Authorization: "Bearer token" },
        }),
      ]);

      if (incRes.ok) setIncidents(await incRes.json());
      if (tagRes.ok) setTags(await tagRes.json());
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      await fetch(`${API_URL}/api/incidents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer token",
        },
        body: JSON.stringify(newIncident),
      });
      setNewIncident({ title: "", description: "", tagId: "" });
      fetchData();
    } catch (error) {
      alert("Erro ao criar incidente.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggle = async (incident: Incident) => {
    // Optimistic Update
    const updatedIncidents = incidents.map((i) =>
      i.id === incident.id ? { ...i, isActive: !i.isActive } : i
    );
    setIncidents(updatedIncidents);

    try {
      await fetch(`${API_URL}/api/incidents/${incident.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer token",
        },
        body: JSON.stringify({ isActive: !incident.isActive }),
      });
    } catch (error) {
      fetchData(); // Revert on error
    }
  };

  // Mock Tags if DB is empty for demo
  const displayTags =
    tags.length > 0
      ? tags
      : [
          { id: 1, name: "Centro" },
          { id: 2, name: "Zona Norte" },
          { id: 3, name: "Fibra Óptica" },
        ];

  return (
    <div className="p-8 space-y-8 max-w-6xl mx-auto animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-red-600 dark:text-red-500 flex items-center gap-3">
            <ShieldAlert size={32} />
            Gestão de Crise (Mass Outage)
          </h1>
          <p className="text-slate-500">
            Ative o "Modo Pânico" para bloquear a criação massiva de tickets
            durante instabilidades.
          </p>
        </div>
        <button
          onClick={fetchData}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400"
        >
          <RefreshCcw size={20} className={loading ? "animate-spin" : ""} />
        </button>
      </header>

      {/* Creation Form */}
      <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-[32px] p-8 shadow-sm">
        <h3 className="font-bold text-red-700 dark:text-red-400 mb-4 flex items-center gap-2">
          <AlertTriangle size={20} /> Reportar Novo Incidente
        </h3>
        <form
          onSubmit={handleCreate}
          className="grid grid-cols-1 md:grid-cols-12 gap-4"
        >
          <div className="md:col-span-3 space-y-1">
            <label className="text-[10px] font-black uppercase text-red-400 pl-1">
              Título Interno
            </label>
            <input
              type="text"
              placeholder="Ex: Rompimento Fibra Centro"
              required
              value={newIncident.title}
              onChange={(e) =>
                setNewIncident({ ...newIncident, title: e.target.value })
              }
              className="w-full p-3 bg-white dark:bg-slate-950 border border-red-200 dark:border-red-900/50 rounded-xl text-sm font-bold outline-none focus:border-red-500"
            />
          </div>
          <div className="md:col-span-3 space-y-1">
            <label className="text-[10px] font-black uppercase text-red-400 pl-1">
              Região Afetada (Tag)
            </label>
            <select
              required
              value={newIncident.tagId}
              onChange={(e) =>
                setNewIncident({ ...newIncident, tagId: e.target.value })
              }
              className="w-full p-3 bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/50 rounded-xl text-sm font-bold outline-none focus:border-red-500 text-slate-600 dark:text-slate-300"
            >
              <option value="">Selecione...</option>
              {displayTags.map((tag) => (
                <option key={tag.id} value={tag.id}>
                  {tag.name}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-4 space-y-1">
            <label className="text-[10px] font-black uppercase text-red-400 pl-1">
              Mensagem Automática para o Cliente
            </label>
            <input
              type="text"
              placeholder="Ex: Identificamos instabilidade na sua região. Previsão 14h."
              required
              value={newIncident.description}
              onChange={(e) =>
                setNewIncident({ ...newIncident, description: e.target.value })
              }
              className="w-full p-3 bg-white dark:bg-slate-950 border border-red-200 dark:border-red-900/50 rounded-xl text-sm font-medium outline-none focus:border-red-500"
            />
          </div>
          <div className="md:col-span-2 flex items-end">
            <button
              type="submit"
              disabled={isCreating}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-lg shadow-red-500/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              {isCreating ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Plus size={18} />
              )}
              ATIVAR
            </button>
          </div>
        </form>
      </div>

      {/* Incidents List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {incidents.length === 0 ? (
          <div className="col-span-full p-12 text-center text-slate-400 font-bold bg-slate-100 dark:bg-slate-800/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
            Nenhum incidente registrado. O sistema está operando normalmente.
          </div>
        ) : (
          incidents.map((incident) => (
            <div
              key={incident.id}
              className={`p-6 rounded-[24px] border-2 relative overflow-hidden transition-all ${
                incident.isActive
                  ? "bg-red-50 dark:bg-red-900/20 border-red-500 shadow-xl shadow-red-500/10"
                  : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 opacity-70"
              }`}
            >
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div>
                  <h3
                    className={`font-black text-lg ${
                      incident.isActive
                        ? "text-red-700 dark:text-red-400"
                        : "text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {incident.title}
                  </h3>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest mt-1 bg-white/50 dark:bg-black/20 px-2 py-1 rounded-md">
                    <MapPin size={12} /> {incident.tag?.name || "Geral"}
                  </span>
                </div>
                <button
                  onClick={() => handleToggle(incident)}
                  className={`w-12 h-8 rounded-full flex items-center transition-colors px-1 ${
                    incident.isActive
                      ? "bg-red-500 justify-end"
                      : "bg-slate-300 dark:bg-slate-600 justify-start"
                  }`}
                >
                  <div className="w-6 h-6 bg-white rounded-full shadow-sm"></div>
                </button>
              </div>

              <div className="relative z-10 bg-white/60 dark:bg-slate-900/60 p-3 rounded-xl backdrop-blur-sm border border-white/20 mb-4">
                <p className="text-xs font-medium italic text-slate-600 dark:text-slate-300">
                  "{incident.description}"
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs font-bold relative z-10">
                {incident.isActive ? (
                  <span className="text-red-600 flex items-center gap-1 animate-pulse">
                    <AlertCircle size={14} /> CRISE ATIVA
                  </span>
                ) : (
                  <span className="text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 size={14} /> RESOLVIDO
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Incidents;
