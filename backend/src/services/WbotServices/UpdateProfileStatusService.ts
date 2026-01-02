// cspell:disable
import AppError from "../../errors/AppError";
import { getWbot } from "../../libs/wbot";

interface Request {
  whatsappId: string;
  status: string;
  companyId: number; // <--- Adicionado
}

const UpdateProfileStatusService = async ({
  whatsappId,
  status,
  companyId,
}: Request): Promise<void> => {
  // Opcional: Verificar se o whatsappId pertence à companyId antes

  const wbot = getWbot(parseInt(whatsappId, 10));

  if (!wbot) {
    throw new AppError("ERR_NO_WAPP_FOUND", 404);
  }

  await wbot.updateProfileStatus(status);
};

export default UpdateProfileStatusService;
