import axios from 'axios';

const API_URL = 'http://localhost:5000/api/dashboard';

import { StudentDashboardData } from '../types';

export type { StudentDashboardData };

export const getStudentDashboard = async (userId: string): Promise<StudentDashboardData | null> => {
    try {
        const response = await axios.get(`${API_URL}/student/${userId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching student dashboard:", error);
        return null;
    }
};


