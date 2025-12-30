import Company from "../models/Company.model";
import Contact from "../models/Contact.model";
import Invoice from "../models/Invoice.model";
import Plan from "../models/Plan.model";
import Queue from "../models/Queue.model";
import Setting from "../models/Setting.model";
import Ticket from "../models/Ticket.model";
import User from "../models/User.model";

export const runSeeds = async () => {
  console.log("🌱 Starting Seed Process for NexZap...");

  // 1. Create Plans (NexZap Pricing)
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
      useOpenAi: true, // IA enabled
      useIntegrations: false,
      useFieldService: true,
      stripePriceId: "price_pro_mock",
    },
    {
      id: 3,
      name: "Plano Enterprise",
      users: 0, // Unlimited
      connections: 0,
      queues: 0,
      useCampaigns: true,
      useSchedules: true,
      useInternalChat: true,
      useExternalApi: true,
      useKanban: true,
      useOpenAi: true,
      useIntegrations: true, // ISP Features enabled (IXC, Voalle)
      useFieldService: true,
      stripePriceId: "price_enterprise_mock",
    },
  ];

  for (const plan of plans) {
    await (Plan as any).upsert(plan);
  }
  console.log("✅ Plans created/updated.");

  // 2. Create Default Company (NexZap Provider)
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
    planId: 3, // Starts with Enterprise features
    status: true,
    dueDate: "2030-12-31", // Lifetime demo
    stripeSubscriptionStatus: "active",
  };

  const [company] = await (Company as any).findOrCreate({
    where: { id: 1 },
    defaults: companyData,
  });

  // Ensure company has correct plan if it already existed
  await company.update({ planId: 3 });
  console.log("✅ Default Company created.");

  // 3. Create Default Admin User
  const adminUser = await (User as any).findOne({
    where: { email: "admin@nexzap.com.br" },
  });
  if (!adminUser) {
    await (User as any).create({
      name: "Admin NexZap",
      email: "admin@nexzap.com.br",
      passwordHash: "123456", // In production this is hashed by the Controller/Model hooks
      profile: "admin",
      tokenVersion: 0,
      active: true,
      companyId: 1,
    });
    console.log("✅ Admin user created (Pass: 123456).");
  }

  // 4. Create Default Settings (Branding & AI)
  const settings = [
    { key: "userCreation", value: "enabled", companyId: 1 },
    { key: "timeZone", value: "America/Sao_Paulo", companyId: 1 },
    { key: "checkMsgIsGroup", value: "enabled", companyId: 1 },

    // Branding NexZap
    { key: "company_name", value: "NexZap", companyId: 1 },
    { key: "primary_color", value: "#4f46e5", companyId: 1 }, // Indigo
    { key: "secondary_color", value: "#10b981", companyId: 1 }, // Emerald

    // AI Settings
    { key: "ai_enabled", value: "true", companyId: 1 },
    { key: "ai_provider", value: "gemini", companyId: 1 },
    {
      key: "ai_system_prompt",
      value:
        "Você é o assistente virtual do Provedor de Internet. Seja cortês e ajude com faturas e suporte técnico.",
      companyId: 1,
    },
    { key: "ai_model", value: "gemini-3-flash-preview", companyId: 1 },

    // Business Hours (Example)
    { key: "business_hours_check", value: "false", companyId: 1 },
  ];

  for (const s of settings) {
    await (Setting as any).upsert(s);
  }
  console.log("✅ Default settings configured.");

  // 5. Create Queues (Setores)
  const queues = [
    {
      id: 1,
      name: "Suporte Técnico",
      color: "#6366f1",
      greetingMessage: "Olá! Um técnico analisará sua conexão em instantes.",
    },
    {
      id: 2,
      name: "Financeiro",
      color: "#10b981",
      greetingMessage:
        "Bem-vindo ao financeiro. Para 2ª via de boleto, digite seu CPF.",
    },
    {
      id: 3,
      name: "Comercial",
      color: "#f59e0b",
      greetingMessage: "Quer assinar nossa fibra? Veja nossos planos!",
    },
  ];

  for (const q of queues) {
    await (Queue as any).upsert(q);
  }
  console.log("✅ Queues created.");

  // 6. Create Mock Contacts & Tickets (For Kanban/Dashboard)
  const contactCount = await (Contact as any).count();
  if (contactCount === 0) {
    const contactsData = [
      {
        name: "João Silva",
        number: "5511999990001",
        profilePicUrl:
          "https://ui-avatars.com/api/?name=Joao+Silva&background=random",
        isGroup: false,
        companyId: 1,
      },
      {
        name: "Maria Souza",
        number: "5511999990002",
        profilePicUrl:
          "https://ui-avatars.com/api/?name=Maria+Souza&background=random",
        isGroup: false,
        companyId: 1,
      },
      {
        name: "Empresa Alpha",
        number: "5511999990003",
        profilePicUrl:
          "https://ui-avatars.com/api/?name=Empresa+Alpha&background=random",
        isGroup: false,
        companyId: 1,
      },
    ];

    for (const c of contactsData) {
      const contact = await (Contact as any).create(c);

      // Create a Ticket for each
      await (Ticket as any).create({
        contactId: contact.id,
        status: Math.random() > 0.5 ? "open" : "pending",
        whatsappId: 1,
        lastMessage: "Gostaria de verificar minha fatura...",
        unreadMessages: Math.floor(Math.random() * 5),
        companyId: 1,
        queueId: Math.floor(Math.random() * 3) + 1,
      });
    }
    console.log("✅ Mock Contacts & Tickets created.");
  }

  // 7. Create Financial Data (For Dashboard Charts)
  const invoiceCount = await (Invoice as any).count();
  if (invoiceCount === 0) {
    const today = new Date();

    // Helper to get date X days ago
    const daysAgo = (d: number) => {
      const date = new Date();
      date.setDate(date.getDate() - d);
      return date;
    };

    const invoices = [
      // Revenue (Paid)
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
        value: 299.9,
        status: "paid",
        paidAt: daysAgo(1),
        dueDate: daysAgo(1),
        contactId: 3,
        companyId: 1,
      },
      {
        value: 150.0,
        status: "paid",
        paidAt: daysAgo(2),
        dueDate: daysAgo(2),
        contactId: 1,
        companyId: 1,
      },
      {
        value: 99.9,
        status: "paid",
        paidAt: daysAgo(3),
        dueDate: daysAgo(3),
        contactId: 2,
        companyId: 1,
      },

      // Overdue
      {
        value: 120.0,
        status: "overdue",
        dueDate: daysAgo(5),
        contactId: 1,
        companyId: 1,
      },
      {
        value: 450.0,
        status: "overdue",
        dueDate: daysAgo(10),
        contactId: 3,
        companyId: 1,
      },
    ];

    for (const inv of invoices) {
      await (Invoice as any).create(inv);
    }
    console.log("✅ Financial Data (Invoices) populated.");
  }

  console.log("🏁 Seed Process Completed!");
};
