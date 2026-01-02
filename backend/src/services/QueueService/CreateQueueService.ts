// cspell: disable
import { Queue } from "../../database/models/Queue.model";
import { UserQueue } from "../../database/models/UserQueue.model";
import { User } from "../../database/models/User.model";

interface Request {
  name: string;
  color: string;
  greetingMessage?: string;
  companyId: number;
  userIds?: number[];
}

const CreateQueueService = async({
  name,
  color,
  greetingMessage,
});
