import { api } from "./api";

export const siteUpdateService = {
  async getAllUpdates() {
    return api.get("/site-updates");
  },
  async getUpdatesByProject(projectId: string) {
    return api.get(`/site-updates?projectId=${projectId}`);
  },
  async createUpdate(updateData: any) {
    return api.post("/site-updates", updateData);
  },
  async deleteUpdate(id: string) {
    return api.delete(`/site-updates/${id}`);
  },
};
