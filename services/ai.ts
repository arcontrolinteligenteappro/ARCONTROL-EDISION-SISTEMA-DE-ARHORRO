import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';

// Initialize client only if key exists to prevent immediate crashes in dev if missing
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const getCyberFinancialAdvice = async (currentTotal: number, goal: number, userQuery: string) => {
  if (!ai) {
    return "ERROR: API_KEY_MISSING. Connect to secure node.";
  }

  try {
    const model = 'gemini-3-flash-preview';
    const percent = Math.round((currentTotal / goal) * 100);
    const formatter = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });
    
    const systemInstruction = `
      You are an elite AI Cybersecurity Financial Assistant named 'NetSaver v9'.
      You are running inside the app 'AR CONTROL AHORRO EDITIONS'.
      You speak in a mix of technical hacker jargon (cyberpunk, matrix, computer terminals) and financial wisdom.
      Keep responses short, punchy, and helpful.
      The user is saving money using a 1-250 grid method in Mexican Pesos (MXN).
      Current progress: ${percent}%.
      Total Saved: ${formatter.format(currentTotal)}.
      Goal: ${formatter.format(goal)}.
      
      Always end with a short system status line like "Encryption: SECURE" or "Saving protocols: ACTIVE".
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: userQuery,
      config: {
        systemInstruction: systemInstruction,
        maxOutputTokens: 200,
      }
    });

    return response.text || "NO_DATA_RECEIVED";
  } catch (error) {
    console.error("AI Error:", error);
    return "SYSTEM_FAILURE: Connection intercepted. Try again later.";
  }
};