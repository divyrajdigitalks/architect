"use client";

import { workers as initialWorkers } from "@/lib/dummy-data";
import { useState } from "react";
import { Plus, Search, Mail, Phone, Briefcase, UserCircle2, MoreVertical, ShieldCheck, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";
import { useAuth } from "@/lib/auth-context";

type Employee = typeof initialWorkers[0];

export default function OfficeTeamPage() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>(initialWorkers.filter(w => w.team === "Office"));
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newEmployee, setNewEmployee] = useState({ name: "", type: "", email: "", phone: "", experience: "" });

  const canEdit = user?.role === "architect" || user?.role === "super-admin";

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmployee.name.trim()) return;
    const created: Employee = {
      id: String(Date.now()),
      ...newEmployee,
      team: "Office",
      specializations: [],
      assignedProjects: [],
      joinDate: new Date().toISOString().split("T")[0],
      address: "",
      rate: "₹500/hour"
    } as any;
    setEmployees(prev => [...prev, created]);
    setNewEmployee({ name: "", type: "", email: "", phone: "", experience: "" });
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Office Team</h2>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">Manage architects, designers, and office staff</p>
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
            <Button onClick={() => setIsAddModalOpen(true)} className="gap-2 shadow-lg shadow-indigo-200">
              <Plus className="w-5 h-5" />
              Add Member
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredEmployees.map((emp) => (
          <Card key={emp.id} className="p-8 space-y-6 group hover:border-indigo-200 transition-all duration-500 hover:shadow-xl hover:shadow-indigo-500/5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-2xl font-black text-indigo-600 border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shadow-inner">
                  {emp.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{emp.name}</h3>
                  <p className="text-xs font-black text-indigo-500 uppercase tracking-widest">{emp.type}</p>
                </div>
              </div>
              <button className="p-2 text-slate-300 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 pt-2 border-t border-slate-50">
              <div className="flex items-center gap-3 text-slate-500 group-hover:text-indigo-600 transition-colors">
                <Mail className="w-4 h-4 text-slate-400 group-hover:text-indigo-400" />
                <span className="text-sm font-medium">{emp.email || "no-email@archisite.pro"}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-500 group-hover:text-indigo-600 transition-colors">
                <Phone className="w-4 h-4 text-slate-400 group-hover:text-indigo-400" />
                <span className="text-sm font-medium">{emp.phone}</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group-hover:bg-indigo-50/50 group-hover:border-indigo-100 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Projects</span>
                <span className="text-[10px] font-black text-indigo-600 uppercase">{emp.assignedProjects.length} Projects</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {emp.assignedProjects.length > 0 ? emp.assignedProjects.map(p => (
                  <span key={p} className="px-2 py-0.5 bg-white text-[10px] font-bold text-slate-600 rounded-lg border border-slate-200 group-hover:border-indigo-200">
                    {p}
                  </span>
                )) : (
                  <span className="text-[10px] font-medium text-slate-400 italic">No projects assigned</span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-green-500" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Access</span>
              </div>
              <span className="px-3 py-1 bg-green-50 text-green-700 text-[10px] font-black rounded-lg border border-green-100 uppercase tracking-widest">
                Active
              </span>
            </div>

            <Button variant="secondary" className="w-full text-xs font-bold py-3 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
              View Full Profile
            </Button>
          </Card>
        ))}
      </div>

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Office Member">
        <form onSubmit={handleAdd} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Full Name</label>
              <Input placeholder="e.g., Sarah Jenkins" value={newEmployee.name} onChange={e => setNewEmployee(f => ({ ...f, name: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Job Title</label>
              <select 
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={newEmployee.type}
                onChange={e => setNewEmployee(f => ({ ...f, type: e.target.value }))}
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
              <label className="text-sm font-bold text-slate-700 ml-1">Email</label>
              <Input type="email" placeholder="sarah@archisite.pro" value={newEmployee.email} onChange={e => setNewEmployee(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Phone</label>
              <Input placeholder="+1 (555) 000-0000" value={newEmployee.phone} onChange={e => setNewEmployee(f => ({ ...f, phone: e.target.value }))} />
            </div>
          </div>
          <div className="flex justify-end gap-4 pt-4 border-t border-slate-100">
            <Button variant="secondary" type="button" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button type="submit">Add Member</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
