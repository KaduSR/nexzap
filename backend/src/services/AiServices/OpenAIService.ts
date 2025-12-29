import OpenAI from "openai";

export const handleOpenAI = async (apiKey: string, prompt: string, history: string = "", systemPrompt: string = ""): Promise<string> => {
  const openai = new OpenAI({ apiKey });

  const completion = await openai.chat.completions.create({
    messages: [
      { role: "system", content: systemPrompt || "Você é um assistente virtual." },
      { role: "user", content: `${history}\nUser: ${prompt}` }
    ],
    model: "gpt-3.5-turbo",
  });

  return completion.choices[0]?.message?.content || "";
};