import { Request, Response } from "express";
import { Queue } from "../database/models/Queue.model";
import { User } from "../database/models/User.model";
import AppError from "../errors/AppError";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const users = await (User as any).findAll({
    attributes: ["id", "name", "email", "profile", "active"],
    include: [
      { model: Queue, as: "queues", attributes: ["id", "name", "color"] },
    ],
    order: [["name", "ASC"]],
  });
  return res.json(users);
};

export const store = async (req: any, res: Response): Promise<Response> => {
  const { name, email, password, profile, queueIds } = req.body;
  const { companyId } = req.user;

  // Check email
  const userExists = await (User as any).findOne({ where: { email } });
  if (userExists) {
    throw new AppError("Email already exists.");
  }

  const user = await (User as any).create({
    name,
    email,
    passwordHash: password, // In production, use bcrypt.hash(password, 8)
    profile: profile || "user",
    companyId,
    active: true,
  });

  if (queueIds && queueIds.length > 0) {
    await user.$set("queues", queueIds);
  }

  await user.reload({
    attributes: ["id", "name", "email", "profile", "active"],
    include: [
      { model: Queue, as: "queues", attributes: ["id", "name", "color"] },
    ],
  });

  return res.status(200).json(user);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { userId } = req.params;
  const user = await (User as any).findByPk(userId, {
    attributes: ["id", "name", "email", "profile", "active"],
    include: [{ model: Queue, as: "queues", attributes: ["id", "name"] }],
  });

  if (!user) throw new AppError("User not found", 404);

  return res.json(user);
};

export const update = async (req: any, res: Response): Promise<Response> => {
  const { userId } = req.params;
  const { name, email, password, profile, queueIds, active } = req.body;

  const user = await (User as any).findByPk(userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const updateData: any = { name, email, profile, active };
  if (password) updateData.passwordHash = password; // In production, use bcrypt

  await user.update(updateData);

  if (queueIds) {
    await user.$set("queues", queueIds);
  }

  await user.reload({
    attributes: ["id", "name", "email", "profile", "active"],
    include: [
      { model: Queue, as: "queues", attributes: ["id", "name", "color"] },
    ],
  });

  return res.json(user);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { userId } = req.params;
  const user = await (User as any).findByPk(userId);

  if (!user) throw new AppError("User not found", 404);

  await user.destroy();
  return res.status(200).json({ message: "User deleted" });
};
