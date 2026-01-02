// cspell:disable
import { Response } from "express";
import { Whatsapp } from "../database/models/Whatsapp.model";
import AppError from "../errors/AppError";
import DeleteWhatsAppService from "../services/WbotServices/DeleteWhatsAppService"; // Geralmente deleta a sessão e o registro
import UpdateProfilePictureService from "../services/WbotServices/UpdateProfilePictureService"; // Para mudar foto do bot
import UpdateProfileStatusService from "../services/WbotServices/UpdateProfileStatusService"; // Mudar status (recado)
import UpdateWhatsAppService from "../services/WbotServices/UpdateWhatsAppService"; // Verifique se este serviço existe, se não, crio abaixo

// Update genérico da conexão (Nome, Default, Mensagens de Saudação)
export const update = async (req: any, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;
  const whatsappData = req.body;
  const { companyId } = req.user;

  // Pequena validação para garantir que pertence à empresa
  const session = await Whatsapp.findOne({
    where: { id: whatsappId, companyId },
  });
  if (!session) {
    throw new AppError("ERR_NO_WAPP_FOUND", 404);
  }

  const { whatsapp } = await UpdateWhatsAppService({
    whatsappData,
    whatsappId,
    companyId,
  });

  return res.status(200).json(whatsapp);
};

// Remover/Desconectar
export const remove = async (req: any, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;
  const { companyId } = req.user;

  await DeleteWhatsAppService(whatsappId, companyId);

  return res.status(200).json({ message: "Session disconnected." });
};

// Atualizar Foto de Perfil do WhatsApp
export const updateProfilePicture = async (
  req: any,
  res: Response
): Promise<Response> => {
  const { whatsappId } = req.params;
  const { companyId } = req.user;
  const file = req.file; // Multer single file

  if (!file) {
    throw new AppError("Please upload a file.");
  }

  await UpdateProfilePictureService({
    whatsappId,
    companyId,
    file,
  });

  return res.status(200).json({ message: "Profile picture updated." });
};

// Atualizar Status (Recado) do Perfil
export const updateProfileStatus = async (
  req: any,
  res: Response
): Promise<Response> => {
  const { whatsappId } = req.params;
  const { status } = req.body;
  const { companyId } = req.user;

  await UpdateProfileStatusService({
    whatsappId,
    companyId,
    status,
  });

  return res.status(200).json({ message: "Profile status updated." });
};
