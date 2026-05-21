"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type RoleId = string; // supports dynamic roles too

export type RoleConfig = {
  id: RoleId;
  name: string;
  color: string;
  pages: string[];
  canDelete: boolean; // false = system role
};

export const ALL_PAGES = [
  { key: "dashboard",    label: "Dashboard" },
  { key: "projects",     label: "Projects" },
  { key: "tasks",        label: "Tasks" },
  { key: "workers",      label: "Workers" },
  { key: "supervisors",  label: "Supervisors" },
  { key: "clients",      label: "Clients" },
  { key: "site-updates", label: "Site Updates" },
  { key: "site-photos",  label: "Site Photos" },
  { key: "attendance",   label: "Attendance" },
  { key: "office-team",  label: "Office Team" },
  { key: "site-team",    label: "Site Team" },
  { key: "arkiton",      label: "Arkiton" },
  { key: "working-sop",  label: "Working SOP" },
  { key: "payments",     label: "Payments" },
  { key: "calendar",     label: "Calendar" },
  { key: "reports",      label: "Reports" },
  { key: "messages",     label: "Messages" },
  { key: "settings",     label: "Settings" },
];

export const DEFAULT_ROLES: RoleConfig[] = [
  {
    id: "architect", name: "DIRECTOR", color: "indigo", canDelete: false,
    pages: ALL_PAGES.map(p => p.key),
  },
  {
    id: "client", name: "OFFICE TEAM", color: "blue", canDelete: false,
    pages: ["dashboard", "site-photos", "payments", "messages"],
  },
  {
    id: "supervisor", name: "CLIENTS", color: "orange", canDelete: false,
    pages: ["dashboard", "projects", "tasks", "site-team", "attendance", "site-updates", "site-photos", "messages"],
  },
  {
    id: "worker", name: "AGENCY", color: "green", canDelete: false,
    pages: ["dashboard", "site-photos", "messages"],
  },
  {
    id: "office-admin", name: "ACADEMY", color: "teal", canDelete: false,
    pages: ["dashboard", "office-team", "projects", "tasks", "messages", "attendance"],
  },
  {
    id: "accountant", name: "ACADEMY", color: "purple", canDelete: false,
    pages: ["dashboard", "payments", "projects", "reports", "clients"],
  },
  {
    id: "site-engineer", name: "GUEST", color: "rose", canDelete: false,
    pages: ["dashboard", "arkiton", "working-sop"],
  },
  {
    id: "guest", name: "GUEST", color: "slate", canDelete: false,
    pages: ["dashboard", "arkiton", "working-sop"],
  },
  {
    id: "director", name: "DIRECTOR", color: "indigo", canDelete: false,
    pages: ALL_PAGES.map(p => p.key),
  },
];

interface RoleContextType {
  roles: RoleConfig[];
  addRole: (name: string, color: string) => RoleConfig;
  deleteRole: (id: string) => void;
  updateRolePages: (id: string, pages: string[]) => void;
  getRoleById: (id: string) => RoleConfig | undefined;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);
const STORAGE_KEY = "archisite_roles";

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [roles, setRoles] = useState<RoleConfig[]>(DEFAULT_ROLES);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setRoles(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load roles from localStorage", e);
    }
    setIsInitialized(true);
  }, []);

  // Persist to localStorage whenever roles change, but only after initialization
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(roles));
    }
  }, [roles, isInitialized]);

  const addRole = (name: string, color: string): RoleConfig => {
    const newRole: RoleConfig = {
      id: "custom_" + Date.now(),
      name: name.trim(),
      color,
      pages: ["dashboard"],
      canDelete: true,
    };
    setRoles(prev => [...prev, newRole]);
    return newRole;
  };

  const deleteRole = (id: string) => {
    setRoles(prev => prev.filter(r => r.id !== id || !r.canDelete));
  };

  const updateRolePages = (id: string, pages: string[]) => {
    setRoles(prev => prev.map(r => r.id === id && r.id !== "architect" ? { ...r, pages } : r));
  };

  const getRoleById = (id: string) => roles.find(r => r.id === id);

  return (
    <RoleContext.Provider value={{ roles, addRole, deleteRole, updateRolePages, getRoleById }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRoles() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRoles must be used within RoleProvider");
  return ctx;
}
