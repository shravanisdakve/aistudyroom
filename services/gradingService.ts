import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

export interface GradeResult {
    score: number;
    maxScore: number;
    feedback: string;
    strengths: string[];
    improvements: string[];
    confidence: number; // 0-1
}

export const gradeAssignment = async (
    rubric: string,
    studentType: string, // e.g. "High School"
    assignmentContext: string, // Question text
    studentAnswer: string
): Promise<GradeResult> => {

    const prompt = `You are an expert AI Grader. 
    Task: Grade the following student submission based STRICTLY on the provided rubric.
    
    Context:
    - Student Level: ${studentType}
    - Assignment: ${assignmentContext}
    - Rubric: ${rubric}
    
    Student Submission:
    "${studentAnswer}"
    
    Return ONLY a JSON object with this structure:
    {
      "score": number, // The numerical score
      "maxScore": number, // The total possible score from the rubric
      "feedback": "string", // Constructive, encouraging feedback (2-3 sentences)
      "strengths": ["string", "string"], // 2 key strengths
      "improvements": ["string", "string"], // 2 specific areas to improve
      "confidence": number // 0.0 to 1.0 (How well did the answer match the rubric criteria?)
    }`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            }
        });

        const text = response.text;
        if (!text) throw new Error("No response from AI");

        return JSON.parse(text) as GradeResult;
    } catch (error) {
        console.error("Error grading assignment:", error);
        throw new Error("Failed to auto-grade assignment");
    }
};
