"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { 
  PenTool, 
  FileText, 
  Layers, 
  Clock, 
  CheckCircle2, 
  Plus, 
  Search,
  Filter,
  ArrowRight,
  X
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";

export default function OfficeWorkPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", project: "", priority: "Medium", status: "In Design" });

  const categories = [
    { title: "Design Phase", count: 12, icon: PenTool, color: "text-indigo-600", bg: "bg-indigo-50" },
    { title: "Documentation", count: 8, icon: FileText, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Approvals", count: 5, icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
    { title: "Revisions", count: 3, icon: Clock, color: "text-orange-600", bg: "bg-orange-50" },
  ];

  const recentTasks = [
    { id: "OW-101", title: "Modern Villa - Interior Layout", project: "Modern Villa", priority: "High", status: "In Design", deadine: "2024-05-25" },
    { id: "OW-102", title: "City Heights - Structural Review", project: "City Heights Apartment", priority: "Medium", status: "Review", deadine: "2024-05-28" },
    { id: "OW-103", title: "Lakeview - Electrical Mapping", project: "Lakeview Residence", priority: "High", status: "In Design", deadine: "2024-06-02" },
  ];

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("New Task:", newTask);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="OFFICE WORK" 
        description="Manage designs, documentation, and office-side project coordination."
      >
        <Button onClick={() => setIsModalOpen(true)} className="rounded-xl font-medium gap-2">
          <Plus className="w-4 h-4" /> New Office Task
        </Button>
      </PageHeader>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Create New Office Task"
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Project</label>
              <select 
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                value={newTask.project}
                onChange={(e) => setNewTask({...newTask, project: e.target.value})}
              >
                <option value="">Select Project</option>
                <option value="Modern Villa">Modern Villa</option>
                <option value="City Heights">City Heights</option>
                <option value="Lakeview">Lakeview</option>
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
            <Button type="submit" className="font-medium">Create Task</Button>
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

      <div className="grid  gap-8">
        {/* Active Tasks Table */}
        <Card className=" border-slate-100 shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 px-6 py-4">
            <CardTitle className="text-sm font-medium text-slate-900 uppercase tracking-widest">Active Office Tasks</CardTitle>
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
                  <TableHead className="px-6">Task ID</TableHead>
                  <TableHead className="px-6">Task Detail</TableHead>
                  <TableHead className="px-6">Project</TableHead>
                  <TableHead className="px-6 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTasks.map((task) => (
                  <TableRow key={task.id} className="hover:bg-slate-50/50 transition-colors group">
                    <TableCell className="px-6 py-4">
                      <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded font-mono">
                        {task.id}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-slate-900">{task.title}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant={task.priority === "High" ? "destructive" : "warning"} className="text-[9px] px-1.5 py-0">
                            {task.priority}
                          </Badge>
                          <span className="text-[10px] text-slate-400 font-medium font-mono">Due: {task.deadine}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <p className="text-xs font-medium text-slate-600">{task.project}</p>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8 group-hover:bg-white group-hover:text-indigo-600">
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Modules/Quick Access */}
        {/* <div className="space-y-6">
          <Card className="p-6 bg-slate-900 text-white border-slate-800 shadow-xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/20 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-indigo-600/30 transition-all" />
            <div className="relative z-10 space-y-4">
              <Layers className="w-8 h-8 text-indigo-400" />
              <h3 className="text-lg font-black tracking-tight">Design Library</h3>
              <p className="text-sm text-slate-400 font-medium">Access master blocks, previous project layouts, and design standards.</p>
              <Button className="w-full bg-indigo-600 hover:bg-indigo-500 border-none rounded-xl font-bold h-10 mt-2">Open Library</Button>
            </div>
          </Card>

          <Card className="p-6 border-slate-100">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4">Quick Documentation</h3>
            <div className="space-y-3">
              {["Material Specification", "Client Quotation", "Structural NOC", "Interior BOQ"].map((doc) => (
                <button key={doc} className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group text-left">
                  <span className="text-xs font-bold text-slate-600 group-hover:text-indigo-600">{doc}</span>
                  <Plus className="w-3 h-3 text-slate-300 group-hover:text-indigo-400" />
                </button>
              ))}
            </div>
          </Card>
        </div> */}
      </div>
    </div>
  );
}

import { cn } from "@/lib/utils";
