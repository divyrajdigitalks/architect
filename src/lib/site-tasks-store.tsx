"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { siteTaskService } from "@/services/siteTask.service";

export type SiteTaskStatus = "Pending" | "In Progress" | "Completed" | "Critical" | "Delayed" | "On Track";
export type SiteTaskCategory = "Civil" | "Interior";

export type SiteTask = {
  id: string;
  title: string;
  projectId?: string;
  project: string;
  category: SiteTaskCategory;
  assignedTo: any[];
  status: SiteTaskStatus;
  progress: number;
  startDate?: string;
  endDate?: string;
  notes?: string;
  images?: string[];
  createdAt?: string;
};

type CreateSiteTaskInput = Omit<SiteTask, "id" | "createdAt"> & {
  id?: string;
};

type SiteTasksContextType = {
  siteTasks: SiteTask[];
  isHydrated: boolean;
  getSiteTasksByProjectId: (projectId: string) => SiteTask[];
  createSiteTask: (input: CreateSiteTaskInput) => SiteTask | Promise<SiteTask>;
  updateSiteTask: (id: string, patch: Partial<SiteTask>) => void;
  updateSiteTaskStatus: (id: string, status: SiteTaskStatus) => void;
  deleteSiteTask: (id: string) => void;
};

const SiteTasksContext = createContext<SiteTasksContextType | undefined>(undefined);

export function SiteTasksProvider({ children }: { children: React.ReactNode }) {
  const [siteTasks, setSiteTasks] = useState<SiteTask[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const data = (await siteTaskService.getAllTasks()) as any;
        if (data && data.length > 0) {
          const mappedTasks = data.map((t: any) => ({
            ...t,
            id: t._id,
          }));
          setSiteTasks(mappedTasks);
        }
      } catch (error) {
        console.error("Failed to fetch site tasks from backend", error);
      } finally {
        setIsHydrated(true);
      }
    };

    fetchTasks();
  }, []);

  const api = useMemo<SiteTasksContextType>(() => {
    const getSiteTasksByProjectId = (projectId: string) => siteTasks.filter((t) => t.projectId === projectId || (t.project as any)?._id === projectId);

    const createSiteTask = async (input: CreateSiteTaskInput): Promise<SiteTask> => {
      try {
        const payload = {
          title: input.title,
          project: input.projectId,
          category: input.category,
          assignedTo: input.assignedTo,
          status: input.status || "On Track",
          progress: input.progress || 0,
          startDate: input.startDate,
          endDate: input.endDate,
          notes: input.notes,
        };
        const data = (await siteTaskService.createTask(payload)) as any;
        const created: SiteTask = {
          ...data,
          id: data._id,
        };
        const fresh = (await siteTaskService.getAllTasks()) as any;
        if (fresh) {
          setSiteTasks(fresh.map((t: any) => ({ ...t, id: t._id })));
        }
        return created;
      } catch (error) {
        console.error("Failed to create site task on backend", error);
        const created: SiteTask = {
          id: input.id ?? String(Date.now()),
          title: input.title,
          projectId: input.projectId,
          project: input.project,
          category: input.category,
          assignedTo: input.assignedTo ?? [],
          status: input.status ?? "On Track",
          progress: input.progress ?? 0,
          startDate: input.startDate,
          endDate: input.endDate,
          notes: input.notes,
          createdAt: new Date().toISOString(),
        };
        setSiteTasks((prev) => [created, ...prev]);
        return created;
      }
    };

    const updateSiteTask = async (id: string, patch: Partial<SiteTask>) => {
      try {
        const payload: any = { ...patch };
        if (patch.projectId) {
          payload.project = patch.projectId;
        }
        await siteTaskService.updateTask(id, payload);
        const fresh = (await siteTaskService.getAllTasks()) as any;
        if (fresh) {
          setSiteTasks(fresh.map((t: any) => ({ ...t, id: t._id })));
        }
      } catch (error) {
        console.error("Failed to update site task on backend", error);
        setSiteTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
      }
    };

    const updateSiteTaskStatus = (id: string, status: SiteTaskStatus) => updateSiteTask(id, { status });

    const deleteSiteTask = async (id: string) => {
      try {
        await siteTaskService.deleteTask(id);
        const fresh = (await siteTaskService.getAllTasks()) as any;
        if (fresh) {
          setSiteTasks(fresh.map((t: any) => ({ ...t, id: t._id })));
        }
      } catch (error) {
        console.error("Failed to delete site task on backend", error);
        setSiteTasks((prev) => prev.filter((t) => t.id !== id));
      }
    };

    return { siteTasks, isHydrated, getSiteTasksByProjectId, createSiteTask, updateSiteTask, updateSiteTaskStatus, deleteSiteTask };
  }, [siteTasks, isHydrated]);

  return <SiteTasksContext.Provider value={api}>{children}</SiteTasksContext.Provider>;
}

export function useSiteTasks() {
  const ctx = useContext(SiteTasksContext);
  if (!ctx) throw new Error("useSiteTasks must be used within a SiteTasksProvider");
  return ctx;
}
