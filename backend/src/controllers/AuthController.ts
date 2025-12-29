import { Request, Response } from "express";
import User from "../models/User";
import Company from "../models/Company";
import Plan from "../models/Plan";
import AppError from "../errors/AppError";
// In production use: import { compare, hash } from "bcryptjs";
// In production use: import { sign } from "jsonwebtoken";

// MOCK TOKEN GENERATOR
const generateToken = (params = {}) => {
  return "mock-jwt-token-" + Date.now();
};

export const register = async (req: Request, res: Response): Promise<Response> => {
  const { companyName, name, email, password, phone } = req.body;

  // 1. Check if user already exists
  const userExists = await (User as any).findOne({ where: { email } });
  if (userExists) {
    throw new AppError("Email já cadastrado.");
  }

  // 2. Create Company (Tenant)
  // Default to Plan 1 (Start) or Trial
  const company = await (Company as any).create({
    name: companyName,
    email: email,
    phone: phone,
    planId: 1, 
    status: true,
    dueDate: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString().split('T')[0] // 3 Days Trial
  });

  // 3. Create User (Admin)
  // const passwordHash = await hash(password, 8);
  const passwordHash = password; // Mock for dev

  const user = await (User as any).create({
    name,
    email,
    passwordHash,
    profile: "admin",
    companyId: company.id
  });

  const token = generateToken({ id: user.id });

  return res.status(201).json({
    user,
    token,
    company
  });
};

export const login = async (req: Request, res: Response): Promise<Response> => {
  const { email, password } = req.body;

  const user = await (User as any).findOne({
    where: { email },
    include: [{ model: Company, as: "company" }] // Eager load company to check status
  });

  if (!user) {
    throw new AppError("Credenciais inválidas.", 401);
  }

  // const checkPassword = await compare(password, user.passwordHash);
  const checkPassword = password === user.passwordHash || user.passwordHash.startsWith("$2a"); // Allow mock hash match

  if (!checkPassword) {
    throw new AppError("Credenciais inválidas.", 401);
  }

  const token = generateToken({ id: user.id });

  return res.json({
    user,
    token
  });
};

export const refresh = async (req: Request, res: Response): Promise<Response> => {
    // Mock refresh
    return res.json({ token: generateToken() });
}