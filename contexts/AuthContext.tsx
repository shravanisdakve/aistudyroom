import React, {
  useContext,
  useState,
  useEffect,
  createContext,
  ReactNode,
} from "react";

/* ===================== TYPES ===================== */

interface User {
  uid: string;
  displayName: string | null;
  email: string | null;
  university?: string;
  role?: 'student' | 'teacher';
  primarySubject?: string;
}

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signup: (
    displayName: string,
    email: string,
    university: string,
    password: string,
    role: 'student' | 'teacher',
    primarySubject?: string
  ) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (updates: Partial<User>) => Promise<void>;
}

/* ===================== CONTEXT ===================== */

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

/* ===================== PROVIDER ===================== */

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const API_URL = "http://localhost:5000/api/auth";

  /* ===== Auto login after page refresh ===== */
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (token && user) {
      setCurrentUser(JSON.parse(user));
    }
    setLoading(false);
  }, []);

  /* ===================== SIGNUP ===================== */
  const signup = async (
    displayName: string,
    email: string,
    university: string,
    password: string,
    role: 'student' | 'teacher',
    primarySubject?: string
  ) => {
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName,
          email,
          university,
          password,
          role,
          primarySubject,
        }),
      });

      if (!res.ok) {
        throw new Error("Signup failed");
      }

      const data = await res.json();

      // Auto-login logic
      const user: User = {
        uid: data.user.id || data.user._id || "user-id",
        displayName: data.user.displayName || null,
        email: data.user.email,
        university: data.user.university,
        role: data.user.role || 'student',
        primarySubject: data.user.primarySubject,
      };

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(user));

      setCurrentUser(user);

    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /* ===================== LOGIN ===================== */
  const login = async (email: string, password: string) => {
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        throw new Error("Login failed");
      }

      const data = await res.json();

      const user: User = {
        uid: data.user.id || data.user._id || "user-id",
        displayName: data.user.displayName || null,
        email: data.user.email,
        university: data.user.university,
        role: data.user.role || 'student',
        primarySubject: data.user.primarySubject,
      };

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(user));

      setCurrentUser(user);
    } catch (error) {
      console.error("Login Error", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /* ===================== LOGOUT ===================== */
  const logout = async () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setCurrentUser(null);
  };

  /* ===================== UPDATE PROFILE ===================== */
  const updateUserProfile = async (updates: Partial<User>) => {
    if (!currentUser) return;

    const updatedUser = { ...currentUser, ...updates };
    setCurrentUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  /* ===================== VALUE ===================== */
  const value: AuthContextType = {
    currentUser,
    loading,
    signup,
    login,
    logout,
    updateUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};