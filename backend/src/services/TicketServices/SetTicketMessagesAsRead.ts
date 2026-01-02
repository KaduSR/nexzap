// cspell:disable
import { Message } from "../../database/models/Message.model";
import { Ticket } from "../../database/models/Ticket.model";
import { getIO } from "../../libs/socket";

const SetTicketMessagesAsRead = async (
  ticketId: number | string
): Promise<void> => {
  const ticket = await Ticket.findByPk(ticketId);

  if (!ticket) {
    return; // Silently fail is ok here
  }

  // 1. Marca mensagens como lidas no banco
  await Message.update(
    { read: true },
    {
      where: {
        ticketId,
        read: false,
      },
    }
  );

  // 2. Reseta o contador do ticket
  await ticket.update({ unreadMessages: 0 });

  // 3. Avisa via Socket para atualizar a bolinha vermelha no frontend
  const io = getIO();
  io.to(ticket.status)
    .to("notification")
    .emit(`company-${ticket.companyId}-ticket`, {
      action: "updateUnread",
      ticketId: ticket.id,
      unreadMessages: 0,
    });
};

export default SetTicketMessagesAsRead;
