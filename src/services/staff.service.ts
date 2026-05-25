import { api } from "./api";
import { Role } from "./role.service";

export interface StaffMember {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  team: string;
  isActive: boolean;
  experience?: number;
}

export const staffService = {
  async getAllStaff(): Promise<StaffMember[]> {
    return api.get("/users");
  },

  async getStaffById(id: string): Promise<StaffMember> {
    return api.get(`/users/${id}`);
  },

  async updateStaff(id: string, staffData: any): Promise<StaffMember> {
    return api.put(`/users/${id}`, staffData);
  },

  async deleteStaff(id: string): Promise<any> {
    return api.delete(`/users/${id}`);
  },

  async createStaff(staffData: any): Promise<StaffMember> {
    // Staff creation is usually through registration or a specific admin endpoint
    // Here we use the auth register endpoint for adding staff
    return api.post("/auth/register", staffData);
  },
};
