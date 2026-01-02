import { Op } from "sequelize";
import { Queue } from "../../database/models/Queue.model";
import { User } from "../../database/models/User.model";

interface Request {
  companyId: number;
  searchParam?: string;
  pageNumber?: string;
}

const ListQueuesService = async ({
  companyId,
  searchParam = "",
  pageNumber = "1",
}: Request) => {
  const whereCondition = {
    companyId,
    name: { [Op.like]: `%${searchParam.toLocaleLowerCase().trim()}%` },
  };

  const limit = 20;
  const offset = limit * (+pageNumber - 1);

  const { count, rows: queues } = await Queue.findAndCountAll({
    where: whereCondition,
    limit,
    offset,
    order: [["name", "ASC"]],
    include: [{ model: User, as: "users", attributes: ["id", "name"] }],
  });

  const hasMore = count > offset + queues.length;
  return { queues, count, hasMore };
};

export default ListQueuesService;
