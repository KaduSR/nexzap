
export const wbotMessageListener = (wbot: any) => {
  console.log(`[Listener] Ouvindo mensagens na sessão ${wbot.id}`);

  // Mock: wbot.ev.on('messages.upsert', async (message) => { ... })
  // Aqui entraria a lógica de processamento de filas e chatbot
};
