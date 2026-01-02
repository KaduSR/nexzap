// cspell: disable

import { Queue, User } from "../../database/models/";
import AppError from "../../errors/AppError";

interface QueueData {
  name?: string;
  color?: string;
  greetingMessage?: string;
  userIds?: number[];
}

const UpdateQueueService = async (
  queueId: number | string,
  queueData: QueueData,
  companyId: number
): Promise<Queue> => {
  const { name, color, greetingMessage, userIds } = queueData;

  const queue = await Queue.findOne({
    where: { id: queueId, companyId },
    include: [{ model: User, as: "users" }],
  });

  if (!queue) {
    throw new AppError("ERR_NO_QUEUE_FOUND", 404);
  }

  await queue.update({
    name,
    color,
    greetingMessage,
  });

  if (userIds) {
    await queue.$set("users", userIds);
  }

  await queue.reload({
    include: [{ model: User, as: "users", attributes: ["id", "name"] }],
  });

  return queue;
};

export default UpdateQueueService;
