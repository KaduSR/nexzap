// cspell:disable
import { Sequelize, Op } from "sequelize";
import { Campaign } from "../../database/models/Campaign.model";

interface Request {
  companyId: number;
  searchParam?: string;
  pageNumber?: string;
}

interface Response {
  campaigns: Campaign[];
  count: number;
  hasMore: boolean;
}

const ListCampaignsService = async ({
  companyId,
  searchParam = "",
  pageNumber = "1",
}: Request): Promise<Response> => {
  const whereCondition = {
    companyId,
    name: Sequelize.where(
      Sequelize.fn("LOWER", Sequelize.col("name")),
      "LIKE",
      `%${searchParam.toLowerCase().trim()}%`
    ),
  };

  const limit = 20;
  const offset = limit * (+pageNumber - 1);

  const { count, rows: campaigns } = await Campaign.findAndCountAll({
    where: whereCondition,
    limit,
    offset,
    order: [["createdAt", "DESC"]],
  });

  const hasMore = count > offset + campaigns.length;

  return {
    campaigns,
    count,
    hasMore,
  };
};

export default ListCampaignsService;
