import { api } from "./api";

export interface Client {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
}

export const clientService = {
  async getAllClients(): Promise<Client[]> {
    return api.get("/clients");
  },
  async getClientById(id: string): Promise<Client> {
    return api.get(`/clients/${id}`);
  },
  async createClient(clientData: any): Promise<Client> {
    return api.post("/clients", clientData);
  },
};
