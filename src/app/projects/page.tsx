"use client";

import { useAuth } from "@/lib/auth-context";
import { useProjects } from "@/lib/projects-store";
import { staffService, StaffMember } from "@/services/staff.service";
import { projectService } from "@/services/project.service";
import {
  MapPin, ChevronRight, Plus, Search, HardHat, CheckCircle2, UserCircle2,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { DataTable, Column } from "@/components/ui/DataTable";

type Project = ReturnType<typeof useProjects>["projects"][0];

const defaultStages = [
  "Layout", "Excavation", "Foundation", "Structure", "Brick Work",
  "Plumbing", "Electrical", "Plaster", "Flooring", "Painting", "Interior", "Final Handover",
].map(name => ({ name, status: "Pending" as const }));

const emptyForm = {
  name: "", clientId: "", location: "",
  startDate: "", expectedCompletion: "", budget: "",
  designerId: "",
};

export default function ProjectsPage() {
  const { user } = useAuth();
  const { projects, createProject, fetchProjects } = useProjects() as any;
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (isAddModalOpen) {
        setIsLoadingData(true);
        try {
          const staffData = await staffService.getAllStaff();
          setStaff(staffData);
        } catch (error) {
          console.error("Error loading modal data:", error);
        } finally {
          setIsLoadingData(false);
        }
      }
    };
    loadData();
  }, [isAddModalOpen]);

  // Staff with "client" role
  const clientStaff = staff.filter(s =>
    s.role?.name?.toLowerCase() === "client"
  );

  // Staff with designer/architect/director roles
  const designers = staff.filter(s => {
    const rn = s.role?.name?.toLowerCase() ?? "";
    return rn === "designer";
  });

  const filteredProjects = projects.filter((p: any) => {
    const match =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.client?.toLowerCase().includes(searchQuery.toLowerCase());
    if (user?.role === "client") return match && p.id === user.projectId;
    return match;
  });

  const canAdd = user?.role === "architect" || user?.role === "director";

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
      header: "Designer",
      render: (project: any) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-indigo-50 rounded-lg flex items-center justify-center text-[10px] font-medium text-indigo-600 border border-indigo-100 font-mono">
            {project.designer?.name?.[0] || "—"}
          </div>
          <span className="text-sm font-medium text-slate-700">{project.designer?.name || "—"}</span>
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    
    if (!form.clientId) {
      alert("Please select a client for this project");
      return;
    }

    try {
      await projectService.createProject({
        name: form.name,
        client: form.clientId,
        location: form.location,
        startDate: form.startDate,
        expectedCompletion: form.expectedCompletion,
        budget: form.budget,
        designer: form.designerId,
        stages: defaultStages,
      });

      if (fetchProjects) await fetchProjects();
      setForm(emptyForm);
      setIsAddModalOpen(false);
    } catch (error) {
      console.error("Error creating project:", error);
      alert("Failed to create project");
    }
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
        <DataTable columns={columns} data={filteredProjects} />
      </div>

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)}
        title="Create New Project" className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">

          {/* Project Name & Client Selection - Side by Side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 ml-1">Project Name *</label>
              <Input 
                placeholder="e.g., Modern Villa" 
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))} 
                required 
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 ml-1 flex items-center gap-2">
                <UserCircle2 className="w-4 h-4 text-indigo-600" /> Select Client *
              </label>
              {isLoadingData ? (
                <div className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-400 bg-slate-50">
                  Loading clients...
                </div>
              ) : clientStaff.length === 0 ? (
                <div className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-400 bg-slate-50">
                  No clients found
                </div>
              ) : (
                <select
                  value={form.clientId}
                  onChange={e => setForm(f => ({ ...f, clientId: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a client...</option>
                  {clientStaff.map(client => (
                    <option key={client._id} value={client._id}>
                      {client.name} ({client.email})
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 ml-1">Location</label>
            <Input 
              placeholder="e.g., Ahmedabad, Gujarat" 
              value={form.location}
              onChange={e => setForm(f => ({ ...f, location: e.target.value }))} 
            />
          </div>

          {/* Dates & Budget */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 ml-1">Start Date</label>
              <Input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 ml-1">Expected Completion</label>
              <Input type="date" value={form.expectedCompletion} onChange={e => setForm(f => ({ ...f, expectedCompletion: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 ml-1">Budget</label>
              <Input placeholder="e.g., ₹85,00,000" value={form.budget}
                onChange={e => setForm(f => ({ ...f, budget: e.target.value }))} className="font-mono" />
            </div>
          </div>

          {/* Designer Selection */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <label className="text-sm font-medium text-slate-700 ml-1 flex items-center gap-2">
              <HardHat className="w-4 h-4 text-indigo-600" /> Assign Designer (Optional)
            </label>
            {isLoadingData ? (
              <p className="text-xs text-slate-400 ml-1">Loading designers…</p>
            ) : designers.length === 0 ? (
              <p className="text-xs text-slate-400 ml-1 italic">No designers found. Add staff with Architect / Designer / Director role.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {designers.map(des => (
                  <button
                    key={des._id}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, designerId: f.designerId === des._id ? "" : des._id }))}
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left",
                      form.designerId === des._id
                        ? "bg-indigo-50 border-indigo-400 shadow-sm"
                        : "bg-white border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all flex-shrink-0",
                      form.designerId === des._id 
                        ? "bg-indigo-600 text-white shadow-sm" 
                        : "bg-slate-100 text-slate-600"
                    )}>
                      {des.name?.[0]?.toUpperCase() || "D"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-900 truncate">{des.name}</p>
                      <p className="text-xs text-slate-500">{des.role?.name}</p>
                      {des.email && (
                        <p className="text-xs text-slate-400 truncate">{des.email}</p>
                      )}
                    </div>
                    {form.designerId === des._id && (
                      <CheckCircle2 className="w-5 h-5 text-indigo-600 ml-auto flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-slate-100">
            <Button 
              variant="secondary" 
              type="button" 
              onClick={() => { 
                setIsAddModalOpen(false); 
                setForm(emptyForm); 
              }}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={!form.name.trim() || !form.clientId}
            >
              Create Project
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}