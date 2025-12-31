import { compare, hash } from "bcryptjs";
import { Request, Response } from "express";
import { sign } from "jsonwebtoken";
// Certifique-se de que os imports estão usando Named Exports com { }
import { Company } from "../database/models/Company.model";
import { User } from "../database/models/User.model";
import AppError from "../errors/AppError";

// Configuração do JWT
const authConfig = {
  secret: process.env.JWT_SECRET || "default_secret_nexzap",
  expiresIn: "7d",
};

export const register = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyName, name, email, password, phone } = req.body;

  const userExists = await User.findOne({ where: { email } });
  if (userExists) {
    throw new AppError("Email já cadastrado.");
  }

  const company = await Company.create({
    name: companyName,
    email: email,
    phone: phone,
    planId: 1,
    status: true,
    dueDate: new Date(new Date().setDate(new Date().getDate() + 3)),
  });

  const passwordHash = await hash(password, 8);

  const user = await User.create({
    name,
    email,
    passwordHash,
    profile: "admin",
    companyId: company.id,
    active: true,
  });

  const token = sign(
    { id: user.id, companyId: company.id },
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

  // 👇 CORREÇÃO AQUI: Removido 'as: "company"'
  // O sequelize-typescript mapeia automaticamente para a propriedade 'company' do User
  const user = await User.findOne({
    where: { email },
    include: [Company],
  });

  if (!user) {
    throw new AppError("Credenciais inválidas.", 401);
  }

  const checkPassword = await compare(password, user.passwordHash);

  if (!checkPassword) {
    throw new AppError("Credenciais inválidas.", 401);
  }

  const token = sign(
    { id: user.id, companyId: user.companyId },
    authConfig.secret,
    {
      expiresIn: authConfig.expiresIn,
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
  return res.json({ message: "Refresh not implemented yet" });
};
