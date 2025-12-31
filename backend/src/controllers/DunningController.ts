import { Response } from "express";
import { DunningSettings } from "../database/models/DunningSettings.model";
import { ProcessDunningService } from "../services/FinanceServices/ProcessDunningService";

export const index = async (req: any, res: Response): Promise<Response> => {
  const settings = await (DunningSettings as any).findAll({
    order: [
      ["frequencyType", "ASC"],
      ["days", "ASC"],
    ],
  });
  return res.json(settings);
};

export const store = async (req: any, res: Response): Promise<Response> => {
  const { frequencyType, days, messageTemplate } = req.body;
  const { companyId } = req.user;

  const setting = await (DunningSettings as any).create({
    frequencyType,
    days,
    messageTemplate,
    companyId,
    isActive: true,
  });

  return res.status(200).json(setting);
};

export const update = async (req: any, res: Response): Promise<Response> => {
  const { id } = req.params;
  const data = req.body;

  const setting = await (DunningSettings as any).findByPk(id);
  if (!setting) {
    return res.status(404).json({ error: "Setting not found" });
  }

  await setting.update(data);
  return res.json(setting);
};

export const remove = async (req: any, res: Response): Promise<Response> => {
  const { id } = req.params;
  const setting = await (DunningSettings as any).findByPk(id);
  if (setting) {
    await setting.destroy();
  }
  return res.status(200).json({ message: "Deleted" });
};

export const runNow = async (req: any, res: Response): Promise<Response> => {
  // Manual trigger for testing
  ProcessDunningService(); // Async, don't await to not block response
  return res.json({ message: "Dunning process started in background." });
};
