import { Op } from "sequelize";
import Contact from "../../database/models/Contact.model";
import ScheduledMessage from "../../database/models/ScheduledMessage.model";
import Ticket from "../../database/models/Ticket.model";
import { getIO } from "../../libs/socket";
import { logger } from "../../utils/logger";
import SendWhatsAppMessage from "../WbotServices/SendWhatsAppMessage";

export const ProcessScheduledMessages = async (): Promise<void> => {
  const now = new Date();

  // Find messages that are PENDING and sendAt is <= now
  const schedules = await (ScheduledMessage as any).findAll({
    where: {
      status: "PENDING",
      sendAt: {
        [Op.lte]: now,
      },
    },
    include: [{ model: Ticket, include: [Contact] }, { model: Contact }],
  });

  if (schedules.length > 0) {
    logger.info(`[Scheduler] Found ${schedules.length} messages to send.`);
  }

  for (const schedule of schedules) {
    let ticket = schedule.ticket;

    try {
      // If ticket is closed, reopen it to bring attention
      if (ticket && ticket.status === "closed") {
        await (ticket as any).update({ status: "open", unreadMessages: 0 });
      }

      // Send Message
      await SendWhatsAppMessage({
        body: schedule.body,
        ticket: ticket,
        quotedMsg: null as any,
      });

      // Update Schedule Status
      await (schedule as any).update({ status: "SENT" });

      // Emit Socket to update frontend list immediately
      const io = getIO();
      io.emit(`scheduled-${schedule.companyId}`, {
        action: "update",
        schedule,
      });

      logger.info(`[Scheduler] Message sent for ticket ${ticket.id}`);
    } catch (error) {
      logger.error(
        `[Scheduler] Error sending message ID ${schedule.id}: ${error}`
      );
      await (schedule as any).update({ status: "ERROR" });
    }
  }
};
