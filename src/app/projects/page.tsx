"use client";

import { useAuth } from "@/lib/auth-context";
import { projects as initialProjects, supervisors, workers, clients, WORKER_SPECIALIZATIONS } from "@/lib/dummy-data";
import {
  MoreHorizontal, MapPin, Calendar, ChevronRight, Plus, ArrowUpRight,
  LayoutGrid, List, Search, X, HardHat, Users, CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";
import { DataTable, Column } from "@/components/ui/DataTable";

type Project = typeof initialProjects[0];

const defaultStages = [
  "Layout", "Excavation", "Foundation", "Structure", "Brick Work",
  "Plumbing", "Electrical", "Plaster", "Flooring", "Painting", "Interior", "Final Handover",
].map(name => ({ name, status: "Pending" }));

const emptyForm = {
  name: "", client: "", clientId: "", location: "",
  startDate: "", expectedCompletion: "", budget: "",
  supervisorId: "", workerIds: [] as string[],
};

export default function ProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [specFilter, setSpecFilter] = useState("");

  const filteredProjects = projects.filter(p => {
    const match = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.client.toLowerCase().includes(searchQuery.toLowerCase());
    if (user?.role === "client") return match && p.id === user.projectId;
    return match;
  });

  const canAdd = user?.role === "architect";

  const getSupervisorName = (id?: string) =>
    supervisors.find(s => s.id === id)?.name || "—";

  const columns: Column<Project>[] = [
    {
      header: "Project",
      render: (project) => (
        <div>
          <p className="text-sm font-medium text-slate-900 group-hover:text-indigo-600 transition-colors">{project.name}</p>
          <p className="text-xs font-medium text-slate-500">{project.client}</p>
        </div>
      ),
    },
    {
      header: "Location",
      render: (project) => <span className="text-sm font-medium text-slate-600">{project.location}</span>,
    },
    {
      header: "Supervisor",
      render: (project) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-indigo-50 rounded-lg flex items-center justify-center text-[10px] font-medium text-indigo-600 border border-indigo-100 font-mono">
            {getSupervisorName(project.supervisorId).split(" ").map(n => n[0]).join("")}
          </div>
          <span className="text-sm font-medium text-slate-700">{getSupervisorName(project.supervisorId)}</span>
        </div>
      ),
    },
    {
      header: "Status",
      render: (project) => (
        <div className="flex items-center gap-2">
          <div className={cn("w-2 h-2 rounded-full",
            project.status === "In Progress" ? "bg-green-500" : "bg-blue-500")} />
          <span className="text-xs font-medium text-slate-700">{project.status}</span>
        </div>
      ),
    },
    {
      header: "Progress",
      render: (project) => (
        <div className="flex items-center gap-4">
          <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-600" style={{ width: `${project.progress}%` }} />
          </div>
          <span className="text-xs font-medium text-slate-900 font-mono">{project.progress}%</span>
        </div>
      ),
    },
    {
      header: "Action",
      headerClassName: "text-right",
      cellClassName: "text-right",
      render: (project) => (
        <Link href={`/projects/${project.id}`}
          className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700">
          View <ChevronRight className="w-4 h-4" />
        </Link>
      ),
    },
  ];

  const filteredWorkersForForm = workers.filter(w =>
    specFilter === "" || w.specializations.some(s => s.toLowerCase().includes(specFilter.toLowerCase())) ||
    w.name.toLowerCase().includes(specFilter.toLowerCase())
  );

  const toggleWorker = (id: string) => {
    setForm(f => ({
      ...f,
      workerIds: f.workerIds.includes(id)
        ? f.workerIds.filter(w => w !== id)
        : [...f.workerIds, id],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    const clientObj = clients.find(c => c.id === form.clientId);
    const newProject: Project = {
      id: String(Date.now()),
      name: form.name,
      client: clientObj?.name || form.client,
      clientId: form.clientId,
      location: form.location,
      startDate: form.startDate,
      expectedCompletion: form.expectedCompletion,
      status: "Planned",
      progress: 0,
      budget: form.budget,
      received: "$0",
      pending: form.budget,
      supervisorId: form.supervisorId,
      workerIds: form.workerIds,
      stages: defaultStages,
    };
    setProjects(prev => [...prev, newProject]);
    setForm(emptyForm);
    setIsAddModalOpen(false);
  };

  return (
    <>
      <div className="space-y-10 animate-in fade-in duration-500">
        <div className="flex flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-medium text-slate-900 tracking-tight">
              {user?.role === "client" ? "My Project" : "Project Portfolio"}
            </h2>
            <p className="text-sm font-medium text-slate-500 hidden sm:block">
              {user?.role === "client" ? "Track your construction progress" : "Manage and track active construction sites"}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {user?.role !== "client" && (
              <div className="hidden md:block">
                <Input placeholder="Search projects..." icon={Search} className="w-64"
                  value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              </div>
            )}
            {canAdd && (
              <Button onClick={() => setIsAddModalOpen(true)} className="gap-2 font-medium">
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">Add Project</span>
              </Button>
            )}
          </div>
        </div>

        <Card className="overflow-hidden p-0">
          <DataTable columns={columns} data={filteredProjects} />
        </Card>
      </div>

      {/* Create Project Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)}
        title="Create New Project" className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">

          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 ml-1">Project Name *</label>
              <Input placeholder="e.g., Modern Villa" value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 ml-1">Client</label>
              <select value={form.clientId}
                onChange={e => setForm(f => ({ ...f, clientId: e.target.value, client: clients.find(c => c.id === e.target.value)?.name || "" }))}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Select client...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 ml-1">Location</label>
            <Input placeholder="e.g., Beverly Hills, CA" value={form.location}
              onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 ml-1">Start Date</label>
              <Input type="date" value={form.startDate}
                onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 ml-1">Expected Completion</label>
              <Input type="date" value={form.expectedCompletion}
                onChange={e => setForm(f => ({ ...f, expectedCompletion: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 ml-1">Budget</label>
              <Input placeholder="e.g., $850,000" value={form.budget}
                onChange={e => setForm(f => ({ ...f, budget: e.target.value }))} className="font-mono" />
            </div>
          </div>

          {/* Supervisor Assign */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <label className="text-sm font-medium text-slate-700 ml-1 flex items-center gap-2">
              <HardHat className="w-4 h-4 text-indigo-600" /> Assign Supervisor
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {supervisors.map(sup => (
                <button key={sup.id} type="button"
                  onClick={() => setForm(f => ({ ...f, supervisorId: f.supervisorId === sup.id ? "" : sup.id }))}
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left",
                    form.supervisorId === sup.id
                      ? "bg-indigo-50 border-indigo-400"
                      : "bg-white border-slate-100 hover:border-slate-300"
                  )}>
                  <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center text-xs font-medium transition-all",
                    form.supervisorId === sup.id ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600")}>
                    {sup.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{sup.name}</p>
                    <p className="text-[10px] text-slate-500 font-medium">{sup.experience}</p>
                  </div>
                  {form.supervisorId === sup.id && (
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 ml-auto flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Workers Assign */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <label className="text-sm font-medium text-slate-700 ml-1 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              Assign Workers
              {form.workerIds.length > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-indigo-600 text-white text-[10px] font-medium rounded-full font-mono">
                  {form.workerIds.length} selected
                </span>
              )}
            </label>
            <Input placeholder="Filter by name or specialization..."
              value={specFilter} onChange={e => setSpecFilter(e.target.value)} icon={Search} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-52 overflow-y-auto pr-1">
              {filteredWorkersForForm.map(w => {
                const selected = form.workerIds.includes(w.id);
                return (
                  <button key={w.id} type="button" onClick={() => toggleWorker(w.id)}
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left",
                      selected ? "bg-indigo-50 border-indigo-400" : "bg-white border-slate-100 hover:border-slate-300"
                    )}>
                    <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center text-xs font-medium flex-shrink-0 transition-all font-mono",
                      selected ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600")}>
                      {w.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900 truncate">{w.name}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {w.specializations.map(s => (
                          <span key={s} className="text-[9px] font-medium text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 uppercase tracking-wider">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                    {selected && <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-slate-100">
            <Button variant="secondary" type="button" onClick={() => { setIsAddModalOpen(false); setForm(emptyForm); }}>
              Cancel
            </Button>
            <Button type="submit">Create Project</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
