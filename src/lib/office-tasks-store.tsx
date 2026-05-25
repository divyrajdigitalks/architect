"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { officeTaskService } from "@/services/officeTask.service";

export type OfficeTaskStatus = "Pending" | "In Progress" | "Completed";
export type OfficeTaskCategory = "Civil" | "Interior";

export type OfficeTask = {
  id: string;
  title: string;
  projectId?: string;
  project: string;
  category: OfficeTaskCategory;
  assignedTo: any[];
  status: OfficeTaskStatus;
  progress: number;
  deadline?: string;
  priority?: string;
  notes?: string;
  createdAt?: string;
};

type CreateOfficeTaskInput = Omit<OfficeTask, "id" | "createdAt"> & {
  id?: string;
};

type OfficeTasksContextType = {
  officeTasks: OfficeTask[];
  isHydrated: boolean;
  getOfficeTasksByProjectId: (projectId: string) => OfficeTask[];
  createOfficeTask: (input: CreateOfficeTaskInput) => OfficeTask | Promise<OfficeTask>;
  updateOfficeTask: (id: string, patch: Partial<OfficeTask>) => void;
  updateOfficeTaskStatus: (id: string, status: OfficeTaskStatus) => void;
  deleteOfficeTask: (id: string) => void;
};

const STORAGE_KEY = "archisite_office_tasks";
const OfficeTasksContext = createContext<OfficeTasksContextType | undefined>(undefined);

function safeParse<T>(raw: string | null): T | undefined {
  if (!raw) return undefined;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return undefined;
  }
}

export function OfficeTasksProvider({ children }: { children: React.ReactNode }) {
  const [officeTasks, setOfficeTasks] = useState<OfficeTask[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const data = (await officeTaskService.getAllTasks()) as any;
        if (data && data.length > 0) {
          const mappedTasks = data.map((t: any) => ({
            ...t,
            id: t._id,
          }));
          setOfficeTasks(mappedTasks);
        }
      } catch (error) {
        console.error("Failed to fetch office tasks from backend", error);
        const saved = safeParse<OfficeTask[]>(localStorage.getItem(STORAGE_KEY));
        if (saved) setOfficeTasks(saved);
      } finally {
        setIsHydrated(true);
      }
    };

    fetchTasks();
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(officeTasks));
  }, [officeTasks, isHydrated]);

  const api = useMemo<OfficeTasksContextType>(() => {
    const getOfficeTasksByProjectId = (projectId: string) => officeTasks.filter((t) => t.projectId === projectId || (t.project as any)?._id === projectId);

    const createOfficeTask = async (input: CreateOfficeTaskInput): Promise<OfficeTask> => {
      try {
        const payload = {
          title: input.title,
          project: input.projectId,
          category: input.category,
          assignedTo: input.assignedTo,
          priority: input.priority || "Medium",
          status: input.status || "Pending",
          progress: input.progress || 0,
          deadline: input.deadline,
          notes: input.notes,
        };
        const data = (await officeTaskService.createTask(payload)) as any;
        const created: OfficeTask = {
          ...data,
          id: data._id,
        };
        
        // Fetch fresh populated tasks from backend
        const fresh = (await officeTaskService.getAllTasks()) as any;
        if (fresh) {
          setOfficeTasks(fresh.map((t: any) => ({ ...t, id: t._id })));
        }
        return created;
      } catch (error) {
        console.error("Failed to create office task on backend", error);
        const created: OfficeTask = {
          id: input.id ?? String(Date.now()),
          title: input.title,
          projectId: input.projectId,
          project: input.project,
          category: input.category,
          assignedTo: input.assignedTo ?? [],
          status: input.status ?? "Pending",
          progress: input.progress ?? 0,
          deadline: input.deadline,
          priority: input.priority,
          notes: input.notes,
          createdAt: new Date().toISOString(),
        };
        setOfficeTasks((prev) => [created, ...prev]);
        return created;
      }
    };

    const updateOfficeTask = async (id: string, patch: Partial<OfficeTask>) => {
      try {
        const payload: any = { ...patch };
        if (patch.projectId) {
          payload.project = patch.projectId;
        }
        await officeTaskService.updateTask(id, payload);
        const fresh = (await officeTaskService.getAllTasks()) as any;
        if (fresh) {
          setOfficeTasks(fresh.map((t: any) => ({ ...t, id: t._id })));
        }
      } catch (error) {
        console.error("Failed to update office task on backend", error);
        setOfficeTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
      }
    };

    const updateOfficeTaskStatus = (id: string, status: OfficeTaskStatus) => updateOfficeTask(id, { status });

    const deleteOfficeTask = async (id: string) => {
      try {
        await officeTaskService.deleteTask(id);
        const fresh = (await officeTaskService.getAllTasks()) as any;
        if (fresh) {
          setOfficeTasks(fresh.map((t: any) => ({ ...t, id: t._id })));
        }
      } catch (error) {
        console.error("Failed to delete office task on backend", error);
        setOfficeTasks((prev) => prev.filter((t) => t.id !== id));
      }
    };

    return { officeTasks, isHydrated, getOfficeTasksByProjectId, createOfficeTask, updateOfficeTask, updateOfficeTaskStatus, deleteOfficeTask };
  }, [officeTasks, isHydrated]);

  return <OfficeTasksContext.Provider value={api}>{children}</OfficeTasksContext.Provider>;
}

export function useOfficeTasks() {
  const ctx = useContext(OfficeTasksContext);
  if (!ctx) throw new Error("useOfficeTasks must be used within a OfficeTasksProvider");
  return ctx;
}
