import User from "../../models/User";
import Setting from "../../models/Setting";
import Queue from "../../models/Queue";
import FlowCampaign from "../../models/FlowCampaign";
import Invoice from "../../models/Invoice";
import Contact from "../../models/Contact";
import Plan from "../../models/Plan";
import Company from "../../models/Company";

export const runSeeds = async () => {
    
    // 1. Create Plans (The Menu)
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
            useIntegrations: false
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
            useIntegrations: false
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
            useIntegrations: true // ISP Features
        }
    ];

    for (const plan of plans) {
        await (Plan as any).upsert(plan);
    }
    console.log("🌱 Seed: Plans created/updated.");

    // 2. Create Default Company (SUPER ADMIN COMPANY)
    const company = await (Company as any).findOne({ where: { id: 1 } });
    if (!company) {
        await (Company as any).create({
            id: 1,
            name: "Whaticket SaaS (Matriz)",
            email: "admin@whaticket.com",
            document: "00.000.000/0001-91",
            phone: "5511999999999",
            address: "Av. Paulista, 1000",
            city: "São Paulo",
            state: "SP",
            zipcode: "01310-100",
            planId: 3, // Starts with Enterprise
            status: true,
            dueDate: "2099-12-31" // Lifetime
        });
        console.log("🌱 Seed: Default Company created.");
    }

    // 3. Create Default Admin User
    const adminUser = await (User as any).findOne({ where: { email: "admin@whaticket.com" } });
    if (!adminUser) {
        await (User as any).create({
            name: "Super Admin",
            email: "admin@whaticket.com",
            passwordHash: "$2a$08$WaFHn.L1iE..", // Mock hash
            profile: "admin",
            tokenVersion: 0,
            active: true,
            companyId: 1
        });
        console.log("🌱 Seed: Admin user created.");
    }

    // 4. Create Default Settings
    const settings = [
        { key: "userCreation", value: "enabled" },
        { key: "timeZone", value: "America/Sao_Paulo" },
        { key: "checkMsgIsGroup", value: "enabled" },
        
        // Response AI Settings
        { key: "ai_enabled", value: "true" },
        { key: "ai_provider", value: "gemini" }, 
        { key: "ai_system_prompt", value: "Você é um assistente virtual inteligente e prestativo do Whaticket Plus." },
        { key: "ai_api_key", value: "" },
        
        // Transcription AI Settings
        { key: "ai_auto_transcribe_audio", value: "false" },
        { key: "ai_transcription_provider", value: "gemini" },
        { key: "ai_transcription_api_key", value: "" },
        { key: "ai_transcription_model", value: "gemini-2.5-flash-native-audio-preview-09-2025" },


        // Business Hours Settings
        { key: "business_hours_check", value: "false" }, // Master switch
        ...['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].map(day => ({ key: `business_hours_${day}_active`, value: 'true' })),
        ...['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].map(day => ({ key: `business_hours_${day}_start`, value: '08:00' })),
        ...['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].map(day => ({ key: `business_hours_${day}_end`, value: '18:00' })),
        { key: "business_hours_saturday_active", value: "true" },
        { key: "business_hours_saturday_start", value: "08:00" },
        { key: "business_hours_saturday_end", value: "12:00" },
        { key: "business_hours_sunday_active", value: "false" },
        { key: "business_hours_sunday_start", value: "08:00" },
        { key: "business_hours_sunday_end", value: "12:00" }
    ];

    for (const s of settings) {
        const settingExists = await (Setting as any).findOne({ where: { key: s.key } });
        if (!settingExists) {
            await (Setting as any).create(s);
        } else {
            // Update only if it's a new key being added to avoid overwriting user changes
            if (!settingExists) await (Setting as any).create(s);
        }
    }
    console.log("🌱 Seed: Default settings checked/created.");

    // 5. Create Default Queues
    const queueExists = await (Queue as any).count();
    if (queueExists === 0) {
        await (Queue as any).create({
            name: "Suporte Geral",
            color: "#6366f1",
            greetingMessage: "Olá! Bem-vindo ao suporte."
        });
        await (Queue as any).create({
            name: "Financeiro",
            color: "#10b981",
            greetingMessage: "Olá! Você está no financeiro."
        });
        console.log("🌱 Seed: Default queues created.");
    }

    // 6. Create Default Flow
    const flowExists = await (FlowCampaign as any).count();
    if (flowExists === 0) {
        await (FlowCampaign as any).create({
            id: 1,
            name: "Fluxo Principal",
            phrase: "ola",
            active: true,
            flow: {
                nodes: [
                    { 
                        id: 'node_1', 
                        type: 'trigger', 
                        label: 'Início do Fluxo', 
                        data: { trigger: 'Qualquer Mensagem' },
                        position: { x: 400, y: 50 }
                    }
                ]
            }
        });
        console.log("🌱 Seed: Default flow created.");
    }

    // 7. Create Dummy Invoices for Dashboard
    const invoiceCount = await (Invoice as any).count();
    if (invoiceCount === 0) {
        // Ensure a contact exists
        const [contact] = await (Contact as any).findOrCreate({
            where: { number: '5511999999999' },
            defaults: { name: 'Cliente Seed', isGroup: false, companyId: 1 }
        });

        const today = new Date();
        const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
        const dayBefore = new Date(today); dayBefore.setDate(dayBefore.getDate() - 2);

        // Paid Invoices (Revenue)
        await (Invoice as any).create({ value: 150.00, status: 'paid', paidAt: today, dueDate: today, contactId: contact.id, companyId: 1 });
        await (Invoice as any).create({ value: 200.50, status: 'paid', paidAt: today, dueDate: today, contactId: contact.id, companyId: 1 });
        await (Invoice as any).create({ value: 99.90, status: 'paid', paidAt: yesterday, dueDate: yesterday, contactId: contact.id, companyId: 1 });
        await (Invoice as any).create({ value: 299.90, status: 'paid', paidAt: dayBefore, dueDate: dayBefore, contactId: contact.id, companyId: 1 });

        // Overdue Invoices
        await (Invoice as any).create({ value: 120.00, status: 'overdue', dueDate: dayBefore, contactId: contact.id, companyId: 1 });
        await (Invoice as any).create({ value: 450.00, status: 'overdue', dueDate: yesterday, contactId: contact.id, companyId: 1 });

        console.log("🌱 Seed: Financial Data Created.");
    }
};