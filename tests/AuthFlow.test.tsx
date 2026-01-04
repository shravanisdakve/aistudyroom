import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, MemoryRouter, Routes, Route } from 'react-router-dom';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import { AuthContext } from '../contexts/AuthContext';

// Mock dependencies
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

describe('Authentication Flow Integration', () => {

    // Mock AuthContext values
    const mockLogin = vi.fn();
    const mockSignup = vi.fn();

    const renderWithAuth = (component: React.ReactNode, currentUser = null) => {
        return render(
            <AuthContext.Provider value={{
                currentUser,
                loading: false,
                login: mockLogin,
                signup: mockSignup,
                logout: vi.fn(),
                updateUserProfile: vi.fn()
            }}>
                <BrowserRouter>
                    {component}
                </BrowserRouter>
            </AuthContext.Provider>
        );
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders Signup form correctly with Student/Teacher toggle', () => {
        renderWithAuth(<Signup />);

        expect(screen.getByText('Create your Account')).toBeInTheDocument();
        expect(screen.getByText('Student')).toBeInTheDocument();
        expect(screen.getByText('Teacher')).toBeInTheDocument();
    });

    it('shows Primary Subject field only when Teacher is selected', async () => {
        renderWithAuth(<Signup />);

        // Initially should not be visible (default is Student)
        expect(screen.queryByPlaceholderText(/Computer Science/i)).not.toBeInTheDocument();

        // Click Teacher
        fireEvent.click(screen.getByText('Teacher'));

        // Now should be visible
        expect(await screen.findByPlaceholderText(/Computer Science/i)).toBeInTheDocument();
    });

    it('Teacher Login redirects to /teacher-dashboard', async () => {
        // Mock a logged-in teacher state
        const teacherUser = {
            uid: '123',
            email: 'teach@test.com',
            displayName: 'Prof Test',
            role: 'teacher'
        };

        renderWithAuth(<Login />, teacherUser as any);

        // Expect redirection to teacher dashboard
        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/teacher-dashboard');
        });
    });

    it('Student Login redirects to / (StudyHub)', async () => {
        // Mock a logged-in student state
        const studentUser = {
            uid: '456',
            email: 'student@test.com',
            displayName: 'Student Test',
            role: 'student'
        };

        renderWithAuth(<Login />, studentUser as any);

        // Expect redirection to main dashboard
        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/');
        });
    });

    it('submits Login form with email and password', async () => {
        renderWithAuth(<Login />);

        fireEvent.change(screen.getByPlaceholderText(/name@example.com/i), { target: { value: 'test@test.com' } });
        fireEvent.change(screen.getByPlaceholderText(/Enter your password/i), { target: { value: 'password123' } });

        fireEvent.click(screen.getByRole('button', { name: /Log in/i }));

        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalledWith('test@test.com', 'password123');
        });
    });
});
