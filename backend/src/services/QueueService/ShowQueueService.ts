// cspell:disable
import { Queue, User } from "../../database/models";
import AppError from "../../errors/AppError";

const ShowQueueService = async (
  queueId: number | string,
  companyId: number
): Promise<Queue> => {
  const queue = await Queue.findOne({
    where: {
      id: queueId,
      companyId,
    },
    include: [{ model: User, as: "users", attributes: ["id", "name"] }],
  });

  if (!queue) {
    throw new AppError("ERR_NO_QUEUE_FOUND", 404);
  }

  return queue;
};

export default ShowQueueService;
