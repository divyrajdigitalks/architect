"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { siteUpdateService } from "@/services/site-update.service";

export type SiteUpdate = {
  id: string;
  projectId?: string;
  project: string;
  update: string;
  date: string;
  progress: number;
  photos: number;
  stage?: string;
  addedBy?: string;
  createdAt?: string;
};

type CreateUpdateInput = Omit<SiteUpdate, "id" | "date" | "photos" | "createdAt"> & {
  id?: string;
  date?: string;
  photos?: number;
};

type SiteUpdatesContextType = {
  updates: SiteUpdate[];
  isHydrated: boolean;
  getUpdatesByProjectId: (projectId: string) => SiteUpdate[];
  createUpdate: (input: CreateUpdateInput) => SiteUpdate;
  deleteUpdate: (id: string) => void;
};

const SiteUpdatesContext = createContext<SiteUpdatesContextType | undefined>(undefined);

export function SiteUpdatesProvider({ children }: { children: React.ReactNode }) {
  const [updates, setUpdates] = useState<SiteUpdate[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        const data = (await siteUpdateService.getAllUpdates()) as any;
        if (data && data.length > 0) {
          const mappedUpdates = data.map((u: any) => ({
            ...u,
            id: u._id,
          }));
          setUpdates(mappedUpdates);
        }
      } catch (error) {
        console.error("Failed to fetch site updates from backend", error);
      } finally {
        setIsHydrated(true);
      }
    };

    fetchUpdates();
  }, []);

  const api = useMemo<SiteUpdatesContextType>(() => {
    const getUpdatesByProjectId = (projectId: string) => updates.filter((u) => u.projectId === projectId);

    const createUpdate = (input: CreateUpdateInput): SiteUpdate => {
      const created: SiteUpdate = {
        id: input.id ?? String(Date.now()),
        projectId: input.projectId,
        project: input.project,
        update: input.update,
        date: input.date ?? new Date().toISOString().split("T")[0],
        progress: input.progress ?? 0,
        photos: input.photos ?? 0,
        stage: input.stage,
        addedBy: input.addedBy,
        createdAt: new Date().toISOString(),
      };
      setUpdates((prev) => [created, ...prev]);
      return created;
    };

    const deleteUpdate = (id: string) => setUpdates((prev) => prev.filter((u) => u.id !== id));

    return { updates, isHydrated, getUpdatesByProjectId, createUpdate, deleteUpdate };
  }, [updates, isHydrated]);

  return <SiteUpdatesContext.Provider value={api}>{children}</SiteUpdatesContext.Provider>;
}

export function useSiteUpdates() {
  const ctx = useContext(SiteUpdatesContext);
  if (!ctx) throw new Error("useSiteUpdates must be used within a SiteUpdatesProvider");
  return ctx;
}

