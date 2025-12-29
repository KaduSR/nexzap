
import axios from "axios";
import { getIO } from "../../libs/socket";

// URL do seu Typebot Viewer (onde o fluxo roda)
const TYPEBOT_API_URL = "https://typebot.io/api/v1"; 
const TYPEBOT_PUBLIC_ID = "my-public-bot-id"; // ID público do fluxo

export const handleTypebot = async (
    ticket: any, 
    messageBody: string, 
    wbot: any
): Promise<void> => {
    
    if (!ticket.typebotStatus) return;

    try {
        let sessionId = ticket.typebotSessionId;
        let data;

        // 1. Iniciar ou Continuar Sessão
        if (!sessionId) {
            console.log(`[Typebot] Iniciando nova sessão para Ticket ${ticket.id}`);
            const req = await axios.post(`${TYPEBOT_API_URL}/typebots/${TYPEBOT_PUBLIC_ID}/start`, {
                prefilledVariables: {
                    remoteJid: ticket.contact?.remoteJid,
                    name: ticket.contact?.name,
                    ticketId: ticket.id
                }
            });
            data = req.data;
            sessionId = data.sessionId;
            
            // Atualizar ticket com sessionId (Mock)
            ticket.typebotSessionId = sessionId;
        } else {
            console.log(`[Typebot] Continuando sessão ${sessionId}`);
            const req = await axios.post(`${TYPEBOT_API_URL}/sessions/${sessionId}/continue`, {
                message: messageBody
            });
            data = req.data;
        }

        // 2. Processar Respostas do Typebot (Bubbles)
        const messages = data.messages || [];
        
        for (const message of messages) {
            // Delay natural entre mensagens
            await new Promise(r => setTimeout(r, 1000));

            if (message.type === "text") {
                const text = message.content.richText?.[0]?.children?.[0]?.text || "Mensagem sem texto";
                
                await wbot.sendMessage(ticket.contact?.remoteJid || `${ticket.contactId}@s.whatsapp.net`, {
                    text: text
                });
                
                // Emitir Socket para aparecer no painel
                emitSocketMessage(ticket, text);
            }
            
            if (message.type === "image") {
                const url = message.content.url;
                await wbot.sendMessage(ticket.contact?.remoteJid || `${ticket.contactId}@s.whatsapp.net`, {
                    image: { url }
                });
                emitSocketMessage(ticket, "📷 Imagem enviada pelo Bot");
            }

            if (message.type === "audio") {
                 const url = message.content.url;
                 await wbot.sendMessage(ticket.contact?.remoteJid || `${ticket.contactId}@s.whatsapp.net`, {
                    audio: { url },
                    mimetype: 'audio/mp4',
                    ptt: true // Envia como nota de voz
                });
                emitSocketMessage(ticket, "🎤 Áudio enviado pelo Bot");
            }
        }

        // 3. Processar Ações de Entrada (Input)
        // Se o Typebot espera uma entrada, não finalizamos o ticket.
        // Se não houver input esperado, o fluxo pode ter acabado.

    } catch (error) {
        console.error("[Typebot] Erro de comunicação:", error);
    }
};

const emitSocketMessage = (ticket: any, body: string) => {
    const io = getIO();
    const mockMessage = {
        id: `tb_${Date.now()}_${Math.random()}`,
        ticketId: ticket.id,
        body: body,
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
};
