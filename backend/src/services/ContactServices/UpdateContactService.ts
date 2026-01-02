// cspell: disable
import { Contact } from "../../database/models/Contact.model";
import AppError from "../../errors/AppError";

interface ContactData {
  email?: string;
  number?: string;
  name?: string;
  extraInfo?: any[];
}

interface Request {
  contactData: ContactData;
  contactId: string;
  companyId: number;
}

const UpdateContactService = async ({
  contactData,
  contactId,
  companyId,
}: Request): Promise<Contact> => {
  const { email, name, number, extraInfo } = contactData;

  const contact = await Contact.findOne({
    where: { id: contactId, companyId },
    include: ["extraInfo"],
  });

  if (!contact) {
    throw new AppError("ERR_NO_CONTACT_FOUND", 404);
  }

  if (extraInfo) {
    // Lógica para atualizar campos extras se necessário
    // Por simplicidade, focamos nos dados principais
  }

  await contact.update({
    name,
    number,
    email,
  });

  await contact.reload({
    include: ["extraInfo"],
  });

  return contact;
};

export default UpdateContactService;
