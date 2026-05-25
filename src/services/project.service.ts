import { api } from "./api";

export interface Project {
  _id: string;
  name: string;
  client: any;
  location: string;
  startDate: string;
  expectedCompletion: string;
  status: string;
  progress: number;
  budget: string;
  received: string;
  pending: string;
  supervisor?: any;
  workers?: any[];
  stages: any[];
  flow?: any;
}

export const projectService = {
  async getAllProjects(): Promise<Project[]> {
    return api.get("/projects");
  },

  async getProjectById(id: string): Promise<Project> {
    return api.get(`/projects/${id}`);
  },

  async createProject(projectData: any): Promise<Project> {
    return api.post("/projects", projectData);
  },

  async updateProject(id: string, projectData: any): Promise<Project> {
    return api.put(`/projects/${id}`, projectData);
  },

  async deleteProject(id: string): Promise<any> {
    return api.delete(`/projects/${id}`);
  },

  async updateStage(id: string, stageData: { stageName: string; status: string }): Promise<Project> {
    return api.post(`/projects/${id}/stage`, stageData); // Backend uses updateStage controller
  },
};
