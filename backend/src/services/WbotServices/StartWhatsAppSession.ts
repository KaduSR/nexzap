import { Whatsapp } from "../../database/models/Whatsapp.model";
import { BaileysProvider } from "./providers/BaileysProvider";

export const StartWhatsAppSession = async (
  whatsapp: Whatsapp
): Promise<any> => {
  const provider = new BaileysProvider(whatsapp);
  const wbot = await provider.init();
  return wbot;
};
