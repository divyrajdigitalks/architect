"use client";

import { clients as initialClients } from "@/lib/dummy-data";
import { useState } from "react";
import { Plus, Search, Phone, Mail, MoreVertical, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { useAuth } from "@/lib/auth-context";

type Client = typeof initialClients[0];

const emptyForm = { name: "", email: "", phone: "", projects: [] as string[], paymentStatus: "Pending" };

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { DataTable, Column } from "@/components/ui/DataTable";

export default function ClientsPage() {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [form, setForm] = useState(emptyForm);

  const canAdd = user?.role === "architect" || user?.role === "director";

  const columns: Column<Client>[] = [
    {
      header: "Client",
      className: "py-3 px-4",
      render: (client) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-[10px] font-bold text-indigo-600 border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-all">
            {client.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-900">{client.name}</p>
            <p className="text-[9px] font-medium text-slate-500">{client.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Projects",
      className: "py-3 px-4",
      render: (client) => (
        <div className="flex flex-wrap gap-1">
          {client.projects.map((p) => (
            <span key={p} className="px-1.5 py-0 rounded-md bg-slate-100 text-[8px] font-bold text-slate-600 border border-slate-200">
              {p}
            </span>
          ))}
        </div>
      ),
    },
    {
      header: "Contact",
      className: "py-3 px-4",
      render: (client) => (
        <div className="flex items-center gap-1.5 text-slate-600">
          <Phone className="w-3 h-3 text-slate-400" />
          <span className="text-[10px] font-semibold">{client.phone}</span>
        </div>
      ),
    },
    {
      header: "Payment",
      className: "py-3 px-4",
      render: (client) => (
        <Badge 
          variant="outline" 
          className={cn(
            "text-[8px] font-bold uppercase tracking-wider border px-1.5 py-0",
            client.paymentStatus === "Paid" ? "bg-green-50 text-green-700 border-green-100" :
            client.paymentStatus === "Pending" ? "bg-indigo-50 text-indigo-700 border-indigo-100" :
            "bg-red-50 text-red-700 border-red-100"
          )}
        >
          {client.paymentStatus}
        </Badge>
      ),
    },
    {
      header: "Actions",
      className: "py-3 px-4 text-right",
      headerClassName: "text-right",
      render: (client) => (
        <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-all">
          <MoreVertical className="w-3.5 h-3.5" />
        </button>
      ),
    },
  ];

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setClients(prev => [...prev, {
      id: String(Date.now()),
      ...form,
      projects: form.projects,
    }]);
    setForm(emptyForm);
    setIsAddModalOpen(false);
  };

  return (
    <>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-row items-center justify-between gap-6">
          <div className="space-y-0.5">
            <h2 className="text-xl font-semibold text-slate-900 tracking-tight">Client Directory</h2>
            <p className="text-xs font-medium text-slate-500 hidden sm:block">Manage client relationships and project assignments</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden md:block">
              <Input placeholder="Search clients..." icon={Search} className="w-56 h-9 text-xs"
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            {canAdd && (
              <Button size="sm" onClick={() => setIsAddModalOpen(true)} className="gap-2 shadow-sm font-medium">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Client</span>
              </Button>
            )}
          </div>
        </div>

        <Card className="overflow-hidden border-slate-200">
          <DataTable columns={columns} data={filteredClients} />
        </Card>
      </div>

      <Modal isOpen={isAddModalOpen} onClose={() => { setIsAddModalOpen(false); setForm(emptyForm); }} title="Add New Client">
        <form className="space-y-4" onSubmit={handleAdd}>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 ml-1">Full Name *</label>
            <Input placeholder="e.g., Alice Johnson" value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required className="h-9 text-xs" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 ml-1">Email Address</label>
              <Input type="email" placeholder="e.g., alice@example.com" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="h-9 text-xs" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 ml-1">Phone Number</label>
              <Input placeholder="e.g., +1 234 567 890" value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="h-9 text-xs" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 ml-1">Payment Status</label>
            <select value={form.paymentStatus}
              onChange={e => setForm(f => ({ ...f, paymentStatus: e.target.value }))}
              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-md text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all">
              <option>Pending</option>
              <option>Paid</option>
              <option>Overdue</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button size="sm" variant="secondary" onClick={() => { setIsAddModalOpen(false); setForm(emptyForm); }} type="button" className="font-medium">Cancel</Button>
            <Button size="sm" type="submit" className="font-medium">Save Client</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
