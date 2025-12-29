import { Op, fn, col, literal } from "sequelize";
import Invoice from "../../models/Invoice";

interface FinancialData {
  todayRevenue: number;
  totalOverdue: number;
  totalClients: number;
  chartData: { date: string; value: number }[];
}

const GetFinancialDataService = async (companyId: number): Promise<FinancialData> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 1. Receita de Hoje (Faturas com status 'paid' e data de pagamento = hoje)
  const todayRevenueResult = await (Invoice as any).sum("value", {
    where: {
      companyId,
      status: "paid",
      paidAt: { [Op.gte]: today }
    }
  });

  // 2. Total em Atraso (Vencidas)
  const totalOverdueResult = await (Invoice as any).sum("value", {
    where: {
      companyId,
      status: "overdue"
    }
  });

  // 3. Gráfico de Receita (Últimos 7 dias)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  // Note: SQLite and Postgres behave differently with date functions. 
  // This approach is generic for sequelize but specific implementation might vary.
  // Assuming SQLite for this project setup.
  const chartDataResult = await (Invoice as any).findAll({
    attributes: [
      [fn("date", col("paidAt")), "date"],
      [fn("sum", col("value")), "value"]
    ],
    where: {
      companyId,
      status: "paid",
      paidAt: { [Op.gte]: sevenDaysAgo }
    },
    group: [fn("date", col("paidAt"))],
    order: [[fn("date", col("paidAt")), "ASC"]],
    raw: true
  });

  // Formatar dados para o gráfico
  const chartData = chartDataResult.map((item: any) => ({
    date: item.date, // Formato YYYY-MM-DD
    value: parseFloat(item.value)
  }));

  // Ensure all 7 days are present even if 0
  const filledChartData = [];
  for(let i=6; i>=0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const existing = chartData.find((c: any) => c.date === dateStr);
      filledChartData.push({
          date: dateStr,
          value: existing ? existing.value : 0
      });
  }

  return {
    todayRevenue: todayRevenueResult || 0,
    totalOverdue: totalOverdueResult || 0,
    totalClients: 0, 
    chartData: filledChartData
  };
};

export default GetFinancialDataService;