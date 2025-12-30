import { Request, Response } from "express";
import Whatsapp from "../database/models/Whatsapp";
import AppError from "../errors/AppError";
import { getIO } from "../libs/socket";
import { removeWbot } from "../libs/wbot";
import { StartWhatsAppSession } from "../services/WbotServices/StartWhatsAppSession";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const whatsapps = await (Whatsapp as any).findAll({
    order: [["name", "ASC"]],
  });
  return res.json(whatsapps);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { whatsappId } = req.params;
  const data = req.body;

  const whatsapp = await (Whatsapp as any).findByPk(whatsappId);

  if (!whatsapp) {
    throw new AppError("ERR_NO_WAPP_FOUND", 404);
  }

  await whatsapp.update(data);

  return res.json(whatsapp);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { whatsappId } = req.params;
  const whatsapp = await (Whatsapp as any).findByPk(whatsappId);

  if (!whatsapp) {
    throw new AppError("ERR_NO_WAPP_FOUND", 404);
  }

  await whatsapp.destroy();
  removeWbot(Number(whatsappId));

  const io = getIO();
  io.emit("whatsapp", { action: "delete", whatsappId: whatsapp.id });

  return res.status(200).json({ message: "Whatsapp deleted." });
};

export const restart = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { whatsappId } = req.params;
  const whatsapp = await (Whatsapp as any).findByPk(whatsappId);

  if (!whatsapp) {
    throw new AppError("ERR_NO_WAPP_FOUND", 404);
  }

  removeWbot(Number(whatsappId));

  await (whatsapp as any).update({ status: "DISCONNECTED" });

  // Reinicia processo em background
  StartWhatsAppSession(whatsapp);

  return res.status(200).json({ message: "Whatsapp restarting." });
};
