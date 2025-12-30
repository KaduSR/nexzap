import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  Zap,
  CheckCircle2,
} from "lucide-react";

const Login: React.FC = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { handleLogin, loading } = useContext(AuthContext);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await handleLogin(form);
    } catch (err: any) {
      setError(err.message || "Erro ao conectar. Verifique suas credenciais.");
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-950">
      {/* Left Side - Marketing / Branding */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-slate-900">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-emerald-900 opacity-40"></div>

        {/* Background Patterns */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-blue-600 rounded-full blur-[128px] opacity-20"></div>
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-emerald-600 rounded-full blur-[128px] opacity-20"></div>

        <div className="relative z-10 flex flex-col justify-between p-16 w-full text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-emerald-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-emerald-900/30">
              <Zap size={28} fill="currentColor" />
            </div>
            <span className="font-black text-3xl tracking-tight">
              Nex<span className="text-emerald-400">Zap</span>
            </span>
          </div>

          <div className="space-y-8 max-w-lg">
            <h1 className="text-5xl font-black leading-tight tracking-tight">
              O Sistema <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                Operacional do Provedor
              </span>
            </h1>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 mt-1">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">
                    Centralize seu Atendimento
                  </h3>
                  <p className="text-slate-400 text-sm">
                    WhatsApp, Instagram e Webchat em uma única tela.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400 mt-1">
                  <Zap size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">
                    Automação Inteligente
                  </h3>
                  <p className="text-slate-400 text-sm">
                    Chatbots que consultam faturas e desbloqueiam clientes 24/7.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-end border-t border-white/10 pt-8">
            <div className="text-xs font-medium text-slate-400">
              © 2025 NexZap Tecnologia.
              <br />
              Feito para Provedores.
            </div>
            <div className="flex gap-2">
              <div className="h-1.5 w-12 bg-emerald-500 rounded-full"></div>
              <div className="h-1.5 w-12 bg-slate-700 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        <div className="w-full max-w-md space-y-8 animate-in slide-in-from-right-10 fade-in duration-500">
          <div className="text-center lg:text-left">
            <div className="lg:hidden flex justify-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-emerald-500 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg">
                <Zap size={24} fill="currentColor" />
              </div>
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight">
              Acesse sua conta
            </h2>
            <p className="mt-2 text-slate-400">Bem-vindo de volta ao NexZap.</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl text-sm font-bold flex items-center gap-2 animate-in zoom-in-95">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">
                Email Corporativo
              </label>
              <div className="relative group">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors"
                  size={20}
                />
                <input
                  type="email"
                  required
                  className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl py-3.5 pl-12 pr-4 text-slate-200 outline-none transition-all shadow-sm font-medium"
                  placeholder="seu@provedor.com.br"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center pl-1 pr-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Senha
                </label>
                <a
                  href="#"
                  className="text-xs font-bold text-blue-500 hover:text-blue-400"
                >
                  Esqueceu?
                </a>
              </div>
              <div className="relative group">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors"
                  size={20}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl py-3.5 pl-12 pr-12 text-slate-200 outline-none transition-all shadow-sm font-medium"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  Entrar no Sistema <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="text-center">
            <p className="text-slate-500 text-sm">
              Ainda não é cliente?{" "}
              <Link
                to="/signup"
                className="text-emerald-500 font-bold hover:text-emerald-400 transition-colors"
              >
                Teste Grátis por 3 dias
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
