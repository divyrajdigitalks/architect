import { api } from "./api";

export const paymentService = {
  async getAllPayments() {
    return api.get("/payments");
  },
  async getPaymentById(id: string) {
    return api.get(`/payments/${id}`);
  },
  async createPayment(paymentData: any) {
    return api.post("/payments", paymentData);
  },
  async updatePayment(id: string, paymentData: any) {
    return api.put(`/payments/${id}`, paymentData);
  },
  async deletePayment(id: string) {
    return api.delete(`/payments/${id}`);
  },
};
