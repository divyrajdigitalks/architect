"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { taskService } from "@/services/task.service";

export type TaskStatus = "Pending" | "In Progress" | "Completed";

export type Task = {
  id: string;
  name: string;
  projectId?: string;
  project: string;
  stage: string;
  officeTeam: string;
  officeStatus: TaskStatus;
  siteTeam: string;
  siteStatus: TaskStatus;
  worker?: string; // for backward compatibility
  deadline: string;
  status?: TaskStatus; // for backward compatibility
  createdAt?: string;
};

type CreateTaskInput = Omit<Task, "id" | "status" | "createdAt"> & {
  id?: string;
  status?: TaskStatus;
};

type TasksContextType = {
  tasks: Task[];
  isHydrated: boolean;
  getTasksByProjectId: (projectId: string) => Task[];
  createTask: (input: CreateTaskInput) => Task;
  updateTask: (id: string, patch: Partial<Task>) => void;
  updateTaskStatus: (id: string, status: TaskStatus) => void;
  deleteTask: (id: string) => void;
};

const TasksContext = createContext<TasksContextType | undefined>(undefined);

export function TasksProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const data = await taskService.getAllTasks();
        if (data && data.length > 0) {
          const mappedTasks = data.map((t: any) => ({
            ...t,
            id: t._id,
          }));
          setTasks(mappedTasks);
        }
      } catch (error) {
        console.error("Failed to fetch tasks from backend", error);
      } finally {
        setIsHydrated(true);
      }
    };

    fetchTasks();
  }, []);

  const api = useMemo<TasksContextType>(() => {
    const getTasksByProjectId = (projectId: string) => tasks.filter((t) => t.projectId === projectId);

    const createTask = (input: CreateTaskInput): Task => {
      const created: Task = {
        id: input.id ?? String(Date.now()),
        name: input.name,
        projectId: input.projectId,
        project: input.project,
        stage: input.stage,
        officeTeam: input.officeTeam,
        officeStatus: input.officeStatus ?? "Pending",
        siteTeam: input.siteTeam,
        siteStatus: input.siteStatus ?? "Pending",
        worker: input.worker ?? input.siteTeam,
        deadline: input.deadline,
        status: input.status ?? input.officeStatus ?? "Pending",
        createdAt: new Date().toISOString(),
      };
      setTasks((prev) => [created, ...prev]);
      return created;
    };

    const updateTask = (id: string, patch: Partial<Task>) => {
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
    };

    const updateTaskStatus = (id: string, status: TaskStatus) => updateTask(id, { status });

    const deleteTask = (id: string) => setTasks((prev) => prev.filter((t) => t.id !== id));

    return { tasks, isHydrated, getTasksByProjectId, createTask, updateTask, updateTaskStatus, deleteTask };
  }, [tasks, isHydrated]);

  return <TasksContext.Provider value={api}>{children}</TasksContext.Provider>;
}

export function useTasks() {
  const ctx = useContext(TasksContext);
  if (!ctx) throw new Error("useTasks must be used within a TasksProvider");
  return ctx;
}

