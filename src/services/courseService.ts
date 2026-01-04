import axios from 'axios';
import { auth } from '../legacy/firebase';
import { type Course } from '../types';
export type { Course };

const API_URL = 'http://localhost:5000/api/courses';
const getUserId = () => {
    try {
        if (typeof auth !== 'undefined' && auth?.currentUser?.uid) return auth.currentUser.uid;
    } catch (e) { console.warn("Auth not initialized", e); }

    // Fallback for demo/dev mode without real Firebase Auth
    const localUser = localStorage.getItem('user');
    if (localUser) {
        try { return JSON.parse(localUser).uid; } catch (e) { return null; }
    }
    return null;
}

export const getCourses = async (): Promise<Course[]> => {
    try {
        const userId = getUserId();
        if (!userId) return [];

        const response = await axios.get(API_URL, { params: { userId } });
        // Map _id to id for frontend compatibility
        return response.data.map((c: any) => ({ ...c, id: c._id }));
    } catch (error) {
        console.error("Error fetching courses:", error);
        return [];
    }
};

export const addCourse = async (name: string): Promise<Course | null> => {
    try {
        const userId = getUserId();
        if (!userId) throw new Error("User not authenticated");

        const response = await axios.post(API_URL, { userId, name });
        const newCourse = response.data;
        return { ...newCourse, id: newCourse._id };
    } catch (error) {
        console.error("Error adding course:", error);
        return null;
    }
};

export const deleteCourse = async (id: string): Promise<void> => {
    try {
        await axios.delete(`${API_URL}/${id}`);
    } catch (error) {
        console.error("Error deleting course:", error);
    }
};

export const getCourse = async (id: string): Promise<Course | null> => {
    // This might be tricky if we don't need a specific endpoint, 
    // but usually getCourses() caches it or we add a get-one endpoint.
    // For now, let's just fetch all and find (or add endpoint later).
    const courses = await getCourses();
    return courses.find(c => c.id === id) || null;
};

// ========== ENROLLMENT FUNCTIONS ==========

export interface AvailableCourse {
    id: string;
    name: string;
    code: string;
    description: string;
    level: string;
    duration: string;
    teacherId: string;
    studentsCount: number;
}

export interface EnrolledCourse {
    id: string;
    name: string;
    code: string;
    description: string;
    level: string;
    duration: string;
    teacherId: string;
    color: string;
}

export const getAvailableCourses = async (): Promise<AvailableCourse[]> => {
    try {
        const response = await axios.get(`${API_URL}/available`);
        return response.data;
    } catch (error) {
        console.error("Error fetching available courses:", error);
        return [];
    }
};

export const joinCourseByCode = async (code: string): Promise<{ success: boolean; message: string; course?: any }> => {
    try {
        const userId = getUserId();
        if (!userId) return { success: false, message: 'Please log in first' };

        const response = await axios.post(`${API_URL}/join`, { code, studentId: userId });
        return { success: true, message: response.data.message, course: response.data.course };
    } catch (error: any) {
        const msg = error.response?.data?.error || 'Failed to join course';
        return { success: false, message: msg };
    }
};

export const getEnrolledCourses = async (studentId?: string): Promise<EnrolledCourse[]> => {
    try {
        const id = studentId || getUserId();
        if (!id) return [];

        const response = await axios.get(`${API_URL}/enrolled/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching enrolled courses:", error);
        return [];
    }
};
