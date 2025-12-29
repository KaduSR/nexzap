import { Router } from "express";
import * as AuthController from "../controllers/AuthController";

const authRoutes = Router();

authRoutes.post("/auth/signup", AuthController.register);
authRoutes.post("/auth/login", AuthController.login);
authRoutes.post("/auth/refresh", AuthController.refresh);

export default authRoutes;