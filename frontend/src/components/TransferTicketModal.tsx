import {
  ArrowRight,
  Check,
  GitMerge,
  Loader2,
  Search,
  User,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";

const API_URL = process.env.VITE_API_URL;

interface Queue {
  id: number;
  name: string;
  color: string;
}

interface User {
  id: number;
  name: string;
}

interface Props {
  ticketId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const TransferTicketModal: React.FC<Props> = ({
  ticketId,
  onClose,
  onSuccess,
}) => {
  const [tab, setTab] = useState<"queue" | "user">("queue");
  const [queues, setQueues] = useState<Queue[]>([]);
  const [users, setUsers] = useState<User[]>([]); // In real app, fetch users
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const queueRes = await fetch(`${API_URL}/api/queues`, {
        headers: { Authorization: "Bearer token" },
      });
      if (queueRes.ok) setQueues(await queueRes.json());

      // Mock Users for demo (Backend doesn't have list users endpoint implemented in provided files)
      setUsers([
        { id: 1, name: "Admin" },
        { id: 2, name: "Maria Atendente" },
        { id: 3, name: "João Técnico" },
      ]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async () => {
    if (!selectedId) return;
    setIsSaving(true);
    try {
      const payload =
        tab === "queue"
          ? { queueId: selectedId, userId: null, status: "pending" }
          : { userId: selectedId, queueId: null };

      await fetch(`${API_URL}/api/tickets/${ticketId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer token",
        },
        body: JSON.stringify(payload),
      });
      onSuccess();
      onClose();
    } catch (error) {
      alert("Erro ao transferir.");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredList =
    tab === "queue"
      ? queues.filter((q) =>
          q.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : users.filter((u) =>
          u.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900">
          <h3 className="font-black text-lg">Transferir Ticket</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl text-slate-400"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="p-4 flex gap-2 border-b border-slate-100 dark:border-slate-800">
          <button
            onClick={() => {
              setTab("queue");
              setSelectedId(null);
            }}
            className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
              tab === "queue"
                ? "bg-indigo-600 text-white shadow-lg"
                : "bg-slate-100 dark:bg-slate-800 text-slate-500"
            }`}
          >
            <GitMerge size={16} /> Para Setor
          </button>
          <button
            onClick={() => {
              setTab("user");
              setSelectedId(null);
            }}
            className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
              tab === "user"
                ? "bg-indigo-600 text-white shadow-lg"
                : "bg-slate-100 dark:bg-slate-800 text-slate-500"
            }`}
          >
            <User size={16} /> Para Atendente
          </button>
        </div>

        {/* Search */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Buscar..."
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold outline-none focus:border-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2 bg-slate-50 dark:bg-slate-950">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-indigo-500" />
            </div>
          ) : filteredList.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs font-bold uppercase">
              Nenhum resultado encontrado.
            </div>
          ) : (
            filteredList.map((item: any) => (
              <div
                key={item.id}
                onClick={() => setSelectedId(item.id)}
                className={`p-4 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                  selectedId === item.id
                    ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 ring-1 ring-indigo-500"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                      tab === "queue" ? "bg-indigo-500" : "bg-emerald-500"
                    }`}
                    style={item.color ? { backgroundColor: item.color } : {}}
                  >
                    {item.name.charAt(0)}
                  </div>
                  <span className="font-bold text-sm text-slate-700 dark:text-slate-200">
                    {item.name}
                  </span>
                </div>
                {selectedId === item.id && (
                  <Check
                    className="text-indigo-600 dark:text-indigo-400"
                    size={20}
                  />
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <button
            onClick={handleTransfer}
            disabled={!selectedId || isSaving}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
          >
            {isSaving ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <ArrowRight size={20} />
            )}
            Confirmar Transferência
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransferTicketModal;
