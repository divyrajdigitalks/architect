"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { 
  Hammer, 
  Camera, 
  ClipboardList, 
  MapPin, 
  CheckCircle2, 
  Plus, 
  Search,
  Filter,
  ArrowRight,
  HardHat,
  X
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
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

export default function SiteWorkPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newLog, setNewLog] = useState({ project: "", task: "", status: "On Track" });

  const siteStats = [
    { title: "Active Sites", count: 4, icon: MapPin, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "On-site Team", count: 28, icon: HardHat, color: "text-indigo-600", bg: "bg-indigo-50" },
    { title: "Site Logs", count: 15, icon: ClipboardList, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Inspections", count: 2, icon: CheckCircle2, color: "text-indigo-600", bg: "bg-indigo-50" },
  ];

  const activeSites = [
    { id: "SW-001", project: "Modern Villa", task: "Foundation Casting", supervisor: "Mike Ross", status: "Critical", progress: 85 },
    { id: "SW-002", project: "City Heights", task: "Electrical Conduit", supervisor: "Sarah Lane", status: "On Track", progress: 45 },
    { id: "SW-003", project: "Lakeview Res.", task: "Site Preparation", supervisor: "John Doe", status: "Delayed", progress: 15 },
  ];

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("New Site Log:", newLog);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="SITE WORK" 
        description="Track on-site execution, daily logs, and technical implementation."
      >
        <Button onClick={() => setIsModalOpen(true)} className="rounded-xl font-medium gap-2 bg-blue-600 hover:bg-blue-500">
          <Plus className="w-4 h-4" /> Log Site Activity
        </Button>
      </PageHeader>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Log New Site Activity"
      >
        <form onSubmit={handleAddLog} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Project</label>
            <select 
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              value={newLog.project}
              onChange={(e) => setNewLog({...newLog, project: e.target.value})}
              required
            >
              <option value="">Select Project</option>
              <option value="Modern Villa">Modern Villa</option>
              <option value="City Heights">City Heights</option>
              <option value="Lakeview">Lakeview</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Current Task / Activity</label>
            <Input 
              placeholder="e.g., Foundation Casting" 
              value={newLog.task}
              onChange={(e) => setNewLog({...newLog, task: e.target.value})}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Status</label>
            <select 
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              value={newLog.status}
              onChange={(e) => setNewLog({...newLog, status: e.target.value})}
            >
              <option value="On Track">On Track</option>
              <option value="Delayed">Delayed</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-medium">Save Activity</Button>
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

      <div className="grid  gap-8">
        {/* Site Activity Table */}
        <Card className=" border-slate-100 shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 px-6 py-4">
            <CardTitle className="text-sm font-medium text-slate-900 uppercase tracking-widest">Active Site Execution</CardTitle>
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
                  <TableHead className="px-6">Site ID</TableHead>
                  <TableHead className="px-6">Current Task</TableHead>
                  <TableHead className="px-6">Status</TableHead>
                  <TableHead className="px-6 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeSites.map((site) => (
                  <TableRow key={site.id} className="hover:bg-slate-50/50 transition-colors group">
                    <TableCell className="px-6 py-4">
                      <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded font-mono">
                        {site.id}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-slate-900">{site.task}</p>
                        <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{site.project} / {site.supervisor}</p>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Badge 
                          variant={site.status === "Critical" ? "destructive" : site.status === "Delayed" ? "warning" : "success"}
                          className="text-[9px] px-2 py-0"
                        >
                          {site.status}
                        </Badge>
                        <div className="flex-1 w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden hidden sm:block">
                          <div 
                            className={cn(
                              "h-full rounded-full transition-all duration-500",
                              site.status === "Critical" ? "bg-red-500" : site.status === "Delayed" ? "bg-orange-500" : "bg-green-500"
                            )} 
                            style={{ width: `${site.progress}%` }} 
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8 group-hover:bg-white group-hover:text-blue-600">
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Site Media & Tools */}
        {/* <div className="space-y-6">
          <Card className="p-6 bg-slate-900 text-white border-slate-800 shadow-xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-blue-600/30 transition-all" />
            <div className="relative z-10 space-y-4">
              <Camera className="w-8 h-8 text-blue-400" />
              <h3 className="text-lg font-black tracking-tight">Site Photo Stream</h3>
              <p className="text-sm text-slate-400 font-medium">Real-time photo updates from all active construction sites.</p>
              <Button className="w-full bg-blue-600 hover:bg-blue-500 border-none rounded-xl font-bold h-10 mt-2">View Stream</Button>
            </div>
          </Card>

          <Card className="p-6 border-slate-100">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4">Site Safety Protocol</h3>
            <div className="space-y-3">
              {[
                { label: "PPE Checklist", status: "Verified" },
                { label: "Safety Audit", status: "Pending" },
                { label: "Emergency Contacts", status: "Active" },
              ].map((tool) => (
                <div key={tool.label} className="flex items-center justify-between p-3 rounded-xl border border-slate-50 bg-slate-50/50">
                  <span className="text-xs font-bold text-slate-600">{tool.label}</span>
                  <span className={cn(
                    "text-[9px] font-black uppercase px-2 py-0.5 rounded",
                    tool.status === "Verified" ? "text-green-600 bg-green-50" : 
                    tool.status === "Pending" ? "text-orange-600 bg-orange-50" : "text-blue-600 bg-blue-50"
                  )}>
                    {tool.status}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div> */}
      </div>
    </div>
  );
}
