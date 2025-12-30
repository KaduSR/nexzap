import { GoogleGenAI } from "@google/genai";
import Groq from "groq-sdk";
import OpenAI from "openai";
import Setting from "../../database/models/Setting";
import { logger } from "../../utils/logger";

interface Request {
  companyId?: number;
  prompt: string;
  history?: string;
  image?: string; // Base64 Image
}

const UnifiedAiService = async ({
  companyId,
  prompt,
  history,
  image,
}: Request): Promise<string | null> => {
  try {
    const settings = await (Setting as any).findAll({
      where: {
        key: [
          "ai_provider",
          "ai_api_key",
          "ai_enabled",
          "ai_system_prompt",
          "ai_model",
        ],
      },
    });

    const getSettingValue = (key: string, defaultValue: any = null) => {
      const setting = settings.find((s: any) => s.key === key);
      return setting ? setting.value : defaultValue;
    };

    // 1. Check if AI is globally enabled.
    const isEnabled = getSettingValue("ai_enabled", "false") === "true";
    if (!isEnabled) {
      logger.info(
        "Unified AI Service is disabled globally. Skipping response."
      );
      return null;
    }

    // 2. Determine provider and credentials.
    const provider = getSettingValue("ai_provider", "gemini");
    const systemPrompt = getSettingValue(
      "ai_system_prompt",
      "Você é um assistente virtual útil."
    );
    const model = getSettingValue("ai_model");
    let apiKey = getSettingValue("ai_api_key");

    // Special handling for Gemini: can use environment variable as a fallback.
    if (provider === "gemini") {
      apiKey = apiKey || process.env.API_KEY;
    }

    // 3. If no API key is available for the selected provider, exit.
    if (!apiKey) {
      logger.warn(
        `API Key for provider '${provider}' is not configured. AI will not respond.`
      );
      return null;
    }

    // Lógica para Visão Computacional (Recebimento de Imagens)
    if (image) {
      if (provider === "gemini") {
        const ai = new GoogleGenAI({ apiKey });
        const imgModel =
          model && model.includes("vision") ? model : "gemini-3-flash-preview";

        const response = await ai.models.generateContent({
          model: imgModel,
          contents: {
            parts: [
              { inlineData: { mimeType: "image/jpeg", data: image } },
              { text: prompt },
            ],
          },
        });
        return response.text || "Não consegui analisar a imagem.";
      }

      if (provider === "openai") {
        const openai = new OpenAI({ apiKey });
        const response = await openai.chat.completions.create({
          model: "gpt-4-turbo",
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: prompt },
                {
                  type: "image_url",
                  image_url: { url: `data:image/jpeg;base64,${image}` },
                },
              ],
            },
          ],
        });
        return response.choices[0].message.content || "";
      }
      return "Este provedor de IA não suporta análise de imagens no momento.";
    }

    // Lógica Padrão de Texto
    let responseText = "";

    switch (provider) {
      case "gemini":
        const ai = new GoogleGenAI({ apiKey });
        const geminiResp = await ai.models.generateContent({
          model: model || "gemini-3-flash-preview",
          contents: `${history}\nUser: ${prompt}`,
          config: { systemInstruction: systemPrompt },
        });
        responseText = geminiResp.text || "";
        break;

      case "openai":
        const openai = new OpenAI({ apiKey });
        const openAiResp = await openai.chat.completions.create({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `${history}\nUser: ${prompt}` },
          ],
          model: model || "gpt-3.5-turbo",
        });
        responseText = openAiResp.choices[0]?.message?.content || "";
        break;

      case "groq":
        const groq = new Groq({ apiKey });
        const groqResp = await groq.chat.completions.create({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `${history}\nUser: ${prompt}` },
          ],
          model: model || "llama3-70b-8192",
        });
        responseText = groqResp.choices[0]?.message?.content || "";
        break;

      default:
        logger.warn(`Unsupported AI provider: ${provider}`);
        return null;
    }

    return responseText;
  } catch (error) {
    logger.error(`Error in UnifiedAiService: ${error}`);
    if (
      error instanceof Error &&
      (error.message.includes("API key") ||
        error.message.includes("authentication"))
    ) {
      logger.error(
        "Authentication error with AI provider. Check if the API Key is valid."
      );
    }
    return null;
  }
};

export default UnifiedAiService;
