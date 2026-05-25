import { api } from "./api";

export const authService = {
  async login(credentials: any) {
    return api.post("/auth/login", credentials);
  },

  async register(userData: any) {
    return api.post("/auth/register", userData);
  },

  async getMe() {
    return api.get("/auth/me");
  },
};
