import path from "path";
import { Sequelize } from "sequelize-typescript";

// Importar TODOS os modelos
import { Company } from "./models/Company.model";
import { Contact } from "./models/Contact.model";
import { Invoice } from "./models/Invoice.model";
import { Plan } from "./models/Plan.model";
import { Queue } from "./models/Queue.model";
import { Setting } from "./models/Setting.model";
import { Ticket } from "./models/Ticket.model";
import { User } from "./models/User.model";

// Use process.env ou padrão local
const dbPath = path.resolve(process.cwd(), "database.sqlite");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: dbPath,
  // REGISTRE AQUI O ARRAY COMPLETO:
  models: [User, Company, Plan, Setting, Contact, Ticket, Queue, Invoice],
  logging: false,
  define: {
    timestamps: true,
    underscored: false,
  },
});

export { sequelize };
