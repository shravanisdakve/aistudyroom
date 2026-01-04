export interface Mastery {
    userId: string;
    topic: string; // e.g., "Calculus - Derivatives"
    score: number; // 0 to 100
    confidence: number; // 0 to 1 (how sure the AI is of this score)
    lastUpdated: number;
}

import axios from 'axios';
import { type Mastery } from '../types';

const API_URL = 'http://localhost:5000/api/mastery';

export const getUserMastery = async (userId: string): Promise<Mastery[]> => {
    try {
        const response = await axios.get(`${API_URL}/${userId}`);
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
