import {
  AlertTriangle,
  Check,
  CreditCard,
  Crown,
  FileText,
  Loader2,
  QrCode,
  Rocket,
  Shield,
  Zap,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const API_URL = process.env.VITE_API_URL;

const Subscription: React.FC = () => {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "pix">("card"); // Novo Estado
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const status = searchParams.get("status");

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/companies/plans`, {
        headers: { Authorization: "Bearer token" },
      });
      if (res.ok) {
        const data = await res.json();
        setPlans(data);
      }
    } catch (e) {
      console.error("Error fetching plans", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId: number) => {
    setProcessingId(planId);
    try {
      const res = await fetch(`${API_URL}/api/subscription/create-checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer token",
        },
        body: JSON.stringify({
          planId,
          paymentMethod, // Envia o método escolhido
          frontendUrl: window.location.origin,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          // Redireciona para o Stripe (Checkout ou Fatura)
          window.location.href = data.url;
        } else {
          alert("Modo Desenvolvimento: Simulação de pagamento concluída.");
          navigate("/subscription?status=success");
        }
      } else {
        const err = await res.json();
        alert(err.error || "Erro ao iniciar pagamento.");
      }
    } catch (e) {
      alert("Erro de conexão.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="p-8 space-y-10 max-w-7xl mx-auto animate-in fade-in duration-500">
      {status === "success" && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 p-6 rounded-[24px] text-center mb-8 animate-in zoom-in duration-300">
          <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white shadow-lg shadow-emerald-500/30">
            <Check size={32} strokeWidth={3} />
          </div>
          <h2 className="text-2xl font-black text-emerald-500 mb-2">
            Pagamento Confirmado!
          </h2>
          <p className="text-slate-400">
            Sua assinatura está ativa. Aproveite todos os recursos.
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="mt-6 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-all"
          >
            Ir para o Dashboard
          </button>
        </div>
      )}

      {status === "canceled" && (
        <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl flex items-center justify-center gap-3 text-amber-500 font-bold mb-8">
          <AlertTriangle /> O pagamento foi cancelado. Nenhuma cobrança foi
          realizada.
        </div>
      )}

      <header className="text-center max-w-2xl mx-auto space-y-4">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white">
          Planos e Preços
        </h1>
        <p className="text-slate-400 text-lg">
          Escale seu atendimento com ferramentas profissionais.
        </p>
      </header>

      {/* SELETOR DE MÉTODO DE PAGAMENTO */}
      <div className="flex flex-col items-center mt-8 space-y-3">
        <div className="bg-slate-900 p-1.5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row gap-1 shadow-xl">
          <button
            onClick={() => setPaymentMethod("card")}
            className={`flex items-center gap-3 px-6 py-3 rounded-xl font-bold text-sm transition-all ${
              paymentMethod === "card"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <CreditCard size={18} />
            Cartão de Crédito
            <span className="hidden sm:inline opacity-60 text-[10px] uppercase tracking-wider ml-1 bg-black/20 px-1.5 py-0.5 rounded">
              Auto
            </span>
          </button>
          <button
            onClick={() => setPaymentMethod("pix")}
            className={`flex items-center gap-3 px-6 py-3 rounded-xl font-bold text-sm transition-all ${
              paymentMethod === "pix"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <QrCode size={18} />
            Pix / Boleto
            <span className="hidden sm:inline opacity-60 text-[10px] uppercase tracking-wider ml-1 bg-black/20 px-1.5 py-0.5 rounded">
              Fatura
            </span>
          </button>
        </div>
        <p className="text-xs text-slate-500 font-medium max-w-md text-center">
          {paymentMethod === "card"
            ? "Cobrança automática mensal no cartão. Liberação imediata."
            : "Você receberá uma fatura por email todo mês com código Pix e Boleto. Liberação após pagamento."}
        </p>
      </div>

      {/* Pricing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
        {loading ? (
          <div className="col-span-full py-20 flex justify-center">
            <Loader2 size={48} className="animate-spin text-indigo-500" />
          </div>
        ) : (
          plans.map((plan, index) => {
            const isPopular = plan.name.includes("Pro");
            const isEnterprise = plan.name.includes("Enterprise");

            return (
              <div
                key={plan.id}
                className={`relative flex flex-col p-8 rounded-[32px] border-2 transition-all duration-300 hover:-translate-y-2
                            ${
                              isPopular
                                ? "bg-slate-900 border-indigo-500 shadow-2xl shadow-indigo-900/20 z-10 scale-105"
                                : "bg-slate-950 border-slate-800 hover:border-slate-700"
                            }
                        `}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                    Mais Popular
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-lg font-bold text-slate-400 uppercase tracking-widest mb-2">
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-white">
                      {isEnterprise
                        ? "R$ 697"
                        : isPopular
                        ? "R$ 397"
                        : "R$ 197"}
                    </span>
                    <span className="text-slate-500 font-medium">/mês</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-center gap-3 text-slate-300 text-sm">
                    <div className="p-1 bg-emerald-500/10 rounded-full text-emerald-500">
                      <Check size={12} strokeWidth={3} />
                    </div>
                    <span>
                      {plan.users === 0
                        ? "Usuários Ilimitados"
                        : `${plan.users} Usuários`}
                    </span>
                  </li>
                  <li className="flex items-center gap-3 text-slate-300 text-sm">
                    <div className="p-1 bg-emerald-500/10 rounded-full text-emerald-500">
                      <Check size={12} strokeWidth={3} />
                    </div>
                    <span>
                      {plan.connections === 0
                        ? "Conexões Ilimitadas"
                        : `${plan.connections} WhatsApps`}
                    </span>
                  </li>
                  <li className="flex items-center gap-3 text-slate-300 text-sm">
                    <div className="p-1 bg-emerald-500/10 rounded-full text-emerald-500">
                      <Check size={12} strokeWidth={3} />
                    </div>
                    <span>
                      {plan.queues === 0
                        ? "Setores Ilimitados"
                        : `${plan.queues} Setores`}
                    </span>
                  </li>

                  {plan.useCampaigns && (
                    <li className="flex items-center gap-3 text-white font-bold text-sm">
                      <div className="p-1 bg-indigo-500/20 rounded-full text-indigo-400">
                        <Zap size={12} strokeWidth={3} />
                      </div>
                      Campanhas em Massa
                    </li>
                  )}
                  {plan.useIntegrations && (
                    <li className="flex items-center gap-3 text-white font-bold text-sm">
                      <div className="p-1 bg-indigo-500/20 rounded-full text-indigo-400">
                        <Rocket size={12} strokeWidth={3} />
                      </div>
                      Integração IXC/VoIP
                    </li>
                  )}
                  {plan.useOpenAi && (
                    <li className="flex items-center gap-3 text-white font-bold text-sm">
                      <div className="p-1 bg-purple-500/20 rounded-full text-purple-400">
                        <Crown size={12} strokeWidth={3} />
                      </div>
                      Inteligência Artificial
                    </li>
                  )}
                </ul>

                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={processingId === plan.id}
                  className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95
                                ${
                                  isPopular
                                    ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20"
                                    : "bg-slate-800 hover:bg-slate-700 text-white"
                                }
                            `}
                >
                  {processingId === plan.id ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : paymentMethod === "card" ? (
                    <CreditCard size={20} />
                  ) : (
                    <FileText size={20} />
                  )}

                  {processingId === plan.id
                    ? "Processando..."
                    : paymentMethod === "card"
                    ? "Assinar com Cartão"
                    : "Gerar Fatura Pix"}
                </button>
              </div>
            );
          })
        )}
      </div>

      <div className="text-center pt-12 border-t border-slate-800">
        <div className="flex items-center justify-center gap-2 text-slate-500 text-sm mb-2">
          <Shield size={16} /> Pagamento seguro via Stripe
        </div>
        <p className="text-slate-600 text-xs">
          Dúvidas? Entre em contato com nosso{" "}
          <a href="#" className="text-indigo-500 hover:underline">
            suporte
          </a>
          .
        </p>
      </div>
    </div>
  );
};

export default Subscription;
