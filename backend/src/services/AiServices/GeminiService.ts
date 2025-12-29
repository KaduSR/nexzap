import { GoogleGenAI } from "@google/genai";

export const handleGemini = async (ignoredApiKey: string, prompt: string, history: string = "", systemPrompt: string = ""): Promise<string> => {
  // Inicializa o cliente utilizando a variável de ambiente, ignorando o argumento passado se houver
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Utiliza o modelo gemini-3-flash-preview para tarefas de texto gerais
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `${history}\nUser: ${prompt}`,
    config: {
        systemInstruction: systemPrompt,
    },
  });

  return response.text || "";
};