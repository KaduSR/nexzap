import AppError from "../../errors/AppError";
import { getWbot } from "../../libs/wbot";

interface Request {
  whatsappId: number;
  status: string;
}

const UpdateProfileStatusService = async ({
  whatsappId,
  status
}: Request): Promise<void> => {
  const wbot = getWbot(whatsappId);

  if (!wbot.user?.id) {
    throw new AppError("ERR_WAPP_NOT_CONNECTED");
  }

  try {
    await wbot.updateProfileStatus(status);
  } catch (err) {
    console.error(err);
    throw new AppError("ERR_UPDATING_PROFILE_STATUS");
  }
};

export default UpdateProfileStatusService;