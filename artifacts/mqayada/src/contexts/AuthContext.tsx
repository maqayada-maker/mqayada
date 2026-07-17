import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type UserRole = "client" | "advisor" | "admin" | "supervisor";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  advisorId: number | null;
  company?: string;
  emailVerified?: boolean;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (data: RegisterData) => Promise<{ pending?: boolean; message?: string; emailVerificationSent?: boolean }>;
  logout: () => void;
}

interface RegisterData {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role: "client" | "advisor";
  company?: string;
  employeeId?: string;
  appointmentDate?: string;
  inviteToken?: string;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = "mqayada_token";
const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

class ApiError extends Error {
  rejected?: boolean;
  rejectedAt?: string | null;
  pending?: boolean;
  constructor(data: { error?: string; rejected?: boolean; rejectedAt?: string | null; pending?: boolean }) {
    super(data.error ?? "حدث خطأ");
    this.rejected = data.rejected;
    this.rejectedAt = data.rejectedAt;
    this.pending = data.pending;
  }
}

export { ApiError };

async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new ApiError(data);
  return data;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (!stored) { setIsLoading(false); return; }
    apiFetch("/api/auth/me", { headers: { Authorization: `Bearer ${stored}` } })
      .then((u) => { setUser(u); setToken(stored); })
      .catch(() => { localStorage.removeItem(TOKEN_KEY); setToken(null); })
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (email: string, password: string): Promise<AuthUser> => {
    const data = await apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user as AuthUser;
  };

  const register = async (registerData: RegisterData) => {
    const data = await apiFetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(registerData),
    });
    if (data.pending) {
      return { pending: true, message: data.message };
    }
    localStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
    setUser(data.user);
    if (data.emailVerificationSent) {
      return { emailVerificationSent: true };
    }
    return {};
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
