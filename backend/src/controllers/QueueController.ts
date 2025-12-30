import { Response } from "express";
import Queue from "../database/models/Queue.model";
import User from "../database/models/User.model";

export const index = async (req: any, res: Response): Promise<Response> => {
  const queues = await (Queue as any).findAll({
    order: [["name", "ASC"]],
    include: [{ model: User, as: "users", attributes: ["id", "name"] }],
  });
  return res.json(queues);
};

export const store = async (req: any, res: Response): Promise<Response> => {
  const { name, color, greetingMessage, userIds } = req.body;

  const queue = await (Queue as any).create({
    name,
    color,
    greetingMessage,
  });

  if (userIds && Array.isArray(userIds)) {
    await queue.$set("users", userIds);
  }

  await queue.reload({
    include: [{ model: User, as: "users", attributes: ["id", "name"] }],
  });

  return res.status(200).json(queue);
};

export const update = async (req: any, res: Response): Promise<Response> => {
  const { queueId } = req.params;
  const { name, color, greetingMessage, userIds } = req.body;

  const queue = await (Queue as any).findByPk(queueId);
  if (!queue) return res.status(404).json({ error: "Queue not found" });

  await queue.update({ name, color, greetingMessage });

  if (userIds && Array.isArray(userIds)) {
    await queue.$set("users", userIds);
  }

  await queue.reload({
    include: [{ model: User, as: "users", attributes: ["id", "name"] }],
  });

  return res.json(queue);
};

export const remove = async (req: any, res: Response): Promise<Response> => {
  const { queueId } = req.params;
  const queue = await (Queue as any).findByPk(queueId);
  if (queue) await queue.destroy();
  return res.status(200).json({ message: "Deleted" });
};
