// cspell: disable
import { format } from "date-fns";
import { Phone, Search, User } from "lucide-react";
import React, { useState } from "react";

// Mock Context Hook replacement for UI only
const useSip = () => ({
  makeCall: (n: string) => console.log(n),
  hangup: () => {},
  sendDtmf: (d: string) => {},
  connectionStatus: "Registered",
  callStatus: "Idle",
  currentNumber: "",
  callDuration: 0,
  recentCalls: [
    {
      id: 1,
      number: "1199999999",
      type: "incoming" as const,
      date: new Date().toISOString(),
      name: "João",
    },
  ],
});

const Softphone: React.FC = () => {
  const {
    makeCall,
    hangup,
    connectionStatus,
    callStatus,
    callDuration,
    recentCalls,
  } = useSip();
  const [dialNumber, setDialNumber] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  return (
    // FIX: Removido bg-slate-950, adicionado w-full h-full
    <div className="h-full w-full flex bg-slate-950 text-white animate-in fade-in duration-500">
      {/* LEFT PANEL */}
      <div className="w-96 border-r border-slate-800 flex flex-col bg-slate-900">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-2xl font-black mb-1">Telefone</h2>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <div
              className={`w-2 h-2 rounded-full ${
                connectionStatus === "Registered"
                  ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                  : "bg-red-500"
              }`}
            ></div>
            {connectionStatus === "Registered"
              ? "Linha Pronta"
              : "Desconectado"}
          </div>
        </div>
        <div className="p-4 border-b border-slate-800">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              size={18}
            />
            <input
              type="text"
              placeholder="Buscar no histórico..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm font-medium outline-none focus:border-indigo-600"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {recentCalls.map((call) => (
            <div
              key={call.id}
              className="p-4 hover:bg-slate-800/50 cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold border border-slate-700">
                  {call.name ? call.name[0] : <User />}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-200">
                    {call.name}
                  </p>
                  <span className="text-xs text-slate-500">
                    {format(new Date(call.date), "dd/MM HH:mm")}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL: DIALER */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center relative">
            <input
              value={dialNumber}
              onChange={(e) => setDialNumber(e.target.value)}
              placeholder="Digite o número..."
              className="bg-transparent text-4xl font-thin text-white text-center w-full outline-none placeholder-slate-700 tracking-wider"
              autoFocus
            />
          </div>
          <div className="grid grid-cols-3 gap-4 mb-8">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"].map(
              (digit) => (
                <button
                  key={digit}
                  onClick={() => setDialNumber((prev) => prev + digit)}
                  className="h-16 rounded-2xl bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 text-white font-medium text-2xl transition-all active:scale-95 shadow-lg"
                >
                  {digit}
                </button>
              )
            )}
          </div>
          <div className="flex items-center justify-center gap-6">
            <button className="w-20 h-20 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-[0_0_40px_-10px_rgba(16,185,129,0.5)] transition-all hover:scale-110 active:scale-95">
              <Phone size={32} fill="currentColor" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Softphone;
