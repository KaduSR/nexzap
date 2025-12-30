import { Op } from "sequelize";
import Contact from "../../database/models/Contact.model";
import DunningSettings from "../../database/models/DunningSettings.model";
import Setting from "../../database/models/Setting.model";
import Whatsapp from "../../database/models/Whatsapp.model";
import { logger } from "../../utils/logger";
import { sleepRandom } from "../../utils/sleepRandom";
import IxcClient from "../IxcService/IxcClient";
import FindOrCreateTicketService from "../TicketServices/FindOrCreateTicketService";
import SendWhatsAppMessage from "../WbotServices/SendWhatsAppMessage";

export const ProcessDunningService = async (): Promise<void> => {
  logger.info("[Dunning] Starting dunning process...");

  // 1. Get configurations (Tokens)
  const ixcToken = await (Setting as any).findOne({
    where: { key: "ixc_token" },
  });
  const ixcUrl = await (Setting as any).findOne({ where: { key: "ixc_url" } });

  if (!ixcToken || !ixcUrl) {
    logger.warn("[Dunning] IXC credentials not found. Skipping.");
    return;
  }

  const ixc = new IxcClient(ixcToken.value, ixcUrl.value);

  // 2. Fetch all active dunning rules
  const rules = await (DunningSettings as any).findAll({
    where: { isActive: true },
  });

  // 3. Process each rule
  for (const rule of rules) {
    let targetDate = new Date();

    // Calculate target due date based on rule
    if (rule.frequencyType === "before_due") {
      targetDate.setDate(targetDate.getDate() + rule.days);
    } else if (rule.frequencyType === "after_due") {
      targetDate.setDate(targetDate.getDate() - rule.days);
    }
    // 'on_due' means today, no change needed

    const dateStr = targetDate.toISOString().split("T")[0]; // YYYY-MM-DD

    logger.info(
      `[Dunning] Processing Rule: ${rule.frequencyType} ${rule.days} days. Target Date: ${dateStr}`
    );

    // 4. Fetch invoices from ERP
    const invoices = await ixc.getInvoicesByDueDate(dateStr);

    if (invoices.length === 0) continue;

    // 5. Send messages
    for (const invoice of invoices) {
      try {
        // Normalize phone number (Remove non-digits)
        const phone = invoice.cliente_telefone.replace(/\D/g, "");
        if (phone.length < 10) continue; // Invalid number

        // Human Delay to avoid ban
        await sleepRandom(5, 15);

        // Find Contact in Whaticket
        let contact = await (Contact as any).findOne({
          where: { number: { [Op.like]: `%${phone}%` } },
        });

        if (!contact) {
          // Optional: Create contact if not exists (Implementation dependent)
          // For now, we skip to avoid spamming wrong numbers
          logger.warn(
            `[Dunning] Contact not found for phone ${phone}. Skipping.`
          );
          continue;
        }

        // Get default Whatsapp Connection
        const whatsapp = await (Whatsapp as any).findOne({
          where: { status: "CONNECTED" },
        });
        if (!whatsapp) {
          logger.error("[Dunning] No connected WhatsApp found.");
          break;
        }

        // Create Ticket to record interaction (or use existing)
        const ticket = await FindOrCreateTicketService(
          contact,
          whatsapp.id,
          0,
          contact.companyId
        );

        // Prepare Message
        let body = rule.messageTemplate
          .replace("{{name}}", invoice.cliente_nome.split(" ")[0])
          .replace("{{valor}}", invoice.valor)
          .replace("{{vencimento}}", invoice.vencimento)
          .replace("{{linha_digitavel}}", invoice.linha_digitavel)
          .replace("{{pix}}", invoice.pix_code || "")
          .replace("{{link_pdf}}", invoice.link_pdf);

        // Send Message
        await SendWhatsAppMessage({ body, ticket });

        logger.info(
          `[Dunning] Message sent to ${contact.name} (${invoice.id})`
        );
      } catch (err) {
        logger.error(
          `[Dunning] Error processing invoice ${invoice.id}: ${err}`
        );
      }
    }
  }
  logger.info("[Dunning] Process finished.");
};
