"use client";

import { useState } from "react";
import { supervisors as initialSupervisors, projects } from "@/lib/dummy-data";
import {
  Plus, Search, Phone, Mail, Briefcase, X, LayoutGrid, List,
  Calendar, HardHat, UserCircle2, CheckCircle2, ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { useAuth } from "@/lib/auth-context";
import { useRoles } from "@/lib/role-context";

type Supervisor = {
  id: string;
  name: string;
  phone: string;
  email: string;
  experience: string;
  assignedProjects: string[];
  joinDate: string;
  assignedRole?: string;
};

export default function SupervisorsPage() {
  const { user } = useAuth();
  const [supervisors, setSupervisors] = useState<Supervisor[]>(initialSupervisors);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [profileSupervisor, setProfileSupervisor] = useState<Supervisor | null>(null);
  const [assignSupervisor, setAssignSupervisor] = useState<Supervisor | null>(null);
  const [newForm, setNewForm] = useState({ name: "", phone: "", email: "", experience: "" });

  const { roles } = useRoles();
  const canEdit = user?.role === "architect";

  const filtered = supervisors.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getProjectName = (id: string) => projects.find(p => p.id === id)?.name || id;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newForm.name.trim()) return;
    setSupervisors(prev => [...prev, {
      id: "s" + Date.now(),
      ...newForm,
      assignedProjects: [],
      joinDate: new Date().toISOString().split("T")[0],
    }]);
    setNewForm({ name: "", phone: "", email: "", experience: "" });
    setIsAddModalOpen(false);
  };

  const toggleProjectAssign = (supervisorId: string, projectId: string) => {
    setSupervisors(prev => prev.map(s => {
      if (s.id !== supervisorId) return s;
      const already = s.assignedProjects.includes(projectId);
      return {
        ...s,
        assignedProjects: already
          ? s.assignedProjects.filter(p => p !== projectId)
          : [...s.assignedProjects, projectId],
      };
    }));
    // also update the local assignSupervisor state so modal reflects change
    setAssignSupervisor(prev => {
      if (!prev || prev.id !== supervisorId) return prev;
      const already = prev.assignedProjects.includes(projectId);
      return {
        ...prev,
        assignedProjects: already
          ? prev.assignedProjects.filter(p => p !== projectId)
          : [...prev.assignedProjects, projectId],
      };
    });
  };

  return (
    <>
      <div className="space-y-10 animate-in fade-in duration-500">
        <div className="flex flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Supervisors</h2>
            <p className="text-sm font-medium text-slate-500 hidden sm:block">Manage site supervisors and their project assignments</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:block">
              <Input placeholder="Search supervisors..." icon={Search} className="w-64"
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
            <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-sm h-[46px]">
              <Button variant={view === "grid" ? "white" : "ghost"} size="icon"
                onClick={() => setView("grid")}
                className={cn("p-2 rounded-lg", view === "grid" ? "text-indigo-600 shadow-sm" : "text-slate-400")}>
                <LayoutGrid className="w-5 h-5" />
              </Button>
              <Button variant={view === "list" ? "white" : "ghost"} size="icon"
                onClick={() => setView("list")}
                className={cn("p-2 rounded-lg", view === "list" ? "text-indigo-600 shadow-sm" : "text-slate-400")}>
                <List className="w-5 h-5" />
              </Button>
            </div>
            {canEdit && (
              <Button onClick={() => setIsAddModalOpen(true)} className="gap-2">
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">Add Supervisor</span>
              </Button>
            )}
          </div>
        </div>

        {view === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map(sup => (
              <Card key={sup.id} className="p-7 space-y-6 group hover:border-indigo-200 transition-all">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-xl font-black text-indigo-600 border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                      {sup.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{sup.name}</h3>
                      <p className="text-xs font-medium text-slate-500">{sup.experience} experience</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-indigo-50 text-[10px] font-black text-indigo-600 rounded-lg border border-indigo-100 uppercase tracking-widest">
                    Supervisor
                  </span>
                </div>

                {/* Contact */}
                <div className="space-y-2 pt-2 border-t border-slate-50">
                  <div className="flex items-center gap-3 text-slate-500">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-medium">{sup.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-500">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-medium">{sup.email}</span>
                  </div>
                </div>

                {/* Assigned Projects */}
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assigned Projects</p>
                  {sup.assignedProjects.length === 0 ? (
                    <p className="text-xs font-medium text-slate-400 italic">No projects assigned</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {sup.assignedProjects.map(pid => (
                        <span key={pid} className="px-2.5 py-1 bg-green-50 text-green-700 text-[10px] font-bold rounded-lg border border-green-100 uppercase tracking-wider">
                          {getProjectName(pid)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Role Assignment */}
                {canEdit && (
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Role</p>
                    <select
                      value={sup.assignedRole ?? "supervisor"}
                      onChange={e => setSupervisors(prev => prev.map(s => s.id === sup.id ? { ...s, assignedRole: e.target.value } : s))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer">
                      {roles.filter(r => r.id !== "architect" && r.id !== "client").map(r => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-2 border-t border-slate-50">
                  <Button variant="secondary" className="flex-1 text-xs" onClick={() => setProfileSupervisor(sup)}>
                    View Profile
                  </Button>
                  {canEdit && (
                    <Button variant="outline" className="flex-1 text-xs text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                      onClick={() => setAssignSupervisor(supervisors.find(s => s.id === sup.id) || sup)}>
                      Assign Project
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="overflow-hidden p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Supervisor</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Assigned Projects</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(sup => (
                  <TableRow key={sup.id} className="group">
                    <TableCell>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-sm font-bold text-indigo-600 border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                          {sup.name.split(" ").map(n => n[0]).join("")}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{sup.name}</p>
                          <p className="text-xs text-slate-500">{sup.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><span className="text-sm font-medium text-slate-600">{sup.phone}</span></TableCell>
                    <TableCell><span className="text-sm font-medium text-slate-600">{sup.experience}</span></TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1.5">
                        {sup.assignedProjects.length === 0
                          ? <span className="text-xs text-slate-400 italic">None</span>
                          : sup.assignedProjects.map(pid => (
                            <span key={pid} className="px-2 py-0.5 bg-green-50 text-green-700 text-[10px] font-bold rounded border border-green-100">
                              {getProjectName(pid)}
                            </span>
                          ))
                        }
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {canEdit && (
                          <select
                            value={sup.assignedRole ?? "supervisor"}
                            onChange={e => setSupervisors(prev => prev.map(s => s.id === sup.id ? { ...s, assignedRole: e.target.value } : s))}
                            className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer">
                            {roles.filter(r => r.id !== "architect" && r.id !== "client").map(r => (
                              <option key={r.id} value={r.id}>{r.name}</option>
                            ))}
                          </select>
                        )}
                        <Button variant="ghost" className="text-indigo-600 font-bold text-xs" onClick={() => setProfileSupervisor(sup)}>Profile</Button>
                        {canEdit && (
                          <Button variant="ghost" className="text-slate-500 font-bold text-xs"
                            onClick={() => setAssignSupervisor(supervisors.find(s => s.id === sup.id) || sup)}>Assign</Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>

      {/* Add Supervisor Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Supervisor">
        <form onSubmit={handleAdd} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Full Name</label>
              <Input placeholder="e.g., Rahul Verma" value={newForm.name} onChange={e => setNewForm(f => ({ ...f, name: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Phone</label>
              <Input placeholder="e.g., 555-3001" value={newForm.phone} onChange={e => setNewForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Email</label>
              <Input placeholder="e.g., rahul@site.pro" value={newForm.email} onChange={e => setNewForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Experience</label>
              <Input placeholder="e.g., 5 years" value={newForm.experience} onChange={e => setNewForm(f => ({ ...f, experience: e.target.value }))} />
            </div>
          </div>
          <div className="flex justify-end gap-4 pt-4 border-t border-slate-100">
            <Button variant="secondary" type="button" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button type="submit">Add Supervisor</Button>
          </div>
        </form>
      </Modal>

      {/* Profile Modal */}
      {profileSupervisor && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-indigo-600 p-8 relative">
              <button onClick={() => setProfileSupervisor(null)} className="absolute top-5 right-5 w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30 transition-all">
                <X className="w-5 h-5 text-white" />
              </button>
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 bg-white/20 rounded-[1.5rem] flex items-center justify-center text-3xl font-black text-white border-2 border-white/30">
                  {profileSupervisor.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white">{profileSupervisor.name}</h3>
                  <p className="text-indigo-200 font-bold text-sm uppercase tracking-widest mt-1">Site Supervisor</p>
                </div>
              </div>
            </div>
            <div className="p-8 space-y-5">
              {/* Role Badge */}
              <div className="flex items-center gap-3 p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                <div className="flex-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Role</p>
                  <p className="text-sm font-bold text-indigo-700">
                    {roles.find(r => r.id === (profileSupervisor.assignedRole ?? "supervisor"))?.name ?? "Supervisor"}
                  </p>
                </div>
                {canEdit && (
                  <select
                    value={profileSupervisor.assignedRole ?? "supervisor"}
                    onChange={e => {
                      const val = e.target.value;
                      setSupervisors(prev => prev.map(s => s.id === profileSupervisor.id ? { ...s, assignedRole: val } : s));
                      setProfileSupervisor(prev => prev ? { ...prev, assignedRole: val } : prev);
                    }}
                    className="px-3 py-1.5 border border-indigo-200 rounded-xl text-xs font-bold text-indigo-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer">
                    {roles.filter(r => r.id !== "architect" && r.id !== "client").map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                )}
              </div>
              {[
                { icon: Phone, label: "Phone", value: profileSupervisor.phone },
                { icon: Mail, label: "Email", value: profileSupervisor.email },
                { icon: HardHat, label: "Experience", value: profileSupervisor.experience },
                { icon: Calendar, label: "Joined", value: profileSupervisor.joinDate },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-200 shadow-sm">
                    <Icon className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
                    <p className="text-sm font-bold text-slate-900">{value}</p>
                  </div>
                </div>
              ))}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Assigned Projects</p>
                {profileSupervisor.assignedProjects.length === 0 ? (
                  <p className="text-sm text-slate-400 italic">No projects assigned</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {profileSupervisor.assignedProjects.map(pid => (
                      <span key={pid} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-100">
                        {getProjectName(pid)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Project Modal */}
      {assignSupervisor && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Assign Projects</h3>
                  <p className="text-sm text-slate-500 mt-1">to {assignSupervisor.name}</p>
                </div>
                <button onClick={() => setAssignSupervisor(null)} className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center hover:bg-slate-200 transition-all">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              <div className="space-y-3">
                {projects.map(project => {
                  const isAssigned = assignSupervisor.assignedProjects.includes(project.id);
                  return (
                    <button
                      key={project.id}
                      onClick={() => toggleProjectAssign(assignSupervisor.id, project.id)}
                      className={cn(
                        "w-full flex items-center justify-between p-5 rounded-2xl border-2 transition-all text-left",
                        isAssigned
                          ? "bg-indigo-50 border-indigo-300"
                          : "bg-white border-slate-100 hover:border-slate-300"
                      )}
                    >
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{project.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{project.location} · {project.status}</p>
                      </div>
                      <div className={cn(
                        "w-7 h-7 rounded-xl flex items-center justify-center border-2 transition-all",
                        isAssigned ? "bg-indigo-600 border-indigo-600" : "bg-white border-slate-200"
                      )}>
                        {isAssigned && <CheckCircle2 className="w-4 h-4 text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100">
                <Button className="w-full" onClick={() => setAssignSupervisor(null)}>Save Assignments</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
