// cspell: disable
import { Router } from "express";
import multer from "multer";
import uploadConfig from "../config/upload";
import * as ContactController from "../controllers/ContactController";
import isAuth from "../middleware/isAuth";

const contactRoutes = Router();
const upload = multer(uploadConfig);

// Rotas CRUD de Contactos
contactRoutes.post("/contacts", isAuth, ContactController.store);
contactRoutes.get("/contacts", isAuth, ContactController.index);
contactRoutes.get("/contacts/:contactId", isAuth, ContactController.show);
contactRoutes.put("/contacts/:contactId", isAuth, ContactController.update);
contactRoutes.delete("/contacts/:contactId", isAuth, ContactController.remove);

// Rota de Importação (IXC / CSV)
// O nome do campo no formData do frontend deve ser "file"
contactRoutes.post(
  "/contacts/import/ixc",
  isAuth,
  upload.array("file"),
  ContactController.uploadIxc
);

export default contactRoutes;
