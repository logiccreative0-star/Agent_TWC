import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface Message {
  role: "user" | "model";
  content: string;
}

export async function chatWithUrl(url: string, history: Message[], query: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        ...history.map(m => ({
          role: m.role,
          parts: [{ text: m.content }]
        })),
        {
          role: "user",
          parts: [{ text: `Based on the information from ${url}, please answer: ${query}` }]
        }
      ],
      config: {
        systemInstruction: `You are a helpful customer support agent. 
        Your knowledge is strictly limited to the content of the provided URL. 
        If the answer is not in the URL, politely state that you don't have that information and offer to help with something else related to the site.
        Use a professional, friendly, and concise tone.`,
        tools: [{ urlContext: {} }]
      }
    });

    return response.text || "I'm sorry, I couldn't process that request.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "An error occurred while trying to fetch information. Please check the URL and try again.";
  }
}
