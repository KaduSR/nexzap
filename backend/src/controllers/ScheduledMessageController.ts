import { Response } from "express";
import ScheduledMessage from "../database/models/ScheduledMessage";
import Ticket from "../database/models/Ticket";

export const store = async (req: any, res: Response): Promise<Response> => {
  const { ticketId } = req.params;
  const { body, sendAt } = req.body;
  const { companyId } = req.user;

  const ticket = await (Ticket as any).findByPk(ticketId);
  if (!ticket) {
    return res.status(404).json({ error: "Ticket not found" });
  }

  const schedule = await (ScheduledMessage as any).create({
    body,
    sendAt,
    ticketId,
    contactId: ticket.contactId,
    companyId,
    status: "PENDING",
  });

  return res.json(schedule);
};

export const index = async (req: any, res: Response): Promise<Response> => {
  const { ticketId } = req.params;

  const schedules = await (ScheduledMessage as any).findAll({
    where: { ticketId, status: "PENDING" },
    order: [["sendAt", "ASC"]],
  });

  return res.json(schedules);
};

export const remove = async (req: any, res: Response): Promise<Response> => {
  const { scheduleId } = req.params;

  const schedule = await (ScheduledMessage as any).findByPk(scheduleId);
  if (schedule) {
    await (schedule as any).destroy();
  }

  return res.status(200).json({ message: "Schedule deleted" });
};
