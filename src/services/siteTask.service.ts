import { api } from "./api";

export const siteTaskService = {
  async getAllTasks() {
    return api.get("/site-tasks");
  },
  async getTaskById(id: string) {
    return api.get(`/site-tasks/${id}`);
  },
  async createTask(taskData: any) {
    return api.post("/site-tasks", taskData);
  },
  async updateTask(id: string, taskData: any) {
    return api.put(`/site-tasks/${id}`, taskData);
  },
  async deleteTask(id: string) {
    return api.delete(`/site-tasks/${id}`);
  },
};
