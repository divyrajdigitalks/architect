"use client";

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
  HardHat
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

export default function SiteWorkPage() {
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

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="SITE WORK" 
        description="Track on-site execution, daily logs, and technical implementation."
      >
        <Button className="rounded-xl font-bold gap-2 bg-blue-600 hover:bg-blue-500">
          <Plus className="w-4 h-4" /> Log Site Activity
        </Button>
      </PageHeader>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {siteStats.map((stat) => (
          <Card key={stat.title} className="p-6 border-slate-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", stat.bg)}>
                <stat.icon className={cn("w-6 h-6", stat.color)} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.title}</p>
                <h3 className="text-2xl font-black text-slate-900">{stat.count}</h3>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Site Activity Table */}
        <Card className="lg:col-span-2 border-slate-100 shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 px-6 py-4">
            <CardTitle className="text-sm font-black text-slate-900 uppercase tracking-widest">Active Site Execution</CardTitle>
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
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  <tr>
                    <th className="px-6 py-4">Site ID</th>
                    <th className="px-6 py-4">Current Task</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {activeSites.map((site) => (
                    <tr key={site.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                          {site.id}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-slate-900">{site.task}</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{site.project} / {site.supervisor}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
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
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8 group-hover:bg-white group-hover:text-blue-600">
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Site Media & Tools */}
        <div className="space-y-6">
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
        </div>
      </div>
    </div>
  );
}
