import * as Yup from "yup";
import { Request, Response } from "express";
import { getIO } from "../libs/socket";

import ListQueuesService from "../services/QueueService/ListQueuesService";
import CreateQueueService from "../services/QueueService/CreateQueueService";
import UpdateQueueService from "../services/QueueService/UpdateQueueService";
import DeleteQueueService from "../services/QueueService/DeleteQueueService";
import ShowQueueService from "../services/QueueService/ShowQueueService";
import AppError from "../errors/AppError";

type IndexQuery = {
  pageNumber?: string;
  searchParam?: string;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { pageNumber, searchParam } = req.query as IndexQuery;
  const { companyId } = req.user;

  const { queues, count, hasMore } = await ListQueuesService({
    companyId,
    searchParam,
    pageNumber,
  });

  return res.json({ queues, count, hasMore });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { name, color, greetingMessage, userIds } = req.body;
  const { companyId } = req.user;

  const queueSchema = Yup.object().shape({
    name: Yup.string()
      .min(2, "ERR_QUEUE_INVALID_NAME")
      .required("ERR_QUEUE_NAME_REQUIRED"),
    color: Yup.string()
      .required("ERR_QUEUE_COLOR_REQUIRED")
      .test("Check-color", "ERR_QUEUE_INVALID_COLOR", (value) => {
        if (value) {
          return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value);
        }
        return false;
      }),
  });

  try {
    await queueSchema.validate({ name, color });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  const queue = await CreateQueueService({
    name,
    color,
    greetingMessage,
    companyId,
    userIds,
  });

  const io = getIO();
  io.emit(`company-${companyId}-queue`, {
    action: "update",
    queue,
  });

  return res.status(200).json(queue);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { queueId } = req.params;
  const { companyId } = req.user;

  const queue = await ShowQueueService(queueId, companyId);

  return res.status(200).json(queue);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { queueId } = req.params;
  const { companyId } = req.user;
  const { name, color, greetingMessage, userIds } = req.body;

  const queueSchema = Yup.object().shape({
    name: Yup.string()
      .min(2, "ERR_QUEUE_INVALID_NAME")
      .required("ERR_QUEUE_NAME_REQUIRED"),
    color: Yup.string()
      .required("ERR_QUEUE_COLOR_REQUIRED")
      .test("Check-color", "ERR_QUEUE_INVALID_COLOR", (value) => {
        if (value) {
          return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value);
        }
        return false;
      }),
  });

  try {
    await queueSchema.validate({ name, color });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  const queue = await UpdateQueueService(
    queueId,
    {
      name,
      color,
      greetingMessage,
      userIds,
    },
    companyId
  );

  const io = getIO();
  io.emit(`company-${companyId}-queue`, {
    action: "update",
    queue,
  });

  return res.status(201).json(queue);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { queueId } = req.params;
  const { companyId } = req.user;

  await DeleteQueueService(queueId, companyId);

  const io = getIO();
  io.emit(`company-${companyId}-queue`, {
    action: "delete",
    queueId: +queueId,
  });

  return res.status(200).json({ message: "Queue deleted" });
};
