import IxcClient from "../IxcService/IxcClient";
import Invoice from "../../models/Invoice";
import Contact from "../../models/Contact";
import Setting from "../../models/Setting";
import { Op } from "sequelize";
import { getIO } from "../../libs/socket";
import { logger } from "../../utils/logger";

export const SyncIxcInvoicesService = async (): Promise<void> => {
  // 1. Get Settings (In production, iterate over companies)
  const ixcToken = await (Setting as any).findOne({ where: { key: "ixc_token" } });
  const ixcUrl = await (Setting as any).findOne({ where: { key: "ixc_url" } });
  const companyId = 1; // Default

  const token = ixcToken?.value || "MOCK_TOKEN";
  const url = ixcUrl?.value || "http://mock.url";

  const ixc = new IxcClient(token, url);

  try {
    const todayStr = new Date().toISOString().split('T')[0];
    
    // 2. Fetch payments from ERP
    const receivedInvoices = await ixc.getReceivingRecords({
        date: todayStr 
    });

    if (receivedInvoices.length > 0) {
        logger.info(`[Finance] Syncing ${receivedInvoices.length} payments from ERP...`);
    }

    for (const record of receivedInvoices) {
      // 3. Find invoice in local DB
      // We look for ID match. In dev seed, invoice IDs are small (e.g. 1, 2). 
      // The mock ERP returns IDs like 101. 
      // For demonstration, let's assume we sync based on 'id' if it exists, or create new.
      
      const invoice = await (Invoice as any).findOne({
        where: { 
            // In a real scenario, map external ID to local ID or use a specific column
            id: record.id_fatura, 
            companyId 
        }
      });

      if (invoice && invoice.status !== "paid") {
        // 4. Update to PAID
        await invoice.update({
          status: "paid", 
          value: record.valor_recebido, 
          paidAt: new Date(), 
        });

        // 5. Notify Frontend
        const contact = await (Contact as any).findByPk(invoice.contactId);
        
        const io = getIO();
        io.emit(`company-${companyId}-payment`, {
            action: "received",
            invoice: invoice,
            client: contact?.name || "Cliente"
        });
        
        logger.info(`[Finance] Payment confirmed for invoice #${invoice.id} - R$ ${record.valor_recebido}`);
      }
    }

  } catch (error) {
    logger.error(`[Finance] Error syncing invoices: ${error}`);
  }
};