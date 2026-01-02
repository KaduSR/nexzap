// cspell: disable
import { Queue, User } from "../../database/models/";

interface Request {
  name: string;
  color: string;
  greetingMessage?: string;
  companyId: number;
  userIds?: number[];
}

const CreateQueueService = async ({
  name,
  color,
  greetingMessage,
  companyId,
  userIds = [],
}: Request): Promise<Queue> => {
  const queue = await Queue.create({
    name,
    color,
    greetingMessage,
    companyId,
  });

  if (userIds.length > 0) {
    await queue.$set("users", userIds);
  }

  await queue.reload({
    include: [{ model: User, as: "users", attributes: ["id", "name"] }],
  });
  return queue;
};

export default CreateQueueService;
