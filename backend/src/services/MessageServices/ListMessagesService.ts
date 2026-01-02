// cspell:disable
import { Message } from "../../database/models/Message.model";
import { Ticket } from "../../database/models/Ticket.model";
import AppError from "../../errors/AppError";

interface Request {
  ticketId: string;
  companyId: number;
  pageNumber?: string;
}

interface Response {
  messages: Message[];
  ticket: Ticket;
  count: number;
  hasMore: boolean;
}

const ListMessagesService = async ({
  ticketId,
  companyId,
  pageNumber = "1",
}: Request): Promise<Response> => {
  const ticket = await Ticket.findOne({
    where: { id: ticketId, companyId },
  });

  if (!ticket) {
    throw new AppError("ERR_NO_TICKET_FOUND", 404);
  }

  const limit = 20;
  const offset = limit * (+pageNumber - 1);

  const { count, rows: messages } = await Message.findAndCountAll({
    where: { ticketId },
    limit,
    offset,
    order: [["createdAt", "DESC"]], // Traz as mais recentes primeiro
    include: [
      {
        model: Ticket,
        as: "ticket",
        where: { companyId }, // Garante segurança da empresa
      },
      {
        model: Message,
        as: "quotedMsg",
        include: ["contact"],
      },
    ],
  });

  const hasMore = count > offset + messages.length;

  return {
    messages: messages.reverse(), // Inverte para exibir corretamente no chat (antigas -> novas)
    ticket,
    count,
    hasMore,
  };
};

export default ListMessagesService;
