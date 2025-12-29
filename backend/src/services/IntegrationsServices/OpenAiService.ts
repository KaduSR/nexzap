
import OpenAI from "openai";
import { getIO } from "../../libs/socket";

interface AiSettings {
    apiKey: string;
    organization?: string;
    prompt: string;
    model?: string; // gpt-3.5-turbo, gpt-4, deepseek-chat
    maxTokens?: number;
    temperature?: number;
}

// Simula banco de dados de configurações de IA
const mockAiSettings: AiSettings = {
    apiKey: "sk-mock-key-dev-only", // Substituir por ENV
    prompt: "Você é um assistente virtual da empresa Whaticket Plus. Responda de forma curta e educada.",
    model: "gpt-3.5-turbo",
    temperature: 0.7
};

// Histórico de mensagens em memória (Thread)
// Em produção, isso deve ser salvo no Redis ou Banco de Dados
const conversationHistory = new Map<number, any[]>();

export const handleAiChat = async (
    ticket: any, 
    messageBody: string, 
    wbot: any
): Promise<void> => {
    
    // 1. Verificar se a IA está ativa para este ticket
    if (!ticket.useIntegration || !ticket.promptId) {
        return;
    }

    // 2. Recuperar histórico
    let history = conversationHistory.get(ticket.id) || [];
    
    // Adiciona System Prompt se for nova conversa
    if (history.length === 0) {
        history.push({ role: "system", content: mockAiSettings.prompt });
    }

    // Adiciona mensagem do usuário
    history.push({ role: "user", content: messageBody });

    try {
        console.log(`[AI] Enviando prompt para OpenAI/DeepSeek (Ticket: ${ticket.id})...`);

        // Simulação de Resposta da IA (para evitar custo de API real no preview)
        // Em produção: const openai = new OpenAI({ apiKey: ... }); const response = await openai.chat.completions.create(...)
        
        await new Promise(r => setTimeout(r, 2000)); // Delay de "digitando..."
        
        const aiResponseText = `🤖 [IA Simulada]: Entendi que você disse "${messageBody}". Como posso ajudar com mais detalhes sobre o Whaticket Plus?`;

        // Adiciona resposta da IA ao histórico
        history.push({ role: "assistant", content: aiResponseText });
        
        // Limita histórico para economizar tokens (ex: últimas 10 msgs)
        if (history.length > 10) {
            history = [history[0], ...history.slice(-9)];
        }
        conversationHistory.set(ticket.id, history);

        // 3. Enviar resposta no WhatsApp
        await wbot.sendMessage(ticket.contact.remoteJid || `${ticket.contactId}@s.whatsapp.net`, {
            text: aiResponseText
        });

        // 4. Salvar mensagem no DB (Mock) e Emitir Socket
        const io = getIO();
        const mockMessage = {
            id: `ai_${Date.now()}`,
            ticketId: ticket.id,
            body: aiResponseText,
            fromMe: true,
            read: true,
            mediaType: "chat",
            timestamp: new Date().getTime()
        };

        io.emit("appMessage", {
            action: "create",
            message: mockMessage,
            ticket: ticket,
            contact: ticket.contact
        });

    } catch (error) {
        console.error("[AI] Erro ao processar OpenAiService:", error);
    }
};
