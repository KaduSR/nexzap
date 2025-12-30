import FlowCampaign from "../database/models/FlowCampaign.model";

export const index = async (req: any, res: any) => {
  try {
    const flows = await (FlowCampaign as any).findAll();
    return res.json(flows);
  } catch (err) {
    return res.status(500).json({ error: "Erro ao listar fluxos." });
  }
};

export const save = async (req: any, res: any) => {
  const { name, phrase, flow } = req.body;

  try {
    // Para simplificar, vamos assumir um fluxo único por enquanto (ID 1)
    // Em produção, isso criaria novos IDs ou atualizaria baseado no param
    let flowCampaign = await (FlowCampaign as any).findByPk(1);

    if (flowCampaign) {
      await flowCampaign.update({ name, phrase, flow });
    } else {
      flowCampaign = await (FlowCampaign as any).create({
        id: 1,
        name,
        phrase,
        flow,
      });
    }

    return res.json({
      message: "Fluxo salvo com sucesso!",
      flow: flowCampaign,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao salvar fluxo." });
  }
};

export const getFlow = async (req: any, res: any) => {
  try {
    // Pega o fluxo padrão ID 1
    let flowCampaign = await (FlowCampaign as any).findByPk(1);

    if (!flowCampaign) {
      // Fallback: create default if missing
      flowCampaign = await (FlowCampaign as any).create({
        id: 1,
        name: "Fluxo Principal",
        phrase: "ola",
        active: true,
        flow: {
          nodes: [
            {
              id: "node_1",
              type: "trigger",
              label: "Início do Fluxo",
              data: { trigger: "Qualquer Mensagem" },
              position: { x: 400, y: 50 },
            },
          ],
        },
      });
    }

    return res.json(flowCampaign);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao buscar fluxo." });
  }
};
