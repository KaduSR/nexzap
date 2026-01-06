// cspell:disable
import { Response } from "express";
import { Ticket } from "../database/models/Ticket.model";
import AppError from "../errors/AppError";
import { getIO } from "../libs/socket";
import CreateMessageService from "../services/MessageServices/CreateMessageService";
import DeleteMessageService from "../services/MessageServices/DeleteMessageService";
import ListMessagesService from "../services/MessageServices/ListMessagesService";
import SetTicketMessagesAsRead from "../services/TicketServices/SetTicketMessagesAsRead";

type IndexQuery = {
  pageNumber: string;
};

export const index = async (req: any, res: Response): Promise<Response> => {
  const { ticketId } = req.params;

  // 1. MOCK DE MENSAGENS (Simulação)
  const messages = [
    {
      id: `msg-${new Date().getTime()}`,
      body: `Olá! Aqui são as mensagens do Ticket ${ticketId} vindas do Backend!`,
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

  // Comentei para evitar erros se não houver dados no banco ainda
  // const { pageNumber } = req.query as IndexQuery;
  // const { companyId } = req.user;

  // 2. Comentamos o serviço real para usar o Mock
  // const { count, messages, ticket, hasMore } = await ListMessagesService({ ... });

  // 3. Tenta marcar como lido (Pode dar erro se o ticket não existir no banco real,
  // então vamos envolver num try/catch silencioso para não travar seu teste)
  try {
    await SetTicketMessagesAsRead(ticketId);
  } catch (err) {
    console.log("Aviso: Não foi possível marcar como lido (Ticket fake?)");
  }

  // 4. CORREÇÃO PRINCIPAL: Definimos manualmente os valores que faltavam
  return res.json({
    count: messages.length, // Conta o tamanho do array mock
    messages, // O array mock
    ticket: { id: ticketId, status: "open" }, // Um objeto ticket fake
    hasMore: false, // Dizemos que não tem mais páginas
  });
};

export const store = async (req: any, res: Response): Promise<Response> => {
  const { ticketId } = req.params;
  const { body, quotedMsg, fromMe } = req.body;
  const medias = req.files as Express.Multer.File[];
  const { companyId } = req.user;

  const newMessage = {
    id: `msg-${new Date().getTime()}`,
    body: body,
    fromMe: fromMe,
    mediaType: "chat",
    createdAt: new Date().toISOString(),
    contactId: null,
    ticketId: Number(ticketId),
  };

  const io = getIO();
  io.to(ticketId.toString()).emit("appMessage", {
    action: "create",
    message: newMessage,
  });

  console.log(`📡 Socket emitido para sala ${ticketId}:`, newMessage);

  return res.json(newMessage);

  const ticketIdNumber = parseInt(ticketId, 10);

  // Aqui ele busca no banco. Se você não rodou as seeds ou migrations, vai dar erro 404.
  const ticket = await Ticket.findByPk(ticketIdNumber, {
    include: ["contact"],
  });

  if (!ticket) throw new AppError("ERR_NO_TICKET_FOUND", 404);

  const quotedMsgId = typeof quotedMsg === "object" ? quotedMsg?.id : quotedMsg;

  if (medias && medias.length > 0) {
    await Promise.all(
      medias.map(async (media: Express.Multer.File) => {
        await CreateMessageService({
          messageData: {
            ticketId: ticketIdNumber,
            body: media.originalname,
            contactId: undefined,
            fromMe: true,
            read: true,
            mediaType: media.mimetype.split("/")[0],
            mediaUrl: media.filename,
            quotedMsgId,
            ack: 1,
          },
          companyId,
          media,
        });
      })
    );
  } else {
    await CreateMessageService({
      messageData: {
        ticketId: ticketIdNumber,
        body,
        contactId: undefined,
        fromMe: true,
        read: true,
        mediaType: "chat",
        quotedMsgId,
        ack: 2,
      },
      companyId,
    });
  }

  return res.send();
};

export const remove = async (req: any, res: Response): Promise<Response> => {
  const { messageId } = req.params;

  // CORREÇÃO 2: Geralmente o user está no 'req', não no 'res'
  const { companyId } = req.user;

  const message = await DeleteMessageService(messageId, companyId);

  const io = getIO();

  // CORREÇÃO 3: Typo 'compant' -> 'company'
  io.to(message.ticketId.toString()).emit(`company-${companyId}-appMessage`, {
    action: "update",
    message,
  });

  return res.send();
};
