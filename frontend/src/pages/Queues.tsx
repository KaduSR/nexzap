// cspell:disable
import {
  Check,
  Edit2,
  GitMerge,
  Loader2,
  Palette,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import React, { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL;

interface UserType {
  id: number;
  name: string;
  profile: string;
}

interface Queue {
  id: number;
  name: string;
  color: string;
  greetingMessage: string;
  users: UserType[];
}

const Queues: React.FC = () => {
  // --- Estados ---
  const [queues, setQueues] = useState<Queue[]>([]);
  const [availableUsers, setAvailableUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentQueue, setCurrentQueue] = useState<Partial<Queue>>({
    name: "",
    color: "#6366f1",
    greetingMessage: "",
  });
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // --- Callbacks e Funções ---

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      // Usando window.fetch para evitar conflitos de tipagem
      const [queuesRes, usersRes] = await Promise.all([
        window.fetch(`${API_URL}/queues`, { headers }),
        window.fetch(`${API_URL}/users`, { headers }),
      ]);

      if (queuesRes.ok) {
        const queuesData = await queuesRes.json();
        setQueues(queuesData);
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        const usersList = Array.isArray(usersData)
          ? usersData
          : usersData.users || [];
        setAvailableUsers(usersList);
      }
    } catch (e) {
      console.error("Error fetching data", e);
      toast.error("Erro ao carregar setores.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenModal = (queue?: Queue) => {
    if (queue) {
      setCurrentQueue(queue);
      setSelectedUserIds(queue.users ? queue.users.map((u) => u.id) : []);
    } else {
      setCurrentQueue({ name: "", color: "#6366f1", greetingMessage: "" });
      setSelectedUserIds([]);
    }
    setShowModal(true);
  };

  const toggleUserSelection = (userId: number) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      const method = currentQueue.id ? "PUT" : "POST";
      const url = currentQueue.id
        ? `${API_URL}/queues/${currentQueue.id}`
        : `${API_URL}/queues`;

      const payload = {
        ...currentQueue,
        userIds: selectedUserIds,
      };

      const res = await window.fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowModal(false);
        toast.success("Setor salvo com sucesso!");
        fetchData();
      } else {
        throw new Error("Falha ao salvar");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar setor.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (
      !confirm(
        "Tem certeza que deseja excluir este setor? Isso pode afetar tickets abertos."
      )
    )
      return;
    try {
      const token = localStorage.getItem("token");
      await window.fetch(`${API_URL}/queues/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Setor removido.");
      fetchData();
    } catch (e) {
      toast.error("Erro ao excluir.");
    }
  };

  // --- Renderização ---
  return (
    <div className="p-8 space-y-8 w-full animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-800 dark:text-white flex items-center gap-3">
            <GitMerge className="text-indigo-500" size={32} />
            Setores & Departamentos
          </h1>
          <p className="text-slate-500">
            Vincule atendentes aos departamentos para roteamento automático.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95 cursor-pointer"
        >
          <Plus size={20} /> Novo Setor
        </button>
      </header>

      {/* Lista de Filas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full py-12 flex justify-center text-indigo-500">
            <Loader2 className="animate-spin" size={32} />
          </div>
        ) : queues.length === 0 ? (
          <div className="col-span-full p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
            <p className="text-slate-500 font-bold">Nenhum setor cadastrado.</p>
          </div>
        ) : (
          queues.map((queue) => (
            <div
              key={queue.id}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm relative group hover:border-indigo-500 transition-colors flex flex-col"
            >
              <div
                className={`absolute top-0 left-0 w-1.5 h-full rounded-l-2xl`}
                style={{ backgroundColor: queue.color }}
              ></div>

              <div className="flex justify-between items-start mb-4 pl-3">
                <h3 className="font-black text-xl text-slate-800 dark:text-white line-clamp-1">
                  {queue.name}
                </h3>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleOpenModal(queue)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-indigo-600 cursor-pointer"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(queue.id)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-red-500 cursor-pointer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="pl-3 space-y-3 mb-4 flex-1">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <Palette size={14} /> Cor:{" "}
                  <span style={{ color: queue.color }}>{queue.color}</span>
                </div>
                {queue.greetingMessage && (
                  <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl">
                    <p className="text-xs text-slate-600 dark:text-slate-300 italic line-clamp-2">
                      "{queue.greetingMessage}"
                    </p>
                  </div>
                )}
              </div>

              <div className="pl-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                <p className="text-[10px] font-black uppercase text-slate-400 mb-2">
                  Atendentes Vinculados
                </p>
                <div className="flex -space-x-2 overflow-hidden">
                  {queue.users && queue.users.length > 0 ? (
                    queue.users.slice(0, 5).map((u) => (
                      <div
                        key={u.id}
                        className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300"
                        title={u.name}
                      >
                        {u.name ? u.name.charAt(0) : "?"}
                      </div>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">
                      Nenhum atendente
                    </span>
                  )}
                  {queue.users && queue.users.length > 5 && (
                    <div className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-500">
                      +{queue.users.length - 5}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-4xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900 shrink-0">
              <h3 className="font-black text-lg text-slate-800 dark:text-white">
                {currentQueue.id ? "Editar Setor" : "Novo Setor"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl text-slate-400 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSave}
              className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-5"
            >
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">
                  Nome do Setor
                </label>
                <input
                  type="text"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm outline-none focus:border-indigo-500 text-slate-800 dark:text-white"
                  value={currentQueue.name}
                  onChange={(e) =>
                    setCurrentQueue({ ...currentQueue, name: e.target.value })
                  }
                  required
                  placeholder="Ex: Financeiro"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">
                  Cor
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    className="w-12 h-12 rounded-xl border-none cursor-pointer bg-transparent"
                    value={currentQueue.color}
                    onChange={(e) =>
                      setCurrentQueue({
                        ...currentQueue,
                        color: e.target.value,
                      })
                    }
                  />
                  <input
                    type="text"
                    className="flex-1 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm outline-none focus:border-indigo-500 uppercase text-slate-800 dark:text-white"
                    value={currentQueue.color}
                    onChange={(e) =>
                      setCurrentQueue({
                        ...currentQueue,
                        color: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">
                  Mensagem de Saudação
                </label>
                <textarea
                  rows={3}
                  className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium outline-none focus:border-indigo-500 resize-none text-slate-800 dark:text-white"
                  value={currentQueue.greetingMessage}
                  onChange={(e) =>
                    setCurrentQueue({
                      ...currentQueue,
                      greetingMessage: e.target.value,
                    })
                  }
                  placeholder="Mensagem enviada quando o cliente entra nesta fila..."
                />
              </div>

              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-700">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">
                  Vincular Atendentes
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto custom-scrollbar p-1">
                  {availableUsers.map((user) => {
                    const isSelected = selectedUserIds.includes(user.id);
                    return (
                      <div
                        key={user.id}
                        onClick={() => toggleUserSelection(user.id)}
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 ring-1 ring-indigo-500"
                            : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-700 hover:border-indigo-300"
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                            isSelected
                              ? "bg-indigo-500 text-white"
                              : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                          }`}
                        >
                          {user.name ? user.name.charAt(0) : "?"}
                        </div>
                        <span
                          className={`text-sm font-bold truncate flex-1 ${
                            isSelected
                              ? "text-indigo-700 dark:text-indigo-300"
                              : "text-slate-600 dark:text-slate-400"
                          }`}
                        >
                          {user.name}
                        </span>
                        {isSelected && (
                          <Check
                            size={16}
                            className="text-indigo-600 dark:text-indigo-400"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </form>

            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 shrink-0">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all cursor-pointer"
              >
                {isSaving ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Save size={18} />
                )}
                Salvar Setor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Queues;
