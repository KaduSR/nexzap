// cspell: disable
// src/database/index.ts
import path from "path";
import { Sequelize } from "sequelize-typescript";
import * as models from "./models"; // Importa todos os exports do index.ts

const dbPath = path.resolve(process.cwd(), "database.sqlite");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: dbPath,
  // Object.values(models) pega todas as classes exportadas e joga no array
  models: Object.values(models),
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
