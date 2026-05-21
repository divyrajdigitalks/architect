"use client";

import { useProjects } from "@/lib/projects-store";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Hammer, ChevronRight, Briefcase, HardHat } from "lucide-react";
import Link from "next/link";
import { ExecutionModule } from "@/components/projects/ExecutionModule";
import { useState } from "react";

export default function SiteWorkPage() {
  const { projects } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Site Execution Hub</h2>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">Monitor Civil & Interior Work at all construction sites</p>
        </div>
        <div className="bg-orange-50 px-4 py-2 rounded-xl border border-orange-100 flex items-center gap-3">
          <HardHat className="w-5 h-5 text-orange-600" />
          <span className="text-xs font-bold text-orange-700 uppercase tracking-wider">{projects.length} Active Sites</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Project List Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-2">Select Site</h3>
          <div className="space-y-2">
            {projects.map(project => (
              <button
                key={project.id}
                onClick={() => setSelectedProjectId(project.id)}
                className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 group ${
                  selectedProjectId === project.id 
                    ? "bg-orange-600 border-orange-600 text-white shadow-lg shadow-orange-100" 
                    : "bg-white border-slate-200 text-slate-600 hover:border-orange-300 hover:bg-slate-50"
                }`}>
                <div className="flex items-center gap-3">
                  <Briefcase className={`w-4 h-4 ${selectedProjectId === project.id ? "text-orange-200" : "text-slate-400"}`} />
                  <div>
                    <p className="text-sm font-bold truncate">{project.name}</p>
                    <p className={`text-[10px] font-medium uppercase tracking-wider ${selectedProjectId === project.id ? "text-orange-200" : "text-slate-400"}`}>
                      {project.progress}% Complete
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          {selectedProject ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-slate-200">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{selectedProject.name}</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{selectedProject.location}</p>
                </div>
                <Link href={`/projects/${selectedProject.id}`}>
                  <Button variant="outline" size="sm" className="gap-2 text-[10px] font-black uppercase tracking-widest">
                    Go to Project
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
              
              {selectedProject.flow && (
                <ExecutionModule data={selectedProject.flow.siteWork} projectId={selectedProject.id} />
              )}
            </div>
          ) : (
            <div className="h-[400px] bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200 flex flex-col items-center justify-center text-center p-10">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mb-6">
                <Hammer className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No Site Selected</h3>
              <p className="text-sm text-slate-500 max-w-xs mt-2 font-medium">Please select a project from the left sidebar to monitor its site execution progress.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
