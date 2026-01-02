// cspell: disable
import { Ticket } from "../../database/models/Ticket.model";
import AppError from "../../errors/AppError";

const DeleteTicketService = async (
  id: string | number,
  companyId: number
): Promise<Ticket> => {
  const ticket = await Ticket.findOne({
    where: {
      id,
      companyId,
    },
  });

  if (!ticket) {
    throw new AppError("ERR_NO_TICKET_FOUND", 404);
  }

  await ticket.destroy();
  return ticket;
};

export default DeleteTicketService;
