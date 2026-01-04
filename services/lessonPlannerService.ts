import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

export interface LessonPlan {
    topic: string;
    gradeLevel: string;
    duration: string;
    objectives: string[];
    activities: { title: string; duration: string; description: string }[];
    materials: string[];
    assessment: string;
}

export const generateLessonPlan = async (topic: string, gradeLevel: string, duration: string): Promise<LessonPlan> => {
    const prompt = `Create a detailed lesson plan for a ${duration} class on "${topic}" for ${gradeLevel} students.
    Return ONLY a JSON object with the following structure:
    {
      "topic": "${topic}",
      "gradeLevel": "${gradeLevel}",
      "duration": "${duration}",
      "objectives": ["string", "string"],
      "activities": [{"title": "string", "duration": "string", "description": "string"}],
      "materials": ["string"],
      "assessment": "string"
    }`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                // schema: ... (Optional types/schema validation for strictness)
            }
        });

        const text = response.text;
        if (!text) throw new Error("No response from AI");

        return JSON.parse(text) as LessonPlan;
    } catch (error) {
        console.error("Error generating lesson plan:", error);
        throw new Error("Failed to generate lesson plan");
    }
};
