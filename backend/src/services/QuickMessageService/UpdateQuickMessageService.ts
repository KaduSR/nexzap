import { QuickMessage } from "../../database/models/QuickMessage.model";
import ShowQuickMessageService from "./ShowQuickMessageService";

interface Request {
  id: string | number;
  shortcode: string;
  message: string;
  userId?: number;
  mediaPath?: string;
  mediaName?: string;
}

const UpdateQuickMessageService = async ({
  id,
  shortcode,
  message,
  mediaPath,
  mediaName,
}: Request): Promise<QuickMessage> => {
  const quickMessage = await ShowQuickMessageService(id);

  await (quickMessage as any).update({
    shortcode,
    message,
    mediaPath: mediaPath ? mediaPath : quickMessage.mediaPath,
    mediaName: mediaName ? mediaName : quickMessage.mediaName,
  });

  return quickMessage;
};

export default UpdateQuickMessageService;
