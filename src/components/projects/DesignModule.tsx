"use client";

import { OfficeTask, OfficeTaskStatus } from "@/lib/office-tasks-store";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { CheckCircle2, Clock, AlertCircle, FileText, Plus, ChevronRight } from "lucide-react";
import { useState } from "react";

interface DesignModuleProps {
  tasks: OfficeTask[];
  projectId: string;
  updateTaskStatus?: (id: string, status: OfficeTaskStatus) => void;
}

export function DesignModule({ tasks, projectId, updateTaskStatus }: DesignModuleProps) {
  const [activeSubTab, setActiveSubTab] = useState<"civil" | "interior">("civil");

  if (!tasks) return <div className="p-10 text-center text-slate-500">Design data not available.</div>;

  const civilTasks = tasks.filter(t => t.category === "Civil");
  const interiorTasks = tasks.filter(t => t.category === "Interior");
  console.log("DesignModule tasks:", tasks);
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-200 w-fit">
        <button
          onClick={() => setActiveSubTab("civil")}
          className={cn(
            "px-6 py-2 rounded-xl text-xs font-medium transition-all",
            activeSubTab === "civil" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "text-slate-400 hover:text-slate-900"
          )}
        >
          Civil Designing
        </button>
        <button
          onClick={() => setActiveSubTab("interior")}
          className={cn(
            "px-6 py-2 rounded-xl text-xs font-medium transition-all",
            activeSubTab === "interior" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "text-slate-400 hover:text-slate-900"
          )}
        >
          Interior Designing
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(activeSubTab === "civil" ? civilTasks : interiorTasks).map((task) => (
          <DesignTaskCard key={task.id} task={task} onStatusChange={(status) => updateTaskStatus?.(task.id, status)} />
        ))}
      </div>
    </div>
  );
}

function DesignTaskCard({ task, onStatusChange }: { task: OfficeTask, onStatusChange?: (status: OfficeTaskStatus) => void }) {
  const statusColors = {
    "Pending": "bg-slate-100 text-slate-500 border-slate-200",
    "In Progress": "bg-blue-50 text-blue-600 border-blue-200",
    "Completed": "bg-green-50 text-green-600 border-green-200",
  };

  const statusOptions: OfficeTaskStatus[] = ["Pending", "In Progress", "Completed"];

  return (
    <Card className="p-6 space-y-4 hover:shadow-lg transition-all group border-slate-200">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h4 className="text-sm font-medium text-slate-900 group-hover:text-indigo-600 transition-colors">{task.title}</h4>
          <select
            value={task.status}
            onChange={(e) => onStatusChange?.(e.target.value as OfficeTaskStatus)}
            className={cn(
              "text-[10px] px-2 py-0.5 rounded-full border font-medium uppercase tracking-widest focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer",
              statusColors[task.status]
            )}
          >
            {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
        <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
          <FileText className="w-4 h-4 text-slate-400" />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-[10px] font-medium text-slate-400 uppercase tracking-widest font-mono">
          <span>Progress</span>
          <span>{task.progress}%</span>
        </div>
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-indigo-600 transition-all duration-500" 
            style={{ width: `${task.progress}%` }} 
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-50">
        <div className="flex -space-x-2">
          {task.assignedTo && task.assignedTo.length > 0 ? (
            task.assignedTo.map((user, i) => (
              <div key={i} className="w-6 h-6 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-[10px] font-medium text-indigo-600 font-mono" title={user.name}>
                {(user.name || user)[0]}
              </div>
            ))
          ) : (
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Unassigned</span>
          )}
        </div>
        <Button variant="ghost" size="sm" className="h-8 text-[10px] font-medium uppercase tracking-widest gap-1 hover:text-indigo-600 p-0">
          Details <ChevronRight className="w-3 h-3" />
        </Button>
      </div>
    </Card>
  );
}
