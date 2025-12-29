
import { WASocket } from "@whiskeysockets/baileys";

export interface IWhatsappProvider {
  init(): Promise<WASocket>;
}
