import { useAuth as useContextAuth } from '../contexts/AuthContext';

// Re-exporting the hook to match the requested component structure
// components/hooks/useAuth.ts -> contexts/AuthContext.tsx
export const useAuth = () => {
    return useContextAuth();
};
