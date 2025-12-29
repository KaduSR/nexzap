import { Op } from "sequelize";
import QuickMessage from "../../models/QuickMessage";

interface Request {
  companyId: number;
  userId: number;
}

const ListQuickMessageService = async ({
  companyId,
  userId
}: Request): Promise<QuickMessage[]> => {
  const quickMessages = await (QuickMessage as any).findAll({
    where: {
      companyId,
      [Op.or]: [
        { userId },
        { userId: null }
      ]
    },
    order: [["shortcode", "ASC"]]
  });

  return quickMessages;
};

export default ListQuickMessageService;