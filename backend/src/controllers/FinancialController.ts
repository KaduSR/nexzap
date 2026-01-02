// cspell: disable
import { endOfDay, startOfDay, subDays } from "date-fns";
import { Response } from "express";
import { Op } from "sequelize";
import { Invoice } from "../database/models/Invoice.model";

export const index = async (req: any, res: Response): Promise<Response> => {
  const { companyId } = req.user;

  try {
    const today = new Date();
    const startToday = startOfDay(today);
    const endToday = endOfDay(today);

    const todayRevenueSum = await Invoice.sum("value", {
      where: {
        companyId,
        status: "paid",
        paidAt: { [Op.between]: [startToday, endToday] },
      },
    });

    const totalOverdueSum = await Invoice.sum("value", {
      where: {
        companyId,
        status: "overdue",
      },
    });

    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(today, i);
      const start = startOfDay(date);
      const end = endOfDay(date);

      const val = await Invoice.sum("value", {
        where: {
          companyId,
          status: "paid",
          paidAt: { [Op.between]: [start, end] },
        },
      });

      chartData.push({
        date: date.toISOString().split("T")[0],
        value: val || 0,
        name: date.toLocaleDateString("pt_BR", {
          day: "2-digit",
          month: "2-digit",
        }),
      });
    }

    return res.json({
      todayRevenue: todayRevenueSum || 0,
      totalRevenue: totalOverdueSum || 0,
      chartData,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error ao buscar dados financeiros" });
  }
};
