
import { GoogleGenAI, Chat, GenerateContentResponse, Type } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

// --- AI TUTOR SERVICE ---
let chat: Chat | null = null;

const getChatInstance = (): Chat => {
    if (!chat) {
        chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: 'You are an expert AI Tutor. Your goal is to help users understand complex topics by providing clear explanations, step-by-step examples, and asking probing questions to test their knowledge. Be patient, encouraging, and adapt your teaching style to the user\'s needs.',
            },
        });
    }
    return chat;
}

export const streamChat = (message: string) => {
    const chatInstance = getChatInstance();
    return chatInstance.sendMessageStream({ message });
};


// --- STUDY BUDDY (NOTES-BASED) SERVICE ---
let studyBuddyChat: Chat | null = null;
let currentNotesContext = '';

export const streamStudyBuddyChat = (message: string, notes: string) => {
    // If the chat doesn't exist or the notes have changed, create a new instance.
    if (!studyBuddyChat || currentNotesContext !== notes) {
        currentNotesContext = notes;
        const systemInstruction = `You are an expert AI Study Buddy. The user has provided the following notes to study from:
---
${notes || 'No notes provided yet.'}
---
Your knowledge is strictly limited to the text provided above. You CANNOT use any external information. When responding to the user:
1. First, determine if the user's question can be answered using ONLY the provided notes.
2. If the answer is in the notes, provide a comprehensive answer based exclusively on that text.
3. If the answer is NOT in the notes, you MUST begin your response with the exact phrase: "Based on the provided notes, I can't find information on that topic." After this phrase, you may optionally and briefly mention what the notes DO cover. Do not try to answer the original question.`;

        studyBuddyChat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction,
            },
        });
    }

    return studyBuddyChat.sendMessageStream({ message });
};


// --- CONCEPT VISUALIZER SERVICE ---
export const generateImage = async (prompt: string, aspectRatio: string) => {
    const fullPrompt = `A clear, educational diagram or mind map illustrating the following concept. Use minimal text, focusing on visual representation. Concept: "${prompt}"`;
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: fullPrompt,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/jpeg',
            aspectRatio: aspectRatio,
        },
    });

    const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
    return `data:image/jpeg;base64,${base64ImageBytes}`;
};

// --- NOTE SUMMARIZATION SERVICE ---
export const summarizeText = async (text: string): Promise<string> => {
    const prompt = `Summarize the following academic text or notes. Focus on extracting the key concepts, definitions, and main arguments. Present the summary in a clear, structured format, using bullet points or numbered lists where appropriate. Text: "${text}"`;
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    return response.text;
};

// --- AUDIO SUMMARIZATION SERVICE ---
export const summarizeAudioFromBase64 = async (base64Data: string, mimeType: string): Promise<string> => {
    const audioPart = {
        inlineData: {
            data: base64Data,
            mimeType: mimeType,
        },
    };
    const textPart = {
        text: "First, transcribe the provided audio accurately. Second, based on the transcription, provide a concise summary of the key points and topics discussed. Use bullet points for the summary."
    };

    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [textPart, audioPart] },
    });
    return response.text;
};

// --- CODE HELPER SERVICE ---
export const generateCode = async (prompt: string, language: string): Promise<string> => {
    const fullPrompt = `You are an expert programming assistant. The user is asking for help with a coding task in ${language}. Provide a clear and accurate response. If generating code, wrap it in a single markdown code block (\`\`\`${language.toLowerCase()}\\n...\`\`\`). Task: "${prompt}"`;
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: fullPrompt,
    });
    return response.text;
};

// --- TEXT EXTRACTION FROM FILE SERVICE ---
export const extractTextFromFile = async (base64Data: string, mimeType: string): Promise<string> => {
    const filePart = {
        inlineData: {
            data: base64Data,
            mimeType: mimeType,
        },
    };
    const textPart = {
        text: "Extract all text content from the provided document. Present it as clean, unformatted text. If the document is a presentation, extract text from all slides."
    };

    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [textPart, filePart] },
    });
    return response.text;
};

// --- QUIZ GENERATION SERVICE ---
export const generateQuizQuestion = async (context: string): Promise<string> => {
    const prompt = `Based on the following context, generate a single multiple-choice quiz question to test understanding. The question should focus on a key concept from the text. Context: "${context.substring(0, 4000)}"`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    topic: { type: Type.STRING, description: "A brief, one or two-word topic for the question (e.g., 'Photosynthesis', 'Calculus')." },
                    question: { type: Type.STRING },
                    options: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                    },
                    correctOptionIndex: { type: Type.INTEGER }
                },
                required: ["topic", "question", "options", "correctOptionIndex"]
            }
        }
    });

    return response.text;
};

// --- AI STUDY SUGGESTIONS SERVICE ---
export const getStudySuggestions = async (reportJson: string): Promise<string> => {
    const prompt = `You are an expert academic advisor. Based on the following JSON data of a student's weekly performance, provide 2-3 concise, actionable suggestions to help them improve. Focus on their weaknesses, time management, or quiz performance. Frame your advice in a positive and encouraging tone.\n\nStudent Performance Data:\n${reportJson}\n\nYour Suggestions:`;

    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    return response.text;
};

// --- FLASHCARD GENERATION SERVICE ---
// --- FLASHCARD GENERATION SERVICE ---
export const generateFlashcards = async (context: string): Promise<string> => {
    const prompt = `Based on the following context, generate a list of flashcards. Each flashcard should have a 'front' (a question or term) and a 'back' (the answer or definition). Context: "${context.substring(0, 4000)}"`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        front: { type: Type.STRING },
                        back: { type: Type.STRING }
                    },
                    required: ["front", "back"]
                }
            }
        }
    });

    return response.text;
};

/**
 * Gets a smart suggestion based on the user's reported mood.
 */
export const getSuggestionForMood = async (mood: string): Promise<string> => {
    console.log(`Getting AI suggestion for mood: ${mood}`);

    const prompt = `A user in my learning app just reported their mood as '${mood}'.
Provide one, short (1-2 sentences) and encouraging, actionable suggestion.
- If mood is 'Happy' or 'Calm', suggest a good study task.
- If mood is 'Overwhelmed', suggest a way to get clarity.
- If mood is 'Sad' or 'Angry', suggest a constructive way to manage the feeling.

Example for 'Angry': 'Feeling frustrated? Try taking a short 5-minute walk to clear your head before diving back in.'
Example for 'Overwhelmed': 'Not sure what to do next? Try breaking down your main goal into smaller steps or ask the AI chat for ideas.'
Example for 'Happy': 'Great! Now is a perfect time to tackle that challenging topic you've been putting off.'`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text;

    } catch (error) {
        console.error("Error in getSuggestionForMood:", error);
        return "I'm here for you. Let's take a deep breath and focus on one small thing.";
    }
};

// --- GOAL BREAKDOWN SERVICE ---
export const breakDownGoal = async (goalTitle: string): Promise<string> => {
    const prompt = `A user has set the following academic goal: "${goalTitle}".
    Break this high-level goal down into a short list of 3-5 small, actionable sub-tasks.
    Return ONLY a JSON array of strings.
    Example for "Learn React": ["Understand JSX syntax", "Learn about components and props", "Practice state management with useState", "Build a simple to-do app"]`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
            }
        }
    });

    return response.text;
};

// --- SYLLABUS GENERATION SERVICE ---
export const generateSyllabus = async (topic: string, level: string, duration: string): Promise<string> => {
    const prompt = `Create a detailed course syllabus for a course on "${topic}".
    Target Audience: ${level}
    Duration: ${duration}
    
    Return the response as a JSON object with the following structure:
    {
        "description": "A brief overview of the course (2-3 sentences).",
        "syllabus": [
            {
                "week": 1,
                "topic": "Introduction...",
                "content": "Detailed breakdown of subtopics..."
            },
            ...
        ]
    }`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    description: { type: Type.STRING },
                    syllabus: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                week: { type: Type.INTEGER },
                                topic: { type: Type.STRING },
                                content: { type: Type.STRING }
                            },
                            required: ["week", "topic", "content"]
                        }
                    }
                },
                required: ["description", "syllabus"]
            }
        }
    });

    return response.text;
};

// --- DASHBOARD INSIGHTS SERVICE ---
export const getDashboardInsights = async (stats: { streak: number, mastery: number, tasksCount: number, recentTaskTitle?: string }): Promise<{ title: string, message: string }> => {
    const prompt = `
    Analyze the following student stats and provide a short, motivating insight (Max 2 sentences).
    Stats:
    - Daily Streak: ${stats.streak} days
    - Average Mastery: ${stats.mastery}%
    - Pending Tasks: ${stats.tasksCount}
    - Recent Task: ${stats.recentTaskTitle || 'None'}

    Output a JSON object with "title" (short punchy header) and "message" (coach-like advice).
    Example: { "title": "On Fire!", "message": "You've hit a 5-day streak. Keep pushing on Calculus to improve that mastery score." }
    `;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: 'application/json' }
        });

        return JSON.parse(response.text);
    } catch (error) {
        console.error("AI Insight Error:", error);
        return {
            title: "Keep Learning",
            message: "Consistency is key. Tackle your pending tasks to boost your mastery!"
        };
    }
};

// --- TEACHER AI SERVICE ---
export const generateFeedbackDraft = async (assignmentTitle: string, studentIssue: string): Promise<string> => {
    const prompt = `Draft a supportive but firm message to a student who scored low on the assignment "${assignmentTitle}". The specific issue is: "${studentIssue}". 
    The message should encourage them to review the material and offer help. Keep it under 50 words.`;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });
        return response.text;
    } catch (e) { return "Please review your recent assignment and come see me if you have questions."; }
};

export const summarizeClassPerformance = async (assignmentTitle: string, averageScore: number, lowScorersCount: number): Promise<string> => {
    const prompt = `Summarize the class performance for "${assignmentTitle}". Average score: ${averageScore}%. Students below passing: ${lowScorersCount}. 
    Provide 3 bullet points on what the teacher should focus on next (e.g., review session, harder questions, etc).`;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });
        return response.text;
    } catch (e) { return "Performance summary unavailable."; }
};
