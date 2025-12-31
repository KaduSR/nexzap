// cspell:disable
import { createServer } from "http";
import app from "./app";
import { sequelize, testConnection } from "./database/index";
import { runSeeds } from "./database/seeders/runSeeds";
import { initIO } from "./libs/socket";

const PORT = process.env.PORT || 4000;

async function startServer() {
  try {
    await testConnection();
    await sequelize.sync({ force: true });
    console.log("✅ Banco de dados conectado!");
    await runSeeds();
    console.log("✅ Banco de dados populado!");

    const httpServer = createServer(app);

    initIO(httpServer);

    httpServer.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`🌐 Acesse em: http://localhost:${PORT}`);
      console.log(`🌐 Acesse em: http://0.0.0.0:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Erro ao conectar ao banco de dados:", error);
    process.exit(1);
  }
}

startServer();
