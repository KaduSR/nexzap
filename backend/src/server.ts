import app from "./app";
import { testConnection } from "./database/index";

const PORT = process.env.PORT || 4000;

async function startServer() {
  try {
    await testConnection();
    console.log("✅ Banco de dados conectado!");

    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`🌐 Acesse em: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Erro ao conectar ao banco de dados:", error);
    process.exit(1);
  }
}

startServer();
