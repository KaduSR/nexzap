
import { Setting } from "../models/Setting";

export const CheckSettings = async (key: string): Promise<string> => {
  // Lógica para buscar configuração no banco
  // const setting = await Setting.findOne({ where: { key } });
  // return setting?.value || "";
  return "enabled";
};
