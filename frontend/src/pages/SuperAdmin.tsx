// cspell: disable
import {
  Building2,
  CalendarClock,
  CheckCircle2,
  Crown,
  Edit2,
  FileText,
  List,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Phone,
  Plus,
  Save,
  ShieldCheck,
  Users,
  X,
  XCircle,
  Zap,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

interface Plan {
  id: number;
  name: string;
}

interface Company {
  id: number;
  name: string;
  email: string;
  document?: string;
  phone?: string;
  address?: string;
  city?: string;
  status: boolean;
  dueDate: string;
  plan: Plan;
  planId: number;
}

const SuperAdmin: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  // Form State (Create/Edit)
  const [form, setForm] = useState<any>({
    id: null,
    name: "",
    email: "",
    document: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipcode: "",
    password: "", // Only for creation
    planId: 2, // Default to Pro
    dueDate: "",
    status: true,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const [compRes, planRes] = await Promise.all([
        fetch(`${API_URL}/api/companies`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/api/companies/plans`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (compRes.ok) setCompanies(await compRes.json());
      if (planRes.ok) setPlans(await planRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (company?: Company) => {
    if (company) {
      // Edit Mode
      setForm({
        ...company,
        password: "", // Don't show password
        dueDate: company.dueDate || new Date().toISOString().split("T")[0],
      });
    } else {
      // Create Mode
      const nextMonth = new Date();
      nextMonth.setDate(nextMonth.getDate() + 30);

      setForm({
        id: null,
        name: "",
        email: "",
        document: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        zipcode: "",
        password: "",
        planId: 2,
        dueDate: nextMonth.toISOString().split("T")[0], // Default 30 days
        status: true,
      });
    }
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const isEdit = !!form.id;
      const url = isEdit
        ? `${API_URL}/api/companies/${form.id}`
        : `${API_URL}/api/companies`;

      const method = isEdit ? "PUT" : "POST";

      const token = localStorage.getItem("token");
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setShowModal(false);
        fetchData();
        alert(
          isEdit
            ? "Empresa atualizada com sucesso!"
            : "Nova empresa criada com sucesso!"
        );
      } else {
        const err = await res.json();
        alert(err.error || "Erro ao salvar empresa.");
      }
    } catch (e) {
      alert("Erro de conexão.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-800 dark:text-white flex items-center gap-3">
            <Crown className="text-amber-500" size={32} fill="currentColor" />
            Painel SaaS Master
          </h1>
          <p className="text-slate-500">
            Gerencie planos, clientes e assinaturas do seu SaaS.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/plans")}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-200 px-5 py-3 rounded-xl font-bold transition-all active:scale-95"
          >
            <List size={20} /> Gerenciar Planos
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95"
          >
            <Plus size={20} /> Nova Empresa
          </button>
        </div>
      </header>

      {/* Metrics Bar */}
      <div className="flex flex-wrap gap-4 items-center bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl">
          <Users size={18} className="text-indigo-500" />
          <div>
            <p className="text-[10px] text-slate-500 uppercase font-black">
              Total Clientes
            </p>
            <span className="font-bold text-lg text-slate-800 dark:text-white">
              {companies.length}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-900/20">
          <CheckCircle2 size={18} className="text-emerald-500" />
          <div>
            <p className="text-[10px] text-emerald-600 uppercase font-black">
              Ativos
            </p>
            <span className="font-bold text-lg text-emerald-700 dark:text-emerald-400">
              {companies.filter((c) => c.status).length}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/20">
          <XCircle size={18} className="text-red-500" />
          <div>
            <p className="text-[10px] text-red-600 uppercase font-black">
              Bloqueados
            </p>
            <span className="font-bold text-lg text-red-700 dark:text-red-400">
              {companies.filter((c) => !c.status).length}
            </span>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-xs font-black text-slate-400 uppercase tracking-widest">
                <th className="p-6">Empresa</th>
                <th className="p-6">Contato</th>
                <th className="p-6">Plano</th>
                <th className="p-6">Vencimento</th>
                <th className="p-6">Status</th>
                <th className="p-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center">
                    <Loader2 className="animate-spin mx-auto text-indigo-500" />
                  </td>
                </tr>
              ) : (
                companies.map((company) => (
                  <tr
                    key={company.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                  >
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 font-bold text-lg">
                          {company.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 dark:text-white text-sm">
                            {company.name}
                          </p>
                          <p className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                            <FileText size={10} />{" "}
                            {company.document || "Sem Doc"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="space-y-1">
                        <p className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1">
                          <Mail size={12} /> {company.email}
                        </p>
                        {company.phone && (
                          <p className="text-xs text-slate-500 flex items-center gap-1">
                            <Phone size={12} /> {company.phone}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="p-6">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold uppercase tracking-wider ${
                          company.plan.name.includes("Enterprise")
                            ? "bg-purple-100 text-purple-600 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800"
                            : company.plan.name.includes("Pro")
                            ? "bg-indigo-100 text-indigo-600 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800"
                            : "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:border-slate-700"
                        }`}
                      >
                        <Zap size={12} fill="currentColor" />{" "}
                        {company.plan.name}
                      </span>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                        <CalendarClock size={16} className="text-slate-400" />
                        {new Date(company.dueDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-6">
                      {company.status ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs font-bold">
                          <ShieldCheck size={14} /> ATIVO
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-xs font-bold">
                          <XCircle size={14} /> BLOQUEADO
                        </span>
                      )}
                    </td>
                    <td className="p-6 text-right">
                      <button
                        onClick={() => handleOpenModal(company)}
                        className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-500 hover:text-indigo-600 transition-colors"
                      >
                        <Edit2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Full Edit/Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-4xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600">
                  {form.id ? <Edit2 size={20} /> : <Plus size={20} />}
                </div>
                <div>
                  <h3 className="font-black text-lg">
                    {form.id ? "Editar Cliente" : "Novo Cliente"}
                  </h3>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                    {form.id ? form.name : "Cadastro de Tenant"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl text-slate-400"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSave}
              className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-6"
            >
              {/* Basic Info Section */}
              <div className="space-y-4">
                <h4 className="text-xs font-black text-indigo-500 uppercase tracking-widest border-b border-indigo-100 dark:border-slate-800 pb-2 flex items-center gap-2">
                  <Building2 size={14} /> Dados Cadastrais
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">
                      Razão Social / Nome
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm outline-none focus:border-indigo-500"
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">
                      CNPJ / CPF
                    </label>
                    <input
                      type="text"
                      className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm outline-none focus:border-indigo-500"
                      value={form.document}
                      onChange={(e) =>
                        setForm({ ...form, document: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">
                      Email Financeiro
                    </label>
                    <input
                      type="email"
                      required
                      className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm outline-none focus:border-indigo-500"
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">
                      Telefone / WhatsApp
                    </label>
                    <input
                      type="text"
                      className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm outline-none focus:border-indigo-500"
                      value={form.phone}
                      onChange={(e) =>
                        setForm({ ...form, phone: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Address Section */}
              <div className="space-y-4">
                <h4 className="text-xs font-black text-indigo-500 uppercase tracking-widest border-b border-indigo-100 dark:border-slate-800 pb-2 flex items-center gap-2">
                  <MapPin size={14} /> Endereço e Localização
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-3 space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">
                      Logradouro Completo
                    </label>
                    <input
                      type="text"
                      className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm outline-none focus:border-indigo-500"
                      value={form.address}
                      onChange={(e) =>
                        setForm({ ...form, address: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">
                      Cidade
                    </label>
                    <input
                      type="text"
                      className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm outline-none focus:border-indigo-500"
                      value={form.city}
                      onChange={(e) =>
                        setForm({ ...form, city: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">
                      UF
                    </label>
                    <input
                      type="text"
                      maxLength={2}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm outline-none focus:border-indigo-500 uppercase"
                      value={form.state}
                      onChange={(e) =>
                        setForm({ ...form, state: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">
                      CEP
                    </label>
                    <input
                      type="text"
                      className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm outline-none focus:border-indigo-500"
                      value={form.zipcode}
                      onChange={(e) =>
                        setForm({ ...form, zipcode: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Subscription Section */}
              <div className="space-y-4">
                <h4 className="text-xs font-black text-indigo-500 uppercase tracking-widest border-b border-indigo-100 dark:border-slate-800 pb-2 flex items-center gap-2">
                  <Zap size={14} /> Assinatura e Acesso
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">
                      Plano Selecionado
                    </label>
                    <select
                      className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm outline-none focus:border-indigo-500"
                      value={form.planId}
                      onChange={(e) =>
                        setForm({ ...form, planId: Number(e.target.value) })
                      }
                    >
                      {plans.map((plan) => (
                        <option key={plan.id} value={plan.id}>
                          {plan.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">
                      Data de Vencimento
                    </label>
                    <input
                      type="date"
                      className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm outline-none focus:border-indigo-500"
                      value={form.dueDate}
                      onChange={(e) =>
                        setForm({ ...form, dueDate: e.target.value })
                      }
                    />
                  </div>
                </div>

                {!form.id && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                      <Lock size={10} /> Senha Inicial do Admin
                    </label>
                    <input
                      type="password"
                      className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm outline-none focus:border-indigo-500"
                      value={form.password}
                      onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                      }
                      placeholder="Defina uma senha forte"
                    />
                  </div>
                )}

                <div
                  className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                    form.status
                      ? "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800"
                      : "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800"
                  }`}
                  onClick={() => setForm({ ...form, status: !form.status })}
                >
                  <div
                    className={`w-12 h-6 rounded-full relative transition-colors ${
                      form.status
                        ? "bg-emerald-500"
                        : "bg-slate-300 dark:bg-slate-600"
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${
                        form.status ? "left-7" : "left-1"
                      }`}
                    ></div>
                  </div>
                  <div>
                    <span
                      className={`block font-bold text-sm ${
                        form.status
                          ? "text-emerald-700 dark:text-emerald-400"
                          : "text-red-700 dark:text-red-400"
                      }`}
                    >
                      {form.status ? "Acesso Liberado" : "Acesso Bloqueado"}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {form.status
                        ? "O cliente pode acessar o sistema."
                        : "O cliente verá uma tela de bloqueio."}
                    </span>
                  </div>
                </div>
              </div>
            </form>

            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 shrink-0">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
              >
                {isSaving ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Save size={18} />
                )}
                {form.id ? "Salvar Alterações" : "Criar Empresa"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdmin;
