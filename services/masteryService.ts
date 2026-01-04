

import { type TopicMastery } from '../types';
import axios from 'axios';
import { auth } from '../firebase';

const API_URL = 'http://localhost:5000/api/mastery';

// Helper to get User ID (Real Auth > Local Storage > null)
const getUserId = () => {
    try {
        if (typeof auth !== 'undefined' && auth?.currentUser?.uid) return auth.currentUser.uid;
    } catch (e) { console.warn("Auth not initialized", e); }

    const localUser = localStorage.getItem('user');
    if (localUser) {
        try { return JSON.parse(localUser).uid; } catch (e) { return null; }
    }
    return null;
}

export const getUserMastery = async (userId: string): Promise<TopicMastery[]> => {
    const effectiveUserId = userId || getUserId();
    if (!effectiveUserId) return [];

    try {
        const response = await axios.get(`${API_URL}/${effectiveUserId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching mastery:", error);
        return [];
    }
};

export const updateMastery = async (userId: string, topic: string, scoreDelta: number): Promise<void> => {
    try {
        await axios.post(`${API_URL}/update`, { userId, topic, scoreDelta });
    } catch (error) {
        console.error("Error updating mastery:", error);
    }
};
