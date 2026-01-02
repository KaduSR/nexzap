// cspell:disable
import { Request, Response } from "express";
import AppError from "../errors/AppError";
import SetTicketMessagesAsRead from "../services/TicketServices/SetTicketMessagesAsRead";
import CreateMessageService from "../services/MessageServices/CreateMessageService";
import ListMessagesService from "../services/MessageServices/ListMessagesService";
import DeleteMessageService from "../services/MessageServices/DeleteMessageService"; // Se existir
import { getIO } from "../libs/socket";

type IndexQuery = {
  pageNumber: string;
};

interface MessageData {
  body: string;
  fromMe: boolean;
  read: boolean;
  quotedMsg?: string; // ID da mensagem respondida
  vCard?: any; // Contato enviado
}

export const index = async (req: any, res: Response): Promise<Response> => {
  const { ticketId } = req.params;
  const { pageNumber } = req.query as IndexQuery;
  const { companyId } = req.user;

  const { count, messages, ticket, hasMore } = await ListMessagesService({
    pageNumber,
    ticketId,
    companyId,
  });

  // Marca como lida ao abrir o chat
  await SetTicketMessagesAsRead(ticketId);

  return res.json({ count, messages, ticket, hasMore });
};

export const store = async (req: any, res: Response): Promise<Response> => {
  const { ticketId } = req.params;
  const { body, quotedMsg } = req.body; // Campos de texto
  const medias = req.files as Express.Multer.File[]; // Campos de arquivo
  const { companyId } = req.user;

  const ticketIdNumber = parseInt(ticketId, 10);

  if (isNaN(ticketIdNumber)) {
    throw new AppError("ERR_INVALID_TICKET_ID");
  }

  // Se houver arquivos, processa o envio de media
  if (medias && medias.length > 0) {
    await Promise.all(
      medias.map(async (media: Express.Multer.File) => {
        await CreateMessageService({
          messageData: {
            body: body || media.originalname, // Nome do arquivo como caption se body vazio
            fromMe: true,
            read: true,
            quotedMsg,
          },
          ticketId: ticketIdNumber,
          companyId,
          media, // Passa o objeto do Multer
        });
      })
    );
  } else {
    // Envio apenas de texto
    await CreateMessageService({
      messageData: {
        body,
        fromMe: true,
        read: true,
        quotedMsg,
      },
      ticketId: ticketIdNumber,
      companyId,
    });
  }

  return res.send(); // O socket já emite a mensagem, não precisamos retornar JSON pesado aqui
};

export const remove = async (req: any, res: Response): Promise<Response> => {
  const { messageId } = req.params;
  const { companyId } = req.user;

  const message = await DeleteMessageService(messageId, companyId);

  const io = getIO();
  io.to(message.ticketId.toString()).emit(`company-${companyId}-appMessage`, {
    action: "update",
    message,
  });

  return res.send();
};
