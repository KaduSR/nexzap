import {
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  default as makeWASocket,
  WASocket,
} from "@whiskeysockets/baileys";
import NodeCache from "node-cache";
import pino from "pino";
import { Whatsapp } from "../../../database/models/Whatsapp.model";
import { useMultiFileAuthStateDb } from "../../../helpers/useMultiFileAuthStateDb";
import { getIO } from "../../../libs/socket";
import { initWbot, removeWbot } from "../../../libs/wbot";
import { StartWhatsAppSession } from "../StartWhatsAppSession";
import { wbotMessageListener } from "../wbotMessageListener";
import { IWhatsappProvider } from "./IWhatsappProvider";

const msgRetryCounterCache = new NodeCache();

export class BaileysProvider implements IWhatsappProvider {
  constructor(private whatsapp: Whatsapp) {}

  public async init(): Promise<WASocket> {
    const { whatsapp } = this;

    whatsapp.status = "OPENING";
    await (whatsapp as any).save();

    const io = getIO();
    io.emit("whatsappSession", { action: "update", session: whatsapp });

    const { state, saveCreds } = await useMultiFileAuthStateDb(whatsapp.id);
    const { version } = await fetchLatestBaileysVersion();

    const wbot = makeWASocket({
      version,
      logger: pino({ level: "silent" }) as any,
      printQRInTerminal: false,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(
          state.keys,
          pino({ level: "fatal" }).child({ level: "fatal" })
        ),
      },
      browser: ["Whaticket Plus", "Chrome", "10.0"],
      msgRetryCounterCache,
      generateHighQualityLinkPreview: true,
    });

    // Inject ID
    (wbot as any).id = whatsapp.id;

    wbot.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        whatsapp.qrcode = qr;
        whatsapp.status = "qrcode";
        whatsapp.retries = 0;
        await (whatsapp as any).save();
        io.emit("whatsappSession", { action: "update", session: whatsapp });
      }

      if (connection === "close") {
        const shouldReconnect =
          (lastDisconnect?.error as any)?.output?.statusCode !==
          DisconnectReason.loggedOut;

        if (shouldReconnect) {
          // Reconnect logic: call the Service wrapper to re-instantiate provider
          StartWhatsAppSession(whatsapp);
        } else {
          whatsapp.status = "DISCONNECTED";
          whatsapp.qrcode = null as any;
          await (whatsapp as any).save();
          io.emit("whatsappSession", { action: "update", session: whatsapp });
          removeWbot(whatsapp.id);
        }
      }

      if (connection === "open") {
        whatsapp.status = "CONNECTED";
        whatsapp.qrcode = null as any;
        whatsapp.retries = 0;
        await (whatsapp as any).save();
        io.emit("whatsappSession", { action: "update", session: whatsapp });
        initWbot(whatsapp.id, wbot as any);
      }
    });

    wbot.ev.on("creds.update", saveCreds);

    wbot.ev.on("messages.upsert", async (messageUpsert) => {
      await wbotMessageListener(wbot as any, messageUpsert);
    });

    return wbot;
  }
}
