export interface AiConfig {
  companyId: number;
  provider: "openai" | "gemini" | "groq";
  apiKey: string;
  model?: string; // ex: gpt-3.5-turbo, gemini-3-flash-preview, llama3-70b
  prompt: string;
  history?: string; // Contexto da conversa anterior
}