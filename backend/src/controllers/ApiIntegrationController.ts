export const index = async (req: any, res: any) => {
  return res.json({ message: "Listando integrações..." });
};

export const store = async (req: any, res: any) => {
  return res.json({ message: "Integração criada com sucesso." });
};

export const show = async (req: any, res: any) => {
  return res.json({ id: req.params.integrationId, name: "API Instance 01" });
};

export const getQrCode = async (req: any, res: any) => {
  return res.json({ qrcode: "data:image/png;base64,..." });
};

export const getConnectionStatus = async (req: any, res: any) => {
  return res.json({ status: "CONNECTED" });
};

export const update = async (req: any, res: any) => {
  return res.json({ message: "Integração atualizada." });
};

export const remove = async (req: any, res: any) => {
  return res.json({ message: "Integração removida." });
};

export const webhook = async (req: any, res: any) => {
  console.log("Webhook event received:", req.params.event);
  return res.status(200).send("OK");
};

export const webhookReceiveMessages = async (req: any, res: any) => {
  console.log("New message received via webhook");
  return res.status(200).send("OK");
};
