import { Response } from "express";
import Incident from "../database/models/Incident.model";
import Tag from "../database/models/Tag.model";

export const index = async (req: any, res: Response): Promise<Response> => {
  const incidents = await (Incident as any).findAll({
    include: [{ model: Tag, as: "tag" }],
    order: [
      ["isActive", "DESC"],
      ["createdAt", "DESC"],
    ],
  });
  return res.json(incidents);
};

export const store = async (req: any, res: Response): Promise<Response> => {
  const { title, description, tagId } = req.body;
  const { companyId } = req.user;

  const incident = await (Incident as any).create({
    title,
    description,
    tagId,
    companyId,
    isActive: true,
  });

  return res.status(200).json(incident);
};

export const update = async (req: any, res: Response): Promise<Response> => {
  const { id } = req.params;
  const data = req.body;

  const incident = await (Incident as any).findByPk(id);
  if (!incident) {
    return res.status(404).json({ error: "Incident not found" });
  }

  await incident.update(data);
  return res.json(incident);
};

export const listTags = async (req: any, res: Response): Promise<Response> => {
  const tags = await (Tag as any).findAll();
  return res.json(tags);
};
