// cspell:disable
import { Response } from "express";
import { getIO } from "../libs/socket";

import CreateTicketService from "../services/TicketServices/CreateTicketService";
import DeleteTicketService from "../services/TicketServices/DeleteTicketService";
import ListTicketsServiceKanban from "../services/TicketServices/ListTicketsServiceKanban"; // Verifique se este arquivo existe
import ShowTicketService from "../services/TicketServices/ShowTicketService";
import UpdateTicketService from "../services/TicketServices/UpdateTicketService";

type IndexQuery = {
  searchParam?: string;
  pageNumber?: string;
  status?: string;
  date?: string;
  showAll?: string;
  withUnreadMessages?: string;
  queueIds?: string;
  tags?: string;
  users?: string;
};

interface TicketData {
  contactId: number;
  status: string;
  queueId?: number;
  userId?: number;
}

// Usamos req: any para garantir acesso fácil a req.user e req.query
export const indexKanban = async (
  req: any,
  res: Response
): Promise<Response> => {
  const {
    pageNumber,
    status,
    date,
    searchParam,
    showAll,
    queueIds,
    tags,
    users,
  } = req.query as IndexQuery;

  const { companyId, profile, id: userId } = req.user;

  // Lógica para filtrar apenas tickets do usuário se não for admin/showAll
  // const onlyMyTickets = profile === "user" ? "true" : showAll === "true" ? "false" : "true";

  const { tickets, count, hasMore } = await ListTicketsServiceKanban({
    searchParam,
    tags,
    users,
    pageNumber,
    status,
    date,
    showAll,
    queueIds,
    companyId,
    profile, // Passamos perfil e userId para o serviço filtrar se necessário
    userId,
  });

  return res.status(200).json({ tickets, count, hasMore });
};

export const store = async (req: any, res: Response): Promise<Response> => {
  const { contactId, status, userId, queueId }: TicketData = req.body;
  const { companyId } = req.user;

  const ticket = await CreateTicketService({
    contactId,
    status,
    userId,
    queueId,
    companyId,
  });

  const io = getIO();
  io.to(ticket.status).emit(`company-${companyId}-ticket`, {
    action: "update",
    ticket,
  });

  return res.status(200).json(ticket);
};

export const show = async (req: any, res: Response): Promise<Response> => {
  const { ticketId } = req.params;
  const { companyId } = req.user;

  const ticket = await ShowTicketService(ticketId, companyId);

  return res.status(200).json(ticket);
};

export const update = async (req: any, res: Response): Promise<Response> => {
  const { ticketId } = req.params;
  const ticketData: TicketData = req.body;
  const { companyId } = req.user;

  const { ticket } = await UpdateTicketService({
    ticketData,
    ticketId,
    companyId,
  });

  // Emitir evento Socket para atualizar o Kanban de todos em tempo real
  const io = getIO();
  io.to(ticket.status).emit(`company-${companyId}-ticket`, {
    action: "update",
    ticket,
  });

  return res.status(200).json(ticket);
};

export const remove = async (req: any, res: Response): Promise<Response> => {
  const { ticketId } = req.params;
  const { companyId } = req.user;

  const ticket = await DeleteTicketService(ticketId, companyId);

  const io = getIO();
  io.to(ticket.status).emit(`company-${companyId}-ticket`, {
    action: "delete",
    ticketId: +ticketId,
  });

  return res.status(200).json({ message: "Ticket deleted" });
};
