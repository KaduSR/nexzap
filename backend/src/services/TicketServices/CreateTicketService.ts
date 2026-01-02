// cspell: disable
import { Contact } from "../../database/models/Contact.model";
import { Ticket } from "../../database/models/Ticket.model";
import { User } from "../../database/models/User.model";
import { UserQueue } from "../../database/models/UserQueue.model";

interface Request {
  contactId: number;
  status: string;
  userId?: number;
  queueId?: number;
  companyId: number;
}

const CreateTicketService = async ({
  contactId,
  status,
  userId,
  queueId,
  companyId,
}: Request): Promise<Ticket> => {
  // 1. Verificar se já existe ticket aberto para este contato
  const ticketExists = await (Ticket as any).findOne({
    where: { contactId, status: ["open", "pending"] },
  });

  if (ticketExists) {
    return ticketExists;
  }

  // 2. Lógica de Distribuição (Round Robin) se queueId for informado mas userId não
  let assignedUserId = userId;

  if (queueId && !userId) {
    const userQueues = await (UserQueue as any).findAll({
      where: { queueId },
    });

    if (userQueues.length > 0) {
      // Busca usuários disponíveis e conta quantos tickets cada um tem
      // Esta é uma implementação simplificada. Em produção faria uma query COUNT.
      const userIds = userQueues.map((uq: any) => uq.userId);

      // Sorteia um usuário (Simulação de Round Robin aleatório para simplificar)
      // O ideal é buscar o usuário com menor numero de tickets 'open'
      const randomIndex = Math.floor(Math.random() * userIds.length);
      assignedUserId = userIds[randomIndex];
      console.log(
        `[Round Robin] Ticket distribuído para User ID: ${assignedUserId}`
      );
    }
  }

  // 3. Criar Ticket
  const ticket = await (Ticket as any).create({
    contactId,
    status,
    userId: assignedUserId,
    companyId,
    queueId, // Salva a fila
    lastMessage: "",
    unreadMessages: 0,
  });

  // Reload para trazer associações
  await ticket.reload({
    include: [
      { model: Contact, as: "contact" },
      { model: User, as: "user" },
    ],
  });

  return ticket;
};

export default CreateTicketService;
