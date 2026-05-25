"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Hammer, Camera, ClipboardList, MapPin, CheckCircle2, Plus, Search, Filter, ArrowRight, HardHat } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import Modal from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";

import { useAuth } from "@/lib/auth-context";
import { useSiteTasks, SiteTaskCategory } from "@/lib/site-tasks-store";
import { useProjects } from "@/lib/projects-store";
import { staffService, StaffMember } from "@/services/staff.service";

export default function SiteWorkPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "architect" || user?.role === "director" || user?.role === "site-engineer" || user?.role === "supervisor";
  const { siteTasks, createSiteTask } = useSiteTasks();
  const { projects } = useProjects();
  
  const [activeTab, setActiveTab] = useState<SiteTaskCategory>("Civil");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);

  const [newTask, setNewTask] = useState({
    title: "",
    project: "",
    assignedTo: [] as string[],
    status: "On Track",
  });

  useEffect(() => {
    staffService.getAllStaff().then(setStaffList).catch(console.error);
  }, []);

  const siteStaff = staffList.filter(s => {
    const roleName = s.role?.name?.toLowerCase() || "";
    return roleName && 
           !roleName.includes("director") && 
           !roleName.includes("admin") && 
           !roleName.includes("client") && 
           !roleName.includes("designer");
  });

  const siteStats = [
    { title: "Active Sites", count: projects.filter(p => p.status === "In Progress" || p.status === "Active").length, icon: MapPin, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "On-site Team", count: siteStaff.length, icon: HardHat, color: "text-indigo-600", bg: "bg-indigo-50" },
    { title: "Site Logs", count: siteTasks.length, icon: ClipboardList, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Inspections", count: siteTasks.filter(t => t.status === "Critical" || t.status === "Delayed").length, icon: CheckCircle2, color: "text-indigo-600", bg: "bg-indigo-50" },
  ];

  const handleAddLog = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedProject = projects.find(p => p.id === newTask.project);
    if (!selectedProject) return;

    await createSiteTask({
      title: newTask.title,
      projectId: selectedProject.id,
      project: selectedProject.name,
      category: activeTab,
      assignedTo: newTask.assignedTo,
      status: newTask.status as any,
      progress: 0,
    });

    setIsModalOpen(false);
    setNewTask({ title: "", project: "", assignedTo: [], status: "On Track" });
  };

  const filteredTasks = siteTasks.filter(t => t.category === activeTab);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="SITE WORK" 
        description="Track on-site execution, daily logs, and technical implementation."
      >
        {isAdmin && (
          <Button onClick={() => setIsModalOpen(true)} className="rounded-xl font-medium gap-2 bg-blue-600 hover:bg-blue-500">
            <Plus className="w-4 h-4" /> Create Site Task
          </Button>
        )}
      </PageHeader>

      <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-200 w-fit shadow-sm">
        <button
          onClick={() => setActiveTab("Civil")}
          className={cn("px-8 py-2.5 rounded-xl text-sm font-bold transition-all duration-300", activeTab === "Civil" ? "bg-blue-600 text-white shadow-lg shadow-blue-100" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50")}
        >
          Civil Work
        </button>
        <button
          onClick={() => setActiveTab("Interior")}
          className={cn("px-8 py-2.5 rounded-xl text-sm font-bold transition-all duration-300", activeTab === "Interior" ? "bg-blue-600 text-white shadow-lg shadow-blue-100" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50")}
        >
          Interior Work
        </button>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={`Create New ${activeTab} Site Task`}
      >
        <form onSubmit={handleAddLog} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Project</label>
            <select 
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              value={newTask.project}
              onChange={(e) => setNewTask({...newTask, project: e.target.value})}
              required
            >
              <option value="">Select Project</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Current Task / Activity</label>
            <Input 
              placeholder="e.g., Foundation Casting" 
              value={newTask.title}
              onChange={(e) => setNewTask({...newTask, title: e.target.value})}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Assign To (Supervisor)</label>
              <select 
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                value={newTask.assignedTo[0] || ""}
                onChange={(e) => setNewTask({...newTask, assignedTo: [e.target.value]})}
                required
              >
                <option value="">Select Staff</option>
                {siteStaff.map(s => (
                  <option key={s._id} value={s._id}>{s.name} ({s.role?.name || s.team})</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Status</label>
              <select 
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                value={newTask.status}
                onChange={(e) => setNewTask({...newTask, status: e.target.value})}
              >
                <option value="On Track">On Track</option>
                <option value="Delayed">Delayed</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-medium">Save Task</Button>
          </div>
        </form>
      </Modal>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {siteStats.map((stat) => (
          <Card key={stat.title} className="p-6 border-slate-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", stat.bg)}>
                <stat.icon className={cn("w-6 h-6", stat.color)} />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">{stat.title}</p>
                <h3 className="text-2xl font-medium text-slate-900 font-mono">{stat.count}</h3>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-8">
        <Card className=" border-slate-100 shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 px-6 py-4">
            <CardTitle className="text-sm font-medium text-slate-900 uppercase tracking-widest">Active Site Execution - {activeTab}</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                <Search className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-6 py-4">Site Task</TableHead>
                  <TableHead className="px-6 py-4">Project & Staff</TableHead>
                  <TableHead className="px-6 py-4">Status & Progress</TableHead>
                  <TableHead className="px-6 py-4 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-slate-500">No active site tasks found in this category.</TableCell>
                  </TableRow>
                )}
                {filteredTasks.map((task) => (
                  <TableRow key={task.id} className="hover:bg-slate-50/50 transition-colors group">
                    <TableCell className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-slate-900">{task.title}</p>
                        <span className="text-[10px] text-slate-400 font-medium font-mono block">ID: {task.id.slice(-6)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-700">{(task.project as any)?.name || task.project}</p>
                        <div className="flex -space-x-2">
                          {task.assignedTo && task.assignedTo.length > 0 ? (
                            task.assignedTo.map((user, i) => (
                              <div key={i} className="w-6 h-6 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-blue-600 font-mono shadow-sm" title={user.name}>
                                {(user.name || user)[0]}
                              </div>
                            ))
                          ) : (
                            <span className="text-[9px] text-slate-400 font-medium uppercase tracking-widest">Unassigned</span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Badge 
                          variant={task.status === "Critical" ? "destructive" : task.status === "Delayed" ? "warning" : "success"}
                          className="text-[9px] px-2 py-0"
                        >
                          {task.status}
                        </Badge>
                        <div className="flex-1 w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden hidden sm:block">
                          <div 
                            className={cn(
                              "h-full rounded-full transition-all duration-500",
                              task.status === "Critical" ? "bg-red-500" : task.status === "Delayed" ? "bg-orange-500" : "bg-green-500"
                            )} 
                            style={{ width: `${task.progress}%` }} 
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8 group-hover:bg-white group-hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-all rounded-lg shadow-sm">
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
