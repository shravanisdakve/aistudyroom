import { useState, useCallback } from 'react';
import { streamChat } from '../services/ai/geminiService';
import { aiEngine } from '../services/ai/aiEngine';
import { ChatMessage } from '../types';

export const useAIChat = (initialContext?: string) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const sendMessage = useCallback(async (text: string) => {
        if (!text.trim()) return;

        const newMessage: ChatMessage = { role: 'user', parts: [{ text }] };
        setMessages(prev => [...prev, newMessage]);
        setLoading(true);
        setError(null);

        try {
            // Check if it's the first message and we have context (handled inside aiEngine usually, but here for flexibility)
            // For simple chat:
            const stream = await streamChat(text);

            let fullResponse = '';
            let isFirstChunk = true;

            for await (const chunk of stream) {
                const chunkText = chunk.text();
                fullResponse += chunkText;

                if (isFirstChunk) {
                    setMessages(prev => [...prev, { role: 'model', parts: [{ text: fullResponse }] }]);
                    isFirstChunk = false;
                } else {
                    setMessages(prev => {
                        const lastMsg = prev[prev.length - 1];
                        if (lastMsg.role === 'model') {
                            return [
                                ...prev.slice(0, -1),
                                { ...lastMsg, parts: [{ text: fullResponse }] }
                            ];
                        }
                        return prev;
                    });
                }
            }

        } catch (err) {
            console.error("AI Chat Error:", err);
            setError("Failed to get response from AI.");
            setMessages(prev => [...prev, { role: 'model', parts: [{ text: "Sorry, I encountered an error." }] }]);
        } finally {
            setLoading(false);
        }
    }, [initialContext]);

    const clearChat = () => setMessages([]);

    return {
        messages,
        loading,
        error,
        sendMessage,
        clearChat,
        setMessages // Exporting setMessages for manual control
    };
};
