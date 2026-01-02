// cspell:disable
import { Whatsapp } from "../../database/models/Whatsapp.model";
import AppError from "../../errors/AppError";
import { removeWbot } from "../../libs/wbot";

const DeleteWhatsAppService = async (
  id: string,
  companyId: number
): Promise<void> => {
  const whatsapp = await Whatsapp.findOne({
    where: { id, companyId },
  });

  if (!whatsapp) {
    throw new AppError("ERR_NO_WAPP_FOUND", 404);
  }

  // Desconecta a sessão do Baileys/WhatsApp antes de apagar
  await removeWbot(parseInt(id, 10));

  await whatsapp.destroy();
};

export default DeleteWhatsAppService;
