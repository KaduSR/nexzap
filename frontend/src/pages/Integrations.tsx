
import React, { useState, useEffect } from 'react';
import { 
  Puzzle, 
  ExternalLink, 
  CheckCircle, 
  AlertCircle, 
  Settings2, 
  Key, 
  Globe,
  Database,
  ArrowRight,
  Activity,
  Zap,
  ShieldCheck,
  Server,
  Info,
  Lock,
  Cpu,
  Terminal,
  Webhook,
  Facebook,
  Send,
  Code,
  Copy,
  Command,
  FileCode,
  PhoneCall,
  Mic,
  X,
  Save,
  Radio,
  Wifi,
  Loader2
} from 'lucide-react';

// Helper component just for the icon
const UserIcon = ({ size, className }: { size: number, className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);

const Integrations: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'api-docs'>('overview');
  const [showSipModal, setShowSipModal] = useState(false);
  const [isSavingSip, setIsSavingSip] = useState(false);
  const [isLoadingSip, setIsLoadingSip] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  
  // Estado do formulário SIP
  const [sipConfig, setSipConfig] = useState({
    accountName: '',
    sipServer: '',
    sipProxy: '',
    username: '',
    domain: '',
    login: '',
    password: '',
    displayName: '',
    transport: 'UDP',
    keepAlive: 15
  });

  // Função para buscar configurações do Backend
  const fetchSipSettings = async () => {
    setIsLoadingSip(true);
    try {
        // Mock de dados vindos do banco
        setTimeout(() => {
            setSipConfig({
                accountName: '10500012220',
                sipServer: 'ipbx.sonax.net.br:5080',
                sipProxy: 'ipbx.sonax.net.br:5080',
                username: '10500012220',
                domain: 'ipbx.sonax.net.br:5080',
                login: '10500012220',
                password: '', 
                displayName: 'Ramal 12220',
                transport: 'UDP',
                keepAlive: 30
            });
            setIsLoadingSip(false);
        }, 600);
    } catch (error) {
        console.error("Erro ao buscar config SIP", error);
        setIsLoadingSip(false);
    }
  };

  const handleOpenSipModal = () => {
      setShowSipModal(true);
      fetchSipSettings();
  };

  const handleSaveSip = async () => {
      setIsSavingSip(true);
      setTimeout(() => {
          setIsSavingSip(false);
          setShowSipModal(false);
          alert("Configurações SIP salvas com sucesso no servidor!");
      }, 1500);
  };

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText("https://api.seudominio.com.br/api-integrations/webhook/messages/receive");
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  const integrations = [
    {
      id: 'ixc',
      name: 'IXC Provedor',
      category: 'SISTEMA ERP',
      description: 'Consulta automática de faturas, contratos, desbloqueio de confiança e abertura de O.S.',
      icon: <Cpu className="text-blue-600" size={24} />,
      status: 'Connected',
      color: 'blue',
      action: () => {} 
    },
    {
      id: 'sonavoip',
      name: 'SonaVOIP / SIP',
      category: 'TELEFONIA IP',
      description: 'Integração nativa WebRTC para realizar e receber chamadas diretamente no navegador.',
      icon: <PhoneCall className="text-emerald-500" size={24} />,
      status: 'Config Required',
      color: 'emerald',
      action: handleOpenSipModal
    },
    {
      id: 'meta',
      name: 'Meta Cloud API',
      category: 'CANAL OFICIAL',
      description: 'Conexão oficial (WABA) para alta escala, templates verificados e selo verde.',
      icon: <Facebook className="text-indigo-600" size={24} />,
      status: 'Connected',
      color: 'indigo',
      action: () => {}
    },
    {
      id: 'telegram',
      name: 'Telegram Bot',
      category: 'AUTOMAÇÃO',
      description: 'Crie bots poderosos no Telegram sincronizados com suas filas de atendimento.',
      icon: <Send className="text-blue-400" size={24} />,
      status: 'Disabled',
      color: 'blue',
      action: () => {}
    }
  ];

  const apiRoutes = [
    { method: 'GET', path: '/api-integrations', desc: 'Lista todas as integrações ativas' },
    { method: 'POST', path: '/api-integrations', desc: 'Cria uma nova instância de API' },
    { method: 'GET', path: '/api-integrations/:id/qrcode', desc: 'Gera o QR Code para autenticação' },
    { method: 'POST', path: '/api-integrations/webhook/messages/receive', desc: 'Recebe mensagens via Evolution API' },
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto animate-in fade-in duration-700 relative">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <div className="flex items-center gap-2 mb-1">
              <Puzzle size={20} className="text-indigo-600" />
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Developers & API</span>
           </div>
           <h1 className="text-3xl font-black tracking-tight text-slate-800 dark:text-white">Central de Integrações</h1>
           <p className="text-slate-500 text-lg">Gerencie conexões externas, webhooks e telefonia.</p>
        </div>
        
        <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex border border-slate-200 dark:border-slate-700">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'overview' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Aplicativos
            </button>
            <button 
              onClick={() => setActiveTab('api-docs')}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'api-docs' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Documentação
            </button>
        </div>
      </header>

      {activeTab === 'overview' ? (
        <>
          {/* Webhook Section - Standardized Card */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group">
             {/* Decorative Background */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 dark:bg-indigo-900/10 rounded-full translate-x-1/3 -translate-y-1/3 blur-3xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
             
             <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 shrink-0 relative z-10">
                <Webhook size={32} />
             </div>
             
             <div className="flex-1 relative z-10 text-center md:text-left">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">Webhook Global (Receiver)</h3>
                <p className="text-slate-500 text-sm max-w-xl">
                  Configure este endpoint na sua plataforma externa (Evolution API, Typebot, etc) para receber eventos de mensagens e status em tempo real.
                </p>
             </div>
             
             <div className="w-full md:w-auto flex items-center gap-2 bg-slate-50 dark:bg-slate-900 p-2 pl-4 rounded-xl border border-slate-200 dark:border-slate-700 relative z-10">
                <code className="text-xs font-mono text-slate-600 dark:text-slate-300 truncate max-w-[200px] md:max-w-xs">
                  https://api.seudominio.com/webhook
                </code>
                <button 
                  onClick={handleCopyWebhook}
                  className="p-2 bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 text-slate-500 hover:text-indigo-600 rounded-lg shadow-sm transition-all"
                  title="Copiar URL"
                >
                  {copiedWebhook ? <CheckCircle size={16} className="text-emerald-500" /> : <Copy size={16} />}
                </button>
             </div>
          </div>

          {/* Grid of Apps */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {integrations.map((app) => (
              <div key={app.id} className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 flex flex-col hover:shadow-xl hover:border-indigo-200 dark:hover:border-slate-600 transition-all duration-300 group">
                <div className="flex justify-between items-start mb-6">
                   <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      app.color === 'blue' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20' :
                      app.color === 'emerald' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' :
                      app.color === 'indigo' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20' :
                      'bg-slate-50 text-slate-600'
                   } group-hover:scale-110 transition-transform`}>
                      {app.icon}
                   </div>
                   <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${
                      app.status === 'Connected' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                      app.status === 'Config Required' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                      'bg-slate-50 text-slate-400 border-slate-100'
                   }`}>
                      {app.status === 'Connected' ? 'ATIVO' : app.status === 'Config Required' ? 'PENDENTE' : 'INATIVO'}
                   </span>
                </div>
                
                <h3 className="font-bold text-slate-800 dark:text-white mb-1">{app.name}</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-3">{app.category}</p>
                <p className="text-xs text-slate-500 leading-relaxed mb-6 flex-1">
                  {app.description}
                </p>

                <button 
                  onClick={app.action}
                  className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2"
                >
                  Configurar <Settings2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="space-y-8 animate-in slide-in-from-bottom-5 duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <h3 className="text-xl font-bold flex items-center gap-2 text-slate-800 dark:text-white">
                <Terminal className="text-indigo-600" size={20} /> Endpoints REST
              </h3>
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl overflow-hidden shadow-sm">
                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                  {apiRoutes.map((route, i) => (
                    <div key={i} className="p-6 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group">
                      <span className={`px-3 py-1 rounded-md text-[10px] font-black text-white shrink-0 w-16 text-center ${
                        route.method === 'GET' ? 'bg-blue-500' : 
                        route.method === 'POST' ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}>
                        {route.method}
                      </span>
                      <div className="flex-1 min-w-0">
                        <code className="text-sm font-bold text-slate-700 dark:text-slate-200 block truncate">{route.path}</code>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">{route.desc}</p>
                      </div>
                      <button className="p-2 text-slate-300 hover:text-indigo-600 transition-colors opacity-0 group-hover:opacity-100">
                        <Copy size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                <Command size={80} className="absolute -right-6 -bottom-6 opacity-10 rotate-12" />
                <h4 className="text-lg font-bold mb-3">Autenticação JWT</h4>
                <p className="text-indigo-100 text-xs font-medium leading-relaxed mb-6">
                  Todas as requisições privadas devem incluir o Header <code className="bg-white/20 px-1 rounded">Authorization: Bearer</code> com seu token de acesso pessoal.
                </p>
                <button className="w-full py-3 bg-white text-indigo-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-50 transition-colors shadow-lg">
                  Gerar Token
                </button>
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-6 border border-slate-200 dark:border-slate-700">
                 <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">Precisa de ajuda?</h4>
                 <p className="text-xs text-slate-500 mb-4">Consulte nossa documentação completa no Postman.</p>
                 <button className="text-indigo-600 text-xs font-bold hover:underline flex items-center gap-1">
                    Abrir Postman Docs <ExternalLink size={12} />
                 </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SIP/SonaVOIP Configuration Modal */}
      {showSipModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/50">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-600">
                            <Settings2 size={20} />
                        </div>
                        <div>
                            <h3 className="font-black text-lg">Configuração SIP</h3>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Credenciais SonaVOIP / MicroSIP</p>
                        </div>
                    </div>
                    <button onClick={() => setShowSipModal(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl text-slate-400">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar relative">
                    {isLoadingSip && (
                        <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 z-10 flex items-center justify-center backdrop-blur-sm">
                            <div className="flex flex-col items-center">
                                <Loader2 size={32} className="animate-spin text-emerald-600 mb-2" />
                                <span className="text-xs font-bold text-emerald-600">Carregando dados...</span>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        
                        {/* Nome da Conta */}
                        <div className="col-span-2 space-y-1.5">
                            <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1">Nome da Conta</label>
                            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 flex items-center gap-3 focus-within:border-emerald-500 transition-colors">
                                <Radio size={16} className="text-slate-400" />
                                <input 
                                    type="text" 
                                    className="bg-transparent border-none outline-none w-full text-sm font-bold text-slate-700 dark:text-slate-200 placeholder-slate-400"
                                    value={sipConfig.accountName}
                                    onChange={(e) => setSipConfig({...sipConfig, accountName: e.target.value})}
                                />
                            </div>
                        </div>

                        {/* Servidor SIP */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1">Servidor SIP</label>
                            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 flex items-center gap-3 focus-within:border-emerald-500 transition-colors">
                                <Server size={16} className="text-slate-400" />
                                <input 
                                    type="text" 
                                    className="bg-transparent border-none outline-none w-full text-sm font-bold text-slate-700 dark:text-slate-200"
                                    value={sipConfig.sipServer}
                                    onChange={(e) => setSipConfig({...sipConfig, sipServer: e.target.value})}
                                />
                            </div>
                        </div>

                        {/* Proxy SIP */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1">Proxy SIP</label>
                            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 flex items-center gap-3 focus-within:border-emerald-500 transition-colors">
                                <Globe size={16} className="text-slate-400" />
                                <input 
                                    type="text" 
                                    className="bg-transparent border-none outline-none w-full text-sm font-bold text-slate-700 dark:text-slate-200"
                                    value={sipConfig.sipProxy}
                                    onChange={(e) => setSipConfig({...sipConfig, sipProxy: e.target.value})}
                                />
                            </div>
                        </div>

                         {/* Usuário */}
                         <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1">Usuário *</label>
                            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 flex items-center gap-3 focus-within:border-emerald-500 transition-colors">
                                <UserIcon size={16} className="text-slate-400" />
                                <input 
                                    type="text" 
                                    className="bg-transparent border-none outline-none w-full text-sm font-bold text-slate-700 dark:text-slate-200"
                                    value={sipConfig.username}
                                    onChange={(e) => setSipConfig({...sipConfig, username: e.target.value})}
                                />
                            </div>
                        </div>

                        {/* Domínio */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1">Domínio *</label>
                            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 flex items-center gap-3 focus-within:border-emerald-500 transition-colors">
                                <Globe size={16} className="text-slate-400" />
                                <input 
                                    type="text" 
                                    className="bg-transparent border-none outline-none w-full text-sm font-bold text-slate-700 dark:text-slate-200"
                                    value={sipConfig.domain}
                                    onChange={(e) => setSipConfig({...sipConfig, domain: e.target.value})}
                                />
                            </div>
                        </div>

                        {/* Login */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1">Login</label>
                            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 flex items-center gap-3 focus-within:border-emerald-500 transition-colors">
                                <Key size={16} className="text-slate-400" />
                                <input 
                                    type="text" 
                                    className="bg-transparent border-none outline-none w-full text-sm font-bold text-slate-700 dark:text-slate-200"
                                    value={sipConfig.login}
                                    onChange={(e) => setSipConfig({...sipConfig, login: e.target.value})}
                                />
                            </div>
                        </div>

                         {/* Senha */}
                         <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1">Senha</label>
                            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 flex items-center gap-3 focus-within:border-emerald-500 transition-colors">
                                <Lock size={16} className="text-slate-400" />
                                <input 
                                    type="password" 
                                    className="bg-transparent border-none outline-none w-full text-sm font-bold text-slate-700 dark:text-slate-200"
                                    value={sipConfig.password}
                                    placeholder="••••••••"
                                    onChange={(e) => setSipConfig({...sipConfig, password: e.target.value})}
                                />
                            </div>
                        </div>

                         {/* Nome de Exibição */}
                         <div className="col-span-2 space-y-1.5">
                            <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1">Nome de Exibição</label>
                            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 flex items-center gap-3 focus-within:border-emerald-500 transition-colors">
                                <Mic size={16} className="text-slate-400" />
                                <input 
                                    type="text" 
                                    className="bg-transparent border-none outline-none w-full text-sm font-bold text-slate-700 dark:text-slate-200"
                                    value={sipConfig.displayName}
                                    onChange={(e) => setSipConfig({...sipConfig, displayName: e.target.value})}
                                />
                            </div>
                        </div>

                        {/* Transporte */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1">Transporte</label>
                            <div className="relative">
                                <select 
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold outline-none appearance-none focus:border-emerald-500 transition-colors text-slate-700 dark:text-slate-200"
                                    value={sipConfig.transport}
                                    onChange={(e) => setSipConfig({...sipConfig, transport: e.target.value})}
                                >
                                    <option value="UDP">UDP</option>
                                    <option value="TCP">TCP</option>
                                    <option value="TLS">TLS</option>
                                </select>
                            </div>
                        </div>

                        {/* Keep Alive */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1">Manter Ativo (s)</label>
                            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 flex items-center gap-3 focus-within:border-emerald-500 transition-colors">
                                <Wifi size={16} className="text-slate-400" />
                                <input 
                                    type="number" 
                                    className="bg-transparent border-none outline-none w-full text-sm font-bold text-slate-700 dark:text-slate-200"
                                    value={sipConfig.keepAlive}
                                    onChange={(e) => setSipConfig({...sipConfig, keepAlive: Number(e.target.value)})}
                                />
                            </div>
                        </div>

                    </div>
                </div>

                <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex gap-4">
                    <button 
                        onClick={() => setShowSipModal(false)}
                        className="flex-1 py-3 text-sm font-bold text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-all"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleSaveSip}
                        disabled={isSavingSip}
                        className="flex-[2] bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl py-3 transition-all shadow-xl shadow-emerald-500/20 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isSavingSip ? (
                            <>
                                <Loader2 size={18} className="animate-spin" /> Salvando...
                            </>
                        ) : (
                            <>
                                <Save size={18} /> Salvar Credenciais
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Integrations;
