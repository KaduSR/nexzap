// cspell:disable
import fs from "fs";
import path from "path";

export const useMultiFileAuthStateDb = async (whatsappId: number) => {
  // 1. O PULO DO GATO: Importação Dinâmica 🐈
  // Isso carrega a biblioteca só no momento da execução, evitando o erro de ESM/CommonJS
  const { useMultiFileAuthState } = await import("@whiskeysockets/baileys");

  const pathName = path.resolve(
    (process as any).cwd(),
    ".wwebjs_auth",
    `session-${whatsappId}`
  );

  if (!fs.existsSync(pathName)) {
    fs.mkdirSync(pathName, { recursive: true });
  }

  return await useMultiFileAuthState(pathName);
};
