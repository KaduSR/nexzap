// cspell: disable
import { Contact } from "../../database/models/Contact.model";
import AppError from "../../errors/AppError";

interface Request {
  id: string | number;
  companyId: number;
}

const ShowContactService = async ({
  id,
  companyId,
}: Request): Promise<Contact> => {
  const contact = await Contact.findByPk(id, {
    include: ["extraInfo"],
  });

  if (!contact || contact.companyId !== companyId) {
    throw new AppError("ERR_NO_CONTACT_FOUND", 404);
  }

  return contact;
};

export default ShowContactService;
