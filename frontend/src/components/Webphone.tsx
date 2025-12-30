import React, { useState, useEffect } from 'react';
import { useSip } from '../context/SipContext';
import { useLocation } from 'react-router-dom';
import { 
  Phone, 
  X, 
  Mic, 
  MicOff, 
  Hash, 
  User, 
  MoreVertical, 
  Delete, 
  PhoneOff, 
  PhoneIncoming,
  Minus,
  Maximize2
} from 'lucide-react';

const Webphone: React.FC = () => {
  const { 
    connectionStatus, 
    callStatus, 
    currentNumber, 
    callDuration,
    makeCall, 
    hangup, 
    sendDtmf 
  } = useSip();

  const [isOpen, setIsOpen] = useState(false);
  const [dialNumber, setDialNumber] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const location = useLocation();

  // Auto-open on call activity
  useEffect(() => {
      if (callStatus !== 'Idle') setIsOpen(true);
  }, [callStatus]);

  // Set initial number if calling via Click-to-Call
  useEffect(() => {
      if (callStatus === 'Calling') setDialNumber(currentNumber);
  }, [callStatus, currentNumber]);

  const handleDigit = (digit: string) => {
      setDialNumber(prev => prev + digit);
      if (callStatus === 'InCall') {
          sendDtmf(digit);
      }
  };

  const formatDuration = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (connectionStatus === 'Disconnected') return null; // Hide if not configured
  
  // Hide this widget if we are on the Dedicated Softphone Page to avoid duplicate UI
  if (location.pathname === '/softphone') return null;

  if (!isOpen) {
      return (
          <button 
            onClick={() => setIsOpen(true)}
            className={`
                fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95
                ${callStatus === 'InCall' ? 'bg-emerald-500 animate-pulse' : 'bg-indigo-600'}
                ${callStatus === 'Ringing' ? 'bg-amber-500 animate-bounce' : ''}
            `}
          >
              <Phone className="text-white" fill="currentColor" />
              {callStatus !== 'Idle' && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-slate-900"></span>
              )}
          </button>
      );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 bg-slate-900 border border-slate-700 rounded-[32px] shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-10 duration-300">
        
        {/* Header */}
        <div className={`p-4 flex justify-between items-center ${callStatus === 'InCall' ? 'bg-emerald-600' : 'bg-indigo-600'} transition-colors duration-500`}>
            <div className="flex items-center gap-2 text-white">
                <div className={`w-2 h-2 rounded-full ${connectionStatus === 'Registered' ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)]' : 'bg-red-400'}`}></div>
                <span className="text-xs font-black uppercase tracking-widest">{connectionStatus === 'Registered' ? 'Online' : 'Conectando...'}</span>
            </div>
            <div className="flex gap-2 text-white/70">
                <button onClick={() => setIsOpen(false)} className="hover:text-white"><Minus size={18}/></button>
            </div>
        </div>

        {/* Display Area */}
        <div className="flex-1 bg-slate-950 p-6 flex flex-col items-center justify-center relative min-h-[180px]">
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 to-slate-950/0 pointer-events-none"></div>
            
            {callStatus === 'Idle' ? (
                <input 
                    value={dialNumber}
                    onChange={(e) => setDialNumber(e.target.value)}
                    placeholder="Digitar..."
                    className="bg-transparent text-3xl font-thin text-white text-center w-full outline-none placeholder-slate-700"
                />
            ) : (
                <div className="text-center z-10 space-y-2">
                    <div className="w-20 h-20 bg-slate-800 rounded-full mx-auto flex items-center justify-center border-4 border-slate-800 shadow-xl mb-4">
                        <User size={40} className="text-slate-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">{currentNumber || dialNumber}</h3>
                    <p className="text-emerald-400 font-mono font-bold text-sm tracking-widest">
                        {callStatus === 'Calling' ? 'Chamando...' : 
                         callStatus === 'Ringing' ? 'Recebendo Chamada...' : 
                         formatDuration(callDuration)}
                    </p>
                </div>
            )}
        </div>

        {/* Controls / Keypad */}
        <div className="bg-slate-900 p-4">
            {callStatus === 'Idle' && (
                <div className="grid grid-cols-3 gap-3 mb-4">
                    {['1','2','3','4','5','6','7','8','9','*','0','#'].map(digit => (
                        <button 
                            key={digit}
                            onClick={() => handleDigit(digit)}
                            className="h-12 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-lg transition-colors active:scale-95"
                        >
                            {digit}
                        </button>
                    ))}
                </div>
            )}

            <div className="flex items-center justify-around pb-2">
                {callStatus === 'Idle' ? (
                    <button 
                        onClick={() => makeCall(dialNumber)}
                        disabled={!dialNumber}
                        className="w-16 h-16 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-900/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Phone size={28} fill="currentColor" />
                    </button>
                ) : (
                    <>
                        <button 
                            onClick={() => setIsMuted(!isMuted)}
                            className={`p-4 rounded-xl ${isMuted ? 'bg-white text-slate-900' : 'bg-slate-800 text-slate-400'} hover:bg-slate-700 transition-colors`}
                        >
                            {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                        </button>
                        
                        <button 
                            onClick={() => hangup()}
                            className="w-16 h-16 bg-red-500 hover:bg-red-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-red-900/20 active:scale-95 transition-all"
                        >
                            <PhoneOff size={28} fill="currentColor" />
                        </button>

                        <button className="p-4 rounded-xl bg-slate-800 text-slate-400 hover:bg-slate-700 transition-colors">
                            <Hash size={24} />
                        </button>
                    </>
                )}
            </div>
        </div>
    </div>
  );
};

export default Webphone;