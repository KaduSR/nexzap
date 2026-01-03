// cspell: disable
import { WASocket } from "@whiskeysockets/baileys";
import AppError from "../errors/AppError";

export type Session = WASocket & {
  id?: number;
};

const sessions: Session[] = [];

export const getWbot = (whatsappId: number): Session => {
  const sessionIndex = sessions.findIndex((s) => s.id === whatsappId);
  if (sessionIndex === -1) {
    throw new AppError("ERR_WAPP_NOT_INITIALIZED");
  }
  return sessions[sessionIndex];
};

export const initWbot = (whatsappId: number, wbot: Session): void => {
  const sessionIndex = sessions.findIndex((s) => s.id === whatsappId);
  if (sessionIndex !== -1) {
    sessions[sessionIndex] = wbot;
  } else {
    sessions.push(wbot);
  }
};

export const removeWbot = (whatsappId: number): void => {
  const sessionIndex = sessions.findIndex((s) => s.id === whatsappId);
  if (sessionIndex !== -1) {
    sessions.splice(sessionIndex, 1);
  }
};
