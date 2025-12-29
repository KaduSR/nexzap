import Incident from "../../models/Incident";
import TicketTag from "../../models/TicketTag";
import Ticket from "../../models/Ticket";
import Contact from "../../models/Contact";
import Tag from "../../models/Tag";
// NOTE: Ideally, we should have a ContactTag model/table. 
// Assuming for this architecture that we check tags via the LAST Ticket or a direct Contact-Tag relation if exists.
// Implementing logic based on Contact -> Tickets -> Tags for simplicity in this schema.

const CheckIncidentService = async (contact: Contact): Promise<Incident | null> => {
  
  // 1. Find all Tags associated with this Contact (via recent tickets or direct association if implemented)
  // For this example, let's assume we fetch tags from the last closed ticket of this contact to know their "Region"
  const lastTicket = await (Ticket as any).findOne({
      where: { contactId: contact.id },
      include: [{ model: Tag, as: "tags" }],
      order: [["createdAt", "DESC"]]
  });

  if (!lastTicket || !lastTicket.tags || lastTicket.tags.length === 0) {
      return null;
  }

  const tagIds = lastTicket.tags.map((t: any) => t.id);

  // 2. Check for Active Incidents matching these Tags
  const incident = await (Incident as any).findOne({
    where: {
      isActive: true,
      tagId: tagIds,
      companyId: contact.companyId
    }
  });

  return incident;
};

export default CheckIncidentService;