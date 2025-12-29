import Campaign from "../../models/Campaign";

const ListCampaignsService = async (): Promise<Campaign[]> => {
  const campaigns = await (Campaign as any).findAll({
    order: [["scheduledAt", "ASC"]]
  });
  return campaigns;
};

export default ListCampaignsService;