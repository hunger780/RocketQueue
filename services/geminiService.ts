
import { GoogleGenAI, Type } from "@google/genai";

// Initialize the Gemini API client using the environment variable API_KEY directly.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function estimateWaitTime(
  queueLength: number,
  shopCategory: string,
  averageServiceTimeMinutes: number = 15
): Promise<number> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Estimate the realistic total wait time for the ${queueLength + 1}th person in a queue for a ${shopCategory} shop. 
                 Current queue length: ${queueLength}. 
                 Average service time per person: ${averageServiceTimeMinutes} minutes.
                 Return only a single integer representing the total minutes.`,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    const result = response.text?.trim() || "";
    const minutes = parseInt(result.replace(/\D/g, ""), 10);
    return isNaN(minutes) ? queueLength * averageServiceTimeMinutes : minutes;
  } catch (error) {
    console.error("Gemini estimation error:", error);
    return queueLength * averageServiceTimeMinutes;
  }
}

export async function searchShops(query: string, availableShops: any[]): Promise<string[]> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Based on the user query: "${query}", rank and return the IDs of the most relevant shops from this list: ${JSON.stringify(availableShops)}. 
                 Return as a simple JSON array of ID strings.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Gemini search error:", error);
    return availableShops.map(s => s.id);
  }
}
