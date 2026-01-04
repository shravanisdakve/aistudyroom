import { GoogleGenAI, Chat } from '@google/genai';
import { streamChat, generateQuizQuestion, getStudySuggestions, generateFlashcards, getSuggestionForMood } from './geminiService'; // Import underlying primitives
import { getUserMastery, Mastery } from './masteryService';
import { getNotes } from './notesService';
import { getUserProgress } from './progressService';

// The AI Brain that knows YOU.
export class AIEngine {
    private userId: string;
    private userName: string;

    constructor(userId: string, userName: string) {
        this.userId = userId;
        this.userName = userName;
    }

    /**
     * Builds a comprehensive text context about the user.
     * Includes: Mastery scores, Recent Progress, and specific weak topics.
     */
    async buildUserContext(): Promise<string> {
        const [mastery, progress] = await Promise.all([
            getUserMastery(this.userId),
            getUserProgress(this.userId)
        ]);

        const weakTopics = mastery.filter(m => m.score < 60).map(m => m.topic).join(', ');
        const strongTopics = mastery.filter(m => m.score >= 80).map(m => m.topic).join(', ');

        return `
User Profile:
- Name: ${this.userName}
- Level: ${progress.level} (XP: ${progress.xp})
- Weak Areas: ${weakTopics || "None identified yet"}
- Strong Areas: ${strongTopics || "None identified yet"}
- Learning Style: Visual & Interactive (Inferred)
`;
    }

    /**
     * Starts a chat session with the AI Tutor, pre-prompted with user context.
     */
    async startTutorSession(topic: string) {
        const context = await this.buildUserContext();
        const systemPrompt = `
${context}
---
The user wants to study "${topic}".
You are an expert AI Tutor. Adjust your explanation complexity based on the user's level (Level ${context.includes('Level: 1') ? 'Beginner' : 'Intermediate'}).
If the topic is in their 'Weak Areas', be extra patient and provide concrete examples.
If they are strong in it, challenge them with deeper questions.
`;

        // We use the existing streamChat but ideally we'd pass system instructions dynamically. 
        // For now, we prepend the context to the first invisible message or system config.
        // Since streamChat in geminiService creates a singleton, we might need to modify geminiService to accept config.
        // For this Prototype, we returns a contextual preamble string to send first.
        return systemPrompt;
    }

    /**
     * Generates a daily micro-plan based on weaknesses and progress.
     */
    async getDailyGoals(): Promise<string[]> {
        const context = await this.buildUserContext();
        const prompt = `Based on this user profile: ${context}
        Generate 3 specific, actionable short-term study goals for today. 
        Return ONLY a JSON array of strings.`;

        // This would call a generic generateContent method. 
        // We can reuse getStudySuggestions or add a generic method to geminiService.
        // For now, mocking logic slightly or we need to expose a generic 'askAI' from geminiService.
        return ["Review 'State Management' (Weakness)", "Complete 1 Quiz on React", "Read 5 mins of Documentation"];
    }

    /**
     * Real empathetic mood intervention.
     */
    async getMoodSupport(mood: string): Promise<string> {
        // Calls the REAL geminiService function (which we will update next)
        return getSuggestionForMood(mood);
    }
}

export const aiEngine = new AIEngine('demo', 'Student'); // Singleton for demo
