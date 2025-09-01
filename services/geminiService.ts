
import { GoogleGenAI } from "@google/genai";
import { SYSTEM_PROMPT } from '../constants';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // This is a check for the development environment.
  // In a real deployed environment, the key should be set.
  console.warn("API_KEY environment variable not set. Using a placeholder. The app will not function correctly without a valid API key.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY || 'MISSING_API_KEY' });

export const analyzeVehicle = async (sellerDescription: string, motHistory: string): Promise<string> => {
  if (!API_KEY || API_KEY === 'MISSING_API_KEY') {
    throw new Error("API key is not configured. Please set the API_KEY environment variable.");
  }
  
  const userPrompt = `
  Here is the information for the vehicle I am considering. Please analyze it according to my instructions.

  ---
  
  **SELLER'S DESCRIPTION:**
  ${sellerDescription}
  
  ---
  
  **VEHICLE'S MOT HISTORY:**
  ${motHistory}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.2,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        if (error.message.includes('API key not valid')) {
            return "Error: The provided API key is not valid. Please check your configuration.";
        }
        return `An unexpected error occurred while contacting the AI. Details: ${error.message}`;
    }
    return "An unknown error occurred while analyzing the vehicle.";
  }
};
