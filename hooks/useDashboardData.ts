import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { getUserProgress } from '../services/progressService';
import { getUserMastery } from '../services/masteryService';
import { aiEngine } from '../services/ai/aiEngine';
import { getSuggestionForMood } from '../services/ai/geminiService';

export const useDashboardData = () => {
    const { currentUser } = useAuth();
    const [progress, setProgress] = useState<any>(null);
    const [mastery, setMastery] = useState<any[]>([]);
    const [aiGoals, setAiGoals] = useState<string[]>([]);
    const [moodSuggestion, setMoodSuggestion] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUser) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                // Parallel fetching for performance
                const [userProgress, userMastery, dailyGoals] = await Promise.all([
                    getUserProgress(currentUser.uid),
                    getUserMastery(currentUser.uid),
                    aiEngine.getDailyGoals() // This internally might fetch mastery/progress again if not cached, but for now it's okay.
                ]);

                setProgress(userProgress);
                setMastery(userMastery);
                setAiGoals(dailyGoals);

            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [currentUser]);

    const handleMoodUpdate = async (mood: string) => {
        const suggestion = await getSuggestionForMood(mood);
        setMoodSuggestion(suggestion);
    };

    return {
        progress,
        mastery,
        aiGoals,
        moodSuggestion,
        loading,
        handleMoodUpdate
    };
};
