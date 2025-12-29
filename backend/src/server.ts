import app from "./app";
import { createServer } from "http";
import { initIO } from "./libs/socket";
import sequelize from "./database";
import { runSeeds } from "./database/seeds/runSeeds";
import cron from "node-cron";
import { ProcessCampaignBatchService } from "./services/CampaignService/ProcessCampaignBatchService";
import { ProcessScheduledMessages } from "./services/ScheduleServices/ProcessScheduledMessages";
import { ProcessDunningService } from "./services/FinanceServices/ProcessDunningService";
import { SyncIxcInvoicesService } from "./services/FinanceServices/SyncIxcInvoicesService";

const server = createServer(app);

// Initialize Socket IO
initIO(server);

const PORT = process.env.PORT || 8080;

// Initialize Database then Start Server
sequelize.sync()
  .then(async () => {
    console.log("💾 Database connected and synced.");
    
    // Execute Seeds
    await runSeeds();

    // Start Schedulers
    // Rodar a cada 1 minuto (Campanhas e Agendamentos)
    cron.schedule("*/1 * * * *", async () => {
      // console.log("Running Schedulers (Campaigns & Messages)...");
      try {
        await ProcessCampaignBatchService();
        await ProcessScheduledMessages();
      } catch (err) {
        console.error("Error in Short-term Schedulers:", err);
      }
    });

    // Régua de Cobrança: Rodar todo dia às 09:00
    cron.schedule("0 9 * * *", async () => {
        console.log("⏰ Running Daily Dunning Process...");
        try {
            await ProcessDunningService();
        } catch (err) {
            console.error("Error in Dunning Scheduler:", err);
        }
    });

    // Sincronização Financeira: A cada 30 minutos
    cron.schedule("*/30 * * * *", async () => {
        console.log("🔄 Syncing Financial Data with ERP...");
        try {
            await SyncIxcInvoicesService();
        } catch (err) {
            console.error("Error in Financial Sync:", err);
        }
    });

    // NOTE: Run once on startup for demo purposes
    setTimeout(() => { SyncIxcInvoicesService(); }, 10000);

    server.listen(PORT, () => {
      console.log(`
      🚀 Backend is running!
      📡 Port: ${PORT}
      🔗 Env: ${process.env.NODE_ENV || 'development'}
      🔊 Socket.IO is ready for real-time events.
      ⏰ Cron Jobs active.
      `);
    });
  })
  .catch((err) => {
    console.error("❌ Database connection failed:", err);
  });