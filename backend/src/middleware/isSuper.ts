import { NextFunction, Response } from "express";
import User from "../models/User";

const isSuper = async (
  req: any,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { id } = req.user;

    const user = await User.findByPk(id);

    if (!user || !user.super) {
      return res.status(403).json({
        error: "Acesso Negado. Esta ação requer privilégios de Super Admin.",
      });
    }

    return next();
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: "Erro interno ao verificar permissões." });
  }
};

export default isSuper;
