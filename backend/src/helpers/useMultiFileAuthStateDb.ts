
import { useMultiFileAuthState } from "@whiskeysockets/baileys";
import path from "path";
import fs from "fs";

export const useMultiFileAuthStateDb = async (whatsappId: number) => {
  const pathName = path.resolve((process as any).cwd(), ".wwebjs_auth", `session-${whatsappId}`);
  
  if (!fs.existsSync(pathName)) {
    fs.mkdirSync(pathName, { recursive: true });
  }

  return await useMultiFileAuthState(pathName);
};
