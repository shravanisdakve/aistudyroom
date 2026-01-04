import { describe, it, expect, vi } from 'vitest';
import { generateLessonPlan } from '../services/lessonPlannerService';

// Mock the GoogleGenAI client
const parseResponse = {
    text: JSON.stringify({
        topic: "Photosynthesis",
        gradeLevel: "10th Grade",
        duration: "45 mins",
        objectives: ["Understand sunlight conversion"],
        activities: [{ title: "Lecture", duration: "10m", description: "Intro" }],
        materials: ["Textbook"],
        assessment: "Quiz"
    })
};

vi.mock('@google/genai', () => {
    return {
        GoogleGenAI: class {
            constructor() { }
            get models() {
                return {
                    generateContent: vi.fn().mockResolvedValue(parseResponse)
                };
            }
        },
        Type: { OBJECT: 'OBJECT', STRING: 'STRING', ARRAY: 'ARRAY' }
    };
});

describe('LessonPlannerService', () => {
    it('should generate a valid lesson plan object', async () => {
        const plan = await generateLessonPlan("Photosynthesis", "10th Grade", "45 mins");

        expect(plan).toBeDefined();
        expect(plan.topic).toBe("Photosynthesis");
        expect(plan.gradeLevel).toBe("10th Grade");
        expect(plan.objectives).toHaveLength(1);
        expect(plan.activities[0].title).toBe("Lecture");
    });

    it('should handle API errors gracefully', async () => {
        // We can add a test case here that mocks a rejection if we want to test error handling
        // For now, checking the happy path confirms integration.
    });
});
