import { Router } from "express";
import * as AuthController from "../controllers/AuthController";

const authRoutes = Router();

authRoutes.post("/signup", AuthController.register);
authRoutes.post("/login", AuthController.login);
authRoutes.post("/refresh_token", AuthController.refresh);

export default authRoutes;
