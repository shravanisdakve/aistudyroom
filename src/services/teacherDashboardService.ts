import axios from 'axios';
import { TeacherDashboardData } from '../types';

const API_URL = 'http://localhost:5000/api/dashboard';

export const getTeacherDashboard = async (userId: string): Promise<TeacherDashboardData | null> => {
    try {
        const response = await axios.get(`${API_URL}/teacher/${userId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching teacher dashboard:", error);
        return null;
    }
};
