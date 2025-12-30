import dotenv from "dotenv";

dotenv.config();

export default {
  dialect: "sqlite",
  storage: "./database.sqlite", // Salva os dados num arquivo local
  logging: false,
  define: {
    timestamps: true,
    underscored: true,
  },
};