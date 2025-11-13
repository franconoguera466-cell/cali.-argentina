import { GoogleGenAI, Type } from "@google/genai";
import { DetectedFood } from "../types";

// Cliente de Gemini
const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_API_KEY as string,
});

const model = "gemini-2.5-flash";

// Esquema de nutrición
const nutritionSchema = {
  type: Type.OBJECT,
  properties: {
    calories: {
      type: Type.NUMBER,
      description: "Estimated calories for the portion.",
    },
    protein: {
      type: Type.NUMBER,
      description: "Estimated grams of protein.",
    },
    carbs: {
      type: Type.NUMBER,
      description: "Estimated grams of carbohydrates.",
    },
    fat: {
      type: Type.NUMBER,
      description: "Estimated grams of fat.",
    },
  },
  required: ["calories", "protein", "carbs", "fat"],
};

// Esquema de detección de comida
const foodDetectionSchema = {
  type: Type.OBJECT,
  properties: {
    error: {
      type: Type.STRING,
      description: "An error message if the food is not recognized.",
    },
    name: {
      type: Type.STRING,
      description: "The name of the detected Argentine dish.",
    },
    portionSize: {
      type: Type.STRING,
      description: 'A typical serving size, e.g., "1 unit" or "100g".',
    },
    nutrition: nutritionSchema,
  },
};

// 👉 ÚNICA versión de estimateNutritionFromImage
export const estimateNutritionFromImage = async (
  base64Image: string
): Promise<DetectedFood> => {
  const prompt = `You are a nutritional expert specializing in Argentine cuisine. Analyze the attached image. Your task is to identify if the primary food item is one of the following common Argentine dishes: Empanada, Milanesa, Asado, Choripán, Alfajor, Provoleta, or Tortilla de papa.
If it is one of these dishes, provide your best estimation for its nutritional values for a standard single serving.
If the food is not one of these, or if you cannot identify it clearly, your response should indicate an error.`;

  const result = await ai.models.generate({
    model,
    input: [
      {
        role: "user",
        type: "input_image",
        mimeType: "image/jpeg",
        data: base64Image,
      },
      { role: "user", text: prompt },
    ],
    responseSchema: foodDetectionSchema,
  });

  // El SDK ya castea al esquema que definimos
  return result.output[0] as DetectedFood;
};

// Tip diario
export const getDailyTip = async (): Promise<string> => {
  const prompt =
    "Generate a single, concise, and encouraging nutritional tip for the day, relevant to Argentine culture. Keep it under 25 words. For example: 'Enjoy a glass of Malbec, but in moderation!' or 'A walk after asado aids digestion.'";

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Gemini tip generation error:", error);
    return "Stay hydrated by drinking plenty of water throughout the day!";
  }
};
