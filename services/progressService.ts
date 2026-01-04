import axios from 'axios';

export interface Challenge {
    id: string;
    title: string;
    completed: boolean;
}

export interface UserProgress {
    userId: string;
    level: number;
    xp: number;
    streak: number;
    challenges: Challenge[];
    // ... any other fields
}

const API_URL = 'http://localhost:5000/api/progress';

const DEFAULT_PROGRESS: UserProgress = {
    userId: '',
    level: 1,
    xp: 0,
    streak: 0,
    challenges: []
};

// --- API Functions ---

export const getUserProgress = async (userId: string): Promise<UserProgress> => {
    try {
        const response = await axios.get(`${API_URL}/${userId}`);
        return response.data || DEFAULT_PROGRESS;
    } catch (error) {
        console.error("Error fetching progress:", error);
        return DEFAULT_PROGRESS;
    }
};

export const updateUserXP = async (userId: string, xpDelta: number): Promise<UserProgress> => {
    try {
        // First get current to calc new level
        const current = await getUserProgress(userId);
        let newXp = current.xp + xpDelta;
        let newLevel = current.level;

        // Simple level up logic: Level up every 100 XP
        if (newXp >= 100) {
            newLevel += Math.floor(newXp / 100);
            newXp = newXp % 100;
        }

        const response = await axios.post(`${API_URL}/update`, {
            userId,
            xp: newXp,
            level: newLevel
        });
        return response.data;
    } catch (error) {
        console.error("Error updating XP:", error);
        return DEFAULT_PROGRESS;
    }
};

export const completeChallenge = async (userId: string, challengeId: string): Promise<void> => {
    // Ideally add backend endpoint for this. For now just updating XP is fine.
    // If specific challenge tracking is needed, we'd update the POST /update route to handle challenges array.
    console.log("Completing challenge via API (placeholder)", challengeId);
};
