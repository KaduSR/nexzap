// cspell:disable
import { Message } from "../../database/models/Message.model";
import { Ticket } from "../../database/models/Ticket.model";
import AppError from "../../errors/AppError";

const DeleteMessageService = async (
  id: string,
  companyId: number
): Promise<Message> => {
  const message = await Message.findOne({
    where: { id },
    include: [
      {
        model: Ticket,
        as: "ticket",
        where: { companyId },
      },
    ],
  });

  if (!message) {
    throw new AppError("ERR_NO_MESSAGE_FOUND", 404);
  }

  await message.destroy();

  return message;
};

export default DeleteMessageService;
