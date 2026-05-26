"use client";

import { useState } from "react";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical,
  Calendar,
  CreditCard,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  LayoutGrid,
  List
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";

const payments = [
  { id: "1", project: "Modern Villa", client: "Alice Johnson", amount: "$12,500", status: "Paid", date: "2024-03-12" },
  { id: "2", project: "City Heights", client: "Bob Smith", amount: "$8,250", status: "Pending", date: "2024-03-15" },
  { id: "3", project: "Lakeview Residence", client: "Charlie Brown", amount: "$15,000", status: "Overdue", date: "2024-03-01" },
];

import { useAuth } from "@/lib/auth-context";

export default function PaymentsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "architect" || user?.role === "director" || user?.role === "accountant";
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <>
      <div className="space-y-6 animate-in fade-in duration-500 w-full p-4 sm:p-6">
        <div className="flex flex-row items-center justify-between gap-4">
          <div className="space-y-0.5">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Financial Overview</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:block">Budget & Payment Tracking</p>
          </div>
          
          {isAdmin && (
            <Button 
              onClick={() => setIsAddModalOpen(true)} 
              size="sm"
              className="gap-2 shadow-md shadow-indigo-100 font-bold text-xs"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Payment</span>
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Total Revenue", value: "$425,000", icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
            { label: "Pending Payments", value: "$12,250", icon: CreditCard, color: "text-indigo-600", bg: "bg-indigo-50" },
            { label: "Outstanding Costs", value: "$8,500", icon: TrendingDown, color: "text-orange-600", bg: "bg-orange-50" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-all duration-300">
              <div className={cn("p-3 rounded-xl", stat.bg)}>
                <stat.icon className={cn("w-5 h-5", stat.color)} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{stat.label}</p>
                <p className="text-xl font-bold text-slate-900 tracking-tight">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50">
                <TableHead className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest">Project / Client</TableHead>
                <TableHead className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest">Amount</TableHead>
                <TableHead className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest">Status</TableHead>
                <TableHead className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest">Date</TableHead>
                <TableHead className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-widest">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100">
              {payments.map((payment) => (
                <TableRow key={payment.id} className="group hover:bg-slate-50/30 transition-colors">
                  <TableCell className="px-6 py-4">
                    <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{payment.project}</p>
                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{payment.client}</p>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <span className="text-xs font-bold text-slate-900">{payment.amount}</span>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <span className={cn(
                      "px-2 py-0.5 rounded-md text-[9px] font-black border uppercase tracking-widest",
                      payment.status === "Paid" ? "bg-green-50 text-green-700 border-green-100" :
                      payment.status === "Pending" ? "bg-indigo-50 text-indigo-700 border-indigo-100" :
                      "bg-red-50 text-red-700 border-red-100"
                    )}>
                      {payment.status}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">{payment.date}</TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        title="Record New Payment"
      >
        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); setIsAddModalOpen(false); }}>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Project Name</label>
            <Input placeholder="e.g., Modern Villa" required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Client Name</label>
              <Input placeholder="e.g., Alice Johnson" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Amount</label>
              <Input placeholder="e.g., $10,000" required />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Payment Date</label>
              <Input type="date" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Status</label>
              <select className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all">
                <option>Paid</option>
                <option>Pending</option>
                <option>Overdue</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-4 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)} type="button">
              Cancel
            </Button>
            <Button type="submit">
              Record Payment
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
