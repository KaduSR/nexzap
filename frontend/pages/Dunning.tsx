import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Banknote, 
  Save, 
  X, 
  Play, 
  Clock, 
  CalendarCheck, 
  AlertTriangle,
  Loader2
} from 'lucide-react';

const API_URL = "http://localhost:8080";

interface DunningRule {
  id: number;
  frequencyType: 'before_due' | 'on_due' | 'after_due';
  days: number;
  messageTemplate: string;
  isActive: boolean;
}

const Dunning: React.FC = () => {
  const [rules, setRules] = useState<DunningRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentRule, setCurrentRule] = useState<Partial<DunningRule>>({
      frequencyType: 'before_due',
      days: 3,
      messageTemplate: "Olá {{name}}, sua fatura vence em breve. Segue o Pix: {{pix}}",
      isActive: true
  });

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    setLoading(true);
    try {
        const response = await fetch(`${API_URL}/api/dunning`, {
            headers: { 'Authorization': 'Bearer token' }
        });
        if (response.ok) {
            setRules(await response.json());
        }
    } catch (error) {
        console.error("Failed to fetch rules", error);
    } finally {
        setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSaving(true);
      try {
          const method = currentRule.id ? 'PUT' : 'POST';
          const url = currentRule.id ? `${API_URL}/api/dunning/${currentRule.id}` : `${API_URL}/api/dunning`;
          
          const res = await fetch(url, {
              method,
              headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': 'Bearer token' 
              },
              body: JSON.stringify(currentRule)
          });
          
          if (!res.ok) throw new Error("API Error");

          setShowModal(false);
          fetchRules();
      } catch (error) {
          alert("Erro ao salvar regra.");
      } finally {
          setIsSaving(false);
      }
  };

  const handleDelete = async (id: number) => {
      if(!confirm("Tem certeza que deseja excluir esta automação?")) return;
      try {
          await fetch(`${API_URL}/api/dunning/${id}`, { 
              method: 'DELETE',
              headers: { 'Authorization': 'Bearer token' } 
          });
          fetchRules();
      } catch (e) {
          alert("Erro ao deletar.");
      }
  };

  const handleRunNow = async () => {
      if(!confirm("Deseja forçar a execução da régua agora? Isso pode enviar mensagens reais.")) return;
      try {
          await fetch(`${API_URL}/api/dunning/run`, { 
              method: 'POST',
              headers: { 'Authorization': 'Bearer token' } 
          });
          alert("Processo iniciado em segundo plano.");
      } catch (e) {
          alert("Erro ao iniciar processo.");
      }
  };

  return (
    <div className="p-8 space-y-8 max-w-6xl mx-auto animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-800 dark:text-white flex items-center gap-3">
             <Banknote className="text-emerald-500" size={32} />
             Régua de Cobrança
          </h1>
          <p className="text-slate-500">Automatize o envio de boletos e lembretes para reduzir a inadimplência.</p>
        </div>
        <div className="flex gap-3">
            <button onClick={handleRunNow} className="flex items-center gap-2 px-4 py-2 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 font-bold text-xs uppercase tracking-widest transition-all">
                <Play size={14} /> Rodar Agora
            </button>
            <button onClick={() => { setCurrentRule({ frequencyType: 'before_due', days: 3, messageTemplate: '', isActive: true }); setShowModal(true); }} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95">
                <Plus size={20} /> Nova Regra
            </button>
        </div>
      </header>

      {/* Rules List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
              <div className="col-span-full py-12 flex justify-center text-indigo-500"><Loader2 className="animate-spin" size={32} /></div>
          ) : rules.length === 0 ? (
              <div className="col-span-full p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
                  <p className="text-slate-500 font-bold">Nenhuma regra configurada.</p>
              </div>
          ) : (
              rules.map(rule => (
                  <div key={rule.id} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm relative group overflow-hidden">
                      <div className={`absolute top-0 left-0 w-1.5 h-full ${rule.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                      
                      <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                              <div className={`p-3 rounded-xl ${
                                  rule.frequencyType === 'before_due' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20' :
                                  rule.frequencyType === 'on_due' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/20' :
                                  'bg-red-100 text-red-600 dark:bg-red-900/20'
                              }`}>
                                  {rule.frequencyType === 'before_due' && <CalendarCheck size={20} />}
                                  {rule.frequencyType === 'on_due' && <Clock size={20} />}
                                  {rule.frequencyType === 'after_due' && <AlertTriangle size={20} />}
                              </div>
                              <div>
                                  <h3 className="font-bold text-slate-800 dark:text-white text-sm">
                                      {rule.frequencyType === 'before_due' ? 'Lembrete Antecipado' : 
                                       rule.frequencyType === 'on_due' ? 'No Dia do Vencimento' : 'Cobrança de Atraso'}
                                  </h3>
                                  <p className="text-xs text-slate-500 font-bold">
                                      {rule.frequencyType === 'on_due' ? 'Enviar Hoje' : `${rule.days} dias ${rule.frequencyType === 'before_due' ? 'antes' : 'depois'}`}
                                  </p>
                              </div>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => { setCurrentRule(rule); setShowModal(true); }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-indigo-600"><Edit2 size={16} /></button>
                              <button onClick={() => handleDelete(rule.id)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-red-500"><Trash2 size={16} /></button>
                          </div>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl mb-4">
                          <p className="text-xs text-slate-600 dark:text-slate-300 italic line-clamp-3">"{rule.messageTemplate}"</p>
                      </div>

                      <div className="flex items-center justify-between mt-auto">
                          <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${rule.isActive ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20' : 'bg-slate-100 text-slate-500'}`}>
                              {rule.isActive ? 'Ativo' : 'Pausado'}
                          </span>
                      </div>
                  </div>
              ))
          )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900">
                    <h3 className="font-black text-lg">Configurar Regra</h3>
                    <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl text-slate-400">
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleSave} className="p-8 space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Quando Enviar?</label>
                            <select 
                                className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm outline-none focus:border-indigo-500"
                                value={currentRule.frequencyType}
                                onChange={e => setCurrentRule({...currentRule, frequencyType: e.target.value as any})}
                            >
                                <option value="before_due">Antes do Vencimento</option>
                                <option value="on_due">No Dia do Vencimento</option>
                                <option value="after_due">Após Vencimento</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Dias de Diferença</label>
                            <input 
                                type="number" 
                                min={0}
                                className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm outline-none focus:border-indigo-500"
                                value={currentRule.days}
                                onChange={e => setCurrentRule({...currentRule, days: Number(e.target.value)})}
                                disabled={currentRule.frequencyType === 'on_due'}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Mensagem</label>
                        <textarea 
                            rows={5}
                            className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium outline-none focus:border-indigo-500 resize-none"
                            value={currentRule.messageTemplate}
                            onChange={e => setCurrentRule({...currentRule, messageTemplate: e.target.value})}
                            placeholder="Use {{name}}, {{valor}}, {{pix}}, {{link_pdf}}"
                        />
                        <p className="text-[10px] text-slate-500 pl-1">Variáveis disponíveis: <b>{"{{name}}"}</b>, <b>{"{{valor}}"}</b>, <b>{"{{vencimento}}"}</b>, <b>{"{{pix}}"}</b>, <b>{"{{linha_digitavel}}"}</b>, <b>{"{{link_pdf}}"}</b>.</p>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer" onClick={() => setCurrentRule({...currentRule, isActive: !currentRule.isActive})}>
                        <div className={`w-12 h-6 rounded-full relative transition-colors ${currentRule.isActive ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}>
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${currentRule.isActive ? 'left-7' : 'left-1'}`}></div>
                        </div>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Ativar Regra</span>
                    </div>

                    <button 
                        type="submit" 
                        disabled={isSaving}
                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
                    >
                        {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        Salvar Automação
                    </button>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default Dunning;