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
  architect:       { id: "1", name: "Arch. Sarah Connor", email: "sarah@archisite.pro",  role: "architect" },
  client:          { id: "2", name: "Office Admin",        email: "office@archisite.pro", role: "client" },
  supervisor:      { id: "3", name: "Client User",         email: "client@example.com",   role: "supervisor",    projectId: "1" },
  worker:          { id: "4", name: "Agency Lead",         email: "agency@trades.pro",    role: "worker",        projectId: "1" },
  accountant:      { id: "5", name: "Academy Manager",     email: "academy@archisite.pro", role: "accountant" },
  "site-engineer": { id: "6", name: "Guest User",          email: "guest@example.com",    role: "site-engineer" },
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
    // Use provided userData or fall back to demo user or generate one
    const base = DEMO_USERS[role] ?? {
      id: "custom_" + Date.now(),
      name: userData?.name ?? role,
      email: userData?.email ?? `${role}@archisite.pro`,
      role,
    };
    const finalUser: User = { ...base, ...userData, role };
    setUser(finalUser);
    localStorage.setItem("auth_user", JSON.stringify(finalUser));
    router.push("/");
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("auth_user");
    router.push("/login");
  };

  useEffect(() => {
    if (!isLoading && !user && pathname !== "/login") {
      router.push("/login");
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
