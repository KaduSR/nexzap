// cspell: disable

import { Queue } from "../../database/models";
import AppError from "../../errors/AppError";

const DeleteQueueService = async (
  queueId: number | string,
  companyId: number
): Promise<void> => {
  const queue = await Queue.findOne({
    where: { id: queueId, companyId },
  });

  if (!queue) {
    throw new AppError("ERR_NO_QUEUE_FOUND", 404);
  }

  await queue.destroy();
};

export default DeleteQueueService;
