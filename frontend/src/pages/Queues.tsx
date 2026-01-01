// cspell: disable
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
import React, { useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { url } from "node:inspector";

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
  users: any[];
}

const Queues: React.FC = () => {
  const [queues, setQueues] = useState<Queue[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [currentQueue, setCurrentQueue] = useState<Partial<Queue>>({
    name: "",
    color: "#6366f1",
    greetingMessage: "",
  });

  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchaData();
  }, []);

  const fetchaData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const Headers = { Authorization: `Bearer ${token}` };

      const [queueRes, usersRes] = await Promise.all([
        fetchaData(`${API_URL}/queues`, { Headers }),
        fetchaData(`${API_URL}/users`, { Headers }),
      ]);

      if (queueRes.ok) setQueues(await queueRes.json());
      if (usersRes) {
        const usersData = await usersRes.json();
        setAvailableUsers(
          Array.isArray(usersData) ? usersData : usersData.users || []
        );
      }
    } catch (e) {
      console.error("Error fetching data", e);
      console.error("Error ao carregar setores.");
    } finally {
      setLoading(false);
    }

    const handleOpenModal = (queue?: Queue) => {
      if (queue) {
        setCurrentQueue(queue);
        setSelectedUserIds(queue.users?.map((u) => u.id) || []);
      } else {
        setCurrentQueue({ name: "", color: "#6366f1", greetingMessage: "" });
        setSelectedUserIds([]);
      }
      setShowModal(true);
    };

    const handleSave = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSaving(true);
      try {
        const token = localStorage.getItem("token");
        const method = currentQueue.id ? "PUT": "POST";
        const url = currentQueue.id ? `${API_URL/queues/${currentQueue.id}}` : `${API_URL}/queues`;

        const res = await fetch(url, {
          method,
          headers: {
            
          }
        })
      }
    }
  };

  return (
    // FIX: w-full e removido max-w-6xl
    <div className="p-8 space-y-8 w-full animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-800 dark:text-white flex items-center gap-3">
            <GitMerge className="text-indigo-500" size={32} /> Setores &
            Departamentos
          </h1>
          <p className="text-slate-500">
            Vincule atendentes aos departamentos para roteamento automático.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl font-bold transition-all shadow-lg"
        >
          <Plus size={20} /> Novo Setor
        </button>
      </header>

      {/* Grid Update: 2xl:grid-cols-4 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full py-12 flex justify-center text-indigo-500">
            <Loader2 className="animate-spin" size={32} />
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
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-red-500">
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
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4 dark:text-white">
              Editar Setor (Mock)
            </h2>
            <button
              onClick={() => setShowModal(false)}
              className="w-full py-3 bg-slate-200 rounded-xl"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Queues;
