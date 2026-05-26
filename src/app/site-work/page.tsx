"use client";

import { useState, useEffect, Fragment } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Hammer, Camera, ClipboardList, MapPin, CheckCircle2, Plus, Search, Filter, ArrowRight, HardHat, Edit2, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import Modal from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

import { useAuth } from "@/lib/auth-context";
import { useSiteTasks, SiteTaskCategory } from "@/lib/site-tasks-store";
import { useProjects } from "@/lib/projects-store";
import { staffService, StaffMember } from "@/services/staff.service";
import { TaskImageUpload } from "@/components/projects/TaskImageUpload";
import { Select } from "@/components/ui/Select";
import toast from "react-hot-toast";

export default function SiteWorkPage() {
  const { user } = useAuth();
  const canCreate = user?.role === "architect" || user?.role === "director" || user?.role === "site-engineer" || user?.role === "supervisor";
  const isViewOnly = user?.role === "architect" || user?.role === "director";
  const { siteTasks, createSiteTask, updateSiteTask, updateSiteTaskStatus, deleteSiteTask } = useSiteTasks();
  const { projects } = useProjects();
  
  const [activeTab, setActiveTab] = useState<SiteTaskCategory>("Civil");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [noteValues, setNoteValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    const newErrors: Record<string, string> = {};

    if (!newTask.project) newErrors.project = "Please select a project";
    if (!newTask.title.trim()) newErrors.title = "Activity title is required";
    if (newTask.assignedTo.length === 0) newErrors.assignedTo = "Please assign to staff";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fill in all required fields");
      return;
    }

    const selectedProject = projects.find(p => p.id === newTask.project);
    if (!selectedProject) return;

    try {
      if (editingTask) {
        await updateSiteTask(editingTask.id, {
          title: newTask.title,
          projectId: selectedProject.id,
          project: selectedProject.name,
          assignedTo: newTask.assignedTo,
          status: newTask.status as any,
        });
        toast.success("Site task updated successfully!");
      } else {
        await createSiteTask({
          title: newTask.title,
          projectId: selectedProject.id,
          project: selectedProject.name,
          category: activeTab,
          assignedTo: newTask.assignedTo,
          status: newTask.status as any,
          progress: 0,
        });
        toast.success("Site task created successfully!");
      }

      setIsModalOpen(false);
      setEditingTask(null);
      setNewTask({ title: "", project: "", assignedTo: [], status: "On Track" });
      setErrors({});
    } catch (error) {
      console.error("Error saving site task:", error);
      toast.error(editingTask ? "Failed to update task" : "Failed to create task");
    }
  };

  const handleDelete = async () => {
    if (!taskToDelete) return;
    try {
      await deleteSiteTask(taskToDelete);
      toast.success("Task deleted successfully");
      setIsConfirmOpen(false);
      setTaskToDelete(null);
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task");
    }
  };

  const filteredTasks = siteTasks.filter(t => {
    const isCategory = t.category === activeTab;
    if (!canCreate) {
      const isAssigned = t.assignedTo?.some((s: any) => (s._id || s.id || s) === user?.id);
      return isCategory && isAssigned;
    }
    return isCategory;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500 w-full p-4 sm:p-6">
      <div className="flex flex-row items-center justify-between gap-4">
        <div className="space-y-0.5">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">SITE WORK</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:block">On-site Execution & Logs</p>
        </div>
        
        { canCreate && (
          <Button onClick={() => {
            setEditingTask(null);
            setNewTask({ title: "", project: "", assignedTo: [], status: "On Track" });
            setIsModalOpen(true);
          }} size="sm" className="rounded-xl font-bold text-xs gap-2 bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-100 text-white">
            <Plus className="w-4 h-4" /> New Log
          </Button>
        )}
      </div>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Site Task"
        message="Are you sure you want to delete this site task? This will remove all associated technical notes and photos."
      />

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
          setNewTask({ title: "", project: "", assignedTo: [], status: "On Track" });
          setErrors({});
        }} 
        title={editingTask ? "Edit Site Task" : `Create New ${activeTab} Site Task`}
      >
        <form onSubmit={handleAddLog} className="space-y-6">
          <div className="space-y-2">
            <Select
              label="Project"
              options={projects.map(p => ({ value: p.id, label: p.name }))}
              value={newTask.project}
              onChange={(val) => {
                setNewTask({...newTask, project: val});
                if (errors.project) setErrors(prev => {
                  const { project, ...rest } = prev;
                  return rest;
                });
              }}
              placeholder="Select Project"
              error={errors.project}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Current Task / Activity</label>
            <Input 
              placeholder="e.g., Foundation Casting" 
              value={newTask.title}
              onChange={(e) => {
                setNewTask({...newTask, title: e.target.value});
                if (errors.title) setErrors(prev => {
                  const { title, ...rest } = prev;
                  return rest;
                });
              }}
              error={errors.title}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Select
                label="Assign To (Supervisor)"
                options={siteStaff.map(s => ({ 
                  value: s._id, 
                  label: s.name,
                  description: s.role?.name || s.team 
                }))}
                value={newTask.assignedTo[0] || ""}
                onChange={(val) => {
                  setNewTask({...newTask, assignedTo: [val]});
                  if (errors.assignedTo) setErrors(prev => {
                    const { assignedTo, ...rest } = prev;
                    return rest;
                  });
                }}
                placeholder="Select Staff"
                error={errors.assignedTo}
              />
            </div>
            <div className="space-y-2">
              <Select
                label="Status"
                options={[
                  { value: "On Track", label: "On Track" },
                  { value: "Delayed", label: "Delayed" },
                  { value: "Critical", label: "Critical" },
                ]}
                value={newTask.status}
                onChange={(val) => setNewTask({...newTask, status: val})}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-medium">
              {editingTask ? "Update Log" : "Save Log"}
            </Button>
          </div>
        </form>
      </Modal>

      <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 w-fit shadow-sm">
        <button
          onClick={() => setActiveTab("Civil")}
          className={cn("px-6 py-2 rounded-xl text-xs font-bold transition-all duration-300", activeTab === "Civil" ? "bg-blue-600 text-white shadow-lg shadow-blue-100" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50")}
        >
          Civil Work
        </button>
        <button
          onClick={() => setActiveTab("Interior")}
          className={cn("px-6 py-2 rounded-xl text-xs font-bold transition-all duration-300", activeTab === "Interior" ? "bg-blue-600 text-white shadow-lg shadow-blue-100" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50")}
        >
          Interior Work
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {siteStats.map((stat) => (
          <Card key={stat.title} className="p-4 border-slate-100 hover:shadow-md transition-all">
            <div className="flex items-center gap-3">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", stat.bg)}>
                <stat.icon className={cn("w-5 h-5", stat.color)} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.title}</p>
                <h3 className="text-xl font-bold text-slate-900 font-mono leading-none mt-1">{stat.count}</h3>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6">
        <Card className=" border-slate-200 shadow-sm overflow-hidden rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 px-6 py-3 bg-slate-50/30">
            <CardTitle className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Execution - {activeTab}</CardTitle>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400">
                <Search className="w-3.5 h-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400">
                <Filter className="w-3.5 h-3.5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-6 py-4">Site Task</TableHead>
                  <TableHead className="px-6 py-4">Project</TableHead>
                  <TableHead className="px-6 py-4">Status</TableHead>
                  <TableHead className="px-6 py-4">Staff</TableHead>
                  <TableHead className="px-6 py-4 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-slate-500">No active site tasks found in this category.</TableCell>
                  </TableRow>
                )}
                {filteredTasks.map((task) => (
                  <Fragment key={task.id}>
                    <TableRow 
                      className={cn(
                        "hover:bg-slate-50/50 transition-colors group cursor-pointer",
                        expandedTaskId === task.id && "bg-slate-50"
                      )}
                      onClick={() => setExpandedTaskId(expandedTaskId === task.id ? null : task.id)}
                    >
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center border shadow-inner transition-colors",
                            task.status === "Completed" ? "bg-green-50 text-green-600 border-green-100" : 
                            task.status === "Critical" ? "bg-red-50 text-red-600 border-red-100" :
                            "bg-slate-50 text-slate-400 border-slate-100"
                          )}>
                            {task.status === "Completed" ? <CheckCircle2 className="w-5 h-5" /> : <HardHat className="w-5 h-5" />}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{task.title}</p>
                            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Added on {new Date(task.createdAt || Date.now()).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <p className="text-xs font-bold text-slate-700">{(task.project as any)?.name || task.project}</p>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <Badge 
                          variant={
                            task.status === "Completed" ? "success" : 
                            task.status === "Critical" ? "destructive" : 
                            task.status === "Delayed" ? "warning" : "secondary"
                          }
                          className="text-[10px] px-2 py-0.5 font-black uppercase tracking-widest shadow-sm"
                        >
                          {task.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="flex -space-x-2">
                          {task.assignedTo && task.assignedTo.length > 0 ? (
                            task.assignedTo.map((user: any, i: number) => (
                              <div key={i} className="w-8 h-8 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-xs font-bold text-blue-600 font-mono shadow-sm" title={user.name || user}>
                                {(user.name || user)[0]}
                              </div>
                            ))
                          ) : (
                            <span className="text-[9px] text-slate-400 font-medium uppercase tracking-widest">Unassigned</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {canCreate && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-400 hover:text-amber-600 hover:bg-amber-50"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingTask(task);
                                  setNewTask({
                                    title: task.title,
                                    project: (task.projectId || (task.project as any)?.id || task.project as any)?._id || (task.project as any)?.id || task.project as string,
                                    assignedTo: task.assignedTo?.map((s: any) => s._id || s.id || s) || [],
                                    status: task.status || "On Track",
                                  });
                                  setIsModalOpen(true);
                                }}
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setTaskToDelete(task.id);
                                  setIsConfirmOpen(true);
                                }}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </>
                          )}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className={cn("h-8 w-8 rounded-lg transition-all", expandedTaskId === task.id ? "bg-blue-600 text-white" : "text-slate-400")}
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedTaskId(expandedTaskId === task.id ? null : task.id);
                            }}
                          >
                            <ArrowRight className={cn("w-4 h-4 transition-transform", expandedTaskId === task.id && "rotate-90")} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    {expandedTaskId === task.id && (
                      <TableRow className="bg-slate-50/30 border-b border-slate-100">
                        <TableCell colSpan={5} className="p-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-top-2 duration-300">
                            <div className="space-y-4">
                              {!isViewOnly && (
                                <>
                                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Update Execution Status</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {["On Track", "In Progress", "Completed", "Critical", "Delayed"].map((status) => (
                                      <Button
                                        key={status}
                                        variant={task.status === status ? "default" : "outline"}
                                        size="sm"
                                        className="rounded-xl text-[10px] h-8"
                                        onClick={(e) => { e.stopPropagation(); updateSiteTaskStatus(task.id, status as any); }}
                                      >
                                        {status}
                                      </Button>
                                    ))}
                                  </div>
                                </>
                              )}
                              <div className="pt-2">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Technical Notes</h4>
                                {isViewOnly ? (
                                  <p className="text-sm text-slate-600 bg-white p-3 rounded-xl border border-slate-100 shadow-sm italic">
                                    {task.notes || "No technical notes available."}
                                  </p>
                                ) : (
                                  <div className="space-y-2">
                                    <textarea
                                      className="w-full text-sm text-slate-700 bg-white p-3 rounded-xl border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                                      rows={3}
                                      placeholder="Add technical notes..."
                                      value={noteValues[task.id] ?? (task.notes || "")}
                                      onChange={(e) => setNoteValues(prev => ({ ...prev, [task.id]: e.target.value }))}
                                    />
                                    <Button
                                      size="sm"
                                      className="rounded-xl text-[10px] h-8 bg-blue-600 hover:bg-blue-500"
                                      onClick={() => updateSiteTask(task.id, { notes: noteValues[task.id] ?? task.notes })}
                                    >
                                      Save Notes
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="space-y-4">
                              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Site Photos</h4>
                              {isViewOnly ? (
                                <div className="flex flex-wrap gap-2">
                                  {(task.images || []).length === 0 && <p className="text-xs text-slate-400 italic">No photos uploaded.</p>}
                                  {(task.images || []).map((url, i) => (
                                    <a key={i} href={url} target="_blank" rel="noreferrer" className="w-16 h-16 rounded-lg overflow-hidden border border-slate-200 block">
                                      <img src={url} alt={`img-${i}`} className="w-full h-full object-cover" />
                                    </a>
                                  ))}
                                </div>
                              ) : (
                                <TaskImageUpload
                                  taskId={task.id}
                                  type="Site"
                                  existingImages={task.images}
                                  onUploadComplete={() => console.log("Site photos uploaded!")}
                                />
                              )}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
