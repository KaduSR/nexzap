import { Router } from "express";
import multer from "multer";
import uploadConfig from "./config/upload";

import apiIntegrationRoutes from "./routes/apiIntegrationRoutes";
import authRoutes from "./routes/authRoutes"; // Import Auth Routes

import * as IxcController from "./controllers/IxcController";
import * as SipController from "./controllers/SipController";
import * as FlowBuilderController from "./controllers/FlowBuilderController";
import * as TicketController from "./controllers/TicketController";
import * as TicketAiController from "./controllers/TicketAiController";
import * as MessageController from "./controllers/MessageController";
import * as WhatsAppSessionController from "./controllers/WhatsAppSessionController";
import * as QuickMessageController from "./controllers/QuickMessageController";
import * as SettingController from "./controllers/SettingController";
import * as AiController from "./controllers/AiController";
import * as CampaignController from "./controllers/CampaignController";
import * as ScheduledMessageController from "./controllers/ScheduledMessageController";
import * as DunningController from "./controllers/DunningController";
import * as IncidentController from "./controllers/IncidentController";
import * as WhatsappController from "./controllers/WhatsappController";
import * as UserController from "./controllers/UserController";
import * as FinancialController from "./controllers/FinancialController";
import * as ServiceItemController from "./controllers/ServiceItemController";
import * as QueueController from "./controllers/QueueController";
import * as SuperAdminController from "./controllers/SuperAdminController";
import * as PlanController from "./controllers/PlanController"; // Import PlanController
import * as SubscriptionController from "./controllers/SubscriptionController";
import whatsappRoutes from "./routes/whatsappRoutes";
import isAuth from "./middleware/isAuth";

const routes = Router();
const upload = uploadConfig;

// Public Routes
routes.use(authRoutes); // Use Auth Routes
routes.use(apiIntegrationRoutes);
// Webhook IXC (Public)
routes.post("/ixc/webhook/payment", IxcController.webhookPayment);

// Protected Routes (Apply isAuth manually or globally if preferred, here applying manually for clarity)
routes.use(whatsappRoutes);

// Rotas IXC
routes.get("/ixc/customers", isAuth, IxcController.index);
routes.get("/ixc/customers/:cpf", isAuth, IxcController.show);
routes.get("/ixc/os-params", isAuth, IxcController.getOsParams);
routes.post("/ixc/os", isAuth, IxcController.createOs);

// Rotas SIP
routes.get("/sip/settings", isAuth, SipController.getSettings);
routes.post("/sip/settings", isAuth, SipController.saveSettings);

// Rotas FlowBuilder
routes.get("/flowbuilder", isAuth, FlowBuilderController.index);
routes.get("/flowbuilder/active", isAuth, FlowBuilderController.getFlow);
routes.post("/flowbuilder", isAuth, FlowBuilderController.save);

// Rotas Tickets
routes.get("/tickets/kanban", isAuth, TicketController.indexKanban);
routes.post("/tickets", isAuth, TicketController.store);
routes.put("/tickets/:ticketId", isAuth, TicketController.update);
// Ticket AI Copilot
routes.get("/tickets/:ticketId/ai-analysis", isAuth, TicketAiController.show);

// Rotas Queues (Setores)
routes.get("/queues", isAuth, QueueController.index);
routes.post("/queues", isAuth, QueueController.store);
routes.put("/queues/:queueId", isAuth, QueueController.update);
routes.delete("/queues/:queueId", isAuth, QueueController.remove);

// Rotas Scheduled Messages
routes.get(
  "/tickets/:ticketId/schedules",
  isAuth,
  ScheduledMessageController.index
);
routes.post(
  "/tickets/:ticketId/schedules",
  isAuth,
  ScheduledMessageController.store
);
routes.delete(
  "/schedules/:scheduleId",
  isAuth,
  ScheduledMessageController.remove
);

// Rotas Campaigns
routes.get("/campaigns", isAuth, CampaignController.index);
routes.post("/campaigns", isAuth, CampaignController.store);

// Rotas Dunning (Régua de Cobrança)
routes.get("/dunning", isAuth, DunningController.index);
routes.post("/dunning", isAuth, DunningController.store);
routes.put("/dunning/:id", isAuth, DunningController.update);
routes.delete("/dunning/:id", isAuth, DunningController.remove);
routes.post("/dunning/run", isAuth, DunningController.runNow);

// Rotas Financial Dashboard
routes.get("/financial/dashboard", isAuth, FinancialController.index);

// Rotas Incidents (Panic Mode)
routes.get("/incidents", isAuth, IncidentController.index);
routes.post("/incidents", isAuth, IncidentController.store);
routes.put("/incidents/:id", isAuth, IncidentController.update);
routes.get("/tags", isAuth, IncidentController.listTags);

// Rotas Service Price List (Tabela de Serviços)
routes.get("/services/items", isAuth, ServiceItemController.index);
routes.post("/services/items", isAuth, ServiceItemController.store);
routes.put("/services/items/:id", isAuth, ServiceItemController.update);
routes.delete("/services/items/:id", isAuth, ServiceItemController.remove);

// Rotas Messages
routes.post(
  "/messages/:ticketId",
  isAuth,
  upload.array("medias"),
  MessageController.store
);

// Rotas WhatsApp Actions
routes.post(
  "/whatsapp/:whatsappId/restart",
  isAuth,
  WhatsappController.restart
);
routes.delete("/whatsapp/:whatsappId", isAuth, WhatsappController.remove);

// Rotas WhatsApp Profile
routes.post(
  "/whatsapp/profile-picture/:whatsappId",
  isAuth,
  upload.single("file"),
  WhatsAppSessionController.updateProfilePicture
);

routes.put(
  "/whatsapp/profile-status/:whatsappId",
  isAuth,
  WhatsAppSessionController.updateProfileStatus
);

// Rotas Users
routes.get("/users", isAuth, UserController.index);
routes.post("/users", isAuth, UserController.store); // Create
routes.get("/users/:userId", isAuth, UserController.show); // Show
routes.put("/users/:userId", isAuth, UserController.update); // Update
routes.delete("/users/:userId", isAuth, UserController.remove); // Delete

// Rotas Quick Messages
routes.get("/quick-messages", isAuth, QuickMessageController.index);
routes.post(
  "/quick-messages",
  isAuth,
  upload.single("media"),
  QuickMessageController.store
);
routes.get("/quick-messages/:id", isAuth, QuickMessageController.show);
routes.put(
  "/quick-messages/:id",
  isAuth,
  upload.single("media"),
  QuickMessageController.update
);
routes.delete("/quick-messages/:id", isAuth, QuickMessageController.remove);

// Rotas Settings
routes.get("/settings", isAuth, SettingController.index);
routes.put("/settings/:key", isAuth, SettingController.update);

// Rotas SUPER ADMIN (SaaS)
routes.get("/companies", isAuth, SuperAdminController.index);
routes.post("/companies", isAuth, SuperAdminController.store);
routes.get("/companies/plans", isAuth, SuperAdminController.listPlans);
routes.put("/companies/:id", isAuth, SuperAdminController.updateCompany);
routes.get("/companies/me", isAuth, SuperAdminController.currentCompany);

// Rotas PLANS (SaaS Management)
routes.get("/plans", isAuth, PlanController.index);
routes.post("/plans", isAuth, PlanController.store);
routes.put("/plans/:id", isAuth, PlanController.update);
routes.delete("/plans/:id", isAuth, PlanController.remove);

// Rota Subscription (Stripe)
routes.post(
  "/subscription/create-checkout",
  isAuth,
  SubscriptionController.createCheckoutSession
);

// Rota de Transcrição de Áudio com IA
routes.post(
  "/ai/transcribe",
  isAuth,
  upload.single("audio"),
  AiController.transcribe
);

// Rota de Health Check
routes.get("/", (req, res) => {
  return res.json({
    message: "Whaticket Plus Backend is Online 🟢",
    timestamp: new Date(),
  });
});

export default routes;
