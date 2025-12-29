import { Router } from "express";
import isAuth from "../middleware/isAuth";
import * as WhatsappController from "../controllers/WhatsappController";

const whatsappRoutes = Router();

whatsappRoutes.get("/whatsapp", isAuth, WhatsappController.index);
whatsappRoutes.put("/whatsapp/:whatsappId", isAuth, WhatsappController.update);

export default whatsappRoutes;
