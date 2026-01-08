// cspell:disable
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Calendar,
  Clock,
  MapPin,
  MessageSquare,
  MoreHorizontal,
  Plus,
  Search,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import TicketModal from "../components/TicketModal";
import api from "../services/api";
import { Ticket } from "../types/index";

const API_URL = import.meta.env.VITE_API_URL;

// Mock Columns
const columns = [
  { id: "open", title: "Em Aberto", color: "bg-blue-500" },
  { id: "pending", title: "Em Atendimento", color: "bg-amber-500" },
  { id: "waiting", title: "Aguardando", color: "bg-purple-500" },
  { id: "closed", title: "Finalizados", color: "bg-emerald-500" },
];

const Kanban: React.FC = () => {
  const [filterToday, setFilterToday] = useState(true);
  const [cards, setCards] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<Ticket | null>(null);

  useEffect(() => {
    fetchKanbanTickets();
  }, []);

  const fetchKanbanTickets = async () => {
    setLoading(true);
    try {
      const { data } = await api.get<Ticket[]>("/tickets");
      setCards(data);
    } catch {
      // Silent fail for preview, console log only
    } finally {
      setLoading(false);
    }
  };

  const filteredCards = cards; // Aqui viria a lógica real de filtro

  return (
    <div className="h-full flex flex-col w-full p-6 md:p-8 overflow-hidden animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between md:items-center mb-8 shrink-0 gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3 text-slate-800 dark:text-white">
            Kanban
            <span className="hidden sm:inline-block text-sm font-bold bg-indigo-600 px-3 py-1 rounded-full text-white">
              {format(new Date(), "dd 'de' MMMM", { locale: ptBR })}
            </span>
          </h1>
          <p className="text-slate-500">
            Gestão visual de O.S. e tickets do dia.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-1 sm:flex-auto">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              size={18}
            />
            <input
              type="text"
              placeholder="Buscar cards..."
              className="pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:border-indigo-600 w-full sm:w-64 text-slate-700 dark:text-slate-200 font-medium"
            />
          </div>
          <button
            onClick={() => setFilterToday(!filterToday)}
            className={`p-2.5 rounded-xl border transition-colors flex items-center justify-center gap-2 text-xs font-bold cursor-pointer ${
              filterToday
                ? "bg-indigo-600 border-indigo-500 text-white"
                : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500"
            }`}
          >
            <Calendar size={16} />
            <span className="hidden sm:inline">
              {filterToday ? "Vendo Hoje" : "Ver Todos"}
            </span>
          </button>
          <button
            onClick={() => setTicketModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg cursor-pointer"
          >
            <Plus size={20} />
            Novo Card
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-x-auto custom-scrollbar pb-4">
        {loading ? (
          <div className="flex items-center justify-center h-full w-full">
            <p className="text-slate-500 font-bold animate-pulse">
              Carregando quadro...
            </p>
          </div>
        ) : (
          <div className="flex gap-6 h-full min-w-300">
            {columns.map((col) => (
              <div
                key={col.id}
                className="w-80 lg:w-auto lg:flex-1 flex flex-col bg-slate-100 dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-800/50 shrink-0"
              >
                <div className="p-5 flex items-center justify-between border-b border-slate-200 dark:border-slate-800/50">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full ${col.color} shadow-[0_0_10px]`}
                      style={{ boxShadow: `0 0 10px var(--tw-shadow-color)` }}
                    ></div>
                    <h3 className="font-bold text-sm tracking-wide text-slate-700 dark:text-slate-200">
                      {col.title}
                    </h3>
                    <span className="bg-white dark:bg-slate-800 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {filteredCards.filter((c) => c.status === col.id).length}
                    </span>
                  </div>
                  <button className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer">
                    <MoreHorizontal size={18} />
                  </button>
                </div>

                <div className="p-4 flex-1 overflow-y-auto custom-scrollbar space-y-3">
                  {filteredCards
                    .filter((c) => c.status === col.id)
                    .map((card) => (
                      <div
                        key={card.id}
                        className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:border-indigo-500 transition-all cursor-grab group flex flex-col gap-3"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex flex-wrap gap-2">
                            {card.queue && (
                              <span className="text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wider bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                                {card.queue.name}
                              </span>
                            )}
                          </div>
                          <button className="text-slate-300 hover:text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal size={16} />
                          </button>
                        </div>

                        <div className="min-w-0">
                          <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 leading-snug wrap-break-word">
                            {card.contact?.name || "Sem nome"}
                          </h4>
                          <p className="text-xs text-slate-500 wrap-break-word mt-0.5">
                            {card.contact?.name || "Sem nome"}
                          </p>
                        </div>

                        {card.address && (
                          <div className="flex items-start gap-2 text-xs text-slate-500 bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/50">
                            <MapPin
                              size={14}
                              className="text-indigo-500 shrink-0 mt-0.5"
                            />
                            <span className="leading-relaxed wrap-break-word flex-1">
                              {card.address}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700/50 mt-auto">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-6 h-6 rounded-full border border-slate-200 dark:border-slate-600 overflow-hidden shrink-0">
                              {card.contact?.profilePicUrl ? (
                                <img
                                  src={card.contact?.profilePicUrl}
                                  className="w-full h-full object-cover"
                                  alt={card.contact?.name}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-600 text-xs font-bold">
                                  {card.contact?.name?.charAt(0) || "?"}
                                </div>
                              )}
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 truncate">
                              #{card.id}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-slate-500 shrink-0">
                            <div
                              className="flex items-center gap-1 text-[10px] font-medium"
                              title="Mensagens"
                            >
                              <MessageSquare size={12} /> 3
                            </div>
                            <div
                              className="flex items-center gap-1 text-[10px] font-medium text-amber-500"
                              title="Horário"
                            >
                              <Clock size={12} />{" "}
                              {card.UpdatedAt
                                ? format(new Date(card.UpdatedAt), "HH:mm", {
                                    locale: ptBR,
                                  })
                                : "--:--"}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                  <button className="w-full py-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-400 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2 cursor-pointer">
                    <Plus size={14} /> Adicionar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <TicketModal
        isOpen={ticketModalOpen}
        onClose={() => setTicketModalOpen(false)}
        onSuccess={fetchKanbanTickets}
      />
    </div>
  );
};

export default Kanban;
