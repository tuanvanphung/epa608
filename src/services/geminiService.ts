import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function explainHvacConcept(concept: string, questionText?: string) {
  try {
    const prompt = `You are a professional instructor for the EPA 608 Certification. 
    A student is struggling with this concept: "${concept}".
    ${questionText ? `The context is this exam question: "${questionText}"` : ""}
    Provide a comprehensive, easy-to-understand explanation that clearly explains the "why" behind the correct answer, helping them remember it for the official test. 
    Use a professional yet encouraging tone. Use markdown for better formatting.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return response.text || "I was able to process the request but didn't get a clear explanation back. Please try again.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I'm having trouble connecting to my AI tutor brain right now. Please try again in a moment!";
  }
}
