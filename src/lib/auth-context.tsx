"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

// Role is now a string to support dynamic custom roles
export type Role = string;

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  projectId?: string;
  mobile?: string;
}

interface AuthContextType {
  user: User | null;
  login: (role: Role, userData?: Partial<User>) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Default demo users for built-in roles
const DEMO_USERS: Record<string, User> = {
  director:        { id: "1", name: "Dir. John Wick",      email: "director@archisite.pro", role: "director" },
  architect:       { id: "2", name: "Arch. Sarah Connor",  email: "architect@archisite.pro", role: "architect" },
  "office-team":   { id: "3", name: "Office Admin",        email: "office@archisite.pro",   role: "office-team" },
  "site-engineer": { id: "4", name: "Engr. Mike Ross",     email: "engineer@archisite.pro", role: "site-engineer" },
  supervisor:      { id: "5", name: "Site Supervisor",     email: "supervisor@archisite.pro", role: "supervisor" },
  accountant:      { id: "6", name: "Fin. Manager",        email: "accountant@archisite.pro", role: "accountant" },
  client:          { id: "7", name: "Premium Client",      email: "client@archisite.pro",   role: "client", projectId: "1" },
  guest:           { id: "8", name: "Guest User",          email: "guest@archisite.pro",    role: "guest" },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    try {
      const saved = localStorage.getItem("auth_user");
      if (saved) {
        const parsedUser = JSON.parse(saved);
        // Ensure role is a string
        if (parsedUser && typeof parsedUser.role === 'object' && parsedUser.role !== null) {
          parsedUser.role = parsedUser.role.roleName || 'guest';
        }
        setUser(parsedUser);
      }
    } catch {
      localStorage.removeItem("auth_user");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (role: Role, userData?: Partial<User>) => {
    const base = DEMO_USERS[role] ?? {
      id: "custom_" + Date.now(),
      name: userData?.name ?? role,
      email: userData?.email ?? `${role}@archisite.pro`,
      role,
    };
    const finalUser: User = { ...base, ...userData, role };
    setUser(finalUser);
    localStorage.setItem("auth_user", JSON.stringify(finalUser));
    // Guest goes to their own home, others go to admin dashboard
    router.push(role === "guest" ? "/guest/home" : "/");
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("auth_user");
    router.push("/login");
  };

  useEffect(() => {
    if (isLoading) return;
    const isLoginPage = pathname === "/login";
    const isGuestPage = pathname.startsWith("/guest");
    if (!user && !isLoginPage) {
      router.push("/login");
    } else if (user?.role === "guest" && !isGuestPage) {
      // Guest trying to access admin pages → redirect to guest home
      router.push("/guest/home");
    }
  }, [user, isLoading, pathname, router]);

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
