import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

// For fast, simple text tasks
const flashModel = 'gemini-2.5-flash';
// For complex reasoning tasks
const proModel = 'gemini-2.5-pro';

export async function generateText(prompt: string): Promise<string> {
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: flashModel,
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating text:", error);
    return "An error occurred while processing your request.";
  }
}

export async function extractFactsFromDocument(documentContent: string, caseContext: string): Promise<string> {
  try {
    const prompt = `
      You are an expert legal paralegal AI for a self-represented litigant in the FCFCOA.
      Your task is to analyze a new document in the context of an existing case.
      
      **Existing Case Context:**
      ---
      ${caseContext}
      ---

      **New Document Content:**
      ---
      ${documentContent}
      ---

      **Instructions:**
      1.  Read the new document and identify the most critical and relevant facts it contains.
      2.  Focus on extracting atomic, individual pieces of information (e.g., specific dates, findings, names, allegations, key events, quotes).
      3.  Do NOT provide a narrative summary. Instead, output a list of distinct factual statements.
      4.  Ensure the facts are directly supported by the document's text.
      5.  Analyze this within the framework of the Australian Family Law Act 1975, paying close attention to sections relevant to the best interests of the child (s 60CC).

      Return your response as a valid JSON array of strings. Each string in the array should be a single, concise fact.
      Example: ["Dr. Smith's report is dated January 5, 2025.", "The report diagnoses the mother with Stimulant Use Disorder.", "The children's school attendance is noted as being below 60%."]
      
      Do not include any text outside of the JSON array.
    `;
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: proModel,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        thinkingConfig: { thinkingBudget: 32768 }
      },
    });
    return response.text;
  } catch (error) {
    console.error("Error extracting facts:", error);
    return JSON.stringify({ error: "An error occurred while extracting facts from the document." });
  }
}

export async function generatePrioritization(prompt: string): Promise<string> {
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: proModel,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  priority: { type: Type.NUMBER },
                  task: { type: Type.STRING },
                  rationale: { type: Type.STRING },
                },
                required: ["priority", "task", "rationale"],
              },
            },
            thinkingConfig: { thinkingBudget: 32768 }
        },
    });
    return response.text;
  } catch (error) {
    console.error("Error generating prioritization:", error);
    return JSON.stringify({ error: "An error occurred while processing your request." });
  }
}

export async function generateStrategicPathways(prompt: string): Promise<string> {
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: proModel,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              steps: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    step: { type: Type.NUMBER },
                    action: { type: Type.STRING },
                    description: { type: Type.STRING },
                  },
                  required: ["step", "action", "description"],
                },
              },
              evidenceNeeded: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              risks: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: ["title", "description", "steps", "evidenceNeeded", "risks"],
          },
        },
        thinkingConfig: { thinkingBudget: 32768 }
      },
    });
    return response.text;
  } catch (error)
  {
    console.error("Error generating strategic pathways:", error);
    return JSON.stringify({ error: "An error occurred while processing your request." });
  }
}


export async function analyzeImage(base64Image: string, mimeType: string, prompt: string): Promise<string> {
  try {
    const imagePart = {
      inlineData: {
        mimeType: mimeType,
        data: base64Image,
      },
    };
    const textPart = { text: prompt };

    const response: GenerateContentResponse = await ai.models.generateContent({
        model: flashModel,
        contents: { parts: [imagePart, textPart] }
    });

    return response.text;
  } catch (error) {
    console.error("Error analyzing image:", error);
    return "An error occurred while analyzing the image.";
  }
}