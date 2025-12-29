import { Request, Response } from "express";
import UpdateProfilePictureService from "../services/WbotServices/UpdateProfilePictureService";
import UpdateProfileStatusService from "../services/WbotServices/UpdateProfileStatusService";
import AppError from "../errors/AppError";

export const updateProfilePicture = async (req: any, res: any): Promise<any> => {
  const { whatsappId } = req.params;
  const file = req.file;

  if (!file) {
    throw new AppError("Please upload a file.");
  }

  await UpdateProfilePictureService({
    whatsappId: Number(whatsappId),
    filePath: file.path
  });

  return res.status(200).json({ message: "Profile picture updated." });
};

export const updateProfileStatus = async (req: any, res: any): Promise<any> => {
  const { whatsappId } = req.params;
  const { status } = req.body;

  await UpdateProfileStatusService({
    whatsappId: Number(whatsappId),
    status
  });

  return res.status(200).json({ message: "Profile status updated." });
};