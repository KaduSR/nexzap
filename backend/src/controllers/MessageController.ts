// cspell: disable
import { Response } from "express";
import { getIO } from "../libs/socket";

// Serviços (Mantidos apenas os que são usados nas funções abaixo)
import DeleteMessageService from "../services/MessageServices/DeleteMessageService";
import SetTicketMessagesAsRead from "../services/TicketServices/SetTicketMessagesAsRead";

export const index = async (req: any, res: Response): Promise<Response> => {
  const { ticketId } = req.params;

  // 1. MOCK DE MENSAGENS (Simulação para teste de Frontend)
  const messages = [
    {
      id: `msg-${new Date().getTime()}`,
      body: `Olá! Aqui são as mensagens do Ticket ${ticketId} vindas do Backend (Mock)!`,
      fromMe: false,
      read: true,
      mediaType: "chat",
      createdAt: new Date().toISOString(),
      contactId: 1,
      ticketId: Number(ticketId),
    },
    {
      id: "msg-2",
      body: "Essa mensagem fui eu (atendente) que mandei.",
      fromMe: true,
      read: true,
      mediaType: "chat",
      createdAt: new Date().toISOString(),
      contactId: null,
      ticketId: Number(ticketId),
    },
  ];

  // Tenta marcar como lido (silencioso se falhar, pois é teste)
  try {
    await SetTicketMessagesAsRead(ticketId);
  } catch (err) {
    console.log("Aviso: Não foi possível marcar como lido (Ticket fake?)");
  }

  return res.json({
    count: messages.length,
    messages,
    ticket: { id: ticketId, status: "open" },
    hasMore: false,
  });
};

export const store = async (req: any, res: Response): Promise<Response> => {
  const { ticketId } = req.params;
  const { body, fromMe } = req.body;
  // Upload de arquivos está desativado neste Mock
  // const medias = req.files as Express.Multer.File[];

  // 1. Cria o objeto da mensagem (MOCK)
  const newMessage = {
    id: `msg-${new Date().getTime()}`,
    body: body,
    fromMe: fromMe || true, // Assume true (atendente) se não vier nada
    read: true,
    mediaType: "chat",
    createdAt: new Date().toISOString(),
    ticketId: Number(ticketId),
    contactId: null,
  };

  const io = getIO();
  const companyId = 1; // ID fixo para teste

  // 2. SOCKET 1: Avisa o Chat Aberto (Balão aparece)
  io.to(ticketId.toString()).emit("appMessage", {
    action: "create",
    message: newMessage,
  });

  // 3. SOCKET 2: Avisa a Lista Lateral/Kanban (Atualiza posição e texto)
  const ticketParaLista = {
    id: Number(ticketId),
    lastMessage: body,
    updatedAt: new Date().toISOString(), // Hora atual para subir ao topo
    unreadMessages: 0,
    status: "open",
    contact: { name: "João Silva (Teste)", profilePicUrl: "" },
  };

  // Canal específico da empresa
  // io.(`company-${companyId}-ticket`).emit(`company-${companyId}-ticket`, {
  //   action: "update",
  //   ticket: ticketParaLista,
  // });

  io.emit("appMessage", {
    action: "create",
    message: newMessage,
  });

  io.emit(`company-1-ticket`, {
    action: "update",
    ticket: ticketParaLista,
  });

  console.log(`📡 Sockets emitidos para Ticket ${ticketId} (Chat e Lista)`);

  return res.json(newMessage);
};

export const remove = async (req: any, res: Response): Promise<Response> => {
  const { messageId } = req.params;
  const { companyId } = req.user;

  // Nota: Isso vai tentar apagar do banco de dados REAL.
  // Se você tentar apagar uma mensagem criada pelo Mock acima, vai dar erro 404
  // porque ela não existe no banco SQL, apenas na memória do navegador.
  const message = await DeleteMessageService(messageId, companyId);

  const io = getIO();
  io.to(message.ticketId.toString()).emit(`company-${companyId}-appMessage`, {
    action: "update",
    message,
  });

  return res.send();
};
