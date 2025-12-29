import { Request, Response } from "express";
import Plan from "../models/Plan";
import AppError from "../errors/AppError";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const plans = await (Plan as any).findAll({ order: [["id", "ASC"]] });
  return res.json(plans);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const planData = req.body;
  const plan = await (Plan as any).create(planData);
  return res.status(200).json(plan);
};

export const update = async (req: any, res: Response): Promise<Response> => {
  const { id } = req.params;
  const planData = req.body;

  const plan = await (Plan as any).findByPk(id);
  if (!plan) {
    throw new AppError("Plan not found", 404);
  }

  await plan.update(planData);
  return res.json(plan);
};

export const remove = async (req: any, res: Response): Promise<Response> => {
  const { id } = req.params;
  const plan = await (Plan as any).findByPk(id);

  if (!plan) {
    throw new AppError("Plan not found", 404);
  }

  await plan.destroy();
  return res.status(200).json({ message: "Plan deleted" });
};