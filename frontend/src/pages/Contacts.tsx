// cspell:disable
import React, { useState, useEffect } from "react";
import {
  Search,
  RefreshCw,
  Filter,
  Database,
  DownloadCloud,
  Smartphone,
  Ban,
  MessageSquare,
  Loader2,
  CheckCircle2,
  MoreVertical,
} from "lucide-react";

interface IxcCustomer {
  id: number;
  razao: string;
  cpf_cnpj: string;
  telefone_celular: string;
  ativo: "S" | "N";
  bloqueado: "S" | "N";
  plano: string;
  status_conexao: "online" | "offline";
  endereco: string;
}

const Contacts: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"all" | "active" | "blocked">(
    "all"
  );
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [contacts, setContacts] = useState<IxcCustomer[]>([]);

  // Mock Fetch
  const fetchContacts = async (statusFilter: string) => {
    setLoading(true);
    // Simula delay de rede
    setTimeout(() => {
      const mockData: IxcCustomer[] = [
        {
          id: 42901,
          razao: "João Silva",
          cpf_cnpj: "123.456.789-00",
          telefone_celular: "11999887766",
          ativo: "S",
          bloqueado: "N",
          plano: "FIBRA 500MB",
          status_conexao: "online",
          endereco: "Rua das Flores, 123",
        },
        {
          id: 42902,
          razao: "Maria Souza",
          cpf_cnpj: "987.654.321-00",
          telefone_celular: "11988776655",
          ativo: "S",
          bloqueado: "S",
          plano: "FIBRA 300MB",
          status_conexao: "offline",
          endereco: "Av. Paulista, 1000",
        },
        {
          id: 42903,
          razao: "Empresa Alpha Ltda",
          cpf_cnpj: "00.000.000/0001-99",
          telefone_celular: "11977665544",
          ativo: "S",
          bloqueado: "N",
          plano: "LINK DEDICADO 1GB",
          status_conexao: "online",
          endereco: "Rua Empresarial, 500",
        },
      ];

      let filtered = mockData;
      if (statusFilter === "active") {
        filtered = mockData.filter(
          (c) => c.ativo === "S" && c.bloqueado === "N"
        );
      } else if (statusFilter === "blocked") {
        filtered = mockData.filter(
          (c) => c.ativo === "S" && c.bloqueado === "S"
        );
      }

      setContacts(filtered);
      setLoading(false);
    }, 600);
  };

  useEffect(() => {
    fetchContacts(activeTab);
  }, [activeTab]);

  return (
    <div className="h-full max-w-full flex flex-col p-10 mb:p-15 animate-in fade-in duration-500">
      {/* Header */}
      <header className=" flex w-full flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-10">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3 text-slate-800 dark:text-white">
            Base de Assinantes
            <span className="px-2 py-0.5 rounded text-xs bg-indigo-600 text-white font-bold tracking-widest uppercase">
              ERP Sync
            </span>
          </h1>
          <p className="text-slate-500 mt-1">
            Gerencie os clientes importados do seu provedor (IXC, HubSoft, etc).
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => fetchContacts(activeTab)}
            className="flex items-center gap-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-5 py-3 rounded-xl font-bold transition-all border border-slate-200 dark:border-slate-700 shadow-sm cursor-pointer"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            Sincronizar
          </button>
          <button
            onClick={() => setExporting(true)}
            disabled={exporting}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-900/20 disabled:opacity-70 cursor-pointer"
          >
            {exporting ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <DownloadCloud size={18} />
            )}
            Exportar Lista
          </button>
        </div>
      </header>

      {/* Filters & Search */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 flex flex-col md:flex-row gap-4 mb-6 shadow-sm">
        <div className="flex p-1 bg-slate-100 dark:bg-slate-950 rounded-xl overflow-hidden shrink-0">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-6 py-2 text-sm font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === "all"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setActiveTab("active")}
            className={`px-6 py-2 text-sm font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === "active"
                ? "bg-emerald-600 text-white shadow-md"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            Ativos
          </button>
          <button
            onClick={() => setActiveTab("blocked")}
            className={`px-6 py-2 text-sm font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === "blocked"
                ? "bg-red-600 text-white shadow-md"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            Bloqueados
          </button>
        </div>

        <div className="flex-1 relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Buscar por Nome, CPF/CNPJ ou Contrato..."
            className="w-full pl-12 pr-4 py-3 bg-transparent border-none rounded-xl text-sm outline-none text-slate-700 dark:text-slate-200 font-medium placeholder-slate-400"
          />
        </div>

        <button className="p-3 text-slate-400 hover:text-indigo-500 transition-colors cursor-pointer">
          <Filter size={20} />
        </button>
      </div>

      {/* Data Table Full Width */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl flex-1 overflow-hidden shadow-xl flex flex-col w-full">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-4 py-20">
            <RefreshCw size={40} className="animate-spin text-indigo-500" />
            <p className="text-slate-400 font-bold">
              Consultando API do ERP...
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-200">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-widest font-black">
                  <th className="p-6">Assinante</th>
                  <th className="p-6">Plano / Conexão</th>
                  <th className="p-6">Status Financeiro</th>
                  <th className="p-6">Contato</th>
                  <th className="p-6 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {contacts.map((contact) => (
                  <tr
                    key={contact.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                  >
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500 dark:text-slate-300">
                          {contact.razao.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                            {contact.razao}
                          </p>
                          <p className="text-xs text-slate-500 font-mono">
                            CPF: {contact.cpf_cnpj}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="space-y-1">
                        <p className="font-bold text-xs text-indigo-600 dark:text-indigo-400">
                          {contact.plano}
                        </p>
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              contact.status_conexao === "online"
                                ? "bg-emerald-500"
                                : "bg-red-500"
                            }`}
                          ></div>
                          <span className="text-[10px] uppercase font-bold text-slate-500">
                            {contact.status_conexao === "online"
                              ? "Conectado"
                              : "Sem Conexão"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      {contact.bloqueado === "S" ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-500 text-xs font-bold uppercase">
                          <Ban size={12} /> Bloqueado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 text-xs font-bold uppercase">
                          <CheckCircle2 size={12} /> Ativo
                        </span>
                      )}
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Smartphone size={14} />
                        <span className="text-sm font-medium">
                          {contact.telefone_celular}
                        </span>
                      </div>
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 bg-indigo-600 text-white rounded-lg shadow-lg hover:bg-indigo-700 cursor-pointer">
                          <MessageSquare size={16} />
                        </button>
                        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 rounded-lg cursor-pointer">
                          <Database size={16} />
                        </button>
                        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 rounded-lg cursor-pointer">
                          <MoreVertical size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {/* Footer da Tabela (Opcional, para manter consistência visual) */}
        {!loading && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/30 flex justify-between items-center">
            <span className="text-xs text-slate-500 font-bold">
              Mostrando {contacts.length} registros
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Contacts;
