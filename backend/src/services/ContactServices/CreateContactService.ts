
import Contact from "../../models/Contact";

interface Request {
    name: string;
    number: string;
    profilePicUrl?: string;
    isGroup: boolean;
    companyId: number;
    whatsappId?: number;
}

const CreateContactService = async ({ name, number, profilePicUrl, isGroup, companyId }: Request): Promise<Contact> => {
    const contact = await (Contact as any).findOne({ where: { number, companyId } });
    
    if (contact) {
        await contact.update({ profilePicUrl, name });
        return contact;
    }

    return await (Contact as any).create({ name, number, profilePicUrl, isGroup, companyId });
};

export default CreateContactService;
