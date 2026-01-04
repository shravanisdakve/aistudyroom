import axios from 'axios';
import { auth } from '../legacy/firebase';

// Helper to get User ID
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

const API_URL = 'http://localhost:5000/api/assignments';

export interface Assignment {
    _id: string;
    title: string;
    description: string;
    courseId: string;
    teacherId: string;
    dueAt: string;
    type: 'quiz' | 'homework' | 'project';
    points: number;
    status?: 'not_started' | 'pending' | 'submitted' | 'graded';
    submission?: any;
    submittedCount?: number;
    gradedCount?: number;
    totalStudents?: number;
}

export const createAssignment = async (data: any) => {
    const response = await axios.post(`${API_URL}/create`, data);
    return response.data;
};

export const getStudentAssignments = async (studentId?: string): Promise<Assignment[]> => {
    const id = studentId || getUserId();
    if (!id) return [];
    const response = await axios.get(`${API_URL}/student/${id}`);
    return response.data;
};

export const getTeacherAssignments = async (teacherId?: string): Promise<Assignment[]> => {
    const id = teacherId || getUserId();
    if (!id) return [];
    const response = await axios.get(`${API_URL}/teacher/${id}`);
    return response.data;
};

export const submitAssignment = async (data: any) => {
    const response = await axios.post(`${API_URL}/submit`, data);
    return response.data;
};

export const gradeAssignment = async (data: { submissionId: string, grade: number, feedback: string }) => {
    const response = await axios.post(`${API_URL}/grade`, data);
    return response.data;
};


export const getAssignment = async (id: string): Promise<Assignment | null> => {
    try {
        const response = await axios.get(`${API_URL}/${id}`);
        return response.data;
    } catch (e) {
        console.error("Error fetching assignment", e);
        return null;
    }
};
