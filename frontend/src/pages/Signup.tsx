// cspell: disable
import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  Loader2,
  User,
  Building2,
  Phone,
  CheckCircle,
  Zap,
} from "lucide-react";
import { AuthContext } from "../context/Auth/AuthContext";

const Signup: React.FC = () => {
  const [form, setForm] = useState({
    name: "",
    companyName: "",
    email: "",
    phone: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { handleSignup, loading } = useContext(AuthContext);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    try {
      await handleSignup(form);
    } catch (err: any) {
      setError(err.message || "Erro ao criar conta.");
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-950">
      {/* Left Side - Marketing */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-slate-900">
        <div className="absolute inset-0 bg-linear-to-tr from-emerald-900 to-blue-900 opacity-40"></div>

        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [bg-size:20px_20px]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 bg-emerald-500 rounded-full blur-[150px] opacity-20"></div>

        <div className="relative z-10 flex flex-col justify-between p-16 w-full text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-linear-to-br from-blue-600 to-emerald-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-emerald-900/30">
              <Zap size={28} fill="currentColor" />
            </div>
            <span className="font-black text-3xl tracking-tight">
              Nex<span className="text-emerald-400">Zap</span>
            </span>
          </div>

          <div className="space-y-8 max-w-lg">
            <h1 className="text-5xl font-black leading-tight">
              Comece seu teste <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-300 to-blue-300">
                Grátis por 3 dias
              </span>
            </h1>

            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-lg font-medium text-emerald-100">
                <CheckCircle className="text-emerald-400" /> Integração IXC /
                Voalle / MK
              </li>
              <li className="flex items-center gap-3 text-lg font-medium text-emerald-100">
                <CheckCircle className="text-emerald-400" /> App Exclusivo para
                Técnicos
              </li>
              <li className="flex items-center gap-3 text-lg font-medium text-emerald-100">
                <CheckCircle className="text-emerald-400" /> IA que resolve
                problemas de rede
              </li>
            </ul>
          </div>

          <div className="text-xs font-medium text-slate-400">
            Junte-se a mais de 500 provedores que usam NexZap.
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative overflow-y-auto custom-scrollbar">
        <div className="w-full max-w-md space-y-6 animate-in slide-in-from-right-10 fade-in duration-500">
          <div className="text-center lg:text-left mb-8">
            <div className="lg:hidden flex justify-center mb-6">
              <div className="w-12 h-12 bg-linear-to-br from-blue-600 to-emerald-500 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg">
                <Zap size={24} fill="currentColor" />
              </div>
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight">
              Cadastro de Provedor
            </h2>
            <p className="mt-2 text-slate-400">
              Configure seu ambiente em menos de 2 minutos.
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl text-sm font-bold flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">
                  Seu Nome
                </label>
                <div className="relative group">
                  <User
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors"
                    size={18}
                  />
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl py-3 pl-10 pr-4 text-slate-200 outline-none transition-all font-medium text-sm"
                    placeholder="João Silva"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">
                  Celular/Whatsapp
                </label>
                <div className="relative group">
                  <Phone
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors"
                    size={18}
                  />
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl py-3 pl-10 pr-4 text-slate-200 outline-none transition-all font-medium text-sm"
                    placeholder="11999999999"
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">
                Nome do Provedor
              </label>
              <div className="relative group">
                <Building2
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors"
                  size={18}
                />
                <input
                  type="text"
                  required
                  className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl py-3 pl-10 pr-4 text-slate-200 outline-none transition-all font-medium text-sm"
                  placeholder="FiberNet Telecom"
                  value={form.companyName}
                  onChange={(e) =>
                    setForm({ ...form, companyName: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">
                Email de Acesso
              </label>
              <div className="relative group">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors"
                  size={18}
                />
                <input
                  type="email"
                  required
                  className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl py-3 pl-10 pr-4 text-slate-200 outline-none transition-all font-medium text-sm"
                  placeholder="admin@fibernet.com.br"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">
                Senha
              </label>
              <div className="relative group">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors"
                  size={18}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl py-3 pl-10 pr-12 text-slate-200 outline-none transition-all font-medium text-sm"
                  placeholder="Mínimo 6 caracteres"
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
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 mt-4"
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Criar Conta e Acessar"
              )}
            </button>
          </form>

          <div className="text-center">
            <p className="text-slate-500 text-sm">
              Já é cliente NexZap?{" "}
              <Link
                to="/login"
                className="text-blue-500 font-bold hover:text-blue-400 transition-colors"
              >
                Fazer login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
