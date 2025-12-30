import Contact from "../../database/models/Contact.model";
import Message from "../../database/models/Message.model";
import UnifiedAiService from "./UnifiedAiService";

interface AnalysisResult {
  summary: string;
  sentiment: "positive" | "neutral" | "negative";
  sentimentScore: number;
  suggestion: string;
}

const AnalyzeTicketService = async (
  ticketId: number,
  companyId: number
): Promise<AnalysisResult> => {
  // 1. Fetch recent messages for context
  const messages = await (Message as any).findAll({
    where: { ticketId },
    order: [["createdAt", "DESC"]],
    limit: 20,
    include: [{ model: Contact, as: "contact" }],
  });

  if (!messages || messages.length === 0) {
    throw new Error("Não há mensagens suficientes para analisar.");
  }

  // Organize text chronologically
  const history = messages
    .reverse()
    .map((m: any) => `${m.fromMe ? "Atendente" : "Cliente"}: ${m.body}`)
    .join("\n");

  // 2. Construct Prompt
  const prompt = `
    Analise a seguinte conversa de suporte técnico:
    
    "${history}"

    Responda APENAS um JSON válido (sem markdown, sem blocos de código) com este formato exato:
    {
      "summary": "Resumo curto do problema e estado atual em até 2 frases.",
      "sentiment": "positive" | "neutral" | "negative",
      "sentimentScore": 0 a 100 (onde 0 é muito negativo/irritado e 100 é muito positivo/feliz),
      "suggestion": "Uma sugestão de resposta curta, empática e profissional para o atendente enviar agora."
    }
  `;

  try {
    const aiResponseText = await UnifiedAiService({
      companyId,
      prompt,
      history: "Você é um analista sênior de atendimento ao cliente.",
    });

    if (!aiResponseText) {
      throw new Error("Sem resposta da IA.");
    }

    // Clean markdown if present
    const jsonString = aiResponseText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const result: AnalysisResult = JSON.parse(jsonString);
    return result;
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return {
      summary: "Não foi possível analisar a conversa no momento.",
      sentiment: "neutral",
      sentimentScore: 50,
      suggestion: "Olá, como posso ajudar?",
    };
  }
};

export default AnalyzeTicketService;
