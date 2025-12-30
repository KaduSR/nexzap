import { Request, Response } from "express";
import User from "../models/User";
import Company from "../models/Company";
import AppError from "../errors/AppError";
import { compare, hash } from "bcryptjs";
import { sign } from "jsonwebtoken";
import { Sign } from "crypto";

// Configuração do JWT (Idealmente via .env)
const authConfig = {
  secret: process.env.JWT_SECRET || "default_secret_nexzap",
  expiresIn: "7d" as string,
};

export const register = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyName, name, email, password, phone } = req.body;

  // 1. Check if user already exists
  const userExists = await (User as any).findOne({ where: { email } });
  if (userExists) {
    throw new AppError("Email já cadastrado.");
  }

  // 2. Create Company (Tenant)
  const company = await (Company as any).create({
    name: companyName,
    email: email,
    phone: phone,
    planId: 1,
    status: true,
    dueDate: new Date(new Date().setDate(new Date().getDate() + 3))
      .toISOString()
      .split("T")[0], // 3 Days Trial
  });

  // 3. Create User (Admin)
  const passwordHash = await hash(password, 8);

  const user = await (User as any).create({
    name,
    email,
    passwordHash,
    profile: "admin",
    companyId: company.id,
    active: true,
  });

  const token = sign(
    { id: user.id, companyId: company.id } as object,
    authConfig.secret,
    { expiresIn: authConfig.expiresIn } as any
  );

  return res.status(201).json({
    user,
    token,
    company,
  });
};

export const login = async (req: Request, res: Response): Promise<Response> => {
  const { email, password } = req.body;

  const user = await (User as any).findOne({
    where: { email },
    include: [{ model: Company, as: "company" }],
  });

  if (!user) {
    throw new AppError("Credenciais inválidas.", 401);
  }

  const checkPassword = await compare(password, user.passwordHash);

  if (!checkPassword) {
    throw new AppError("Credenciais inválidas.", 401);
  }

  const token = sign(
    { id: user.id, companyId: user.companyId } as object,
    authConfig.secret,
    {
      expiresIn: String(authConfig.expiresIn),
    } as any
  );

  return res.json({
    user,
    token,
  });
};

export const refresh = async (
  req: Request,
  res: Response
): Promise<Response> => {
  // Implement refresh token logic if needed
  return res.json({ message: "Refresh not implemented yet" });
};
