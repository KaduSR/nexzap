import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Calendar as CalendarIcon,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  Plus,
  User,
  Video,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";

const API_URL = process.env.VITE_API_URL;

interface CalendarEvent {
  id: string | number;
  date: Date;
  title: string;
  type: "campaign" | "ticket" | "task";
  color: string;
  description?: string;
  time?: string;
}

const Calendar: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [googleConnected, setGoogleConnected] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // New Event Form State
  const [newEvent, setNewEvent] = useState({
    title: "",
    date: format(new Date(), "yyyy-MM-dd"),
    time: "09:00",
    message: "",
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const fetchedEvents: CalendarEvent[] = [];

      // 1. Fetch Kanban Tickets (Tasks)
      const ticketsRes = await fetch(`${API_URL}/api/tickets/kanban`, {
        headers: { Authorization: "Bearer token" },
      });
      if (ticketsRes.ok) {
        const tickets = await ticketsRes.json();
        tickets.forEach((t: any) => {
          fetchedEvents.push({
            id: `ticket-${t.id}`,
            date: new Date(t.updatedAt),
            title: `Ticket: ${t.contact?.name || "Sem nome"}`,
            type: "ticket",
            color: "bg-amber-500",
            time: format(new Date(t.updatedAt), "HH:mm"),
          });
        });
      }

      // 2. Fetch Campaigns
      const campaignsRes = await fetch(`${API_URL}/api/campaigns`, {
        headers: { Authorization: "Bearer token" },
      });
      if (campaignsRes.ok) {
        const campaigns = await campaignsRes.json();
        campaigns.forEach((c: any) => {
          fetchedEvents.push({
            id: `camp-${c.id}`,
            date: new Date(c.scheduledAt),
            title: `Campanha: ${c.name}`,
            type: "campaign",
            color: "bg-emerald-600",
            time: format(new Date(c.scheduledAt), "HH:mm"),
          });
        });
      }

      setEvents(fetchedEvents);
    } catch (error) {
      // Silent fail for preview, console log only
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      // Create as a Campaign in Backend
      const res = await fetch(`${API_URL}/api/campaigns`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer token",
        },
        body: JSON.stringify({
          name: newEvent.title,
          message1: newEvent.message,
          scheduledAt: `${newEvent.date}T${newEvent.time}:00.000Z`,
          status: "SCHEDULED",
        }),
      });

      if (res.ok) {
        await fetchEvents(); // Refresh calendar
        setShowEventModal(false);
        setNewEvent({
          title: "",
          date: format(new Date(), "yyyy-MM-dd"),
          time: "09:00",
          message: "",
        });
        alert("Evento/Campanha criado com sucesso!");
      } else {
        alert("Erro ao criar evento. Verifique se o backend está online.");
      }
    } catch (err) {
      console.error(err);
      alert("Erro de conexão.");
    } finally {
      setIsCreating(false);
    }
  };

  const renderHeader = () => {
    return (
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">
            Calendário
          </h1>
          <p className="text-slate-400">
            Agendamentos, Campanhas e Tarefas do Kanban.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => setGoogleConnected(!googleConnected)}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all ${
              googleConnected
                ? "bg-white text-indigo-600 border-white"
                : "bg-transparent text-slate-400 border-slate-600 hover:border-slate-400"
            }`}
          >
            {googleConnected ? <Check size={14} /> : <CalendarIcon size={14} />}
            {googleConnected ? "Google Conectado" : "Conectar Google"}
          </button>
          <button
            onClick={() => setShowEventModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-xl transition-all shadow-lg shadow-indigo-900/20 flex items-center gap-2 font-bold text-xs pr-4"
          >
            <Plus size={18} /> Criar Evento
          </button>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const dateFormat = "EEE";
    const days = [];
    let startDate = startOfWeek(currentMonth);

    for (let i = 0; i < 7; i++) {
      days.push(
        <div
          className="py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-widest"
          key={i}
        >
          {format(addDays(startDate, i), dateFormat, { locale: ptBR })}
        </div>
      );
    }
    return (
      <div className="grid grid-cols-7 border-b border-slate-800 bg-slate-900/50">
        {days}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const dateFormat = "d";
    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = "";

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, dateFormat);
        const cloneDay = day;

        // Find events for this day
        const dayEvents = events.filter((e) => isSameDay(e.date, cloneDay));

        days.push(
          <div
            className={`border-r border-b border-slate-800 p-2 relative group transition-colors min-h-[100px] flex flex-col hover:bg-slate-800/30 ${
              !isSameMonth(day, monthStart)
                ? "bg-slate-950/30 text-slate-700"
                : "text-slate-300"
            } ${isSameDay(day, new Date()) ? "bg-indigo-900/10" : ""}`}
            key={day.toString()}
          >
            <div className="flex justify-between items-start">
              <span
                className={`text-sm font-medium p-1 ${
                  isSameDay(day, new Date())
                    ? "bg-indigo-600 text-white rounded-full w-7 h-7 flex items-center justify-center"
                    : ""
                }`}
              >
                {formattedDate}
              </span>
              {!isSameMonth(day, monthStart) ? null : (
                <button
                  onClick={() => {
                    setNewEvent({
                      ...newEvent,
                      date: format(cloneDay, "yyyy-MM-dd"),
                    });
                    setShowEventModal(true);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-indigo-400 transition-opacity"
                >
                  <Plus size={14} />
                </button>
              )}
            </div>

            <div className="mt-1 space-y-1 overflow-y-auto custom-scrollbar max-h-[80px]">
              {dayEvents.map((evt, idx) => (
                <div
                  key={idx}
                  className={`text-[9px] font-bold px-2 py-1 rounded-md text-white truncate shadow-sm cursor-pointer hover:opacity-80 flex items-center gap-1 ${evt.color}`}
                >
                  {evt.type === "campaign" && <User size={10} />}
                  {evt.type === "ticket" && <Clock size={10} />}
                  {evt.time} {evt.title}
                </div>
              ))}
              {googleConnected &&
                Math.random() > 0.8 &&
                isSameMonth(day, monthStart) && (
                  <div className="text-[9px] font-bold px-2 py-1 rounded-md text-white truncate shadow-sm bg-blue-600 flex items-center gap-1">
                    <Video size={10} /> Google Meet
                  </div>
                )}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7 flex-1" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }
    return <div className="flex-1 flex flex-col">{rows}</div>;
  };

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  return (
    <div className="p-4 md:p-8 h-full flex flex-col bg-slate-950 text-white animate-in fade-in duration-500 relative">
      {renderHeader()}

      <div className="flex-1 flex flex-col lg:flex-row gap-8 overflow-hidden">
        {/* Main Calendar Grid */}
        <div className="flex-1 flex flex-col bg-slate-900 border border-slate-800 rounded-[32px] overflow-hidden shadow-xl min-h-[600px]">
          <div className="p-6 flex items-center justify-between border-b border-slate-800">
            <h2 className="text-xl font-bold capitalize">
              {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={prevMonth}
                className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => setCurrentMonth(new Date())}
                className="px-3 py-1 bg-slate-800 rounded-lg text-xs font-bold text-slate-300 hover:text-white"
              >
                Hoje
              </button>
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {renderDays()}
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 size={40} className="animate-spin text-indigo-600" />
            </div>
          ) : (
            renderCells()
          )}
        </div>

        {/* Side Panel */}
        <div className="w-full lg:w-80 shrink-0 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[32px] p-6 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
            <h3 className="font-bold text-lg mb-1">Próximo Evento</h3>
            {googleConnected ? (
              <>
                <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-6">
                  Em 30 minutos
                </p>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Video size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-sm">Demo Produto</p>
                      <p className="text-[10px] opacity-80">Google Meet</p>
                    </div>
                  </div>
                  <div className="flex -space-x-2">
                    {[1, 2].map((i) => (
                      <img
                        key={i}
                        src={`https://picsum.photos/seed/${i}/30`}
                        className="w-8 h-8 rounded-full border-2 border-indigo-500"
                        alt=""
                      />
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <CalendarIcon
                  className="mx-auto mb-2 text-white/50"
                  size={32}
                />
                <p className="text-xs text-white/70">
                  Conecte o Google Calendar para ver suas reuniões aqui.
                </p>
              </div>
            )}
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-[32px] p-6 flex-1 flex flex-col">
            <h3 className="font-bold text-lg mb-4">Eventos do Dia</h3>
            <div className="space-y-4 flex-1">
              {events.filter((e) => isSameDay(e.date, new Date())).length ===
              0 ? (
                <p className="text-xs text-slate-500">
                  Nenhum evento para hoje.
                </p>
              ) : (
                events
                  .filter((e) => isSameDay(e.date, new Date()))
                  .map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 group cursor-pointer border-l-2 border-slate-700 pl-3 hover:border-indigo-500 transition-colors"
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-500">
                          {item.time}
                        </p>
                        <p className="text-sm font-bold text-slate-200">
                          {item.title}
                        </p>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CREATE EVENT MODAL */}
      {showEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900">
              <h3 className="font-black text-lg">Criar Campanha / Evento</h3>
              <button
                onClick={() => setShowEventModal(false)}
                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl text-slate-400"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateEvent} className="p-8 space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">
                  Título do Evento
                </label>
                <input
                  type="text"
                  required
                  value={newEvent.title}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, title: e.target.value })
                  }
                  placeholder="Ex: Lembrete de Reunião"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 font-bold"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    Data
                  </label>
                  <input
                    type="date"
                    required
                    value={newEvent.date}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, date: e.target.value })
                    }
                    className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    Hora
                  </label>
                  <input
                    type="time"
                    required
                    value={newEvent.time}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, time: e.target.value })
                    }
                    className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 font-bold"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">
                  Mensagem da Campanha (Opcional)
                </label>
                <textarea
                  rows={3}
                  value={newEvent.message}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, message: e.target.value })
                  }
                  placeholder="Se preenchido, criará uma campanha de envio em massa..."
                  className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 text-sm resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={isCreating}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/20 active:scale-95 transition-all"
              >
                {isCreating ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Check size={18} />
                )}
                Agendar Evento
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
