import { api } from "./api";
import endPointApi from "@/lib/endpoints";

export const officeTaskService = {
  async getAllTasks() {
    return api.get(endPointApi.officeTasks);
  },
  async getTaskById(id: string) {
    return api.get(endPointApi.officeTaskById(id));
  },
  async createTask(taskData: any) {
    return api.post(endPointApi.officeTasks, taskData);
  },
  async updateTask(id: string, taskData: any) {
    return api.put(endPointApi.officeTaskById(id), taskData);
  },
  async deleteTask(id: string) {
    return api.delete(endPointApi.officeTaskById(id));
  },
};
