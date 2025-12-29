import { Request, Response } from "express";
import ServiceItem from "../models/ServiceItem";

export const index = async (req: any, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  
  let items = await (ServiceItem as any).findAll({
    where: { companyId },
    order: [["name", "ASC"]]
  });

  // Seed default items if empty (For demo/first run)
  if (items.length === 0) {
      const defaults = [
          { name: "Mudança de Endereço (Com Cabo)", price: 150.00, description: "Reinstalação completa com passagem de novo cabeamento." },
          { name: "Mudança de Endereço (Sem Cabo)", price: 80.00, description: "Reinstalação aproveitando cabeamento existente no local." },
          { name: "Mudança de Ponto (Mesmo Endereço)", price: 60.00, description: "Alteração do cômodo onde fica o roteador." },
          { name: "Troca de Conector", price: 15.00, description: "Substituição de conector danificado (RJ45/APC)." },
          { name: "Visita Técnica Improdutiva", price: 40.00, description: "Técnico foi ao local mas cliente não estava." },
          { name: "Configuração de Roteador Particular", price: 30.00, description: "Configuração de equipamento que não pertence ao provedor." },
          { name: "Cabo de Rede (Metro)", price: 2.50, description: "Venda de cabo UTP CAT5e por metro." }
      ];

      for(const d of defaults) {
          await (ServiceItem as any).create({ ...d, companyId });
      }
      
      items = await (ServiceItem as any).findAll({ where: { companyId } });
  }

  return res.json(items);
};

export const store = async (req: any, res: Response): Promise<Response> => {
  const { name, price, description } = req.body;
  const { companyId } = req.user;

  const item = await (ServiceItem as any).create({
    name,
    price,
    description,
    companyId
  });

  return res.status(200).json(item);
};

export const update = async (req: any, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { name, price, description } = req.body;

  const item = await (ServiceItem as any).findByPk(id);
  if (!item) return res.status(404).json({ error: "Not found" });

  await item.update({ name, price, description });
  return res.json(item);
};

export const remove = async (req: any, res: Response): Promise<Response> => {
  const { id } = req.params;
  const item = await (ServiceItem as any).findByPk(id);
  if (item) await item.destroy();
  return res.status(200).json({ message: "Deleted" });
};