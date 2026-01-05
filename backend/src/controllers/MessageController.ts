// cspell:disable
import { Request, Response } from "express";
import AppError from "../errors/AppError";
import SetTicketMessagesAsRead from "../services/TicketServices/SetTicketMessagesAsRead";
import CreateMessageService from "../services/MessageServices/CreateMessageService";
import ListMessagesService from "../services/MessageServices/ListMessagesService";
import DeleteMessageService from "../services/MessageServices/DeleteMessageService"; // Se existir
import { getIO } from "../libs/socket";
import { Ticket } from "../database/models/Ticket.model";

type IndexQuery = {
  pageNumber: string;
};

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

  return res.json({
    count,
    messages,
    ticket,
    hasMore,
  });
};

export const store = async (req: any, res: Response): Promise<Response> => {
  const { ticketId } = req.params;
  const { body, quotedMsg } = req.body;
  const medias = req.files as Express.Multer.File[];
  const { companyId } = req.user;

  const ticketIdNumber = parseInt(ticketId, 10);

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

export const remove = async (req: any, res: any): Promise<Response> => {
  const { messageId } = req.params;
  const { companyId } = res.user;

  const message = await DeleteMessageService(messageId, companyId);

  const io = getIO();
  io.to(message.ticketId.toString()).emit(`compant-${companyId}-appMessage`, {
    action: "update",
    message,
  });

  return res.send();
};
