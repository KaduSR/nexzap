// cspell:disable
import { endOfDay, parseISO, startOfDay } from "date-fns";
import { Op } from "sequelize";
import { Contact } from "../../database/models/Contact.model";
import { Queue } from "../../database/models/Queue.model";
import { Tag } from "../../database/models/Tag.model";
import { Ticket } from "../../database/models/Ticket.model";
import { User } from "../../database/models/User.model";

// Interface corrigida para aceitar TODOS os parâmetros do Controller
interface Request {
  searchParam?: string;
  pageNumber?: string;
  status?: string;
  date?: string;
  showAll?: string;
  queueIds?: string;
  tags?: string;
  users?: string;
  companyId: number;
  profile?: string;
  userId?: number;
}

interface Response {
  tickets: Ticket[];
  count: number;
  hasMore: boolean;
}

const ListTicketsServiceKanban = async ({
  searchParam = "",
  pageNumber = "1",
  status,
  date,
  showAll,
  queueIds,
  tags,
  users,
  companyId,
  profile,
  userId,
}: Request): Promise<Response> => {
  // 1. Montar Cláusulas de Filtro (Where)
  const whereCondition: any = {
    companyId,
    status: status || { [Op.ne]: "closed" }, // Se não vier status, traz tudo menos fechados
  };

  // Filtro por Data
  if (date) {
    whereCondition.createdAt = {
      [Op.between]: [+startOfDay(parseISO(date)), +endOfDay(parseISO(date))],
    };
  }

  // Filtro de Filas (Queues)
  if (queueIds) {
    const queues = queueIds.split(",").map((id) => Number(id));
    whereCondition.queueId = { [Op.in]: queues };
  }

  // Filtro de Usuários (Users)
  if (users) {
    const userList = users.split(",").map((id) => Number(id));
    whereCondition.userId = { [Op.in]: userList };
  }

  // Lógica de visualização (Admin vê tudo, User vê só dele ou da fila dele)
  if (profile === "user" && showAll !== "true") {
    // Exemplo simples: Usuário vê tickets atribuídos a ele OU tickets sem dono na fila dele
    // Ajuste essa lógica conforme sua regra de negócio
    whereCondition[Op.or] = [
      { userId },
      { status: "pending" }, // Permite ver pendentes para puxar
    ];
  }

  // Configuração da Paginação
  const limit = 20;
  const offset = limit * (+pageNumber - 1);

  // 2. Montar Includes (Joins)
  const includeCondition: any[] = [
    {
      model: Contact,
      as: "contact",
      attributes: ["id", "name", "number", "profilePicUrl"],
      where: {
        name: { [Op.like]: `%${searchParam.toLowerCase()}%` },
      },
      required: !!searchParam, // Se tiver busca, torna o INNER JOIN obrigatório
    },
    { model: Queue, as: "queue", attributes: ["id", "name", "color"] },
    { model: User, as: "user", attributes: ["id", "name"] },
    { model: Tag, as: "tags", attributes: ["id", "name", "color"] },
  ];

  // Filtro por Tags (Associação Many-to-Many)
  if (tags) {
    const tagIds = tags.split(",").map((id) => Number(id));
    includeCondition.push({
      model: Tag,
      as: "tags",
      attributes: ["id", "name", "color"],
      required: true,
      through: {
        where: {
          tagId: { [Op.in]: tagIds },
        },
      },
    });
  }

  // 3. Executar a Query
  // Nota: findAndCountAll com includes complexos pode ter problemas de contagem no Sequelize.
  // Às vezes é melhor buscar primeiro e contar depois, mas aqui usamos o padrão.
  const { count, rows: tickets } = await Ticket.findAndCountAll({
    where: whereCondition,
    include: includeCondition,
    limit,
    offset,
    order: [["updatedAt", "DESC"]],
    distinct: true, // Importante para contagem correta com includes
  });

  const hasMore = count > offset + tickets.length;

  return {
    tickets,
    count,
    hasMore,
  };
};

export default ListTicketsServiceKanban;
