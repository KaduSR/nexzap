import app from "./app";
import { runSeeds } from "./database/seeders/runSeeds";
import { sequelize } from "./database/index";
import { testConnection } from "./database/index";

const PORT = process.env.PORT || 4000;

async function startServer() {
  try {
    await testConnection();
    await sequelize.sync({ force: true });
    console.log("✅ Banco de dados conectado!");
    await runSeeds();
    console.log("✅ Banco de dados populado!");

    app.listen(PORT, () => {
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
