// cspell:disable
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
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL;

// --- Interfaces ---
interface Queue {
  id: number;
  name: string;
  color: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  profile: "admin" | "user";
  queues: Queue[];
  whatsappId?: number;
}

// Payload para criar/editar
interface UserPayload {
  name: string;
  email: string;
  password?: string;
  profile: string;
  queueIds: number[];
  whatsappId?: number | null;
}

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [allQueues, setAllQueues] = useState<Queue[]>([]); // Para o Modal
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form State
  const [formData, setFormData] = useState<UserPayload>({
    name: "",
    email: "",
    password: "",
    profile: "user",
    queueIds: [],
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      // Busca Usuários e Filas em paralelo
      const [usersRes, queuesRes] = await Promise.all([
        window.fetch(`${API_URL}/users`, { headers }),
        window.fetch(`${API_URL}/queues`, { headers }),
      ]);

      if (usersRes.ok) {
        const data = await usersRes.json();
        // Backend pode retornar { users: [], ... } ou array direto
        const list = Array.isArray(data) ? data : data.users || [];
        setUsers(list);
      }

      if (queuesRes.ok) {
        const data = await queuesRes.json();
        setAllQueues(data);
      }
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar dados.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingId(user.id);
      setFormData({
        name: user.name,
        email: user.email,
        password: "", // Senha vazia na edição (só envia se quiser trocar)
        profile: user.profile,
        queueIds: user.queues ? user.queues.map((q) => q.id) : [],
      });
    } else {
      setEditingId(null);
      setFormData({
        name: "",
        email: "",
        password: "",
        profile: "user",
        queueIds: [],
      });
    }
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      const method = editingId ? "PUT" : "POST";
      const url = editingId
        ? `${API_URL}/users/${editingId}`
        : `${API_URL}/users`;

      // Se for edição e senha estiver vazia, remove do payload para não sobrescrever
      const payload = { ...formData };
      if (editingId && !payload.password) {
        delete payload.password;
      }

      const res = await window.fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(`Usuário ${editingId ? "atualizado" : "criado"}!`);
        setShowModal(false);
        fetchData();
      } else {
        const errData = await res.json();
        throw new Error(errData.error || "Falha ao salvar");
      }
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar usuário.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este usuário?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await window.fetch(`${API_URL}/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        toast.success("Usuário removido.");
        fetchData();
      } else {
        throw new Error("Erro ao excluir");
      }
    } catch (err) {
      toast.error("Erro ao excluir usuário.");
    }
  };

  // Toggle de seleção de filas no modal
  const toggleQueue = (queueId: number) => {
    setFormData((prev) => {
      const includes = prev.queueIds.includes(queueId);
      return {
        ...prev,
        queueIds: includes
          ? prev.queueIds.filter((id) => id !== queueId)
          : [...prev.queueIds, queueId],
      };
    });
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 space-y-8 w-full animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-800 dark:text-white flex items-center gap-3">
            <UserCog className="text-indigo-500" size={32} />
            Gestão de Equipe
          </h1>
          <p className="text-slate-500">
            Cadastre atendentes, defina perfis (Admin/User) e vincule setores.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95 cursor-pointer"
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
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
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
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm relative group hover:border-indigo-500 transition-colors h-full flex flex-col"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xl font-bold text-slate-500 shrink-0 uppercase">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white line-clamp-1">
                      {user.name}
                    </h3>
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border flex items-center gap-1 w-fit ${
                        user.profile === "admin"
                          ? "bg-rose-100 text-rose-600 border-rose-200"
                          : "bg-blue-100 text-blue-600 border-blue-200"
                      }`}
                    >
                      {user.profile === "admin" ? (
                        <ShieldAlert size={10} />
                      ) : (
                        <ShieldCheck size={10} />
                      )}
                      {user.profile}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleOpenModal(user)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-indigo-600 cursor-pointer"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-red-500 cursor-pointer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-3 pl-1 mt-auto">
                <p className="text-sm text-slate-500 flex items-center gap-2 truncate">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse"></span>{" "}
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
                          style={{ backgroundColor: q.color || "#64748b" }}
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

      {/* Modal de Edição/Criação */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-4xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900 shrink-0">
              <h3 className="font-black text-lg text-slate-800 dark:text-white">
                {editingId ? "Editar Atendente" : "Novo Atendente"}
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
                  Nome
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm outline-none focus:border-indigo-500 text-slate-800 dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm outline-none focus:border-indigo-500 text-slate-800 dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">
                  Senha {editingId && "(Deixe em branco para manter)"}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm outline-none focus:border-indigo-500 text-slate-800 dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">
                  Perfil de Acesso
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="profile"
                      value="user"
                      checked={formData.profile === "user"}
                      onChange={() =>
                        setFormData({ ...formData, profile: "user" })
                      }
                      className="accent-indigo-600 w-4 h-4"
                    />
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      Usuário Padrão
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="profile"
                      value="admin"
                      checked={formData.profile === "admin"}
                      onChange={() =>
                        setFormData({ ...formData, profile: "admin" })
                      }
                      className="accent-rose-600 w-4 h-4"
                    />
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      Administrador
                    </span>
                  </label>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">
                  Setores Permitidos
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {allQueues.map((q) => {
                    const isSelected = formData.queueIds.includes(q.id);
                    return (
                      <div
                        key={q.id}
                        onClick={() => toggleQueue(q.id)}
                        className={`p-3 rounded-xl border cursor-pointer flex items-center gap-2 transition-all ${
                          isSelected
                            ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500"
                            : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-700"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center ${
                            isSelected
                              ? "bg-indigo-600 border-indigo-600"
                              : "border-slate-400"
                          }`}
                        >
                          {isSelected && (
                            <Check size={12} className="text-white" />
                          )}
                        </div>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          {q.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSaving ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Save size={18} />
                )}
                Salvar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
