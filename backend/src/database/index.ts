// src/database/index.ts
import path from "path";
import { Sequelize } from "sequelize-typescript";

// 1. Importe TODOS os modelos que sua aplicação e o Seed usam
import Company from "./models/Company.model";
import Contact from "./models/Contact.model"; // <--- Faltava este
import Invoice from "./models/Invoice.model"; // <--- Faltava este
import Plan from "./models/Plan.model"; // <--- Faltava este
import Queue from "./models/Queue.model"; // <--- Faltava este
import Setting from "./models/Setting.model"; // <--- Faltava este
import Ticket from "./models/Ticket.model"; // <--- Faltava este
import User from "./models/User.model";
import Whatsapp from "./models/Whatsapp.model";

const dbPath = path.resolve(process.cwd(), "database.sqlite");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: dbPath,
  // 2. Adicione todos eles aqui. Se não estiver aqui, o Sequelize lança "ModelNotInitializedError"
  models: [
    User,
    Company,
    Plan,
    Setting,
    Queue,
    Contact,
    Ticket,
    Invoice,
    Whatsapp,
  ],
  logging: false,
  define: {
    timestamps: true,
    underscored: false,
  },
});

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log(`✅ Conexão estabelecida com SQLite em: ${dbPath}`);
    return sequelize;
  } catch (error) {
    console.error("❌ Erro fatal ao conectar no banco:", error);
    throw error;
  }
}

export { sequelize, testConnection };
