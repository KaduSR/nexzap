import { Request, Response } from "express";
import AppError from "../errors/AppError";
import CreateQuickMessageService from "../services/QuickMessageService/CreateQuickMessageService";
import DeleteQuickMessageService from "../services/QuickMessageService/DeleteQuickMessageService";
import ListQuickMessageService from "../services/QuickMessageService/ListQuickMessageService";
import ShowQuickMessageService from "../services/QuickMessageService/ShowQuickMessageService";
import UpdateQuickMessageService from "../services/QuickMessageService/UpdateQuickMessageService";

export const index = async (req: any, res: Response): Promise<Response> => {
  const { companyId, id: userId } = req.user;

  const records = await ListQuickMessageService({
    companyId,
    userId: Number(userId),
  });

  return res.json(records);
};

export const store = async (req: any, res: Response): Promise<Response> => {
  const { companyId, id: userId } = req.user;
  const data = req.body;
  const file = req.file;

  if (!data.shortcode || !data.message) {
    throw new AppError("Shortcode and Message are required");
  }

  const record = await CreateQuickMessageService({
    ...data,
    companyId,
    userId: Number(userId),
    mediaPath: file ? file.filename : null,
    mediaName: file ? file.originalname : null,
  });

  return res.status(200).json(record);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;

  const record = await ShowQuickMessageService(id);

  return res.status(200).json(record);
};

export const update = async (req: any, res: Response): Promise<Response> => {
  const { id } = req.params;
  const data = req.body;
  const file = req.file;

  const record = await UpdateQuickMessageService({
    id,
    ...data,
    mediaPath: file ? file.filename : undefined,
    mediaName: file ? file.originalname : undefined,
  });

  return res.status(200).json(record);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;

  await DeleteQuickMessageService(id);

  return res.status(200).json({ message: "Quick message deleted" });
};
