import express from "express";
import cors from "cors";
import { testConnection } from "./database/index";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

async function startServer() {
  try {
    // Inicialize o banco de dados primeiro
    await testConnection();

    console.log("Banco de dados inicializado com sucesso!");

    // Rota de teste
    app.get("/", (req, res) => {
      res.json({ message: "API NexZap está funcionando!" });
    });

    // Inicie o servidor
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  } catch (error) {
    console.error("Falha ao inicializar o servidor:", error);
    process.exit(1);
  }
}

startServer();
