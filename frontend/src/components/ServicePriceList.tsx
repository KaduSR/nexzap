// cspell: disable
import { Check, Copy, Loader2, Search, Tag, X } from "lucide-react";
import React, { useEffect, useState } from "react";

interface ServiceItem {
  id: number;
  name: string;
  price: number;
  description: string;
}

const API_URL = import.meta.env.VITE_API_URL;

interface Props {
  onClose: () => void;
}

const ServicePriceList: React.FC<Props> = ({ onClose }) => {
  const [items, setItems] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await fetch(`${API_URL}/api/services/items`, {
        headers: { Authorization: "Bearer token" },
      });
      if (res.ok) {
        setItems(await res.json());
      } else {
        // Fallback Mock Data if Backend not ready yet
        setItems([
          {
            id: 1,
            name: "Mudança de Endereço (Com Cabo)",
            price: 150.0,
            description:
              "Reinstalação completa com passagem de novo cabeamento.",
          },
          {
            id: 2,
            name: "Mudança de Endereço (Sem Cabo)",
            price: 80.0,
            description:
              "Reinstalação aproveitando cabeamento existente no local.",
          },
          {
            id: 3,
            name: "Mudança de Ponto (Mesmo Endereço)",
            price: 60.0,
            description: "Alteração do cômodo onde fica o roteador.",
          },
          {
            id: 4,
            name: "Troca de Conector",
            price: 15.0,
            description: "Substituição de conector danificado (RJ45/APC).",
          },
          {
            id: 5,
            name: "Visita Técnica Improdutiva",
            price: 40.0,
            description: "Técnico foi ao local mas cliente não estava.",
          },
          {
            id: 6,
            name: "Configuração de Roteador Particular",
            price: 30.0,
            description:
              "Configuração de equipamento que não pertence ao provedor.",
          },
        ]);
      }
    } catch (e) {
      console.error("Error fetching services", e);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (item: ServiceItem) => {
    const text = `*${item.name}*\nValor: R$ ${item.price
      .toFixed(2)
      .replace(".", ",")}\n_${item.description}_`;
    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-4xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600">
              <Tag size={20} />
            </div>
            <div>
              <h3 className="font-black text-lg text-slate-800 dark:text-white">
                Tabela de Serviços
              </h3>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                ISP Price List
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl text-slate-400"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Buscar serviço (ex: mudança, cabo, conector)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-10 pr-4 text-sm font-bold outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3 bg-slate-50 dark:bg-slate-950/50">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 size={32} className="animate-spin text-indigo-500" />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-10 text-slate-400 font-bold">
              Nenhum serviço encontrado.
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between group hover:border-indigo-500/50 transition-all"
              >
                <div className="flex-1 min-w-0 pr-4">
                  <h4 className="font-bold text-slate-800 dark:text-white text-sm truncate">
                    {item.name}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                    {item.description}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-emerald-600 font-black text-sm bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-lg whitespace-nowrap">
                    R$ {item.price.toFixed(2).replace(".", ",")}
                  </span>

                  <button
                    onClick={() => handleCopy(item)}
                    className={`p-2.5 rounded-xl transition-all ${
                      copiedId === item.id
                        ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                    }`}
                    title="Copiar para área de transferência"
                  >
                    {copiedId === item.id ? (
                      <Check size={18} />
                    ) : (
                      <Copy size={18} />
                    )}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-center">
          <p className="text-[10px] text-slate-400">
            💡 Dica: Clique no botão de copiar para colar as informações
            diretamente no chat.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ServicePriceList;
