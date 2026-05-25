import { api } from "./api";

export const taskService = {
  async getAllTasks() {
    return api.get("/tasks");
  },
  async getTaskById(id: string) {
    return api.get(`/tasks/${id}`);
  },
  async createTask(taskData: any) {
    return api.post("/tasks", taskData);
  },
  async updateTask(id: string, taskData: any) {
    return api.put(`/tasks/${id}`, taskData);
  },
  async deleteTask(id: string) {
    return api.delete(`/tasks/${id}`);
  },
};
