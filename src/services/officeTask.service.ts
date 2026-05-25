import { api } from "./api";

export const officeTaskService = {
  async getAllTasks() {
    return api.get("/office-tasks");
  },
  async getTaskById(id: string) {
    return api.get(`/office-tasks/${id}`);
  },
  async createTask(taskData: any) {
    return api.post("/office-tasks", taskData);
  },
  async updateTask(id: string, taskData: any) {
    return api.put(`/office-tasks/${id}`, taskData);
  },
  async deleteTask(id: string) {
    return api.delete(`/office-tasks/${id}`);
  },
};
