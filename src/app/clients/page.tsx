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
      className: "py-4 px-6",
      render: (client) => (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-sm font-medium text-indigo-600 border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-all font-mono">
            {client.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900">{client.name}</p>
            <p className="text-[10px] font-medium text-slate-500">{client.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Projects",
      className: "py-4 px-6",
      render: (client) => (
        <div className="flex flex-wrap gap-1">
          {client.projects.map((p) => (
            <span key={p} className="px-2 py-0.5 bg-slate-100 text-[9px] font-medium text-slate-600 rounded-md border border-slate-200">
              {p}
            </span>
          ))}
        </div>
      ),
    },
    {
      header: "Contact",
      className: "py-4 px-6",
      render: (client) => (
        <div className="flex items-center gap-2 text-slate-600">
          <Phone className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-medium font-mono">{client.phone}</span>
        </div>
      ),
    },
    {
      header: "Payment Status",
      className: "py-4 px-6",
      render: (client) => (
        <Badge 
          variant="outline" 
          className={cn(
            "text-[10px] font-medium uppercase tracking-wider border",
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
      className: "py-4 px-6 text-right",
      headerClassName: "text-right",
      render: (client) => (
        <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
          <MoreVertical className="w-4 h-4" />
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
      <div className="space-y-10 animate-in fade-in duration-500">
        <div className="flex flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-medium text-slate-900 tracking-tight">Client Directory</h2>
            <p className="text-sm font-medium text-slate-500 hidden sm:block">Manage client relationships and project assignments</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:block">
              <Input placeholder="Search clients..." icon={Search} className="w-64"
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            {canAdd && (
              <Button onClick={() => setIsAddModalOpen(true)} className="gap-2 shadow-lg shadow-indigo-200 font-medium">
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">Add Client</span>
              </Button>
            )}
          </div>
        </div>

        <Card className="overflow-hidden p-0 border-slate-200">
          <DataTable columns={columns} data={filteredClients} />
        </Card>
      </div>

      <Modal isOpen={isAddModalOpen} onClose={() => { setIsAddModalOpen(false); setForm(emptyForm); }} title="Add New Client">
        <form className="space-y-6" onSubmit={handleAdd}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 ml-1">Full Name *</label>
            <Input placeholder="e.g., Alice Johnson" value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 ml-1">Email Address</label>
              <Input type="email" placeholder="e.g., alice@example.com" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="font-mono" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 ml-1">Phone Number</label>
              <Input placeholder="e.g., +1 234 567 890" value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="font-mono" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 ml-1">Payment Status</label>
            <select value={form.paymentStatus}
              onChange={e => setForm(f => ({ ...f, paymentStatus: e.target.value }))}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all">
              <option>Pending</option>
              <option>Paid</option>
              <option>Overdue</option>
            </select>
          </div>
          <div className="flex justify-end gap-4 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => { setIsAddModalOpen(false); setForm(emptyForm); }} type="button" className="font-medium">Cancel</Button>
            <Button type="submit" className="font-medium">Save Client</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
