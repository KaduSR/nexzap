// cspell:disable
import AppError from "../../errors/AppError";
import { getWbot } from "../../libs/wbot";

interface Request {
  whatsappId: string;
  file: Express.Multer.File;
  companyId: number; // <--- Adicionado
}

const UpdateProfilePictureService = async ({
  whatsappId,
  file,
  companyId,
}: Request): Promise<void> => {
  // Opcional: Verificar se o whatsappId pertence à companyId antes

  const wbot = getWbot(parseInt(whatsappId, 10));

  if (!wbot) {
    throw new AppError("ERR_NO_WAPP_FOUND", 404);
  }

  // No Baileys, a atualização de foto geralmente é feita assim
  // Dependendo da versão da lib, pode ser 'updateProfilePicture' ou similar
  await wbot.updateProfilePicture(wbot.user.id, { url: file.path });
};

export default UpdateProfilePictureService;
