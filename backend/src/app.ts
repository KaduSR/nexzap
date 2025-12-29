import "express-async-errors";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser"; // Não esqueça de importar
import helmet from "helmet";
import routes from "./routes";
import path from "path";
import * as StripeWebhookController from "./controllers/StripeWebhookController";

// 1. INICIALIZAÇÃO (Deve vir antes de qualquer app.use ou app.post)
const app = express();

// 2. STRIPE WEBHOOK (Prioridade Máxima - Antes do JSON Global)
// Nota: Certifique-se que a URL bate com o que cadastrou no Stripe (/api/stripe/webhook ou /stripe/webhook)
app.post(
  "/api/stripe/webhook", 
  express.raw({ type: "application/json" }), 
  StripeWebhookController.handleWebhook
);

// 3. MIDDLEWARES GLOBAIS
// Configure o CORS uma única vez e corretamente
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000", // Mais seguro que "*"
  credentials: true, // Necessário se usar Cookies/Sessions
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(cookieParser());

app.use(helmet({
  crossOriginResourcePolicy: false,
}));

// JSON Parser (Só agora, para não quebrar o Stripe)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 4. ARQUIVOS ESTÁTICOS E ROTAS
app.use("/public", express.static(path.resolve("public")));
app.use("/api", routes);

// 5. TRATAMENTO DE ERROS (Global Handler)
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof Error) {
    // Log apenas em dev ou use um logger (Winston/Pino)
    console.error(err); 
    return res.status(400).json({
      error: err.message
    });
  }

  console.error("Unknown error:", err);
  return res.status(500).json({
    status: "error",
    message: "Internal Server Error"
  });
});

export default app;