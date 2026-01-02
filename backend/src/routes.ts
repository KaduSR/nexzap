// cspell:disable
import { Router } from "express";
import multer from "multer";
import uploadConfig from "./config/upload";

import apiIntegrationRoutes from "./routes/apiIntegrationRoutes";
import authRoutes from "./routes/authRoutes";
import whatsappRoutes from "./routes/whatsappRoutes";
import contactRoutes from "./routes/contactRoutes"; // Adicionado rota de contactos

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
import * as PlanController from "./controllers/PlanController";
import * as SubscriptionController from "./controllers/SubscriptionController";
// import * as StripeWebhookController from "./controllers/StripeWebhookController"; // Se existir

import isAuth from "./middleware/isAuth";
import isSuper from "./middleware/isSuper";

const routes = Router();
const upload = multer(uploadConfig);

// --- Rotas Públicas ---
routes.get("/", (req, res) => {
  return res.json({
    message: "NexZap Backend is Online 🟢",
    timestamp: new Date(),
  });
});

routes.get("/ping", (req, res) => {
  return res.json({ message: "Pong 🏓", timestamp: new Date() });
});

routes.use(authRoutes);
routes.use(apiIntegrationRoutes);
routes.use(contactRoutes); // Registando rotas de contacto (importante para o upload CSV)
routes.post("/ixc/webhook/payment", IxcController.webhookPayment);

// --- Rotas Protegidas ---
routes.use(whatsappRoutes);

// IXC
routes.get("/ixc/customers", isAuth, IxcController.index);
routes.get("/ixc/customers/:cpf", isAuth, IxcController.show);
routes.get("/ixc/os-params", isAuth, IxcController.getOsParams);
routes.post("/ixc/os", isAuth, IxcController.createOs);

// SIP
routes.get("/sip/settings", isAuth, SipController.getSettings);
routes.post("/sip/settings", isAuth, SipController.saveSettings);

// FlowBuilder
routes.get("/flowbuilder", isAuth, FlowBuilderController.index);
routes.get("/flowbuilder/active", isAuth, FlowBuilderController.getFlow);
routes.post("/flowbuilder", isAuth, FlowBuilderController.save);

// Tickets
routes.get("/tickets/kanban", isAuth, TicketController.indexKanban);
routes.post("/tickets", isAuth, TicketController.store);
routes.put("/tickets/:ticketId", isAuth, TicketController.update);
routes.get("/tickets/:ticketId/ai-analysis", isAuth, TicketAiController.show);

// Queues
routes.get("/queues", isAuth, QueueController.index);
routes.post("/queues", isAuth, QueueController.store);
routes.put("/queues/:queueId", isAuth, QueueController.update);
routes.delete("/queues/:queueId", isAuth, QueueController.remove);

// Schedules
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

// Campaigns
routes.get("/campaigns", isAuth, CampaignController.index);
routes.post("/campaigns", isAuth, CampaignController.store);
routes.put("/campaigns/:id", isAuth, CampaignController.update); // Adicionado update
routes.delete("/campaigns/:id", isAuth, CampaignController.remove); // Adicionado remove

// Dunning
routes.get("/dunning", isAuth, DunningController.index);
routes.post("/dunning", isAuth, DunningController.store);
routes.put("/dunning/:id", isAuth, DunningController.update);
routes.delete("/dunning/:id", isAuth, DunningController.remove);
routes.post("/dunning/run", isAuth, DunningController.runNow);

// Financial
routes.get("/financial/dashboard", isAuth, FinancialController.index);

// Incidents
routes.get("/incidents", isAuth, IncidentController.index);
routes.post("/incidents", isAuth, IncidentController.store);
routes.put("/incidents/:id", isAuth, IncidentController.update);
routes.get("/tags", isAuth, IncidentController.listTags);

// Services
routes.get("/services/items", isAuth, ServiceItemController.index);
routes.post("/services/items", isAuth, ServiceItemController.store);
routes.put("/services/items/:id", isAuth, ServiceItemController.update);
routes.delete("/services/items/:id", isAuth, ServiceItemController.remove);

// Messages
routes.post(
  "/messages/:ticketId",
  isAuth,
  upload.array("medias"),
  MessageController.store
);

// WhatsApp Actions
routes.post(
  "/whatsapp/:whatsappId/restart",
  isAuth,
  WhatsappController.restart
);
routes.delete("/whatsapp/:whatsappId", isAuth, WhatsappController.remove);
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

// Users
routes.get("/users", isAuth, UserController.index);
routes.post("/users", isAuth, UserController.store);
routes.get("/users/:userId", isAuth, UserController.show);
routes.put("/users/:userId", isAuth, UserController.update);
routes.delete("/users/:userId", isAuth, UserController.remove);

// Quick Messages
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

// Settings
routes.get("/settings", isAuth, SettingController.index);
routes.put("/settings/:key", isAuth, SettingController.update);

// =========================================================================
// 🔒 ROTAS BLINDADAS (SUPER ADMIN)
// =========================================================================

// Gestão de Empresas
routes.get("/companies", isAuth, isSuper, SuperAdminController.index);
routes.post("/companies", isAuth, isSuper, SuperAdminController.store);
routes.get("/companies/plans", isAuth, isSuper, SuperAdminController.listPlans);
routes.put(
  "/companies/:id",
  isAuth,
  isSuper,
  SuperAdminController.updateCompany
);

// Gestão de Planos
routes.get("/plans", isAuth, isSuper, PlanController.index);
routes.post("/plans", isAuth, isSuper, PlanController.store);
routes.put("/plans/:id", isAuth, isSuper, PlanController.update);
routes.delete("/plans/:id", isAuth, isSuper, PlanController.remove);

// =========================================================================

// Rota movida para fora do isSuper para que Admin comum possa ver sua empresa
routes.get("/companies/me", isAuth, SuperAdminController.currentCompany);

// Subscription (Stripe)
routes.post(
  "/subscription/create-checkout",
  isAuth,
  SubscriptionController.createCheckoutSession
);

// AI
routes.post(
  "/ai/transcribe",
  isAuth,
  upload.single("audio"),
  AiController.transcribe
);

export default routes;
