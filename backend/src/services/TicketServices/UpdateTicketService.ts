// cspell: disable
import { Contact } from "../../database/models/Contact.model";
import { Queue } from "../../database/models/Queue.model";
import { Tag } from "../../database/models/Tag.model";
import { Ticket } from "../../database/models/Ticket.model";
import { User } from "../../database/models/User.model";
import AppError from "../../errors/AppError";

interface TicketData {
  status?: string;
  userId?: number | null;
  queueId?: number | null;
  wahtsappId?: number;
  unreadMessages?: number;
}

interface Request {
  ticketData: TicketData;
  ticketId: string | number;
  companyId: number;
}

interface Response {
  ticket: Ticket;
  oldStatus: string;
  oldUserId: number | undefined;
}

const UpdateTicketService = async ({
  ticketData,
  ticketId,
  companyId,
}: Request): Promise<Response> => {
  const ticket = await Ticket.findOne({
    where: {
      id: ticketId,
      companyId,
    },
    include: [
      {
        model: Contact,
        as: "contact",
      },
      {
        model: User,
        as: "user",
      },
      {
        model: Queue,
        as: "queue",
      },
    ],
  });

  if (!ticket) {
    throw new AppError("ERR_NO_TICKET_FOUND", 404);
  }

  const oldStatus = ticket.status;
  const oldUserId = ticket.user?.id;

  if (ticketData.status) {
  }

  await ticket.update(ticketData);
  await ticket.reload({
    include: [
      {
        model: Contact,
        as: "contact",
        attributes: ["id", "name", "number", "profilePicUrl"],
        include: ["extraInfo"],
      },
      {
        model: User,
        as: "user",
        attributes: ["id", "name"],
      },
      {
        model: Queue,
        as: "queue",
        attributes: ["id", "name", "color"],
      },
      {
        model: Tag,
        as: "tags",
        attributes: ["id", "name", "color"],
      },
    ],
  });
  return { ticket, oldStatus, oldUserId };
};

export default UpdateTicketService;
