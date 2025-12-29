import fs from "fs";
import AppError from "../../errors/AppError";
import { getWbot } from "../../libs/wbot";

interface Request {
  whatsappId: number;
  filePath: string;
}

const UpdateProfilePictureService = async ({
  whatsappId,
  filePath
}: Request): Promise<void> => {
  const wbot = getWbot(whatsappId);

  const botJid = wbot.user?.id;

  if (!botJid) {
    throw new AppError("ERR_WAPP_NOT_CONNECTED");
  }

  try {
    // Baileys allows updating profile picture via URL (file path) or buffer
    await wbot.updateProfilePicture(botJid, { url: filePath });
    
    // Clean up temp file
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error("Error deleting temp file:", error);
    }

  } catch (err) {
    console.error(err);
    throw new AppError("ERR_UPDATING_PROFILE_PIC");
  }
};

export default UpdateProfilePictureService;