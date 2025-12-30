import QuickMessage from "../../database/models/QuickMessage.model";
import AppError from "../../errors/AppError";

const ShowQuickMessageService = async (
  id: string | number
): Promise<QuickMessage> => {
  const quickMessage = await (QuickMessage as any).findByPk(id);

  if (!quickMessage) {
    throw new AppError("ERR_NO_QUICKMESSAGE_FOUND", 404);
  }

  return quickMessage;
};

export default ShowQuickMessageService;
