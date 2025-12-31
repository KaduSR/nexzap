// cspell: disable
import {
  Banknote,
  Bot,
  CalendarDays,
  CreditCard,
  Crown,
  GitMerge,
  KanbanSquare,
  LayoutDashboard,
  Link2,
  LogOut,
  Megaphone,
  MessageSquare,
  PanelLeftClose,
  PanelRightClose,
  Phone,
  Puzzle,
  Settings,
  ShieldAlert,
  Tag,
  UserCog,
  Users,
  Zap,
} from "lucide-react";
import React, { useEffect, useState, useContext } from "react";
import { NavLink } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL;

interface SidebarProps {
  isOpen: boolean;
  setOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setOpen }) => {
  const { handleLogout, user } = useContext(AuthContext);
  const [features, setFeatures] = useState<any>({
    useCampaigns: true,
    useIntegrations: true,
    useKanban: true,
    useOpenAi: true,
    // Default to true during loading to avoid flicker, or false for security
  });
  const [planName, setPlanName] = useState("");

  useEffect(() => {
    fetchCompanyPlan();
  }, []);

  const fetchCompanyPlan = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/companies/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const company = await res.json();
        if (company.plan) {
          setFeatures(company.plan);
          setPlanName(company.plan.name);
        }
      }
    } catch (e) {
      console.error("Failed to load plan features");
    }
  };

  const navItems = [
    {
      icon: <LayoutDashboard size={20} />,
      label: "Dashboard",
      path: "/dashboard",
      show: true,
    },
    {
      icon: <Crown size={20} className="text-amber-400" />,
      label: "SuperAdmin",
      path: "/super",
      show: true,
    },
    {
      icon: <MessageSquare size={20} />,
      label: "Atendimento",
      path: "/tickets",
      show: true,
    },
    {
      icon: <KanbanSquare size={20} />,
      label: "Kanban",
      path: "/kanban",
      show: features.useKanban,
    },
    {
      icon: <Phone size={20} />,
      label: "Telefone",
      path: "/softphone",
      show: features.useIntegrations,
    },
    {
      icon: <Users size={20} />,
      label: "Contatos",
      path: "/contacts",
      show: true,
    },
    {
      icon: <CalendarDays size={20} />,
      label: "Calendário",
      path: "/calendar",
      show: features.useSchedules,
    },
    {
      icon: <UserCog size={20} />,
      label: "Equipe",
      path: "/users",
      show: true,
    },
    {
      icon: <Tag size={20} />,
      label: "Catálogo de Serviços",
      path: "/services",
      show: true,
    },
    {
      icon: <GitMerge size={20} />,
      label: "Setores",
      path: "/queues",
      show: true,
    },
    {
      icon: <Banknote size={20} />,
      label: "Cobrança",
      path: "/dunning",
      show: features.useIntegrations,
    },
    {
      icon: <ShieldAlert size={20} />,
      label: "Gestão de Crise",
      path: "/incidents",
      show: features.useIntegrations,
    },
    {
      icon: <Link2 size={20} />,
      label: "Conexões",
      path: "/connections",
      show: true,
    },
    { icon: <Bot size={20} />, label: "Chatbot", path: "/chatbot", show: true },
    {
      icon: <Megaphone size={20} />,
      label: "Campanhas",
      path: "/campaigns",
      show: features.useCampaigns,
    },
    {
      icon: <Puzzle size={20} />,
      label: "Integrações",
      path: "/integrations",
      show: features.useIntegrations,
    },
    {
      icon: <CreditCard size={20} />,
      label: "Assinatura",
      path: "/subscription",
      show: true,
    },
    {
      icon: <Settings size={20} />,
      label: "Configurações",
      path: "/settings",
      show: true,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop - Closes menu when clicking outside */}
      <div
        className={`fixed inset-0 bg-black/60 z-30 lg:hidden transition-opacity duration-300 backdrop-blur-sm ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setOpen(false)}
      />

      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          flex flex-col transition-all duration-300 ease-in-out bg-slate-950 border-r border-slate-800/50 overflow-hidden
          ${
            isOpen
              ? "w-64 translate-x-0 shadow-2xl lg:shadow-none"
              : "-translate-x-full lg:translate-x-0 lg:w-20"
          } 
        `}
      >
        <div className={`p-4 ${isOpen ? "py-6" : "py-6"}`}>
          <div
            className={`flex items-center gap-3 ${
              !isOpen && "lg:justify-center"
            }`}
          >
            <div className="w-10 h-10 bg-linear-to-br from-indigo-600 to-emerald-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-emerald-900/20 shrink-0 relative overflow-hidden group">
              <div className="absolute inset-0 bg-white/20 blur-xl group-hover:blur-md transition-all"></div>
              <Zap size={24} fill="currentColor" className="relative z-10" />
            </div>
            <div
              className={`${
                !isOpen && "lg:hidden"
              } whitespace-nowrap overflow-hidden transition-opacity duration-300`}
            >
              <h1 className="font-black leading-tight text-white tracking-tight">
                Nex<span className="text-emerald-400">Zap</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate">
                Sistema do Provedor
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems
            .filter((item) => item.show)
            .map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (window.innerWidth < 1024) setOpen(false);
                }}
                className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all relative group whitespace-nowrap
                ${!isOpen && "lg:justify-center"}
                ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/50"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }
              `}
                title={!isOpen ? item.label : undefined}
              >
                {item.icon}
                <span className={`${!isOpen && "lg:hidden"}`}>
                  {item.label}
                </span>
              </NavLink>
            ))}
        </nav>

        <div className="p-3 border-t border-slate-800 space-y-2">
          <button
            onClick={() => setOpen(!isOpen)}
            className="w-ful hidden items-center gap-3 px-4 py-3 rounded-xl font-medium text-white hover:bg-slate-800 hover:text-blue transition-colors whitespace-nowrap lg:flex"
            title={isOpen ? "Recolher menu" : "Expandir menu"}
          >
            {isOpen ? (
              <PanelLeftClose size={20} />
            ) : (
              <PanelRightClose size={20} />
            )}
            <span className={`${!isOpen && "hidden"}`}>Recolher</span>
          </button>

          <div
            className={`p-2 rounded-xl flex items-center gap-3 bg-slate-800/50 border border-slate-700/50 ${
              !isOpen &&
              "lg:p-0 lg:bg-transparent lg:border-none lg:justify-center"
            }`}
          >
            <div
              className={`w-10 h-10 rounded-full bg-slate-700 overflow-hidden border-2 border-slate-600 shrink-0 ${
                !isOpen && "lg:w-10 lg:h-10"
              }`}
            >
              <img src="https://picsum.photos/seed/user/100/100" alt="Avatar" />
            </div>
            <div className={`flex-1 min-w-0 ${!isOpen && "lg:hidden"}`}>
              <p className="font-semibold text-sm truncate text-white">
                Cassio Santos
              </p>
              <p className="text-xs text-emerald-400 truncate flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>{" "}
                Online
              </p>
            </div>
            <button
              onClick={handleLogout}
              className={`text-slate-400 hover:text-red-400 transition-colors ${
                !isOpen && "lg:hidden"
              }`}
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
