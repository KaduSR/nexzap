import {
  Brain,
  Check,
  Copy,
  Frown,
  Loader2,
  Meh,
  RefreshCw,
  Smile,
  Sparkles,
} from "lucide-react";
import React, { useState } from "react";

interface TicketAiPanelProps {
  ticketId: string;
  onClose?: () => void;
}

const API_URL = import.meta.env.VITE_API_URL;

const TicketAiPanel: React.FC<TicketAiPanelProps> = ({ ticketId, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_URL}/api/tickets/${ticketId}/ai-analysis`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        setData(await res.json());
      } else {
        alert(
          "Não foi possível gerar a análise. Verifique se há mensagens suficientes."
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (data?.suggestion) {
      navigator.clipboard.writeText(data.suggestion);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Determine sentiment color/icon
  const getSentimentInfo = () => {
    if (!data)
      return { color: "text-slate-400", bg: "bg-slate-200", icon: <Meh /> };

    if (data.sentiment === "negative")
      return {
        color: "text-red-500",
        bg: "bg-red-500",
        icon: <Frown size={28} />,
      };
    if (data.sentiment === "positive")
      return {
        color: "text-emerald-500",
        bg: "bg-emerald-500",
        icon: <Smile size={28} />,
      };
    return {
      color: "text-amber-500",
      bg: "bg-amber-500",
      icon: <Meh size={28} />,
    };
  };

  const sentiment = getSentimentInfo();

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 w-full animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-6 bg-gradient-to-br from-indigo-600 to-violet-700 text-white shrink-0">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <Sparkles className="text-yellow-300" fill="currentColor" />
            <h3 className="font-black text-lg">Copiloto IA</h3>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white"
            >
              x
            </button>
          )}
        </div>
        <p className="text-indigo-100 text-xs font-medium mt-1 opacity-80">
          Análise de sentimento e sugestões inteligentes.
        </p>
      </div>

      {/* Content */}
      <div className="p-6 flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-6">
        {!data && !loading && (
          <div className="flex flex-col items-center justify-center flex-1 text-center space-y-4 opacity-70">
            <div className="w-20 h-20 bg-indigo-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
              <Brain size={32} className="text-indigo-500" />
            </div>
            <p className="text-sm font-bold text-slate-500">
              Clique abaixo para analisar a conversa e obter insights.
            </p>
            <button
              onClick={handleAnalyze}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/30 transition-all flex items-center gap-2"
            >
              <Sparkles size={18} /> Gerar Análise
            </button>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center flex-1 space-y-4">
            <Loader2 size={40} className="animate-spin text-indigo-500" />
            <p className="text-xs font-black uppercase tracking-widest text-slate-400 animate-pulse">
              Analisando Conversa...
            </p>
          </div>
        )}

        {data && !loading && (
          <>
            {/* Sentiment Section */}
            <div className="space-y-2">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                Humor do Cliente
              </h4>
              <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className={`${sentiment.color}`}>{sentiment.icon}</div>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="capitalize text-slate-700 dark:text-slate-200">
                      {data.sentiment === "positive"
                        ? "Satisfeito"
                        : data.sentiment === "negative"
                        ? "Insatisfeito"
                        : "Neutro"}
                    </span>
                    <span className={sentiment.color}>
                      {data.sentimentScore}%
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${sentiment.bg} transition-all duration-1000 ease-out`}
                      style={{ width: `${data.sentimentScore}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Section */}
            <div className="space-y-2">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                Resumo Executivo
              </h4>
              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-300 leading-relaxed shadow-sm">
                {data.summary}
              </div>
            </div>

            {/* Suggestion Section */}
            <div className="space-y-2">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                Sugestão de Resposta
              </h4>
              <div className="bg-indigo-50 dark:bg-indigo-900/10 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 relative group">
                <p className="text-sm text-indigo-900 dark:text-indigo-200 italic pr-6">
                  "{data.suggestion}"
                </p>
                <button
                  onClick={handleCopy}
                  className="absolute top-3 right-3 p-1.5 bg-white dark:bg-slate-800 rounded-lg text-indigo-500 hover:text-indigo-600 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Copiar"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            {/* Footer Action */}
            <button
              onClick={handleAnalyze}
              className="w-full py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-indigo-600 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all mt-auto"
            >
              <RefreshCw size={14} /> Atualizar Dados
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default TicketAiPanel;
