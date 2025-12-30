import cors from "cors";
import express, { NextFunction } from "express";
import "express-async-errors";
import helmet from "helmet";
import path from "path";
import * as StripeWebhookController from "./controllers/StripeWebhookController";
import routes from "./routes";

const app = express();

// Middlewares Globais
app.use(
  cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  }) as any
);

// STRIPE WEBHOOK (Must be before express.json)
app.post(
  "/api/stripe/webhook",
  express.raw({ type: "application/json" }),
  StripeWebhookController.handleWebhook
);

app.use(express.json() as any);
app.use(express.urlencoded({ extended: true }) as any);

// Static Files (Uploads)
app.use("/public", express.static(path.join(process.cwd(), "public")));

// Rotas
app.use("/api", routes);

// Tratamento de Erros Global
app.use((err: Error, req: any, res: any, next: NextFunction) => {
  if (err instanceof Error) {
    console.error(err);
    return res.status(400).json({
      error: err.message,
    });
  }

  console.error("Unknown error:", err);
  return res.status(500).json({
    status: "error",
    message: "Internal Server Error",
  });
});

export default app;
