import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Save, 
  ChevronRight, 
  MessageSquare, 
  Clock, 
  Zap, 
  GitBranch, 
  Users, 
  Bot, 
  Database, 
  ArrowRight, 
  Settings2, 
  Globe, 
  Activity, 
  X, 
  Code, 
  Trash2, 
  FileText, 
  AlertCircle, 
  Play, 
  Layers, 
  MousePointer2, 
  Share2, 
  Smartphone, 
  CheckCircle2, 
  ArrowDown, 
  Split, 
  Timer, 
  Terminal, 
  Loader2,
  Trash,
  Tag as TagIcon
} from 'lucide-react';

interface WorkflowNode {
  id: string;
  type: 'trigger' | 'message' | 'choice' | 'condition' | 'wait' | 'transfer' | 'input' | 'tag';
  label: string;
  data: any;
  position: { x: number; y: number };
}

const API_URL = "http://localhost:8080";

const Chatbot: React.FC = () => {
  const [isAddingNode, setIsAddingNode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Responsive State
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [isLibraryOpen, setIsLibraryOpen] = useState(!isMobile);

  const [nodes, setNodes] = useState<WorkflowNode[]>([
    { 
      id: 'node_1', 
      type: 'trigger', 
      label: 'Início do Fluxo', 
      data: { trigger: 'Palavra-chave: "Suporte"', nextId: '' },
      position: { x: 400, y: 50 }
    }
  ]);
  
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Responsive listener
  useEffect(() => {
    const handleResize = () => {
        const mobile = window.innerWidth < 1024;
        setIsMobile(mobile);
        if (!mobile) {
            setIsLibraryOpen(true);
        }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load Flow from Backend on Mount
  useEffect(() => {
    fetchFlow();
  }, []);

  const fetchFlow = async () => {
    setIsLoading(true);
    try {
        const response = await fetch(`${API_URL}/api/flowbuilder/active`, {
            headers: { 'Authorization': 'Bearer token' }
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data && data.flow && Array.isArray(data.flow.nodes)) {
                setNodes(data.flow.nodes);
            }
        }
    } catch (error) {
        console.warn("Backend offline or unreachable. Using local default flow.");
    } finally {
        setIsLoading(false);
    }
  };

  const handleSaveFlow = async () => {
      setIsSaving(true);
      try {
          const startNode = nodes.find(n => n.type === 'trigger');
          const payload = {
              name: "Fluxo Principal",
              phrase: startNode?.data.trigger?.replace('Palavra-chave: ', '').replace(/"/g, '') || "ola",
              flow: {
                  nodes: nodes,
                  edges: [] // Edges are implicit in data.nextId in this simple builder
              }
          };

          const response = await fetch(`${API_URL}/api/flowbuilder`, {
              method: 'POST',
              headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': 'Bearer token'
              },
              body: JSON.stringify(payload)
          });

          if (response.ok) {
              alert("Fluxo publicado com sucesso! O Chatbot está ativo.");
          } else {
              alert("Erro ao salvar fluxo. Verifique o backend.");
          }
      } catch (error) {
          console.error("Error saving flow:", error);
          alert("Erro de conexão ao salvar.");
      } finally {
          setIsSaving(false);
      }
  };

  const nodeLibrary = [
    { type: 'message', label: 'Mensagem', icon: <MessageSquare size={18} />, color: 'bg-indigo-500', desc: 'Envio de texto/mídia' },
    { type: 'choice', label: 'Menu/Escolha', icon: <GitBranch size={18} />, color: 'bg-amber-500', desc: 'Opções numeradas' },
    { type: 'transfer', label: 'Transferir', icon: <Users size={18} />, color: 'bg-purple-500', desc: 'Para setor/humano' },
    { type: 'wait', label: 'Delay (Aguardar)', icon: <Clock size={18} />, color: 'bg-slate-500', desc: 'Pausa no fluxo' },
    { type: 'input', label: 'Pergunta (Input)', icon: <FileText size={18} />, color: 'bg-teal-500', desc: 'Salvar resposta' },
    { type: 'condition', label: 'Condição', icon: <Split size={18} />, color: 'bg-orange-500', desc: 'Se / Então' },
    { type: 'tag', label: 'Adicionar Tag', icon: <TagIcon size={18} />, color: 'bg-pink-500', desc: 'Etiquetar cliente' },
  ];

  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  const addNode = (type: string, label: string) => {
    const lastNode = nodes[nodes.length - 1];
    const newNodeId = `node_${Date.now()}`;
    
    // Default Data Structures based on Type
    let defaultData: any = { nextId: '' };
    if (type === 'message') defaultData = { content: 'Nova mensagem...', nextId: '' };
    if (type === 'choice') defaultData = { content: 'Escolha uma opção:', options: [{ value: '1', label: 'Opção 1', nextId: '' }] };
    if (type === 'transfer') defaultData = { queueId: 1 };
    if (type === 'wait') defaultData = { seconds: 5, nextId: '' };
    if (type === 'input') defaultData = { content: 'Qual seu nome?', variable: 'nome_cliente', nextId: '' };
    if (type === 'condition') defaultData = { variable: 'nome_cliente', operator: 'exists', nextIdTrue: '', nextIdFalse: '' };
    if (type === 'tag') defaultData = { tag: 'Novo Lead', nextId: '' };


    const newNode: WorkflowNode = {
      id: newNodeId,
      type: type as any,
      label: label,
      data: defaultData,
      position: { x: 400, y: (lastNode?.position.y || 0) + 180 }
    };
    
    const newNodes = [...nodes, newNode];
    // Automatically link previous node if applicable
    if (lastNode && !['choice', 'condition', 'transfer'].includes(lastNode.type)) {
         newNodes[newNodes.length - 2].data.nextId = newNodeId;
    }

    setNodes(newNodes);
    setIsAddingNode(false);
  };

  const addOptionToChoice = () => {
     if (!selectedNode || selectedNode.type !== 'choice') return;
     const newOption = { 
         value: String((selectedNode.data.options?.length || 0) + 1), 
         label: 'Nova Opção', 
         nextId: '' 
     };
     const updatedData = { ...selectedNode.data, options: [...(selectedNode.data.options || []), newOption] };
     setNodes(nodes.map(n => n.id === selectedNode.id ? { ...n, data: updatedData } : n));
  };

  const updateOption = (index: number, field: string, value: string) => {
      if (!selectedNode || selectedNode.type !== 'choice') return;
      const newOptions = [...selectedNode.data.options];
      newOptions[index] = { ...newOptions[index], [field]: value };
      setNodes(nodes.map(n => n.id === selectedNode.id ? { ...n, data: { ...selectedNode.data, options: newOptions } } : n));
  };

  const removeOption = (index: number) => {
      if (!selectedNode || selectedNode.type !== 'choice') return;
      const newOptions = selectedNode.data.options.filter((_: any, i: number) => i !== index);
      setNodes(nodes.map(n => n.id === selectedNode.id ? { ...n, data: { ...n.data, options: newOptions } } : n));
  };

  if (isLoading) {
      return (
          <div className="h-full flex items-center justify-center bg-slate-50 dark:bg-slate-950">
              <div className="flex flex-col items-center gap-4">
                  <Loader2 size={40} className="animate-spin text-indigo-600" />
                  <p className="text-slate-500 font-bold">Carregando Fluxo...</p>
              </div>
          </div>
      );
  }

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-950 select-none overflow-hidden">
      {/* Editor Header */}
      <header className="h-20 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between px-4 lg:px-8 z-30 shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => setIsLibraryOpen(!isLibraryOpen)} className="lg:hidden p-2 -ml-2 text-slate-500">
            <Layers size={24}/>
          </button>
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl rotate-3">
            <Bot size={28} />
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-tight">Workflow Builder</h1>
              <span className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest">PRO</span>
            </div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Engine v2.0</p>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <button 
            onClick={handleSaveFlow}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 md:px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm font-black shadow-xl transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            <span className="hidden md:inline">{isSaving ? 'Salvando...' : 'Publicar Fluxo'}</span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Component Library Sidebar */}
        {isMobile && isLibraryOpen && <div onClick={() => setIsLibraryOpen(false)} className="fixed inset-0 bg-black/60 z-10 lg:hidden" />}
        <aside className={`
          ${isMobile ? `fixed inset-y-0 left-0 z-20 ${isLibraryOpen ? 'translate-x-0' : '-translate-x-full'}` : 'relative'}
          w-80 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col shrink-0
          transition-transform duration-300 ease-in-out
        `}>
          <div className="p-4 lg:p-8 flex-1 overflow-y-auto custom-scrollbar space-y-8">
            <div>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <Layers size={12} /> Blocos Disponíveis
              </h3>
              <div className="space-y-3">
                {nodeLibrary.map((item) => (
                  <div 
                    key={item.type}
                    onClick={() => addNode(item.type, item.label)}
                    className="group flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-[24px] cursor-pointer hover:border-indigo-500 hover:bg-white dark:hover:bg-slate-800 hover:shadow-xl hover:-translate-y-1 transition-all active:scale-95"
                  >
                    <div className={`w-12 h-12 ${item.color} text-white rounded-[18px] flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform`}>
                      {item.icon}
                    </div>
                    <div>
                      <span className="block text-sm font-black text-slate-700 dark:text-slate-200">{item.label}</span>
                      <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-tight">{item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Visual Workflow Canvas */}
        <main className="flex-1 relative bg-[radial-gradient(#e2e8f0_1.5px,transparent_1.5px)] dark:bg-[radial-gradient(#1e293b_1.5px,transparent_1.5px)] [background-size:40px_40px] overflow-auto custom-scrollbar">
          <div className="min-w-[800px] min-h-[1500px] p-8 md:p-24 flex flex-col items-center relative">
            
            {nodes.map((node, index) => (
              <React.Fragment key={node.id}>
                <div 
                  onClick={() => setSelectedNodeId(node.id)}
                  className={`
                    w-96 bg-white dark:bg-slate-900 p-6 rounded-[32px] shadow-lg border-2 transition-all cursor-pointer relative group
                    ${selectedNodeId === node.id ? 'border-indigo-600 ring-[8px] ring-indigo-500/10 scale-105 z-10' : 'border-slate-100 dark:border-slate-800 hover:border-indigo-400'}
                  `}
                >
                  {/* Node Header */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-10 h-10 rounded-[16px] text-white shadow-md flex items-center justify-center shrink-0 ${
                      node.type === 'message' ? 'bg-indigo-500' : 
                      node.type === 'trigger' ? 'bg-emerald-500' :
                      node.type === 'choice' ? 'bg-amber-500' : 
                      node.type === 'wait' ? 'bg-slate-500' : 
                      node.type === 'condition' ? 'bg-orange-500' :
                      node.type === 'tag' ? 'bg-pink-500' :
                      node.type === 'input' ? 'bg-teal-500' : 'bg-purple-600'
                    }`}>
                      {node.type === 'message' ? <MessageSquare size={18} /> : 
                       node.type === 'trigger' ? <Zap size={18} /> :
                       node.type === 'choice' ? <GitBranch size={18} /> :
                       node.type === 'wait' ? <Clock size={18} /> :
                       node.type === 'condition' ? <Split size={18} /> :
                       node.type === 'tag' ? <TagIcon size={18} /> :
                       node.type === 'input' ? <FileText size={18} /> : <Users size={18} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate">{node.label}</h4>
                      <div className="flex items-center justify-between">
                         <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider">{node.type}</span>
                         <span className="text-[9px] bg-slate-100 dark:bg-slate-800 px-1.5 rounded text-slate-500 font-mono">ID: {node.id.split('_')[1]}</span>
                      </div>
                    </div>
                  </div>

                  {/* Node Content Preview */}
                  <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 font-medium">
                     {node.type === 'message' && <p className="line-clamp-2">"{node.data.content}"</p>}
                     {node.type === 'input' && <p className="line-clamp-2">Q: "{node.data.content}" -> Salvar em: <b>{node.data.variable}</b></p>}
                     {node.type === 'wait' && <p>Aguardar <b>{node.data.seconds}</b> segundos.</p>}
                     {node.type === 'tag' && <p>Tag: <b>{node.data.tag}</b></p>}
                     {node.type === 'condition' && <p>Se <b>{node.data.variable}</b> {node.data.operator} ...</p>}
                     {node.type === 'choice' && (
                         <ul className="space-y-1">
                             {node.data.options?.map((opt: any, i: number) => (
                                 <li key={i} className="flex gap-2">
                                     <span className="font-bold text-amber-500">{opt.value}.</span> 
                                     <span>{opt.label}</span>
                                     {opt.nextId && <ArrowRight size={10} className="mt-0.5 text-slate-300" />}
                                 </li>
                             ))}
                         </ul>
                     )}
                     {node.type === 'trigger' && <p>Gatilho: {node.data.trigger}</p>}
                     {node.type === 'transfer' && <p>Fila ID: {node.data.queueId}</p>}
                  </div>
                  
                  {node.data.nextId && !['choice', 'condition'].includes(node.type) && (
                      <div className="mt-3 flex items-center justify-center gap-1 text-[10px] text-indigo-500 font-bold bg-indigo-50 dark:bg-indigo-900/20 py-1 rounded-lg">
                          <ArrowDown size={12} /> Vai para {node.data.nextId.split('_')[1]}
                      </div>
                  )}
                </div>

                {index < nodes.length - 1 && <div className="h-8 border-l-2 border-dashed border-slate-300 dark:border-slate-700"></div>}
              </React.Fragment>
            ))}
            
            <button onClick={() => setIsAddingNode(true)} className="mt-8 p-4 bg-white dark:bg-slate-800 rounded-full shadow-lg text-indigo-600 hover:scale-110 transition-transform"><Plus /></button>
          </div>
        </main>

        {/* Properties Editor Drawer */}
        {selectedNode && (
          <>
            {isMobile && <div onClick={() => setSelectedNodeId(null)} className="fixed inset-0 bg-black/60 z-30 lg:hidden" />}
            <aside className={`
              ${isMobile ? 'fixed inset-y-0 right-0 z-40 w-full max-w-md' : 'relative w-[450px] shrink-0'}
              border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col shadow-2xl 
              animate-in slide-in-from-right-full lg:slide-in-from-right-0 duration-300
            `}>
              <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <h3 className="font-black text-lg">Configurar Bloco</h3>
                <button onClick={() => setSelectedNodeId(null)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400"><X size={20} /></button>
              </div>

              <div className="p-6 flex-1 overflow-y-auto custom-scrollbar space-y-6">
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Título do Bloco</label>
                  <input 
                      type="text" 
                      value={selectedNode.label}
                      onChange={(e) => setNodes(nodes.map(n => n.id === selectedNode.id ? { ...n, label: e.target.value } : n))}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold outline-none focus:border-indigo-500"
                  />
                </div>

                {(['message', 'choice', 'input'].includes(selectedNode.type)) && (
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase">Mensagem de Texto</label>
                      <textarea 
                          rows={5}
                          value={selectedNode.data.content}
                          onChange={(e) => setNodes(nodes.map(n => n.id === selectedNode.id ? { ...n, data: { ...n.data, content: e.target.value } } : n))}
                          className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:border-indigo-500 resize-none"
                      />
                    </div>
                )}

                {selectedNode.type === 'input' && (
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase">Nome da Variável (Salvar Resposta)</label>
                      <input 
                          type="text" 
                          value={selectedNode.data.variable}
                          onChange={(e) => setNodes(nodes.map(n => n.id === selectedNode.id ? { ...n, data: { ...n.data, variable: e.target.value } } : n))}
                          placeholder="ex: nome_cliente"
                          className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold outline-none focus:border-indigo-500"
                      />
                    </div>
                )}

                {selectedNode.type === 'wait' && (
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase">Segundos de Pausa</label>
                      <input 
                          type="number" 
                          value={selectedNode.data.seconds}
                          onChange={(e) => setNodes(nodes.map(n => n.id === selectedNode.id ? { ...n, data: { ...n.data, seconds: Number(e.target.value) } } : n))}
                          className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold outline-none focus:border-indigo-500"
                      />
                    </div>
                )}

                 {selectedNode.type === 'tag' && (
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase">Nome da Tag</label>
                      <input 
                          type="text" 
                          value={selectedNode.data.tag}
                          onChange={(e) => setNodes(nodes.map(n => n.id === selectedNode.id ? { ...n, data: { ...n.data, tag: e.target.value } } : n))}
                          className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold outline-none focus:border-indigo-500"
                      />
                    </div>
                )}

                {selectedNode.type === 'condition' && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                              <label className="text-xs font-bold text-slate-500 uppercase">Variável</label>
                              <input 
                                  type="text"
                                  value={selectedNode.data.variable}
                                  onChange={(e) => setNodes(nodes.map(n => n.id === selectedNode.id ? { ...n, data: { ...n.data, variable: e.target.value } } : n))}
                                  className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold outline-none"
                              />
                          </div>
                          <div>
                              <label className="text-xs font-bold text-slate-500 uppercase">Operador</label>
                              <select 
                                  value={selectedNode.data.operator}
                                  onChange={(e) => setNodes(nodes.map(n => n.id === selectedNode.id ? { ...n, data: { ...n.data, operator: e.target.value } } : n))}
                                  className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold outline-none"
                              >
                                  <option value="equals">Igual a</option>
                                  <option value="contains">Contém</option>
                                  <option value="exists">Existe</option>
                              </select>
                          </div>
                        </div>
                        
                        {selectedNode.data.operator !== 'exists' && (
                             <div>
                                  <label className="text-xs font-bold text-slate-500 uppercase">Valor</label>
                                  <input 
                                      type="text"
                                      value={selectedNode.data.value}
                                      onChange={(e) => setNodes(nodes.map(n => n.id === selectedNode.id ? { ...n, data: { ...n.data, value: e.target.value } } : n))}
                                      className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold outline-none"
                                  />
                             </div>
                        )}

                        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                             <label className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase">Se VERDADEIRO, ir para:</label>
                             <select 
                                  className="w-full mt-1 p-2 bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 rounded-lg text-sm outline-none"
                                  value={selectedNode.data.nextIdTrue || ''}
                                  onChange={(e) => setNodes(nodes.map(n => n.id === selectedNode.id ? { ...n, data: { ...n.data, nextIdTrue: e.target.value } } : n))}
                             >
                                  <option value="">-- Selecione --</option>
                                  {nodes.filter(n => n.id !== selectedNode.id).map(n => (
                                      <option key={n.id} value={n.id}>{n.label}</option>
                                  ))}
                             </select>
                        </div>

                        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-900/30">
                             <label className="text-xs font-bold text-red-600 dark:text-red-400 uppercase">Se FALSO, ir para:</label>
                             <select 
                                  className="w-full mt-1 p-2 bg-white dark:bg-slate-900 border border-red-200 dark:border-red-800 rounded-lg text-sm outline-none"
                                  value={selectedNode.data.nextIdFalse || ''}
                                  onChange={(e) => setNodes(nodes.map(n => n.id === selectedNode.id ? { ...n, data: { ...n.data, nextIdFalse: e.target.value } } : n))}
                             >
                                  <option value="">-- Selecione --</option>
                                  {nodes.filter(n => n.id !== selectedNode.id).map(n => (
                                      <option key={n.id} value={n.id}>{n.label}</option>
                                  ))}
                             </select>
                        </div>
                    </div>
                )}

                {selectedNode.type === 'choice' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-slate-500 uppercase">Opções do Menu</label>
                            <button onClick={addOptionToChoice} className="text-xs font-bold text-indigo-600 flex items-center gap-1 hover:underline"><Plus size={12}/> Adicionar</button>
                        </div>
                        
                        {selectedNode.data.options?.map((opt: any, idx: number) => (
                            <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 relative group">
                                <button onClick={() => removeOption(idx)} className="absolute top-2 right-2 text-slate-300 hover:text-red-500"><X size={14} /></button>
                                <div className="flex gap-2">
                                    <input 
                                      className="w-12 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-center text-sm font-bold"
                                      value={opt.value}
                                      onChange={(e) => updateOption(idx, 'value', e.target.value)}
                                    />
                                    <input 
                                      className="flex-1 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm"
                                      value={opt.label}
                                      onChange={(e) => updateOption(idx, 'label', e.target.value)}
                                      placeholder="Texto da Opção"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <ArrowRight size={14} className="text-slate-400" />
                                    <select 
                                      className="flex-1 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-indigo-600 outline-none"
                                      value={opt.nextId}
                                      onChange={(e) => updateOption(idx, 'nextId', e.target.value)}
                                    >
                                        <option value="">-- Selecione o Destino --</option>
                                        {nodes.filter(n => n.id !== selectedNode.id).map(n => (
                                            <option key={n.id} value={n.id}>Ir para: {n.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!['choice', 'condition'].includes(selectedNode.type) && (
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase">Próximo Passo (Automático)</label>
                      <select 
                          className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold outline-none focus:border-indigo-500"
                          value={selectedNode.data.nextId || ''}
                          onChange={(e) => setNodes(nodes.map(n => n.id === selectedNode.id ? { ...n, data: { ...n.data, nextId: e.target.value } } : n))}
                      >
                          <option value="">-- Finalizar Fluxo --</option>
                          {nodes.filter(n => n.id !== selectedNode.id).map(n => (
                              <option key={n.id} value={n.id}>Ir para: {n.label}</option>
                          ))}
                      </select>
                    </div>
                )}

                <button 
                  onClick={() => {
                    setNodes(nodes.filter(n => n.id !== selectedNode.id));
                    setSelectedNodeId(null);
                  }}
                  className="w-full py-4 text-red-500 bg-red-50 hover:bg-red-100 rounded-xl font-bold flex items-center justify-center gap-2"
                >
                    <Trash size={18} /> Excluir Bloco
                </button>

              </div>
            </aside>
          </>
        )}
      </div>
    </div>
  );
};

export default Chatbot;