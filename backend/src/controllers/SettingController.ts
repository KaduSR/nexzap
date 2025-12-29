import { Request, Response } from "express";
import Setting from "../models/Setting";

export const update = async (req: any, res: Response): Promise<Response> => {
  const { key } = req.params;
  const { value } = req.body;

  try {
    const [setting, created] = await (Setting as any).findOrCreate({
      where: { key },
      defaults: { key, value }
    });

    if (!created) {
      await setting.update({ value });
    }

    return res.status(200).json(setting);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "ERR_UPDATING_SETTING" });
  }
};

export const index = async (req: any, res: Response): Promise<Response> => {
    try {
        const settings = await (Setting as any).findAll();
        return res.json(settings);
    } catch (err) {
        return res.status(500).json({ error: "ERR_FETCHING_SETTINGS" });
    }
}