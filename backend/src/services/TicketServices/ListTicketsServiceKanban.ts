import Ticket from "../../models/Ticket";
import Contact from "../../models/Contact";
import User from "../../models/User";
import Tag from "../../models/Tag";

interface Request {
    date?: string;
    showAll?: string;
}

const ListTicketsServiceKanban = async ({ date, showAll }: Request) => {
    // 1. Fetch tickets (Open/Pending)
    const tickets = await (Ticket as any).findAll({
        where: {
            status: ["open", "pending"]
        },
        include: [
            {
                model: Contact,
                as: "contact",
                attributes: ["id", "name", "number", "profilePicUrl"]
            },
            {
                model: User,
                as: "user",
                attributes: ["id", "name"]
            },
            {
                model: Tag,
                as: "tags",
                attributes: ["id", "name", "color"]
            }
        ],
        order: [["updatedAt", "DESC"]]
    });

    // 2. We return the raw list. The frontend will group them by status or tags.
    // This allows for more flexibility (filtering, sorting) on the client side.
    return tickets;
};

export default ListTicketsServiceKanban;