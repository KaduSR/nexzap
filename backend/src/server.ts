// cspell:disable
import { createServer } from "http";
import app from "./app";
import { sequelize, testConnection } from "./database/index";
import { runSeeds } from "./database/seeders/runSeeds";
import { initIO } from "./libs/socket";

const port = process.env.PORT || 8080;

async function startServer() {
  try {
    await testConnection();
    await sequelize.sync({ force: true });
    console.log("✅ Banco de dados conectado!");
    await runSeeds();
    console.log("✅ Banco de dados populado!");

    const httpServer = createServer(app);
    console.log("✅ Servidor HTTP criado!");
    initIO(httpServer);
    console.log("✅ Socket IO inicializado!");

    httpServer.listen(port, () => {
      console.log(`🚀 Servidor rodando na porta ${port}`);
      console.log(`🌐 Acesse em: http://localhost:${port}`);
      console.log(`🌐 Acesse em: http://0.0.0.0:${port}`);
    });
  } catch (error) {
    console.error("❌ Erro ao conectar ao banco de dados:", error);
    process.exit(1);
  }
}

startServer();
