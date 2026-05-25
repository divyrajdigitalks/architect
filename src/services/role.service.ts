import { api } from "./api";

export interface Role {
  _id: string;
  name: string;
  description: string;
  permissions: string[];
}

export const roleService = {
  async getAllRoles(): Promise<Role[]> {
    return api.get("/roles");
  },

  async getRoleById(id: string): Promise<Role> {
    return api.get(`/roles/${id}`);
  },

  async createRole(roleData: Partial<Role>): Promise<Role> {
    return api.post("/roles", roleData);
  },

  async updateRole(id: string, roleData: Partial<Role>): Promise<Role> {
    return api.put(`/roles/${id}`, roleData);
  },

  async deleteRole(id: string): Promise<any> {
    return api.delete(`/roles/${id}`);
  },
};
