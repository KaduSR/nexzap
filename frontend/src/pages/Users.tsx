import {
  Check,
  Edit2,
  Loader2,
  Plus,
  Save,
  Search,
  Trash2,
  UserCog,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

interface Queue {
  id: number;
  name: string;
  color: string;
}

interface UserType {
  id: number;
  name: string;
  email: string;
  profile: string; // admin or user
  active: boolean;
  queues: Queue[];
}

const Users: React.FC = () => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [queues, setQueues] = useState<Queue[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [currentUser, setCurrentUser] = useState<
    Partial<UserType> & { password?: string }
  >({
    name: "",
    email: "",
    profile: "user",
    password: "",
  });
  const [selectedQueueIds, setSelectedQueueIds] = useState<number[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, queuesRes] = await Promise.all([
        fetch(`${API_URL}/api/users`, {
          headers: { Authorization: "Bearer token" },
        }),
        fetch(`${API_URL}/api/queues`, {
          headers: { Authorization: "Bearer token" },
        }),
      ]);

      if (usersRes.ok) setUsers(await usersRes.json());
      if (queuesRes.ok) setQueues(await queuesRes.json());
    } catch (e) {
      console.error("Error fetching data", e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (user?: UserType) => {
    if (user) {
      setCurrentUser({ ...user, password: "" }); // Don't show existing hash
      setSelectedQueueIds(user.queues?.map((q) => q.id) || []);
    } else {
      setCurrentUser({
        name: "",
        email: "",
        profile: "user",
        password: "",
        active: true,
      });
      setSelectedQueueIds([]);
    }
    setShowModal(true);
  };

  const toggleQueueSelection = (queueId: number) => {
    setSelectedQueueIds((prev) =>
      prev.includes(queueId)
        ? prev.filter((id) => id !== queueId)
        : [...prev, queueId]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const method = currentUser.id ? "PUT" : "POST";
      const url = currentUser.id
        ? `${API_URL}/api/users/${currentUser.id}`
        : `${API_URL}/api/users`;

      const payload = {
        ...currentUser,
        queueIds: selectedQueueIds,
      };

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer token",
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowModal(false);
        fetchData();
      } else {
        const err = await res.json();
        alert(err.message || "Erro ao salvar usuário.");
      }
    } catch (error) {
      alert("Erro de conexão.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este usuário?")) return;
    try {
      await fetch(`${API_URL}/api/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: "Bearer token" },
      });
      fetchData();
    } catch (e) {
      alert("Erro ao excluir.");
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-800 dark:text-white flex items-center gap-3">
            <UserCog className="text-indigo-500" size={32} />
            Gestão de Equipe
          </h1>
          <p className="text-slate-500">
            Cadastre atendentes, defina perfis e vincule setores.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95"
        >
          <Plus size={20} /> Novo Atendente
        </button>
      </header>

      {/* Search */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center gap-3 shadow-sm">
        <Search className="text-slate-400" size={20} />
        <input
          type="text"
          placeholder="Buscar por nome ou email..."
          className="bg-transparent border-none flex-1 outline-none text-sm text-slate-700 dark:text-slate-200 font-medium"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 flex justify-center text-indigo-500">
            <Loader2 className="animate-spin" size={32} />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="col-span-full p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
            <p className="text-slate-500 font-bold">
              Nenhum usuário encontrado.
            </p>
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div
              key={user.id}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm relative group hover:border-indigo-500 transition-colors"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xl font-bold text-slate-500">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white line-clamp-1">
                      {user.name}
                    </h3>
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        user.profile === "admin"
                          ? "bg-red-100 text-red-600 dark:bg-red-900/30"
                          : "bg-blue-100 text-blue-600 dark:bg-blue-900/30"
                      }`}
                    >
                      {user.profile}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleOpenModal(user)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-indigo-600"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-red-500"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-3 pl-1">
                <p className="text-sm text-slate-500 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-300"></span>{" "}
                  {user.email}
                </p>

                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">
                    Setores Vinculados
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {user.queues && user.queues.length > 0 ? (
                      user.queues.map((q) => (
                        <span
                          key={q.id}
                          className="px-2 py-1 rounded-md text-[10px] font-bold text-white shadow-sm"
                          style={{ backgroundColor: q.color }}
                        >
                          {q.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">
                        Nenhum setor
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900 shrink-0">
              <h3 className="font-black text-lg">
                {currentUser.id ? "Editar Usuário" : "Novo Usuário"}
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
              className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-5"
            >
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">
                  Nome Completo
                </label>
                <input
                  type="text"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm outline-none focus:border-indigo-500"
                  value={currentUser.name}
                  onChange={(e) =>
                    setCurrentUser({ ...currentUser, name: e.target.value })
                  }
                  required
                  placeholder="Ex: João da Silva"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm outline-none focus:border-indigo-500"
                  value={currentUser.email}
                  onChange={(e) =>
                    setCurrentUser({ ...currentUser, email: e.target.value })
                  }
                  required
                  placeholder="email@empresa.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">
                    Senha
                  </label>
                  <input
                    type="password"
                    className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm outline-none focus:border-indigo-500"
                    value={currentUser.password}
                    onChange={(e) =>
                      setCurrentUser({
                        ...currentUser,
                        password: e.target.value,
                      })
                    }
                    placeholder={
                      currentUser.id ? "Deixar em branco" : "Obrigatório"
                    }
                    required={!currentUser.id}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">
                    Perfil
                  </label>
                  <select
                    className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm outline-none focus:border-indigo-500"
                    value={currentUser.profile}
                    onChange={(e) =>
                      setCurrentUser({
                        ...currentUser,
                        profile: e.target.value,
                      })
                    }
                  >
                    <option value="user">Usuário</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-700">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">
                  Setores Permitidos
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto custom-scrollbar p-1">
                  {queues.map((queue) => {
                    const isSelected = selectedQueueIds.includes(queue.id);
                    return (
                      <div
                        key={queue.id}
                        onClick={() => toggleQueueSelection(queue.id)}
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 ring-1 ring-indigo-500"
                            : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-700 hover:border-indigo-300"
                        }`}
                      >
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: queue.color }}
                        ></div>
                        <span
                          className={`text-sm font-bold truncate flex-1 ${
                            isSelected
                              ? "text-indigo-700 dark:text-indigo-300"
                              : "text-slate-600 dark:text-slate-400"
                          }`}
                        >
                          {queue.name}
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
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
              >
                {isSaving ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Save size={18} />
                )}
                Salvar Usuário
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
