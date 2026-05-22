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
  { key: "office-work",  label: "Office Work" },
  { key: "site-work",    label: "Site Work" },
  { key: "tasks",        label: "Tasks" },
  { key: "office-team",  label: "Office Team" },
  { key: "site-team",    label: "Site Team" },
  { key: "clients",      label: "Clients" },
  { key: "site-updates", label: "Site Updates" },
  { key: "site-photos",  label: "Site Photos" },
  { key: "attendance",   label: "Attendance" },
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
    id: "director", name: "DIRECTOR", color: "slate", canDelete: false,
    pages: ALL_PAGES.map(p => p.key),
  },
  {
    id: "architect", name: "ARCHITECT", color: "indigo", canDelete: false,
    pages: ["dashboard", "projects", "office-work", "site-work", "tasks", "office-team", "site-team", "clients", "site-updates", "site-photos", "attendance", "arkiton", "working-sop"],
  },
  {
    id: "office-team", name: "OFFICE TEAM", color: "blue", canDelete: false,
    pages: ["dashboard", "projects", "office-work", "messages", "calendar"],
  },
  {
    id: "site-engineer", name: "SITE ENGINEER", color: "orange", canDelete: false,
    pages: ["dashboard", "projects", "site-updates", "site-photos", "tasks", "site-team"],
  },
  {
    id: "supervisor", name: "SUPERVISOR", color: "green", canDelete: false,
    pages: ["dashboard", "projects", "tasks", "site-updates"],
  },
  {
    id: "accountant", name: "ACCOUNTANT", color: "purple", canDelete: false,
    pages: ["dashboard", "payments", "reports", "arkiton", "working-sop"],
  },
  {
    id: "client", name: "CLIENT PORTAL", color: "blue", canDelete: false,
    pages: ["dashboard", "projects", "site-updates", "site-photos", "payments", "messages"],
  },
  {
    id: "guest", name: "GUEST MODE", color: "rose", canDelete: false,
    pages: ["dashboard", "projects", "arkiton", "working-sop"],
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
        const savedRoles: RoleConfig[] = JSON.parse(saved);
        // Merge saved roles with DEFAULT_ROLES to update system role names/pages
        const mergedRoles = DEFAULT_ROLES.map(defRole => {
          const savedRole = savedRoles.find(r => r.id === defRole.id);
          if (savedRole && !defRole.canDelete) {
            // Keep the default name and id for system roles, but allow pages to be saved if needed
            // Actually, the user wants the names updated, so we prioritize DEFAULT_ROLES for system roles
            return defRole; 
          }
          return savedRole || defRole;
        });

        // Add any custom roles that were saved
        const customRoles = savedRoles.filter(sr => sr.canDelete && !DEFAULT_ROLES.find(dr => dr.id === sr.id));
        
        setRoles([...mergedRoles, ...customRoles]);
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
