
import { proto } from "@whiskeysockets/baileys";

export const getBodyMessage = (msg: proto.IWebMessageInfo): string | null => {
  try {
    const type = Object.keys(msg.message || {})[0];
    const content = msg.message?.[type as keyof typeof msg.message];

    if (type === "conversation") {
      return msg.message?.conversation || null;
    }
    if (type === "imageMessage") {
      return msg.message?.imageMessage?.caption || null;
    }
    if (type === "videoMessage") {
      return msg.message?.videoMessage?.caption || null;
    }
    if (type === "extendedTextMessage") {
      return msg.message?.extendedTextMessage?.text || null;
    }
    if (type === "buttonsResponseMessage") {
      return msg.message?.buttonsResponseMessage?.selectedButtonId || null;
    }
    if (type === "listResponseMessage") {
      return msg.message?.listResponseMessage?.singleSelectReply?.selectedRowId || null;
    }
    if (type === "templateButtonReplyMessage") {
      return msg.message?.templateButtonReplyMessage?.selectedId || null;
    }
    
    return String(content);
  } catch (error) {
    console.error("Error extracting message body", error);
    return null;
  }
};
