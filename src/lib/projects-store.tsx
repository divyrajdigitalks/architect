"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { projectService } from "@/services/project.service";
import { ProjectManagementFlow, DesignTask, SiteExecutionTask } from "./types/project-flow";

export type StageStatus = "Pending" | "In Progress" | "Completed";
export type LifecycleStatus = "Pending" | "In Progress" | "Completed";

export type ProjectStage = {
  name: string;
  status: StageStatus;
};

export type ProjectLifecyclePhase = {
  name: string;
  status: LifecycleStatus;
};

export type Project = {
  id: string;
  name: string;
  client: string;
  clientId?: string;
  location: string;
  startDate: string;
  expectedCompletion: string;
  status: string;
  progress: number;
  budget: string;
  received: string;
  pending: string;
  supervisorId?: string;
  workerIds?: string[];
  phase?: string;
  lifecycle?: ProjectLifecyclePhase[];
  stages: ProjectStage[];
  flow?: ProjectManagementFlow;
};

type CreateProjectInput = Omit<
  Project,
  "id" | "progress" | "received" | "pending" | "status" | "phase"
> & {
  id?: string;
  progress?: number;
  received?: string;
  pending?: string;
  status?: string;
  phase?: string;
};

type ProjectsContextType = {
  projects: Project[];
  isHydrated: boolean;
  getProjectById: (id: string) => Project | undefined;
  createProject: (input: CreateProjectInput) => Project;
  updateProject: (id: string, patch: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  fetchProjects: () => Promise<void>;
  updateStageStatus: (projectId: string, stageName: string, status: StageStatus) => void;
  updateLifecycleStatus: (projectId: string, phaseName: string, status: LifecycleStatus) => void;
};

const STORAGE_KEY = "archisite_projects";
const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined);

function safeParse<T>(raw: string | null): T | undefined {
  if (!raw) return undefined;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return undefined;
  }
}

function createDesignTask(title: string): DesignTask {
  return {
    id: "dt_" + Math.random().toString(36).substr(2, 9),
    title,
    assignedTo: [],
    status: "Pending",
    progress: 0,
    deadline: "",
    documents: [],
    comments: [],
    activityLogs: [],
  };
}

function createExecutionTask(stage: string): SiteExecutionTask {
  return {
    id: "et_" + Math.random().toString(36).substr(2, 9),
    stage,
    status: "Pending",
    progress: 0,
    images: [],
    materials: [],
    labourAttendance: [],
    notes: [],
    delays: [],
  };
}

function initializeFlow(): ProjectManagementFlow {
  return {
    officeWork: {
      civil: {
        layoutPlan: createDesignTask("Layout Plan Management"),
        detailedLayout: createDesignTask("Detailed Layout Plan"),
        elevationExterior: createDesignTask("Elevation & Exterior Design"),
        columnFooting: createDesignTask("Column & Footing Drawings"),
        groundPlinthBeam: createDesignTask("Ground Beam & Plinth Beam Drawings"),
        boringUGT: createDesignTask("Boring & UGT Tank Details"),
        slabBeamColumn: createDesignTask("Slab / Beam / Column Details"),
        workingDrawings: createDesignTask("Working Drawings"),
        elevationWorking: createDesignTask("Elevation Working"),
        drainageLayout: createDesignTask("Drainage Layout"),
      },
      interior: {
        furnitureLayout: createDesignTask("Furniture Layout"),
        soLayout: createDesignTask("SO Layout"),
        electricLayout: createDesignTask("Electric Layout"),
        loopingLayout: createDesignTask("Looping Layout"),
        acLayout: createDesignTask("AC Layout"),
        ceilingLayout: createDesignTask("Ceiling Layout"),
        plumbingLayout: createDesignTask("Plumbing Layout"),
        machineWorking: createDesignTask("Machine Working"),
        cncDrawings: createDesignTask("CNC Drawings"),
        softFurnishing: createDesignTask("Soft Furnishing Details"),
        model3D: createDesignTask("3D Model & Rendering"),
      },
    },
    siteWork: {
      civil: {
        boring: createExecutionTask("Boring"),
        foundation: createExecutionTask("Foundation"),
        plinthWork: createExecutionTask("Plinth Work"),
        drainageLine: createExecutionTask("Drainage Line"),
        structuralWork: createExecutionTask("Column, Beam & Slab Work"),
        brickWork: createExecutionTask("Brick Work"),
        plasterWork: createExecutionTask("Plaster Work"),
      },
      interior: {
        plumbing: createExecutionTask("Plumbing Work"),
        electric: createExecutionTask("Electric Work"),
        acPiping: createExecutionTask("AC Piping"),
        pestControl: createExecutionTask("Pest Control"),
        tilesStone: createExecutionTask("Tiles & Stone Work"),
        furniture: createExecutionTask("Furniture Work"),
        paint: createExecutionTask("Color/Paint Work"),
        cleaning: createExecutionTask("Cleaning Work"),
        lightingSurface: createExecutionTask("Surface Lighting & Headboard"),
        lightingDecoration: createExecutionTask("Lighting & Decoration"),
        appliances: createExecutionTask("Appliances & Accessories Installation"),
      },
    },
  };
}

function normalizeSeed(): Project[] {
  return (seedProjects as unknown as Project[]).map((p) => ({
    ...p,
    workerIds: p.workerIds ?? [],
    stages: p.stages ?? [],
    flow: p.flow ?? initializeFlow(),
  }));
}

function computeProgressFromStages(stages: ProjectStage[]): number {
  if (!stages || stages.length === 0) return 0;
  const completed = stages.filter((s) => s.status === "Completed").length;
  return Math.round((completed / stages.length) * 100);
}

function computeStatusFromProgress(progress: number): string {
  if (progress <= 0) return "Planned";
  if (progress >= 100) return "Completed";
  return "In Progress";
}

function computePhaseFromLifecycle(lifecycle?: ProjectLifecyclePhase[]): string | undefined {
  if (!lifecycle || lifecycle.length === 0) return undefined;
  const inProgress = lifecycle.find((p) => p.status === "In Progress");
  return inProgress?.name ?? lifecycle[lifecycle.length - 1]?.name;
}

export function ProjectsProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate from Backend
  const fetchProjects = async () => {
    try {
      const data = await projectService.getAllProjects();
      if (data && data.length > 0) {
        // Map backend _id to id for frontend compatibility
        const mappedProjects = data.map((p: any) => ({
          ...p,
          id: p._id,
          workerIds: p.workers?.map((w: any) => w._id) || [],
          supervisorId: p.supervisor?._id,
          designerId: p.designer?._id,
          client: p.client?.name || p.client,
        }));
        setProjects(mappedProjects);
      }
    } catch (error) {
      console.error("Failed to fetch projects from backend", error);
      // Fallback to local storage if needed
      const saved = safeParse<Project[]>(localStorage.getItem(STORAGE_KEY));
      if (saved) setProjects(saved);
    } finally {
      setIsHydrated(true);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Persist updates
  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  }, [projects, isHydrated]);

  const api = useMemo<ProjectsContextType>(() => {
    const getProjectById = (id: string) => projects.find((p) => p.id === id);

    const createProject = (input: CreateProjectInput): Project => {
      const id = input.id ?? String(Date.now());
      const status = input.status ?? "Planned";
      const progress = input.progress ?? 0;
      const received = input.received ?? "$0";
      const pending = input.pending ?? input.budget ?? "$0";
      const phase = input.phase ?? "Pre-Design";

      const created: Project = {
        id,
        name: input.name,
        client: input.client,
        clientId: input.clientId,
        location: input.location,
        startDate: input.startDate,
        expectedCompletion: input.expectedCompletion,
        status,
        progress,
        budget: input.budget,
        received,
        pending,
        supervisorId: input.supervisorId,
        workerIds: input.workerIds ?? [],
        phase,
        lifecycle: input.lifecycle ?? [],
        stages: input.stages ?? [],
        flow: input.flow ?? initializeFlow(),
      };

      setProjects((prev) => [...prev, created]);
      return created;
    };

    const updateProject = (id: string, patch: Partial<Project>) => {
      setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
    };

    const deleteProject = (id: string) => {
      setProjects((prev) => prev.filter((p) => p.id !== id));
    };

    const updateStageStatus = (projectId: string, stageName: string, status: StageStatus) => {
      setProjects((prev) =>
        prev.map((p) => {
          if (p.id !== projectId) return p;
          const stages = (p.stages ?? []).map((s) => (s.name === stageName ? { ...s, status } : s));
          const progress = computeProgressFromStages(stages);
          const statusText = computeStatusFromProgress(progress);
          return { ...p, stages, progress, status: statusText };
        })
      );
    };

    const updateLifecycleStatus = (projectId: string, phaseName: string, status: LifecycleStatus) => {
      setProjects((prev) =>
        prev.map((p) => {
          if (p.id !== projectId) return p;
          const lifecycle = (p.lifecycle ?? []).map((ph) => (ph.name === phaseName ? { ...ph, status } : ph));
          const phase = computePhaseFromLifecycle(lifecycle) ?? p.phase;
          return { ...p, lifecycle, phase };
        })
      );
    };

    return {
      projects,
      isHydrated,
      getProjectById,
      createProject,
      updateProject,
      deleteProject,
      updateStageStatus,
      updateLifecycleStatus,
    fetchProjects,
  };
  }, [projects, isHydrated]);

  return <ProjectsContext.Provider value={api}>{children}</ProjectsContext.Provider>;
}

export function useProjects() {
  const ctx = useContext(ProjectsContext);
  if (!ctx) throw new Error("useProjects must be used within a ProjectsProvider");
  return ctx;
}

