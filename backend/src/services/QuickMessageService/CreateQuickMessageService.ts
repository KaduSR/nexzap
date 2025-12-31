import { QuickMessage } from "../../database/models/QuickMessage.model";
import AppError from "../../errors/AppError";

interface Request {
  shortcode: string;
  message: string;
  companyId: number;
  userId: number;
  mediaPath?: string;
  mediaName?: string;
}

const CreateQuickMessageService = async ({
  shortcode,
  message,
  companyId,
  userId,
  mediaPath,
  mediaName,
}: Request): Promise<QuickMessage> => {
  const shortcodeExists = await (QuickMessage as any).findOne({
    where: {
      shortcode,
      companyId,
      userId,
    },
  });

  if (shortcodeExists) {
    throw new AppError("ERR_SHORTCODE_DUPLICATED");
  }

  const quickMessage = await (QuickMessage as any).create({
    shortcode,
    message,
    companyId,
    userId,
    mediaPath,
    mediaName,
  });

  return quickMessage;
};

export default CreateQuickMessageService;
