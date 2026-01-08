// cspell:disable
import { GitMerge, Loader2, MessageSquare, User, X } from "lucide-react";
import React, { useState } from "react";
import api from "../services/api";
import { Queue } from "../types/index";

interface TicketsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const TicketModal: React.FC<TicketsModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [selectedQueueId, setSelectedQueueId] = useState<number | "">("");
  const [contactId, setContactId] = useState<number | "">("");
  const [messageBody, setMessageBody] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Inicializamos com array vazio para garantir tipagem
  const [queues, setQueues] = useState<Queue[]>([]);

  // Carregar filas ao abrir o modal
  React.useEffect(() => {
    if (isOpen) {
      const fetchQueues = async () => {
        try {
          const { data } = await api.get("/queues");

          // 🔍 LOG DE INVESTIGAÇÃO: Veja isso no F12 -> Console
          console.log("🔍 Resposta da API /queues:", data);

          // Lógica de Blindagem: Verifica o formato antes de setar
          if (Array.isArray(data)) {
            setQueues(data);
          } else if (data && Array.isArray(data.queues)) {
            // Caso o backend devolva algo como { count: 10, queues: [...] }
            setQueues(data.queues);
          } else {
            // Fallback: se não for array, força vazio para não quebrar o .map
            console.warn("⚠️ Formato de filas inesperado. Usando lista vazia.");
            setQueues([]);
          }
        } catch (err) {
          console.error("Erro ao buscar filas:", err);
          setQueues([]); // Garante que não quebra no erro
        }
      };
      fetchQueues();
    }
  }, [isOpen]);

  const handleSave = async () => {
    if (!contactId || !selectedQueueId || !messageBody) return;

    setIsSaving(true);
    try {
      await api.post("/tickets", {
        contactId: contactId,
        queueId: selectedQueueId,
        body: messageBody,
        status: "open",
      });

      onSuccess();
      onClose();
      // Limpar campos
      setContactId("");
      setSelectedQueueId("");
      setMessageBody("");
    } catch (err) {
      console.error("Erro ao criar ticket:", err);
      alert("Erro ao criar ticket. Verifique o ID do contato.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-4xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900">
          <h3 className="font-black text-lg text-slate-800 dark:text-white">
            Novo Ticket
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl text-slate-400 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body (Formulário) */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-5 bg-white dark:bg-slate-950">
          {/* Campo: ID do Contato */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
              Contato (ID)
            </label>
            <div className="relative">
              <User
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="number"
                placeholder="Ex: 1"
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold outline-none focus:border-indigo-500 transition-all text-slate-700 dark:text-slate-200"
                value={contactId}
                onChange={(e) => {
                  const val = e.target.value;
                  setContactId(val === "" ? "" : Number(val));
                }}
              />
            </div>
          </div>

          {/* Campo: Fila (Setor) */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
              Setor de Atendimento
            </label>
            <div className="relative">
              <GitMerge
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <select
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold outline-none focus:border-indigo-500 transition-all text-slate-700 dark:text-slate-200 appearance-none cursor-pointer"
                value={selectedQueueId}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedQueueId(val === "" ? "" : Number(val));
                }}
              >
                <option value="">Selecione...</option>
                {/* BLINDAGEM NO JSX: Verifica se é array antes de mapear */}
                {Array.isArray(queues) &&
                  queues.map((q) => (
                    <option key={q.id} value={q.id}>
                      {q.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Campo: Mensagem */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
              Mensagem Inicial
            </label>
            <div className="relative">
              <MessageSquare
                className="absolute left-4 top-4 text-slate-400"
                size={18}
              />
              <textarea
                placeholder="Olá, como posso ajudar?"
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-medium outline-none focus:border-indigo-500 transition-all text-slate-700 dark:text-slate-200 resize-none h-32"
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <button
            onClick={handleSave}
            disabled={
              !contactId || !selectedQueueId || !messageBody || isSaving
            }
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 cursor-pointer"
          >
            {isSaving ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              "Criar Ticket"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketModal;
