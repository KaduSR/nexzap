// cspell: disable
import { Response } from "express";
import * as Yup from "yup";
import { getIO } from "../libs/socket";

import CreateContactService from "../services/ContactServices/CreateContactService";
import DeleteContactService from "../services/ContactServices/DeleteContactService";
import { ImportIxcContactsService } from "../services/ContactServices/ImportIxcContactsService";
import ListContactsService from "../services/ContactServices/ListContactsService";
import ShowContactService from "../services/ContactServices/ShowContactService";
import UpdateContactService from "../services/ContactServices/UpdateContactService";

import { Contact } from "../database/models/Contact.model";
import AppError from "../errors/AppError";

type IndexQuery = {
  searchParam?: string;
  pageNumber?: string;
};

interface ContactData {
  name: string;
  number: string;
  email?: string;
  extraInfo?: any[];
}

// Usamos 'req: any' para evitar erros de tipagem com req.user que não está na definição padrão do Express
export const index = async (req: any, res: Response): Promise<Response> => {
  const { searchParam, pageNumber } = req.query as IndexQuery;
  const { companyId } = req.user;

  const { contacts, count, hasMore } = await ListContactsService({
    searchParam,
    pageNumber,
    companyId,
  });

  return res.json({ contacts, count, hasMore });
};

export const getContact = async (
  req: any,
  res: Response
): Promise<Response> => {
  const { name, number } = req.body;
  const { companyId } = req.user;

  const contact = await Contact.findOne({ where: { name, number, companyId } });

  if (contact) {
    return res.status(200).json(contact);
  }

  return res.status(404).json({ error: "Contact not found" });
};

export const store = async (req: any, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const newContact: ContactData = req.body;

  if (newContact.number) {
    newContact.number = newContact.number.replace("-", "").replace(" ", "");
  }

  const schema = Yup.object().shape({
    name: Yup.string().required(),
    number: Yup.string().required().matches(/^\d+$/, "Invalid number format"),
  });

  try {
    await schema.validate(newContact);
  } catch (err: any) {
    throw new AppError(err.message);
  }

  // Adicionado isGroup: false para resolver o erro TS2345
  const contact = await CreateContactService({
    ...newContact,
    companyId,
    isGroup: false,
  });

  const io = getIO();
  io.emit(`company-${companyId}-contact`, {
    action: "create",
    contact,
  });

  return res.status(200).json(contact);
};

export const show = async (req: any, res: Response): Promise<Response> => {
  const { contactId } = req.params;
  const { companyId } = req.user;

  const contact = await ShowContactService({ id: contactId, companyId });

  return res.status(200).json(contact);
};

export const update = async (req: any, res: Response): Promise<Response> => {
  const contactData: ContactData = req.body;
  const { companyId } = req.user;

  const schema = Yup.object().shape({
    name: Yup.string(),
    number: Yup.string().matches(/^\d+$/, "Invalid number format"),
  });

  try {
    await schema.validate(contactData);
  } catch (err: any) {
    throw new AppError(err.message);
  }

  const { contactId } = req.params;

  const contact = await UpdateContactService({
    contactData,
    contactId,
    companyId,
  });

  const io = getIO();
  io.emit(`company-${companyId}-contact`, {
    action: "update",
    contact,
  });

  return res.status(200).json(contact);
};

export const remove = async (req: any, res: Response): Promise<Response> => {
  const { contactId } = req.params;
  const { companyId } = req.user;

  await DeleteContactService(contactId, companyId);

  const io = getIO();
  io.emit(`company-${companyId}-contact`, {
    action: "delete",
    contactId,
  });

  return res.status(200).json({ message: "Contact deleted" });
};

// --- Método de Importação IXC (CSV) ---
export const uploadIxc = async (req: any, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const files = req.files as Express.Multer.File[];

  if (!files || files.length === 0) {
    throw new AppError("No file uploaded");
  }

  const file: Express.Multer.File = files[0];

  try {
    await ImportIxcContactsService({
      companyId,
      file,
    });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  return res.status(200).json({ message: "Importação iniciada." });
};
