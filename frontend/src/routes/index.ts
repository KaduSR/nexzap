// cspell: disable
import { Router } from "express";
import apiIntegrationRoutes from "./apiIntegrationRoutes";

const routes = Router();

routes.use(apiIntegrationRoutes);
// Aqui você pode adicionar outras rotas: routes.use(authRoutes);

export default routes;
