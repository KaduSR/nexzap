// cspell: disable
import React, { useState } from "react";
import { useSip, CallLog } from "../context/SipContext";
import {
  Phone,
  PhoneIncoming,
  PhoneMissed,
  PhoneOutgoing,
  Clock,
  User,
  Delete,
  Search,
  UserPlus,
  Mic,
  MicOff,
  PhoneOff,
  Pause,
  Play,
} from "lucide-react";
import { format } from "date-fns";

const Softphone: React.FC = () => {
  const {
    makeCall,
    hangup,
    sendDtmf,
    connectionStatus,
    callStatus,
    currentNumber,
    callDuration,
    recentCalls,
  } = useSip();

  const [dialNumber, setDialNumber] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isMuted, setIsMuted] = useState(false);

  // Sync current number if call starts externally
  React.useEffect(() => {
    if (callStatus !== "Idle" && currentNumber) {
      setDialNumber(currentNumber);
    }
  }, [callStatus, currentNumber]);

  const handleDigit = (digit: string) => {
    setDialNumber((prev) => prev + digit);
    if (callStatus === "InCall") {
      sendDtmf(digit);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const filteredCalls = recentCalls.filter(
    (call) =>
      call.number.includes(searchTerm) ||
      (call.name && call.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getCallIcon = (type: CallLog["type"]) => {
    switch (type) {
      case "incoming":
        return <PhoneIncoming size={16} className="text-blue-500" />;
      case "outgoing":
        return <PhoneOutgoing size={16} className="text-emerald-500" />;
      case "missed":
        return <PhoneMissed size={16} className="text-red-500" />;
    }
  };

  return (
    <div className="h-full flex bg-slate-950 text-white animate-in fade-in duration-500">
      {/* LEFT PANEL: HISTORY & CONTACTS */}
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
          {filteredCalls.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              Nenhuma chamada recente.
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {filteredCalls.map((call) => (
                <div
                  key={call.id}
                  onClick={() => setDialNumber(call.number)}
                  className="p-4 hover:bg-slate-800/50 cursor-pointer transition-colors flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 font-bold border border-slate-700">
                      {call.name ? call.name[0] : <User size={18} />}
                    </div>
                    <div>
                      <p
                        className={`text-sm font-bold ${
                          call.type === "missed"
                            ? "text-red-400"
                            : "text-slate-200"
                        }`}
                      >
                        {call.name || call.number}
                      </p>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        {getCallIcon(call.type)}
                        <span>
                          {format(new Date(call.date), "dd/MM HH:mm")}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button className="p-2 text-slate-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <Phone size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANEL: DIALER */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950">
        <div className="w-full max-w-sm">
          {/* DISPLAY */}
          <div className="mb-8 text-center relative">
            {callStatus === "Idle" ? (
              <>
                <input
                  value={dialNumber}
                  onChange={(e) =>
                    setDialNumber(e.target.value.replace(/\D/g, ""))
                  }
                  placeholder="Digite o número..."
                  className="bg-transparent text-4xl font-thin text-white text-center w-full outline-none placeholder-slate-700 tracking-wider"
                  autoFocus
                />
                {dialNumber && (
                  <button
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-indigo-500 text-xs font-bold flex items-center gap-1 hover:text-indigo-400"
                    title="Adicionar aos contatos"
                  >
                    <UserPlus size={16} /> Salvar
                  </button>
                )}
              </>
            ) : (
              <div className="animate-in zoom-in duration-300">
                <div className="w-24 h-24 rounded-full bg-slate-800 mx-auto mb-4 border-4 border-slate-700 flex items-center justify-center shadow-2xl relative">
                  <User size={48} className="text-slate-500" />
                  <span className="absolute -bottom-2 bg-emerald-500 text-slate-900 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                    {callStatus}
                  </span>
                </div>
                <h2 className="text-3xl font-bold text-white mb-1">
                  {dialNumber}
                </h2>
                <p className="text-emerald-400 font-mono text-lg font-medium">
                  {formatDuration(callDuration)}
                </p>
              </div>
            )}
          </div>

          {/* KEYPAD */}
          {callStatus === "Idle" && (
            <div className="grid grid-cols-3 gap-4 mb-8">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"].map(
                (digit) => (
                  <button
                    key={digit}
                    onClick={() => handleDigit(digit)}
                    className="h-16 rounded-2xl bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 text-white font-medium text-2xl transition-all active:scale-95 shadow-lg"
                  >
                    {digit}
                  </button>
                )
              )}
            </div>
          )}

          {/* ACTIONS */}
          <div className="flex items-center justify-center gap-6">
            {callStatus === "Idle" ? (
              <button
                onClick={() => makeCall(dialNumber)}
                disabled={!dialNumber}
                className="w-20 h-20 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-[0_0_40px_-10px_rgba(16,185,129,0.5)] transition-all hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
              >
                <Phone size={32} fill="currentColor" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                    isMuted
                      ? "bg-white text-slate-900"
                      : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                  }`}
                >
                  {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                </button>

                <button
                  onClick={() => hangup()}
                  className="w-20 h-20 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-[0_0_40px_-10px_rgba(239,68,68,0.5)] transition-all hover:scale-110 active:scale-95"
                >
                  <PhoneOff size={32} fill="currentColor" />
                </button>

                <button className="w-16 h-16 rounded-full bg-slate-800 text-slate-400 hover:bg-slate-700 flex items-center justify-center transition-all">
                  <Pause size={24} fill="currentColor" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Softphone;
