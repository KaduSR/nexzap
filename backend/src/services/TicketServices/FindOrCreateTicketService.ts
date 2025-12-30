import Contact from "../../database/models/Contact.model";
import Ticket from "../../database/models/Ticket.model";

const FindOrCreateTicketService = async (
  contact: Contact,
  whatsappId: number,
  unreadMessages: number,
  companyId: number,
  groupContact?: Contact
): Promise<Ticket> => {
  let ticket = await (Ticket as any).findOne({
    where: {
      contactId: contact.id,
      whatsappId,
      status: ["open", "pending"],
    },
    include: ["contact"],
  });

  if (ticket) {
    await ticket.update({ unreadMessages: (ticket.unreadMessages || 0) + 1 });
  }

  if (!ticket) {
    ticket = await (Ticket as any).create({
      contactId: contact.id,
      status: "pending",
      whatsappId,
      unreadMessages,
      lastMessage: "",
      isGroup: contact.isGroup,
      useIntegration: false,
      promptId: null,
      companyId,
    });
    await ticket.reload({ include: ["contact"] });
  }

  return ticket;
};

export default FindOrCreateTicketService;
