"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { paymentService } from "@/services/payment.service";
import { useProjects } from "./projects-store";

export type PaymentStatus = "Paid" | "Pending" | "Overdue";

export type Payment = {
  id: string;
  projectId: string;
  project: string | any;
  clientId: string;
  client: string | any;
  milestone: string;
  amount: number;
  status: PaymentStatus;
  date: string;
  notes?: string;
  createdAt?: string;
};

type CreatePaymentInput = Omit<Payment, "id" | "createdAt">;

type PaymentsContextType = {
  payments: Payment[];
  isHydrated: boolean;
  getPaymentsByProjectId: (projectId: string) => Payment[];
  createPayment: (input: CreatePaymentInput) => Promise<Payment>;
  updatePayment: (id: string, patch: Partial<Payment>) => Promise<void>;
  deletePayment: (id: string) => Promise<void>;
  fetchPayments: () => Promise<void>;
};

const PaymentsContext = createContext<PaymentsContextType | undefined>(undefined);

export function PaymentsProvider({ children }: { children: React.ReactNode }) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const { fetchProjects } = useProjects();

  const fetchPayments = async () => {
    try {
      const data = await paymentService.getAllPayments();
      if (data && Array.isArray(data)) {
        const mappedPayments = data.map((p: any) => ({
          ...p,
          id: p._id,
          projectId: p.project?._id || p.project,
          project: p.project?.name || p.project,
          clientId: p.client?._id || p.client,
          client: p.client?.name || p.client,
        }));
        setPayments(mappedPayments);
      }
    } catch (error) {
      console.error("Failed to fetch payments", error);
    } finally {
      setIsHydrated(true);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const api = useMemo<PaymentsContextType>(() => {
    const getPaymentsByProjectId = (projectId: string) => 
      payments.filter((p) => p.projectId === projectId);

    const createPayment = async (input: CreatePaymentInput): Promise<Payment> => {
      const data = await paymentService.createPayment(input) as any;
      const newPayment = {
        ...data,
        id: data._id,
        projectId: data.project?._id || data.project,
        project: data.project?.name || data.project,
        clientId: data.client?._id || data.client,
        client: data.client?.name || data.client,
      };
      setPayments((prev) => [newPayment, ...prev]);
      await fetchProjects();
      return newPayment;
    };

    const updatePayment = async (id: string, patch: Partial<Payment>) => {
      await paymentService.updatePayment(id, patch);
      setPayments((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
      await fetchProjects();
    };

    const deletePayment = async (id: string) => {
      await paymentService.deletePayment(id);
      setPayments((prev) => prev.filter((p) => p.id !== id));
      await fetchProjects();
    };

    return {
      payments,
      isHydrated,
      getPaymentsByProjectId,
      createPayment,
      updatePayment,
      deletePayment,
      fetchPayments,
    };
  }, [payments, isHydrated]);

  return <PaymentsContext.Provider value={api}>{children}</PaymentsContext.Provider>;
}

export function usePayments() {
  const ctx = useContext(PaymentsContext);
  if (!ctx) throw new Error("usePayments must be used within a PaymentsProvider");
  return ctx;
}
