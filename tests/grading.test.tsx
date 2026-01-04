import { describe, it, expect, vi } from 'vitest';
import { gradeAssignment } from '../services/gradingService';

// Mock GoogleGenAI
const mockGradeResponse = {
    text: JSON.stringify({
        score: 8,
        maxScore: 10,
        feedback: "Good understanding of the core concepts.",
        strengths: ["Clear definitions", "Good examples"],
        improvements: ["Elaborate more on edge cases"],
        confidence: 0.95
    })
};

vi.mock('@google/genai', () => {
    return {
        GoogleGenAI: class {
            constructor() { }
            get models() {
                return {
                    generateContent: vi.fn().mockResolvedValue(mockGradeResponse)
                };
            }
        },
        Type: { OBJECT: 'OBJECT', STRING: 'STRING', ARRAY: 'ARRAY' }
    };
});

describe('GradingService', () => {
    it('should return a structured grade result', async () => {
        const rubric = "1 point for definition, 1 point for example";
        const result = await gradeAssignment(rubric, "College", "Define Recursion", "Recursion is...");

        expect(result).toBeDefined();
        expect(result.score).toBe(8);
        expect(result.strengths).toHaveLength(2);
        expect(result.confidence).toBeGreaterThan(0.9);
    });
});
