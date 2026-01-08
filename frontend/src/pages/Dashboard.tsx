// cspell: disable
import {
  Ban,
  CheckCircle2,
  Clock,
  DollarSign,
  MessageCircle,
  MoreHorizontal,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
  WifiOff,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { io } from "socket.io-client";

const API_URL = import.meta.env.VITE_API_URL;
const socketUrl = import.meta.env.VITE_API_URL;

const pieData = [
  { name: "Vendas", value: 400, color: "#6366f1" },
  { name: "Suporte", value: 300, color: "#0ea5e9" },
  { name: "Financeiro", value: 200, color: "#10b981" },
  { name: "Retenção", value: 100, color: "#f59e0b" },
];

const Dashboard: React.FC = () => {
  const [financialData, setFinancialData] = useState<any>(null);
  const [loadingFinancial, setLoadingFinancial] = useState(true);
  const [error, setError] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    fetchFinancialData();

    try {
      const socket = io(socketUrl);
      const companyId = 1;

      socket.on(`company-${companyId}-payment`, (payload: any) => {
        setFinancialData((prev: any) => {
          if (!prev) return prev;
          const amount = parseFloat(payload.invoice.value);
          const newTodayRevenue = parseFloat(prev.todayRevenue) + amount;
          const todayStr = new Date().toISOString().split("T")[0];
          const newChartData = prev.chartData.map((d: any) => {
            if (d.date === todayStr) {
              return { ...d, value: parseFloat(d.value) + amount };
            }
            return d;
          });
          return {
            ...prev,
            todayRevenue: newTodayRevenue,
            chartData: newChartData,
          };
        });
      });

      return () => {
        socket.disconnect();
      };
    } catch (err) {
      console.warn("Socket IO connection failed.");
    }
  }, []);

  const fetchFinancialData = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/api/financial/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setFinancialData(await res.json());
        setError(false);
      } else {
        throw new Error("Failed");
      }
    } catch (error) {
      console.error(
        "Error fetching financial data. Backend might be offline.",
        error
      );
      setError(true);
      // Set dummy data for preview so UI doesn't look broken
      setFinancialData({
        todayRevenue: 0,
        totalOverdue: 0,
        chartData: [],
      });
    } finally {
      setLoadingFinancial(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);
  };

  const chartData =
    financialData?.chartData?.map((item: any) => ({
      name: item.date.split("-").slice(1).reverse().join("/"),
      value: item.value,
      date: item.date,
    })) || [];

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 animate-in fade-in duration-500 text-slate-200">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
            Dashboard
          </h1>
          <p className="text-slate-400 text-sm md:text-base">
            Visão geral do desempenho e faturamento de sua equipe.
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold w-full md:w-auto">
            <WifiOff size={16} /> Backend Offline
          </div>
        )}

        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3 justify-end">
          <button className="bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-300 px-4 py-3 rounded-xl text-sm font-bold transition-all w-full sm:w-auto">
            Exportar Dados
          </button>
          <select className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-xl text-sm font-bold outline-none cursor-pointer transition-all shadow-lg shadow-indigo-900/20 w-full sm:w-auto">
            <option>Últimos 7 dias</option>
            <option>Este mês</option>
            <option>Ano passado</option>
          </select>
        </div>
      </header>

      {/* FINANCIAL SECTION (ISP EDITION) */}
      <section>
        <h2 className="text-lg md:text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Wallet className="text-emerald-500" /> Financeiro (Hoje)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <StatCard
            icon={<DollarSign className="text-white" size={24} />}
            label="Receita do Dia (Pix/Baixa)"
            value={
              loadingFinancial
                ? "..."
                : formatCurrency(financialData?.todayRevenue || 0)
            }
            trend="+5.0%"
            gradient="from-emerald-600 to-teal-600"
          />
          <StatCard
            icon={<Ban className="text-white" size={24} />}
            label="Inadimplência Total"
            value={
              loadingFinancial
                ? "..."
                : formatCurrency(financialData?.totalOverdue || 0)
            }
            trend="+2.1%"
            gradient="from-rose-600 to-red-600"
          />
          <StatCard
            icon={<TrendingUp className="text-white" size={24} />}
            label="Projeção Mensal"
            value={
              loadingFinancial
                ? "..."
                : formatCurrency((financialData?.todayRevenue || 0) * 30)
            }
            trend="Est."
            gradient="from-blue-600 to-indigo-600"
          />
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Financial Chart */}
        <div className="lg:col-span-2 bg-slate-900/50 backdrop-blur-xl p-5 md:p-8 rounded-4xl border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg md:text-xl font-bold mb-1 text-white">
                Fluxo de Caixa (7 Dias)
              </h2>
              <p className="text-slate-500 text-xs md:text-sm">
                Entradas confirmadas via PIX e Baixa Automática
              </p>
            </div>
            <MoreHorizontal className="text-slate-600 cursor-pointer" />
          </div>

          <div className="h-64 md:h-96 w-full flex-1 min-h-0">
            {isMounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="colorRevenue"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                      <stop
                        offset="95%"
                        stopColor="#10b981"
                        stopOpacity={0.2}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#1e293b"
                  />
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#1e293b"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#94a3b8", fontWeight: 600 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#94a3b8" }}
                    tickFormatter={(value) => `R$${value / 1000}k`}
                  />
                  <Tooltip
                    cursor={{ fill: "#1e293b", opacity: 0.4 }}
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderRadius: "16px",
                      border: "1px solid #1e293b",
                      color: "#f8fafc",
                    }}
                    itemStyle={{ color: "#10b981" }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Bar
                    dataKey="value"
                    name="Receita"
                    fill="url(#colorRevenue)"
                    radius={[8, 8, 0, 0]}
                    barSize={40}
                    isAnimationActive={true}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full w-full items-center justify-center text-slate-500">
                Carregando gráfico...
              </div>
            )}
          </div>
        </div>

        {/* Operational Stats (Existing) */}
        <div className="bg-slate-900/50 backdrop-blur-xl p-5 md:p-8 rounded-4xl border border-slate-800 shadow-xl">
          <h2 className="text-lg md:text-xl font-bold mb-2 text-white">
            Operacional
          </h2>
          <p className="text-slate-500 text-xs md:text-sm mb-4">
            Tickets por Departamento
          </p>

          <div className="h-64 md:h-72 w-full relative shrink-0">
            {/* Ajuste a altura para h-64 md:h-72 */}
            {isMounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderRadius: "12px",
                      border: "1px solid #1e293b",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full w-full items-center justify-center text-slate-500">
                Carregando...
              </div>
            )}

            {/* Mantenha a legenda centralizada (o div com absolute) aqui fora do ternário ou dentro, tanto faz, mas cuidado para não apagar */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <span className="block text-2xl md:text-3xl font-black text-white">
                1k
              </span>
              <span className="text-[9px] md:text-[10px] text-slate-500 uppercase font-bold tracking-widest">
                Tickets
              </span>
            </div>
          </div>

          <div className="mt-4 md:mt-6 flex flex-wrap gap-2 justify-center">
            {pieData.map((item) => (
              <div
                key={item.name}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:bg-slate-800 transition-colors cursor-pointer text-xs"
              >
                <div
                  className="w-2 h-2 rounded-full shadow-[0_0_8px]"
                  style={{
                    backgroundColor: item.color,
                    boxShadow: `0 0 8px ${item.color}40`,
                  }}
                ></div>
                <span className="text-slate-300 font-bold">{item.name}</span>
                <span className="font-medium text-slate-500 ml-1">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Operational Stats Grid (Moved down) */}
      <h2 className="text-lg md:text-xl font-bold text-white mb-2 flex items-center gap-2">
        <MessageCircle className="text-indigo-500" /> Atendimento
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard
          icon={<MessageCircle className="text-white" size={24} />}
          label="Total de Tickets"
          value="2,482"
          trend="+12.5%"
          gradient="from-indigo-500 to-violet-600"
        />
        <StatCard
          icon={<CheckCircle2 className="text-white" size={24} />}
          label="Resolvidos"
          value="1,940"
          trend="+8.2%"
          gradient="from-emerald-500 to-teal-600"
        />
        <StatCard
          icon={<Clock className="text-white" size={24} />}
          label="T.M.A"
          value="14m"
          trend="-2.4%"
          gradient="from-amber-500 to-orange-600"
        />
        <StatCard
          icon={<Users className="text-white" size={24} />}
          label="Novos Leads"
          value="156"
          trend="-4.1%"
          gradient="from-pink-500 to-rose-600"
        />
      </div>
    </div>
  );
};

const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  trend: string;
  gradient: string;
}> = ({ icon, label, value, trend, gradient }) => {
  const isPositive = trend.includes("+") || trend === "Est.";
  return (
    <div
      className={`bg-linear-to-br ${gradient} p-5 md:p-6 rounded-3xl shadow-lg relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300 min-w-0 flex flex-col justify-between`}
    >
      {/* Background Shapes */}
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors"></div>
      <div className="absolute -left-4 -bottom-4 w-20 h-20 bg-black/10 rounded-full blur-xl"></div>

      <div className="relative z-10 flex justify-between items-start">
        <div className="p-2.5 md:p-3 bg-white/20 backdrop-blur-md rounded-2xl border border-white/10 shadow-inner">
          {icon}
        </div>
        <div
          className={`px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-black flex items-center gap-1 shadow-xl border-2 border-white/90 ${
            isPositive
              ? "bg-emerald-500 text-white shadow-emerald-900/30"
              : "bg-rose-500 text-white shadow-rose-900/30"
          }`}
        >
          {isPositive ? (
            <TrendingUp size={14} strokeWidth={3} />
          ) : (
            <TrendingDown size={14} strokeWidth={3} />
          )}
          {trend}
        </div>
      </div>

      <div className="relative z-10 mt-4 md:mt-6 text-white">
        <h3 className="text-white/70 text-[10px] md:text-xs font-bold uppercase tracking-widest truncate">
          {label}
        </h3>
        <p className="text-2xl md:text-3xl font-black mt-1 tracking-tight drop-shadow-md truncate leading-tight">
          {value}
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
