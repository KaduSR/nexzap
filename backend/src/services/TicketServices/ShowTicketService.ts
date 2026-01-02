// cspell: disable
import { Contact } from "../../database/models/Contact.model";
import { Queue } from "../../database/models/Queue.model";
import { Ticket } from "../../database/models/Ticket.model";
import { User } from "../../database/models/User.model";
import AppError from "../../errors/AppError";

const ShowTicketService = async (
  id: string | number,
  companyId: number
): Promise<Ticket> => {
  const ticket = await Ticket.findOne({
    where: {
      id,
      companyId,
    },
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
    ],
  });
  if (!ticket) {
    throw new AppError("ERR_NO_TICKET_FOUND", 404);
  }
  return ticket;
};

export default ShowTicketService;
