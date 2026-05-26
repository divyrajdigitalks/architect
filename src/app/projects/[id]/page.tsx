"use client";

import {
  ArrowLeft,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  ClipboardList,
  Camera,
  ChevronRight,
  Construction,
  CircleCheck,
  CircleDashed,
  CircleDot,
  Users,
  CreditCard,
  History,
  TrendingUp,
  DollarSign,
  AlertCircle,
  ArrowUpRight,
  Plus,
  PenTool,
  Hammer,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useState, use, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useProjects } from "@/lib/projects-store";
import { useOfficeTasks } from "@/lib/office-tasks-store";
import { useSiteTasks } from "@/lib/site-tasks-store";
import { useSiteUpdates } from "@/lib/site-updates-store";
import { useTasks } from "@/lib/tasks-store";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { DesignModule } from "@/components/projects/DesignModule";
import { ExecutionModule } from "@/components/projects/ExecutionModule";
import { sitePhotoService } from "@/services/sitePhoto.service";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";

type Tab = "office-work" | "site-work" | "tasks" | "workers" | "updates" | "photos" | "payments" | "timeline";

export default function ProjectDetailsPage({ params }: { params: any }) {
  const resolvedParams = params instanceof Promise ? use(params) : params;
  const id = resolvedParams?.id;
  const { user } = useAuth();
  const { getProjectById, updateStageStatus } = useProjects();
  const { officeTasks, updateOfficeTaskStatus } = useOfficeTasks();
  const { siteTasks, updateSiteTaskStatus } = useSiteTasks();
  const { getTasksByProjectId } = useTasks();
  const { updates: allSiteUpdates } = useSiteUpdates();

  const project = getProjectById(id);
  const [activeTab, setActiveTab] = useState<Tab>("office-work");
  const [stages, setStages] = useState(project?.stages ?? []);
  const [projectPhotos, setProjectPhotos] = useState<{ id: string; url: string; date: string }[]>([]);
  const [photosLoading, setPhotosLoading] = useState(false);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (project) setStages(project.stages);
  }, [project]);

  useEffect(() => {
    if (activeTab === "photos" && project) {
      setPhotosLoading(true);
      sitePhotoService.getPhotosByProject(project.id)
        .then((data: any) => {
          setProjectPhotos((data || []).map((p: any) => ({
            id: p._id || p.id,
            url: p.fileUrl,
            date: new Date(p.createdAt || p.date).toLocaleDateString(),
          })));
        })
        .catch(console.error)
        .finally(() => setPhotosLoading(false));
    }
  }, [activeTab, project]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length || !project) return;
    setIsUploading(true);
    try {
      await sitePhotoService.uploadPhotos(project.id, files);
      const data: any = await sitePhotoService.getPhotosByProject(project.id);
      setProjectPhotos((data || []).map((p: any) => ({
        id: p._id || p.id,
        url: p.fileUrl,
        date: new Date(p.createdAt || p.date).toLocaleDateString(),
      })));
      setShowPhotoUpload(false);
    } catch (err) {
      console.error("Upload failed", err);
      alert("Failed to upload photos.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    try {
      await sitePhotoService.deletePhoto(photoId);
      setProjectPhotos(prev => prev.filter(p => p.id !== photoId));
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  if (!project) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-2xl font-bold">Project not found</h2>
        <Link href="/projects" className="text-indigo-600 hover:underline mt-4 inline-block">Back to Projects</Link>
      </div>
    );
  }

  const handleUpdateStageStatus = (stageName: string, newStatus: any) => {
    updateStageStatus(project.id, stageName, newStatus);
  };

  const projectOfficeTasks = officeTasks.filter(t =>
    t.projectId === project.id ||
    t.project === project.id ||
    (t.project as any)?._id === project.id ||
    (t.project as any)?.name === project.name ||
    t.project === project.name
  );
  const projectSiteTasks = siteTasks.filter(t =>
    t.projectId === project.id ||
    t.project === project.id ||
    (t.project as any)?._id === project.id ||
    (t.project as any)?.name === project.name ||
    t.project === project.name
  );

  // Combine Office and Site tasks for the Tasks tab
  const projectTasks = [
    ...projectOfficeTasks.map(t => ({
      id: t.id,
      name: t.title,
      stage: t.category,
      assignee: t.assignedTo?.map((a: any) => a.name).join(", ") || "Unassigned",
      status: t.status,
      type: "Office" as const,
      deadline: t.deadline
    })),
    ...projectSiteTasks.map(t => ({
      id: t.id,
      name: t.title,
      stage: t.category,
      assignee: t.assignedTo?.map((a: any) => a.name).join(", ") || "Unassigned",
      status: t.status,
      type: "Site" as const,
      deadline: t.endDate
    }))
  ].filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);

  const projectUpdates = allSiteUpdates.filter(u => u.projectId === project.id || u.project === project.name);
  
  // Extract all unique assigned staff from office, site and global tasks
  const staffFromOffice = projectOfficeTasks.flatMap(t => t.assignedTo || []);
  const staffFromSite = projectSiteTasks.flatMap(t => t.assignedTo || []);
  const allAssignedStaff = [...staffFromOffice, ...staffFromSite];
  
  // Use a Map to keep unique staff by ID
  const uniqueStaffMap = new Map();
  
  // Also include supervisor and project workers as a fallback/additional list if needed,
  // but prioritize staff assigned to tasks.
  if (project.supervisor) {
    const s = project.supervisor;
    uniqueStaffMap.set(s._id || s.id, { ...s, type: "Supervisor" });
  }
  
  allAssignedStaff.forEach((s: any) => {
    if (!s) return;
    const id = s._id || s.id || (typeof s === 'string' ? s : null);
    if (!id) return;
    
    if (!uniqueStaffMap.has(id)) {
      uniqueStaffMap.set(id, {
        id,
        name: s.name || (typeof s === 'string' ? s : "Unknown"),
        type: s.role?.name || s.role || "Staff",
        rate: s.rate || "N/A"
      });
    }
  });

  const projectWorkers = Array.from(uniqueStaffMap.values());

  const projectPayments: any[] = []; // Fetch from payment service if needed

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
        <div className="space-y-4">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-[10px] font-semibold text-slate-400 hover:text-indigo-600 transition-colors group uppercase tracking-wider"
          >
            <ArrowLeft className="w-3 h-3 transition-transform group-hover:-translate-x-1" />
            Back to Projects
          </Link>
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">{project.name}</h2>
            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500">
              <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                {project.location}
              </span>
              <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                <span className="font-mono">{project.startDate}</span>
              </span>
              <span className="flex items-center gap-2 px-3 py-1 bg-indigo-600 text-white rounded-md text-[9px] font-semibold uppercase tracking-wider shadow-sm">
                {project.status}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-md text-xs font-medium shadow-sm hover:bg-slate-50 transition-all active:scale-95">
            Project Settings
          </button>
          <Link href="/site-updates"><Button size="sm" className="gap-2 font-medium">
            <Plus className="w-4 h-4" />
            Daily Log
          </Button></Link>
        </div>
      </div>

      <div className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-lg shadow-sm overflow-x-auto scrollbar-hide sticky top-20 z-10">
        {[
          { id: "office-work", label: "Office", icon: PenTool },
          { id: "site-work", label: "Site", icon: Hammer },
          { id: "tasks", label: "Tasks", icon: CheckCircle2 },
          { id: "workers", label: "Team", icon: Users },
          { id: "updates", label: "Logs", icon: ClipboardList },
          { id: "photos", label: "Photos", icon: Camera },
          { id: "payments", label: "Finances", icon: CreditCard },
          { id: "timeline", label: "Timeline", icon: History },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-md text-[11px] font-medium transition-all duration-200 whitespace-nowrap",
              activeTab === tab.id
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-100"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
            )}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="min-h-[400px] animate-in fade-in slide-in-from-top-4 duration-500">
        {activeTab === "office-work" && (
          <DesignModule 
            tasks={projectOfficeTasks} 
            projectId={project.id} 
            updateTaskStatus={updateOfficeTaskStatus}
          />
        )}

        {activeTab === "site-work" && (
          <ExecutionModule 
            tasks={projectSiteTasks} 
            projectId={project.id} 
            updateTaskStatus={updateSiteTaskStatus}
          />
        )}

        {activeTab === "tasks" && (
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50">
                  <TableHead className="px-4 py-3">Task Details</TableHead>
                  <TableHead className="px-4 py-3">Assignee</TableHead>
                  <TableHead className="px-4 py-3">Deadline</TableHead>
                  <TableHead className="px-4 py-3">Status</TableHead>
                  <TableHead className="px-4 py-3 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-50">
                {projectTasks.map((task) => (
                  <TableRow key={task.id} className="group hover:bg-slate-50/30 transition-all">
                    <TableCell className="px-4 py-4">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-xs font-semibold text-slate-900">{task.name}</p>
                        <span className={cn(
                          "text-[7px] font-bold px-1 py-0 rounded border uppercase tracking-wider",
                          task.type === "Office" ? "bg-purple-50 text-purple-600 border-purple-100" : "bg-orange-50 text-orange-600 border-orange-100"
                        )}>
                          {task.type}
                        </span>
                      </div>
                      <span className="text-[8px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0 rounded uppercase tracking-wider border border-indigo-100/50">{task.stage}</span>
                    </TableCell>
                    <TableCell className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-slate-50 rounded-md flex items-center justify-center text-[10px] font-bold text-slate-600 border border-slate-100 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-500 transition-all duration-300">
                          {task.assignee?.split(',')[0]?.split(' ').map((n: string) => n[0]).join('') || "U"}
                        </div>
                        <span className="text-xs font-semibold text-slate-700">{task.assignee || "Unassigned"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-4">
                      <span className="text-xs font-medium text-slate-500">{task.deadline || "N/A"}</span>
                    </TableCell>
                    <TableCell className="px-4 py-4">
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border shadow-sm",
                        task.status === "In Progress" || task.status === "On Track" ? "bg-white text-blue-600 border-blue-100" :
                          task.status === "Completed" ? "bg-white text-green-600 border-green-100" :
                            "bg-white text-slate-400 border-slate-100"
                      )}>
                        {task.status}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-4 text-right">
                      <button className="text-slate-300 hover:text-indigo-600 p-1 hover:bg-white hover:shadow-sm rounded-md transition-all">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {activeTab === "workers" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {projectWorkers.map((worker) => (
              <div key={worker.id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition-all duration-300 group">
                <div className="flex justify-center">
                  <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center text-lg font-bold text-indigo-600 border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                    {worker.name?.split(' ').map(n => n[0]).join('') || "W"}
                  </div>
                </div>
                <div className="text-center space-y-0.5">
                  <h4 className="text-sm font-bold text-slate-900 tracking-tight">{worker.name}</h4>
                  <p className="text-[10px] font-semibold text-indigo-500 uppercase tracking-wider">{worker.type}</p>
                </div>
                <div className="pt-2 border-t border-slate-50 flex justify-between items-center">
                  <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">Rate</span>
                  <span className="text-xs font-bold text-slate-900">{worker.rate}</span>
                </div>
                <button className="w-full py-2 bg-slate-50 text-slate-500 rounded-md text-[10px] font-bold hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-transparent hover:border-indigo-100 uppercase tracking-wider">
                  Profile
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === "updates" && (
          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-8">
            {projectUpdates.map((update, idx) => (
              <div key={update.id} className="flex gap-4 group">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-100 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                    <ClipboardList className="w-5 h-5 text-indigo-600 group-hover:text-white" />
                  </div>
                  {idx !== projectUpdates.length - 1 && <div className="w-px flex-1 bg-slate-100 my-2" />}
                </div>
                <div className="pb-8 border-b border-slate-50 last:border-0 last:pb-0 flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-slate-900 tracking-tight">{update.date}</p>
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[9px] font-bold uppercase tracking-wider rounded-md border border-indigo-100/50">
                      Supervisor log
                    </span>
                  </div>
                  <p className="text-slate-600 text-xs leading-relaxed max-w-2xl font-medium">
                    {update.update}
                  </p>
                  <div className="flex items-center gap-4 pt-1">
                    <span className="flex items-center gap-1.5 text-[9px] font-bold text-indigo-500 uppercase tracking-wider">
                      <TrendingUp className="w-3.5 h-3.5" />
                      {update.progress}%
                    </span>
                    <span className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                      <Camera className="w-3.5 h-3.5" />
                      {update.photos} Photos
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "payments" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-1">
                <div className="bg-green-50 p-2 rounded-md w-fit mb-1">
                  <DollarSign className="w-4 h-4 text-green-600" />
                </div>
                <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">Received</p>
                <p className="text-xl font-bold text-slate-900">{project.received}</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-1">
                <div className="bg-orange-50 p-2 rounded-md w-fit mb-1">
                  <AlertCircle className="w-4 h-4 text-orange-600" />
                </div>
                <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">Outstanding</p>
                <p className="text-xl font-bold text-slate-900">{project.pending}</p>
              </div>
              <div className="bg-indigo-600 p-4 rounded-lg shadow-md flex items-center justify-between group cursor-pointer overflow-hidden relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
                <div className="relative z-10 space-y-0.5">
                  <p className="text-indigo-100 text-[9px] font-semibold uppercase tracking-wider">Next Milestone</p>
                  <p className="text-sm font-bold text-white tracking-tight">Structure Payment</p>
                  <p className="text-indigo-200 text-[10px] font-medium">Due in 12 days</p>
                </div>
                <ArrowUpRight className="w-6 h-6 text-white relative z-10 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </div>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50">
                    <TableHead className="px-4 py-3">Milestone</TableHead>
                    <TableHead className="px-4 py-3">Amount</TableHead>
                    <TableHead className="px-4 py-3">Date</TableHead>
                    <TableHead className="px-4 py-3">Status</TableHead>
                    <TableHead className="px-4 py-3 text-right">Invoice</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-slate-50">
                  {projectPayments.map((payment) => (
                    <TableRow key={payment.id} className="group hover:bg-slate-50/30 transition-all">
                      <TableCell className="px-4 py-4">
                        <p className="text-xs font-semibold text-slate-900">{payment.milestone}</p>
                      </TableCell>
                      <TableCell className="px-4 py-4">
                        <p className="text-xs font-bold text-slate-900">{payment.amount}</p>
                      </TableCell>
                      <TableCell className="px-4 py-4">
                        <span className="text-xs font-medium text-slate-500">{payment.date}</span>
                      </TableCell>
                      <TableCell className="px-4 py-4">
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border shadow-sm",
                          payment.status === "Paid" ? "bg-white text-green-600 border-green-100" : "bg-white text-orange-600 border-orange-100"
                        )}>
                          {payment.status}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-4 text-right">
                        <button className="text-indigo-600 hover:text-indigo-800 font-bold text-[10px] uppercase tracking-wider">Download</button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {activeTab === "timeline" && (
          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Project Schedule</h3>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 bg-slate-50 text-slate-500 rounded-md text-[10px] font-bold border border-slate-100">Export</button>
                <button className="px-3 py-1.5 bg-indigo-600 text-white rounded-md text-[10px] font-bold shadow-sm">Add</button>
              </div>
            </div>

            <div className="space-y-8 relative pl-6">
              <div className="absolute left-3 top-2 bottom-2 w-px bg-slate-100" />
              {[
                { date: "Jan 15, 2024", title: "Project Initiation & Design", status: "Completed" },
                { date: "Feb 01, 2024", title: "Site Excavation", status: "Completed" },
                { date: "Feb 20, 2024", title: "Foundation & Plinth", status: "Completed" },
                { date: "Mar 10, 2024", title: "Structural Framing", status: "In Progress" },
                { date: "Apr 05, 2024", title: "Plumbing & Electrical", status: "Planned" },
              ].map((item, idx) => (
                <div key={idx} className="relative flex gap-6 group">
                  <div className={cn(
                    "absolute -left-6 w-6 h-6 rounded-md border-2 border-white flex items-center justify-center z-10 transition-all duration-300 shadow-sm",
                    item.status === "Completed" ? "bg-green-500" :
                      item.status === "In Progress" ? "bg-indigo-600" : "bg-slate-200"
                  )}>
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{item.date}</p>
                    <h4 className="text-sm font-bold text-slate-900 tracking-tight">{item.title}</h4>
                    <span className={cn(
                      "text-[8px] font-bold uppercase tracking-wider",
                      item.status === "Completed" ? "text-green-600" :
                        item.status === "In Progress" ? "text-indigo-600" : "text-slate-400"
                    )}>{item.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "photos" && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md text-xs font-bold shadow-sm hover:bg-indigo-700 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Camera className="w-3.5 h-3.5" />
                {isUploading ? "Uploading..." : "Upload Photos"}
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {photosLoading ? (
                <div className="col-span-4 flex items-center justify-center py-10">
                  <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <>
                  {projectPhotos.map((photo) => (
                    <div key={photo.id} className="aspect-square bg-slate-50 rounded-lg border border-slate-100 shadow-sm group hover:border-indigo-300 transition-all cursor-pointer relative overflow-hidden">
                      <img src={photo.url} alt="Project photo" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5">
                        <p className="text-white text-[8px] font-bold uppercase tracking-wider">{photo.date}</p>
                        <a href={photo.url} target="_blank" rel="noreferrer" className="px-3 py-1 bg-white text-indigo-600 rounded-md text-[8px] font-bold uppercase tracking-wider">View</a>
                        <button onClick={() => handleDeletePhoto(photo.id)} className="px-3 py-1 bg-red-500 text-white rounded-md text-[8px] font-bold uppercase tracking-wider">Delete</button>
                      </div>
                    </div>
                  ))}

                  {projectPhotos.length === 0 && [1, 2, 3].map((i) => (
                    <div key={i} className="aspect-square bg-slate-50 rounded-lg border border-dashed border-slate-200 flex flex-col items-center justify-center gap-2">
                      <Camera className="w-6 h-6 text-slate-200" />
                      <p className="text-[8px] font-bold text-slate-300 uppercase tracking-wider">No Photos</p>
                    </div>
                  ))}

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square w-full bg-indigo-50 rounded-lg border border-dashed border-indigo-200 flex flex-col items-center justify-center gap-2 group hover:bg-indigo-100 transition-all"
                  >
                    <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                      <Plus className="w-4 h-4 text-indigo-600" />
                    </div>
                    <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Upload</p>
                  </button>
                </>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} />
          </div>
        )}
      </div>
    </div>
  );
}
