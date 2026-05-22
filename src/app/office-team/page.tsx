"use client";

import { workers as initialWorkers } from "@/lib/dummy-data";
import { useState } from "react";
import { Plus, Search, Mail, Phone, Briefcase, UserCircle2, MoreVertical, ShieldCheck, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { DataTable, Column } from "@/components/ui/DataTable";
import Modal from "@/components/ui/Modal";
import { useAuth } from "@/lib/auth-context";

type Employee = typeof initialWorkers[0];

export default function OfficeTeamPage() {
  const { user } = useAuth();
  const [members, setMembers] = useState<Employee[]>(initialWorkers.filter(w => w.team === "Office"));
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newMember, setNewMember] = useState({ name: "", type: "Architect", email: "", phone: "", experience: "" });

  const canEdit = user?.role === "architect" || user?.role === "super-admin";

  const columns: Column<Employee>[] = [
    {
      header: "Member",
      className: "py-4 px-6",
      render: (member) => (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-sm font-medium text-indigo-600 border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-all font-mono">
            {member.name.split(" ").map(n => n[0]).join("")}
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900">{member.name}</p>
            <p className="text-[10px] font-normal text-slate-500">{member.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Role",
      className: "py-4 px-6",
      render: (member) => (
        <Badge variant="outline" className="text-[10px] font-medium text-indigo-600 bg-indigo-50 border-indigo-100 uppercase">
          {member.type}
        </Badge>
      ),
    },
    {
      header: "Contact",
      className: "py-4 px-6",
      render: (member) => (
        <div className="flex items-center gap-2 text-slate-600">
          <Phone className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-normal font-mono">{member.phone}</span>
        </div>
      ),
    },
    {
      header: "Experience",
      className: "py-4 px-6",
      render: (member) => <span className="text-xs font-medium text-slate-700">{member.experience || "—"}</span>,
    },
    {
      header: "Actions",
      className: "py-4 px-6 text-right",
      headerClassName: "text-right",
      render: (member) => (
        <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
          <MoreVertical className="w-4 h-4" />
        </button>
      ),
    },
  ];

  const filteredMembers = members.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMember.name.trim()) return;
    const created: Employee = {
      id: String(Date.now()),
      ...newMember,
      team: "Office",
      specializations: [],
      assignedProjects: [],
      joinDate: new Date().toISOString().split("T")[0],
      address: "",
      rate: "—",
      email: newMember.email || `${newMember.name.toLowerCase().replace(/\s+/g, ".")}@archisite.pro`
    } as any;
    setMembers(prev => [...prev, created]);
    setNewMember({ name: "", type: "Architect", email: "", phone: "", experience: "" });
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-3xl font-medium text-slate-900 tracking-tight">Office Team</h2>
          <p className="text-sm font-medium text-slate-500 uppercase tracking-widest mt-1">Manage architects, designers, and office staff</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:block">
            <Input 
              placeholder="Search team..." 
              icon={Search} 
              className="w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {canEdit && (
            <Button onClick={() => setIsAddModalOpen(true)} className="gap-2 shadow-lg shadow-indigo-200 font-medium">
              <Plus className="w-5 h-5" />
              Add Member
            </Button>
          )}
        </div>
      </div>

      <Card className="overflow-hidden p-0 border-slate-200">
        <DataTable columns={columns} data={filteredMembers} />
      </Card>

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Office Member">
        <form onSubmit={handleAdd} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 ml-1">Full Name</label>
              <Input placeholder="e.g., Sarah Jenkins" value={newMember.name} onChange={e => setNewMember(f => ({ ...f, name: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 ml-1">Job Title</label>
              <select 
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={newMember.type}
                onChange={e => setNewMember(f => ({ ...f, type: e.target.value }))}
                required
              >
                <option value="">Select Role</option>
                <option>Architect</option>
                <option>Interior Designer</option>
                <option>Project Manager</option>
                <option>Accountant</option>
                <option>HR Manager</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 ml-1">Email</label>
              <Input type="email" placeholder="sarah@archisite.pro" value={newMember.email} onChange={e => setNewMember(f => ({ ...f, email: e.target.value }))} className="font-mono" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 ml-1">Phone</label>
              <Input placeholder="+1 (555) 000-0000" value={newMember.phone} onChange={e => setNewMember(f => ({ ...f, phone: e.target.value }))} className="font-mono" />
            </div>
          </div>
          <div className="flex justify-end gap-4 pt-4 border-t border-slate-100">
            <Button variant="secondary" type="button" onClick={() => setIsAddModalOpen(false)} className="font-medium">Cancel</Button>
            <Button type="submit" className="font-medium">Add Member</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
