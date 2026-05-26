"use client";

import { useState, useEffect, Fragment } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PenTool, FileText, Clock, CheckCircle2, Plus, Search, Filter, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { useAuth } from "@/lib/auth-context";
import { useOfficeTasks, OfficeTaskCategory } from "@/lib/office-tasks-store";
import { useProjects } from "@/lib/projects-store";
import { staffService, StaffMember } from "@/services/staff.service";
import { cn } from "@/lib/utils";
import { TaskImageUpload } from "@/components/projects/TaskImageUpload";

export default function OfficeWorkPage() {
  const { user } = useAuth();
  const canCreate = user?.role === "architect" || user?.role === "director" || user?.role === "office-team";
  const isViewOnly = user?.role === "architect" || user?.role === "director";
  const { officeTasks, createOfficeTask, updateOfficeTask, updateOfficeTaskStatus } = useOfficeTasks();
  const { projects } = useProjects();
  
  const [activeTab, setActiveTab] = useState<OfficeTaskCategory>("Civil");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [noteValues, setNoteValues] = useState<Record<string, string>>({});
  
  const [newTask, setNewTask] = useState({
    title: "",
    project: "",
    assignedTo: [] as string[],
    priority: "Medium",
  });

  useEffect(() => {
    staffService.getAllStaff().then(setStaffList).catch(console.error);
  }, []);

  const officeStaff = staffList.filter(s => s.role?.name?.toLowerCase().includes("designer"));

  const categories = [
    { title: "Design Phase", count: officeTasks.filter(t => t.status === "In Progress").length, icon: PenTool, color: "text-indigo-600", bg: "bg-indigo-50" },
    { title: "Documentation", count: officeTasks.filter(t => t.status === "Pending").length, icon: FileText, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Approvals", count: officeTasks.filter(t => t.status === "Completed").length, icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
    { title: "Revisions", count: officeTasks.filter(t => t.priority === "High" || t.priority === "Critical").length, icon: Clock, color: "text-orange-600", bg: "bg-orange-50" },
  ];

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedProject = projects.find(p => p.id === newTask.project);
    if (!selectedProject) return;

    await createOfficeTask({
      title: newTask.title,
      projectId: selectedProject.id,
      project: selectedProject.name,
      category: activeTab,
      assignedTo: newTask.assignedTo,
      priority: newTask.priority,
      status: "Pending",
      progress: 0,
    });
    
    setIsModalOpen(false);
    setNewTask({ title: "", project: "", assignedTo: [], priority: "Medium" });
  };

  const filteredTasks = officeTasks.filter(t => {
    const isCategory = t.category === activeTab;
    if (!canCreate) {
      const isAssigned = t.assignedTo?.some((s: any) => (s._id || s.id || s) === user?.id);
      return isCategory && isAssigned;
    }
    return isCategory;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="OFFICE WORK" 
        description="Manage designs, documentation, and office-side project coordination."
      >
        {isViewOnly ? null : canCreate && (
          <Button onClick={() => setIsModalOpen(true)} className="rounded-xl font-medium gap-2 bg-indigo-600 hover:bg-indigo-500">
            <Plus className="w-4 h-4" /> New Office Task
          </Button>
        )}
      </PageHeader>

      <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-200 w-fit shadow-sm">
        <button
          onClick={() => setActiveTab("Civil")}
          className={cn("px-8 py-2.5 rounded-xl text-sm font-bold transition-all duration-300", activeTab === "Civil" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50")}
        >
          Civil Designing
        </button>
        <button
          onClick={() => setActiveTab("Interior")}
          className={cn("px-8 py-2.5 rounded-xl text-sm font-bold transition-all duration-300", activeTab === "Interior" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50")}
        >
          Interior Designing
        </button>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={`Create New ${activeTab} Task`}
      >
        <form onSubmit={handleAddTask} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Task Title</label>
            <Input 
              placeholder="e.g., Interior Layout Design" 
              value={newTask.title}
              onChange={(e) => setNewTask({...newTask, title: e.target.value})}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Project</label>
            <select 
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Assign To (Staff)</label>
              <select 
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                value={newTask.assignedTo[0] || ""}
                onChange={(e) => setNewTask({...newTask, assignedTo: [e.target.value]})}
                required
              >
                <option value="">Select Staff</option>
                {officeStaff.map(s => (
                  <option key={s._id} value={s._id}>{s.name} ({s.role?.name || s.team})</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Priority</label>
              <select 
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                value={newTask.priority}
                onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" className="font-medium bg-indigo-600 hover:bg-indigo-500">Create Task</Button>
          </div>
        </form>
      </Modal>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((cat) => (
          <Card key={cat.title} className="p-6 border-slate-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", cat.bg)}>
                <cat.icon className={cn("w-6 h-6", cat.color)} />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">{cat.title}</p>
                <h3 className="text-2xl font-medium text-slate-900 font-mono">{cat.count}</h3>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-8">
        <Card className=" border-slate-100 shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 px-6 py-4">
            <CardTitle className="text-sm font-medium text-slate-900 uppercase tracking-widest">Active {activeTab} Tasks</CardTitle>
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
                  <TableHead className="px-6 py-4">Task Detail</TableHead>
                  <TableHead className="px-6 py-4">Project</TableHead>
                  <TableHead className="px-6 py-4">Status & Progress</TableHead>
                  <TableHead className="px-6 py-4">Assigned To</TableHead>
                  <TableHead className="px-6 py-4 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-slate-500">No active tasks found in this category.</TableCell>
                  </TableRow>
                )}
                {filteredTasks.map((task) => (
                  <Fragment key={task.id}>
                    <TableRow 
                      key={task.id} 
                      className={cn(
                        "hover:bg-slate-50/50 transition-colors group cursor-pointer",
                        expandedTaskId === task.id && "bg-slate-50"
                      )}
                      onClick={() => setExpandedTaskId(expandedTaskId === task.id ? null : task.id)}
                    >
                      <TableCell className="px-6 py-4">
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-slate-900">{task.title}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant={task.priority === "High" || task.priority === "Critical" ? "destructive" : "warning"} className="text-[9px] px-1.5 py-0">
                              {task.priority || "Medium"}
                            </Badge>
                            <span className="text-[10px] text-slate-400 font-medium font-mono">ID: {task.id.slice(-6)}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <p className="text-xs font-bold text-slate-700">{(task.project as any)?.name || task.project}</p>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="space-y-2 max-w-[150px]">
                          <div className="flex justify-between items-center text-[10px] font-bold">
                            <span className={cn(
                              "uppercase tracking-widest",
                              task.status === "Completed" ? "text-green-600" :
                              task.status === "In Progress" ? "text-blue-600" : "text-slate-500"
                            )}>{task.status}</span>
                            <span className="text-slate-500 font-mono">{task.progress}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-indigo-600 transition-all duration-500" 
                              style={{ width: `${task.progress}%` }} 
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="flex -space-x-2">
                          {task.assignedTo && task.assignedTo.length > 0 ? (
                            task.assignedTo.map((user, i) => (
                              <div key={i} className="w-12 h-12 rounded-xl bg-indigo-100 border-2 border-white flex items-center justify-center text-xs font-bold text-indigo-600 font-mono shadow-sm" title={user.name}>
                                {(user.name || user)}
                              </div>
                            ))
                          ) : (
                            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Unassigned</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        <Button variant="ghost" size="icon" className={cn("h-8 w-8 rounded-lg transition-all", expandedTaskId === task.id ? "bg-indigo-600 text-white" : "text-slate-400")}>
                          <ArrowRight className={cn("w-4 h-4 transition-transform", expandedTaskId === task.id && "rotate-90")} />
                        </Button>
                      </TableCell>
                    </TableRow>
                    {expandedTaskId === task.id && (
                      <TableRow className="bg-slate-50/30 border-b border-slate-100">
                        <TableCell colSpan={5} className="p-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-top-2 duration-300">
                            <div className="space-y-4">
                              {!isViewOnly && (
                                <>
                                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Update Task Status</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {["Pending", "In Progress", "Completed"].map((status) => (
                                      <Button
                                        key={status}
                                        variant={task.status === status ? "default" : "outline"}
                                        size="sm"
                                        className="rounded-xl text-[10px] h-8"
                                        onClick={() => updateOfficeTaskStatus(task.id, status as any)}
                                      >
                                        {status}
                                      </Button>
                                    ))}
                                  </div>
                                </>
                              )}
                              <div className="pt-2">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Notes</h4>
                                {isViewOnly ? (
                                  <p className="text-sm text-slate-600 bg-white p-3 rounded-xl border border-slate-100 shadow-sm italic">
                                    {task.notes || "No notes available for this task."}
                                  </p>
                                ) : (
                                  <div className="space-y-2">
                                    <textarea
                                      className="w-full text-sm text-slate-700 bg-white p-3 rounded-xl border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
                                      rows={3}
                                      placeholder="Add notes..."
                                      value={noteValues[task.id] ?? (task.notes || "")}
                                      onChange={(e) => setNoteValues(prev => ({ ...prev, [task.id]: e.target.value }))}
                                    />
                                    <Button
                                      size="sm"
                                      className="rounded-xl text-[10px] h-8 bg-indigo-600 hover:bg-indigo-500"
                                      onClick={() => updateOfficeTask(task.id, { notes: noteValues[task.id] ?? task.notes })}
                                    >
                                      Save Notes
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="space-y-4">
                              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Design Photos</h4>
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
                                  type="Office"
                                  existingImages={task.images}
                                  onUploadComplete={() => console.log("Upload finished!")}
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
