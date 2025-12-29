import Groq from "groq-sdk";

export const handleGroq = async (apiKey: string, prompt: string, history: string = "", systemPrompt: string = ""): Promise<string> => {
  const groq = new Groq({ apiKey });

  const completion = await groq.chat.completions.create({
    messages: [
      { role: "system", content: systemPrompt || "Você é um assistente útil e prestativo." },
      { role: "user", content: `${history}\nUser: ${prompt}` }
    ],
    model: "llama3-70b-8192", // Modelo rápido e eficiente
  });

  return completion.choices[0]?.message?.content || "";
};