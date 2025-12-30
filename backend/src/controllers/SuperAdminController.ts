import { Request, Response } from "express";
import Company from "../database/models/Company.model";
import Plan from "../database/models/Plan.model";
import User from "../database/models/User.model";
import AppError from "../errors/AppError";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const companies = await (Company as any).findAll({
    include: [{ model: Plan, as: "plan" }],
    order: [["name", "ASC"]],
  });
  return res.json(companies);
};

export const listPlans = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const plans = await (Plan as any).findAll();
  return res.json(plans);
};

export const store = async (req: any, res: Response): Promise<Response> => {
  const {
    name,
    email,
    phone,
    document,
    address,
    city,
    state,
    zipcode,
    password,
    planId,
    dueDate,
  } = req.body;

  // 1. Validar se email já existe
  const companyExists = await (Company as any).findOne({ where: { email } });
  if (companyExists) {
    throw new AppError("Empresa com este email já existe.");
  }

  // 2. Criar Empresa
  const company = await (Company as any).create({
    name,
    email,
    phone,
    document,
    address,
    city,
    state,
    zipcode,
    planId,
    status: true,
    dueDate: dueDate || new Date().toISOString().split("T")[0], // Default hoje se não informado
  });

  // 3. Criar Usuário Admin da Empresa
  await (User as any).create({
    name: "Admin",
    email: email,
    passwordHash: password, // In production use bcrypt
    profile: "admin",
    companyId: company.id,
    active: true,
  });

  return res.status(201).json(company);
};

export const updateCompany = async (
  req: any,
  res: Response
): Promise<Response> => {
  const { id } = req.params;
  const {
    planId,
    status,
    dueDate,
    name,
    document,
    phone,
    address,
    city,
    state,
    zipcode,
  } = req.body;

  const company = await (Company as any).findByPk(id);

  if (!company) {
    return res.status(404).json({ error: "Company not found" });
  }

  await company.update({
    planId,
    status,
    dueDate,
    name,
    document,
    phone,
    address,
    city,
    state,
    zipcode,
  });

  await company.reload({ include: [{ model: Plan, as: "plan" }] });

  return res.json(company);
};

export const currentCompany = async (
  req: any,
  res: Response
): Promise<Response> => {
  // In production this comes from req.user.companyId
  const companyId = 1;

  const company = await (Company as any).findByPk(companyId, {
    include: [{ model: Plan, as: "plan" }],
  });

  return res.json(company);
};
