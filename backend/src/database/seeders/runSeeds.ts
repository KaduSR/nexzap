// cspell:disable
import { hash } from "bcryptjs";
import { Company } from "../models/Company.model";
import { Contact } from "../models/Contact.model";
import { Invoice } from "../models/Invoice.model";
import { Plan } from "../models/Plan.model";
import { Queue } from "../models/Queue.model";
import { Setting } from "../models/Setting.model";
import { Ticket } from "../models/Ticket.model";
import { User } from "../models/User.model";
import { Whatsapp } from "../models/Whatsapp.model"; // Certifique-se de importar

export const runSeeds = async () => {
  console.log("🌱 Starting Seed Process for NexZap...");

  // 1. Create Plans
  const plans = [
    {
      id: 1,
      name: "Plano Start",
      users: 3,
      connections: 1,
      queues: 3,
      useCampaigns: false,
      useSchedules: true,
      useInternalChat: true,
      useExternalApi: false,
      useKanban: true,
      useOpenAi: false,
      useIntegrations: false,
      useFieldService: false,
      stripePriceId: "price_start_mock",
    },
    {
      id: 2,
      name: "Plano Pro",
      users: 10,
      connections: 3,
      queues: 10,
      useCampaigns: true,
      useSchedules: true,
      useInternalChat: true,
      useExternalApi: true,
      useKanban: true,
      useOpenAi: true,
      useIntegrations: false,
      useFieldService: true,
      stripePriceId: "price_pro_mock",
    },
    {
      id: 3,
      name: "Plano Enterprise",
      users: 0,
      connections: 0,
      queues: 0,
      useCampaigns: true,
      useSchedules: true,
      useInternalChat: true,
      useExternalApi: true,
      useKanban: true,
      useOpenAi: true,
      useIntegrations: true,
      useFieldService: true,
      stripePriceId: "price_enterprise_mock",
    },
  ];

  for (const plan of plans) {
    await (Plan as any).upsert(plan);
  }
  console.log("✅ Plans created/updated.");

  // 2. Create Default Company
  const companyData = {
    id: 1,
    name: "Provedor Exemplo (Matriz)",
    email: "admin@nexzap.com.br",
    document: "00.000.000/0001-91",
    phone: "5511999999999",
    address: "Av. da Tecnologia, 1000",
    city: "São Paulo",
    state: "SP",
    zipcode: "01000-000",
    planId: 3,
    status: true,
    dueDate: "2030-12-31",
    stripeSubscriptionStatus: "active",
  };

  const [company] = await (Company as any).findOrCreate({
    where: { id: 1 },
    defaults: companyData,
  });

  await company.update({ planId: 3 });
  console.log("✅ Default Company created.");

  // 3. Create Default Admin User
  const adminUser = await (User as any).findOne({
    where: { email: "admin@nexzap.com.br" },
  });

  if (!adminUser) {
    const passwordHash = await hash("123456", 8);
    await User.create({
      name: "Admin NexZap",
      email: "admin@nexzap.com.br",
      passwordHash,
      profile: "admin",
      tokenVersion: 0,
      active: true,
      companyId: 1,
    });
    console.log("✅ Admin user created (Pass: 123456).");
  }

  // 4. Create Default Settings
  const settings = [
    { key: "userCreation", value: "enabled", companyId: 1 },
    { key: "timeZone", value: "America/Sao_Paulo", companyId: 1 },
    { key: "checkMsgIsGroup", value: "enabled", companyId: 1 },
    { key: "company_name", value: "NexZap", companyId: 1 },
    { key: "primary_color", value: "#4f46e5", companyId: 1 },
    { key: "secondary_color", value: "#10b981", companyId: 1 },
    { key: "ai_enabled", value: "true", companyId: 1 },
    { key: "ai_provider", value: "gemini", companyId: 1 },
    {
      key: "ai_system_prompt",
      value: "Você é o assistente virtual do Provedor de Internet.",
      companyId: 1,
    },
    { key: "ai_model", value: "gemini-3-flash-preview", companyId: 1 },
    { key: "business_hours_check", value: "false", companyId: 1 },
  ];

  for (const s of settings) {
    await (Setting as any).upsert(s);
  }
  console.log("✅ Default settings configured.");

  // 5. Create Queues
  const queues = [
    {
      id: 1,
      name: "Suporte Técnico",
      color: "#6366f1",
      greetingMessage: "Olá...",
    },
    { id: 2, name: "Financeiro", color: "#10b981", greetingMessage: "Olá..." },
    { id: 3, name: "Comercial", color: "#f59e0b", greetingMessage: "Olá..." },
  ];

  for (const q of queues) {
    await (Queue as any).upsert(q);
  }
  console.log("✅ Queues created.");

  // --- CORREÇÃO: CRIAR WHATSAPP ANTES DOS TICKETS ---
  const existingWhatsapp = await (Whatsapp as any).findByPk(1);
  if (!existingWhatsapp) {
    await (Whatsapp as any).create({
      id: 1,
      name: "Conexão Principal",
      status: "CONNECTED",
      isDefault: true,
      companyId: 1,
      token: "seed-token",
      session: "seed-session",
    });
    console.log("✅ Whatsapp connection created.");
  }
  // --------------------------------------------------

  // 6. Create Mock Contacts & Tickets
  const contactCount = await (Contact as any).count();
  if (contactCount === 0) {
    const contactsData = [
      {
        name: "João Silva",
        number: "5511999990001",
        profilePicUrl: "",
        isGroup: false,
        companyId: 1,
      },
      {
        name: "Maria Souza",
        number: "5511999990002",
        profilePicUrl: "",
        isGroup: false,
        companyId: 1,
      },
      {
        name: "Empresa Alpha",
        number: "5511999990003",
        profilePicUrl: "",
        isGroup: false,
        companyId: 1,
      },
    ];

    for (const c of contactsData) {
      const contact = await (Contact as any).create(c);

      await (Ticket as any).create({
        contactId: contact.id,
        status: Math.random() > 0.5 ? "open" : "pending",
        whatsappId: 1, // Agora o ID 1 existe!
        lastMessage: "Gostaria de verificar minha fatura...",
        unreadMessages: Math.floor(Math.random() * 5),
        companyId: 1,
        queueId: Math.floor(Math.random() * 3) + 1,
      });
    }
    console.log("✅ Mock Contacts & Tickets created.");
  }

  // 7. Create Financial Data
  const invoiceCount = await (Invoice as any).count();
  if (invoiceCount === 0) {
    const today = new Date();
    const daysAgo = (d: number) => {
      const date = new Date();
      date.setDate(date.getDate() - d);
      return date;
    };

    const invoices = [
      {
        value: 150.0,
        status: "paid",
        paidAt: today,
        dueDate: today,
        contactId: 1,
        companyId: 1,
      },
      {
        value: 99.9,
        status: "paid",
        paidAt: today,
        dueDate: today,
        contactId: 2,
        companyId: 1,
      },
      {
        value: 120.0,
        status: "overdue",
        dueDate: daysAgo(5),
        contactId: 1,
        companyId: 1,
      },
    ];

    for (const inv of invoices) {
      await (Invoice as any).create(inv);
    }
    console.log("✅ Financial Data populated.");
  }

  console.log("🏁 Seed Process Completed!");
};
