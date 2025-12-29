import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  User, 
  Bell, 
  Palette, 
  Database,
  ChevronRight,
  Brain,
  ArrowLeft,
  Save,
  Loader2,
  Key,
  MessageSquare,
  Cpu,
  ToggleLeft,
  ToggleRight,
  Check,
  Zap,
  Plus,
  Trash2,
  Edit2,
  FileAudio,
  Image as ImageIcon,
  Paperclip,
  Search,
  UploadCloud,
  Download,
  Lock,
  Info
} from 'lucide-react';

// API URL (Adjust as needed)
const API_URL = "http://localhost:8080";

// Modelos de IA por Provedor
const AI_MODELS = {
  openai: {
    response: [
      { id: 'gpt-4o', name: 'GPT-4o (Mais Recente)' },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo (Rápido)' },
    ],
    transcription: [
      { id: 'whisper-1', name: 'Whisper 1' },
    ],
  },
  gemini: {
    response: [
      { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash (Rápido)' },
      { id: 'gemini-3-pro-preview', name: 'Gemini 3 Pro (Avançado)' },
    ],
    transcription: [
      { id: 'gemini-2.5-flash-native-audio-preview-09-2025', name: 'Gemini 2.5 Flash Audio' },
    ],
  },
  groq: {
    response: [
      { id: 'llama3-70b-8192', name: 'LLaMA3 70b' },
      { id: 'llama3-8b-8192', name: 'LLaMA3 8b' },
      { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7b' },
    ],
    transcription: [
      { id: 'whisper-large-v3', name: 'Whisper Large v3' },
    ],
  },
};

interface QuickMessage {
  id: number;
  shortcode: string;
  message: string;
  mediaPath?: string;
  mediaName?: string;
}

type SettingsSection = 'main' | 'ai' | 'quick_messages' | 'account' | 'branding' | 'notifications' | 'data' | 'security';

const Settings: React.FC = () => {
  const [activeSection, setActiveSection] = useState<SettingsSection>('main');
  const [isSaving, setIsSaving] = useState(false);
  
  // --- STATE FOR QUICK MESSAGES ---
  const [quickMessages, setQuickMessages] = useState<QuickMessage[]>([]);
  const [isLoadingQm, setIsLoadingQm] = useState(false);
  const [showQmModal, setShowQmModal] = useState(false);
  const [currentQm, setCurrentQm] = useState<Partial<QuickMessage>>({ shortcode: '', message: '' });
  const [qmFile, setQmFile] = useState<File | null>(null);

  // --- STATE FOR SETTINGS ---
  const [account, setAccount] = useState({ name: 'Admin', email: 'admin@whaticket.com', password: '' });
  const [branding, setBranding] = useState({ companyName: 'Minha Empresa', primaryColor: '#4f46e5', secondaryColor: '#10b981' });
  const [notifications, setNotifications] = useState({ newTicket: true, newMessage: true, ticketClose: true, connectionAlert: true });

  // --- AI STATE ---
  const [aiConfig, setAiConfig] = useState({
    enabled: true,
    provider: 'gemini', 
    apiKey: '',
    model: 'gemini-3-flash-preview', 
    systemPrompt: `Você é um assistente virtual inteligente do Whaticket Plus.
Seu objetivo é auxiliar no atendimento ao cliente de forma cordial e eficiente.
Sempre se identifique como Assistente Virtual.`,
    autoTranscribeAudio: false,
    transcriptionProvider: 'gemini',
    transcriptionApiKey: '',
    transcriptionModel: 'gemini-2.5-flash-native-audio-preview-09-2025'
  });

  // Fetch Settings (Generic)
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
      try {
          const res = await fetch(`${API_URL}/api/settings`, {
              headers: { 'Authorization': 'Bearer token' }
          });
          const data = await res.json();
          if (Array.isArray(data)) {
              const getValue = (key: string, defaultValue: any) => data.find((s: any) => s.key === key)?.value ?? defaultValue;
              
              setAiConfig({
                  enabled: getValue('ai_enabled', 'true') === 'true',
                  provider: getValue('ai_provider', 'gemini'),
                  apiKey: getValue('ai_api_key', ''),
                  model: getValue('ai_model', 'gemini-3-flash-preview'),
                  systemPrompt: getValue('ai_system_prompt', aiConfig.systemPrompt),
                  autoTranscribeAudio: getValue('ai_auto_transcribe_audio', 'false') === 'true',
                  transcriptionProvider: getValue('ai_transcription_provider', 'gemini'),
                  transcriptionApiKey: getValue('ai_transcription_api_key', ''),
                  transcriptionModel: getValue('ai_transcription_model', 'gemini-2.5-flash-native-audio-preview-09-2025')
              });

              setBranding({
                  companyName: getValue('company_name', 'Minha Empresa'),
                  primaryColor: getValue('primary_color', '#4f46e5'),
                  secondaryColor: getValue('secondary_color', '#10b981'),
              });

              setNotifications({
                  newTicket: getValue('notify_new_ticket', 'true') === 'true',
                  newMessage: getValue('notify_new_message', 'true') === 'true',
                  ticketClose: getValue('notify_ticket_close', 'true') === 'true',
                  connectionAlert: getValue('notify_connection', 'true') === 'true'
              });
          }
      } catch (error) {
          console.error("Error fetching settings", error);
      }
  };

  // Fetch Quick Messages
  useEffect(() => {
    if (activeSection === 'quick_messages') {
      fetchQuickMessages();
    }
  }, [activeSection]);

  const fetchQuickMessages = async () => {
    setIsLoadingQm(true);
    try {
      const res = await fetch(`${API_URL}/api/quick-messages`, {
        headers: { 'Authorization': 'Bearer token' } // Mock Token
      });
      if (res.ok) {
        const data = await res.json();
        setQuickMessages(data);
      }
    } catch (error) {
      console.error("Failed to fetch quick messages", error);
    } finally {
      setIsLoadingQm(false);
    }
  };

  const handleSaveQm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const formData = new FormData();
    formData.append('shortcode', currentQm.shortcode || '');
    formData.append('message', currentQm.message || '');
    if (qmFile) {
      formData.append('media', qmFile);
    }

    try {
      const url = currentQm.id 
        ? `${API_URL}/api/quick-messages/${currentQm.id}` 
        : `${API_URL}/api/quick-messages`;
      
      const method = currentQm.id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Authorization': 'Bearer token' },
        body: formData
      });

      if (res.ok) {
        setShowQmModal(false);
        setQmFile(null);
        setCurrentQm({ shortcode: '', message: '' });
        fetchQuickMessages();
      } else {
        alert("Erro ao salvar. Verifique se o atalho já existe.");
      }
    } catch (error) {
      console.error(error);
      alert("Erro de conexão.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteQm = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir esta resposta rápida?")) return;
    try {
      await fetch(`${API_URL}/api/quick-messages/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer token' }
      });
      fetchQuickMessages();
    } catch (error) {
      console.error(error);
    }
  };

  const handleEditQm = (qm: QuickMessage) => {
    setCurrentQm(qm);
    setQmFile(null);
    setShowQmModal(true);
  };

  const handleSaveAi = async () => {
    setIsSaving(true);
    try {
        const settingsToSave = [
            { key: "ai_enabled", value: String(aiConfig.enabled) },
            { key: "ai_provider", value: aiConfig.provider },
            { key: "ai_api_key", value: aiConfig.apiKey },
            { key: "ai_system_prompt", value: aiConfig.systemPrompt },
            { key: "ai_model", value: aiConfig.model },
            { key: "ai_auto_transcribe_audio", value: String(aiConfig.autoTranscribeAudio) },
            { key: "ai_transcription_provider", value: aiConfig.transcriptionProvider },
            { key: "ai_transcription_api_key", value: aiConfig.transcriptionApiKey },
            { key: "ai_transcription_model", value: aiConfig.transcriptionModel }
        ];

        // Save sequentially
        for (const setting of settingsToSave) {
            await fetch(`${API_URL}/api/settings/${setting.key}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer token' 
                },
                body: JSON.stringify({ value: setting.value })
            });
        }
        
        alert("Configurações de IA salvas com sucesso!");
    } catch (error) {
        console.error("Error saving settings", error);
        alert("Erro ao salvar configurações.");
    } finally {
        setIsSaving(false);
    }
  };

  const handleSaveAccount = async () => {
      setIsSaving(true);
      try {
          // Assume ID 1 for current user (mock)
          await fetch(`${API_URL}/api/users/1`, {
              method: 'PUT',
              headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': 'Bearer token'
              },
              body: JSON.stringify(account)
          });
          alert("Dados da conta atualizados!");
      } catch (e) {
          alert("Erro ao salvar conta.");
      } finally {
          setIsSaving(false);
      }
  };

  const handleSaveBranding = async () => {
      setIsSaving(true);
      try {
          const settingsToSave = [
              { key: "company_name", value: branding.companyName },
              { key: "primary_color", value: branding.primaryColor },
              { key: "secondary_color", value: branding.secondaryColor }
          ];
          for (const setting of settingsToSave) {
            await fetch(`${API_URL}/api/settings/${setting.key}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer token' },
                body: JSON.stringify({ value: setting.value })
            });
          }
          alert("Configurações de marca salvas!");
      } catch (e) {
          alert("Erro ao salvar.");
      } finally {
          setIsSaving(false);
      }
  };

  const handleSaveNotifications = async () => {
      setIsSaving(true);
      try {
          const settingsToSave = [
              { key: "notify_new_ticket", value: String(notifications.newTicket) },
              { key: "notify_new_message", value: String(notifications.newMessage) },
              { key: "notify_ticket_close", value: String(notifications.ticketClose) },
              { key: "notify_connection", value: String(notifications.connectionAlert) }
          ];
          for (const setting of settingsToSave) {
            await fetch(`${API_URL}/api/settings/${setting.key}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer token' },
                body: JSON.stringify({ value: setting.value })
            });
          }
          alert("Preferências de notificação salvas!");
      } catch (e) {
          alert("Erro ao salvar.");
      } finally {
          setIsSaving(false);
      }
  };

  const settingsGroups = [
    {
      title: 'Sistema',
      items: [
        { icon: <User className="text-indigo-500" />, label: 'Minha Conta', description: 'Dados pessoais e segurança', action: () => setActiveSection('account') },
        { icon: <Zap className="text-amber-500" />, label: 'Respostas Rápidas', description: 'Atalhos de mensagens (/)', action: () => setActiveSection('quick_messages') },
        { icon: <Brain className="text-violet-500" />, label: 'Inteligência Artificial', description: 'Chatbot LLM (Gemini, OpenAI, Groq)', action: () => setActiveSection('ai') },
        { icon: <Palette className="text-pink-500" />, label: 'Cores & Marca', description: 'Logotipo e cores personalizadas', action: () => setActiveSection('branding') },
        { icon: <Bell className="text-teal-500" />, label: 'Notificações', description: 'Configurar avisos do sistema', action: () => setActiveSection('notifications') },
      ]
    },
    {
      title: 'Avançado',
      items: [
        { icon: <Database className="text-slate-500" />, label: 'Importação/Exportação', description: 'Gerenciar contatos e dados', action: () => setActiveSection('data') },
        { icon: <Shield className="text-red-500" />, label: 'Segurança & Logs', description: 'Registros de acesso e auditoria', action: () => setActiveSection('security') },
      ]
    }
  ];

  // --- RENDER HELPERS ---
  const SettingsHeader = ({ title, desc }: { title: string, desc: string }) => (
    <header className="flex items-center gap-4 mb-8">
        <button onClick={() => setActiveSection('main')} className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-white">
            <ArrowLeft size={24} />
        </button>
        <div>
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            <p className="text-slate-500">{desc}</p>
        </div>
    </header>
  );

  const renderContent = () => {
      switch (activeSection) {
        case 'account':
            return (
                <div className="p-8 max-w-2xl mx-auto animate-in slide-in-from-right duration-300">
                    <SettingsHeader title="Minha Conta" desc="Gerencie suas informações de perfil." />
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border dark:border-slate-700 space-y-6">
                        <div className="flex justify-center mb-6">
                            <div className="w-24 h-24 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden border-4 border-white dark:border-slate-600 shadow-lg relative cursor-pointer group">
                                <img src="https://picsum.photos/seed/user/200/200" alt="Avatar" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <UploadCloud className="text-white" />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Nome Completo</label>
                                <input 
                                    type="text" 
                                    value={account.name}
                                    onChange={e => setAccount({...account, name: e.target.value})}
                                    className="w-full mt-1 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500" 
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
                                <input 
                                    type="email" 
                                    value={account.email}
                                    onChange={e => setAccount({...account, email: e.target.value})}
                                    className="w-full mt-1 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500" 
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Nova Senha</label>
                                <input 
                                    type="password" 
                                    placeholder="Deixe em branco para manter" 
                                    value={account.password}
                                    onChange={e => setAccount({...account, password: e.target.value})}
                                    className="w-full mt-1 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500" 
                                />
                            </div>
                        </div>
                        <button onClick={handleSaveAccount} disabled={isSaving} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-2">
                            {isSaving ? <Loader2 className="animate-spin" /> : <Save />} Salvar Alterações
                        </button>
                    </div>
                </div>
            );

        case 'branding':
            return (
                <div className="p-8 max-w-2xl mx-auto animate-in slide-in-from-right duration-300">
                    <SettingsHeader title="Cores & Marca" desc="Personalize a aparência do sistema." />
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border dark:border-slate-700 space-y-6">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Nome da Empresa</label>
                            <input 
                                type="text" 
                                value={branding.companyName}
                                onChange={e => setBranding({...branding, companyName: e.target.value})}
                                className="w-full mt-1 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500" 
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Cor Primária</label>
                                <div className="flex items-center gap-2 mt-1 p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl">
                                    <input 
                                        type="color" 
                                        value={branding.primaryColor}
                                        onChange={e => setBranding({...branding, primaryColor: e.target.value})}
                                        className="w-8 h-8 rounded cursor-pointer bg-transparent border-none" 
                                    />
                                    <span className="text-sm font-mono uppercase">{branding.primaryColor}</span>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Cor Secundária</label>
                                <div className="flex items-center gap-2 mt-1 p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl">
                                    <input 
                                        type="color" 
                                        value={branding.secondaryColor}
                                        onChange={e => setBranding({...branding, secondaryColor: e.target.value})}
                                        className="w-8 h-8 rounded cursor-pointer bg-transparent border-none" 
                                    />
                                    <span className="text-sm font-mono uppercase">{branding.secondaryColor}</span>
                                </div>
                            </div>
                        </div>
                         <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                             <div className="flex-1">
                                 <h4 className="font-bold text-sm">Logotipo (Claro)</h4>
                                 <p className="text-xs text-slate-500">Usado no modo light.</p>
                             </div>
                             <button className="px-3 py-1.5 bg-white dark:bg-slate-800 border dark:border-slate-600 rounded-lg text-xs font-bold">Upload</button>
                         </div>
                         <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                             <div className="flex-1">
                                 <h4 className="font-bold text-sm">Logotipo (Escuro)</h4>
                                 <p className="text-xs text-slate-500">Usado no modo dark.</p>
                             </div>
                             <button className="px-3 py-1.5 bg-white dark:bg-slate-800 border dark:border-slate-600 rounded-lg text-xs font-bold">Upload</button>
                         </div>
                        <button onClick={handleSaveBranding} disabled={isSaving} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-2">
                             {isSaving ? <Loader2 className="animate-spin" /> : <Save />} Salvar Marca
                        </button>
                    </div>
                </div>
            );

        case 'notifications':
             return (
                <div className="p-8 max-w-2xl mx-auto animate-in slide-in-from-right duration-300">
                    <SettingsHeader title="Notificações" desc="Controle como você recebe alertas." />
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border dark:border-slate-700 space-y-4">
                        {[
                            { key: 'newTicket', label: "Novos Tickets", desc: "Receber alerta quando um cliente abrir um ticket." },
                            { key: 'newMessage', label: "Mensagens Recebidas", desc: "Tocar som ao receber nova mensagem." },
                            { key: 'ticketClose', label: "Tickets Finalizados", desc: "Notificar quando um ticket for encerrado." },
                            { key: 'connectionAlert', label: "Alertas de Conexão", desc: "Avisar se o WhatsApp desconectar." }
                        ].map((item) => (
                            <div key={item.key} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer" onClick={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key as keyof typeof notifications] })}>
                                <div>
                                    <h4 className="font-bold text-sm">{item.label}</h4>
                                    <p className="text-xs text-slate-500">{item.desc}</p>
                                </div>
                                <div className={`w-12 h-6 rounded-full relative transition-colors ${notifications[item.key as keyof typeof notifications] ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${notifications[item.key as keyof typeof notifications] ? 'right-1' : 'left-1'}`}></div>
                                </div>
                            </div>
                        ))}
                        <button onClick={handleSaveNotifications} disabled={isSaving} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 mt-4">
                             {isSaving ? <Loader2 className="animate-spin" /> : <Save />} Salvar Preferências
                        </button>
                    </div>
                </div>
             );

        case 'data':
             return (
                <div className="p-8 max-w-2xl mx-auto animate-in slide-in-from-right duration-300">
                    <SettingsHeader title="Importação e Exportação" desc="Gerencie seus dados e backups." />
                    <div className="grid grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border dark:border-slate-700 flex flex-col items-center text-center gap-4 hover:border-indigo-500 transition-colors cursor-pointer group">
                             <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                 <Download size={32} />
                             </div>
                             <div>
                                 <h3 className="font-bold text-lg">Exportar Contatos</h3>
                                 <p className="text-xs text-slate-500">Baixar lista completa em CSV.</p>
                             </div>
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border dark:border-slate-700 flex flex-col items-center text-center gap-4 hover:border-indigo-500 transition-colors cursor-pointer group">
                             <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                 <UploadCloud size={32} />
                             </div>
                             <div>
                                 <h3 className="font-bold text-lg">Importar Contatos</h3>
                                 <p className="text-xs text-slate-500">Subir planilha Excel/CSV.</p>
                             </div>
                        </div>
                         <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border dark:border-slate-700 flex flex-col items-center text-center gap-4 hover:border-indigo-500 transition-colors cursor-pointer group">
                             <div className="w-16 h-16 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                 <Database size={32} />
                             </div>
                             <div>
                                 <h3 className="font-bold text-lg">Backup de Conversas</h3>
                                 <p className="text-xs text-slate-500">Gerar arquivo JSON de chats.</p>
                             </div>
                        </div>
                    </div>
                </div>
             );

        case 'security':
            return (
                <div className="p-8 max-w-2xl mx-auto animate-in slide-in-from-right duration-300">
                    <SettingsHeader title="Segurança" desc="Proteja sua conta e monitore acessos." />
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border dark:border-slate-700 space-y-6">
                        <div className="flex items-center justify-between p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
                            <div className="flex items-center gap-3">
                                <Shield className="text-indigo-600" />
                                <div>
                                    <h4 className="font-bold text-sm">Autenticação de Dois Fatores (2FA)</h4>
                                    <p className="text-xs text-slate-500">Adicione uma camada extra de segurança.</p>
                                </div>
                            </div>
                            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700">Ativar</button>
                        </div>

                        <div>
                            <h4 className="font-bold text-sm mb-4">Sessões Ativas</h4>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-500">
                                            <Zap size={20} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm">Chrome - Windows</p>
                                            <p className="text-[10px] text-slate-500">São Paulo, BR • Atual</p>
                                        </div>
                                    </div>
                                    <span className="text-emerald-500 text-xs font-bold">Online</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-500">
                                            <Zap size={20} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm">Safari - iPhone</p>
                                            <p className="text-[10px] text-slate-500">São Paulo, BR • 2h atrás</p>
                                        </div>
                                    </div>
                                    <button className="text-red-500 text-xs font-bold hover:underline">Revogar</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );

        default:
          return (
             <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
                <p className="text-slate-500">Personalize o Whaticket Plus conforme sua necessidade.</p>
              </div>

              <div className="space-y-8">
                {settingsGroups.map((group) => (
                  <div key={group.title} className="space-y-4">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 pl-4">{group.title}</h2>
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border dark:border-slate-700 shadow-sm overflow-hidden divide-y dark:divide-slate-700">
                      {group.items.map((item) => (
                        <button 
                          key={item.label}
                          onClick={item.action}
                          className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left group"
                        >
                          <div className="flex items-center gap-4">
                            <div className="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl group-hover:scale-110 transition-transform">
                              {item.icon}
                            </div>
                            <div>
                              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">{item.label}</h4>
                              <p className="text-xs text-slate-500">{item.description}</p>
                            </div>
                          </div>
                          <ChevronRight size={18} className="text-slate-300" />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-12 p-6 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/30">
                <h3 className="text-red-600 font-bold mb-1">Zona Crítica</h3>
                <p className="text-red-500 text-xs mb-4">As ações abaixo são permanentes e não podem ser desfeitas.</p>
                <button onClick={() => confirm("Tem certeza? Esta ação deletará todos os seus dados.") && alert("Solicitação de exclusão enviada.")} className="text-red-600 text-sm font-bold border border-red-200 dark:border-red-900/50 px-4 py-2 rounded-xl hover:bg-red-600 hover:text-white transition-all">
                  Excluir minha empresa
                </button>
              </div>
            </div>
          );
      }
  };

  return renderContent();
};

export default Settings;