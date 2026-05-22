"use client";

import { useProjects } from "@/lib/projects-store";
import { MapPin, HardHat, ChevronRight, Filter, Phone } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function GuestPortfolioPage() {
  const { projects } = useProjects();
  const [activeFilter, setActiveFilter] = useState("All");
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const filters = ["All", "In Progress", "Planned", "Completed"];
  const filtered = activeFilter === "All" ? projects : projects.filter(p => p.status === activeFilter);

  const stats = [
    { value: `${projects.length}+`, label: "Total Projects" },
    { value: `${projects.filter(p => p.status === "In Progress").length}`, label: "Active Sites" },
    { value: "12+", label: "Years Experience" },
    { value: "100%", label: "Client Satisfaction" },
  ];

  const gradients = [
    "from-indigo-900 to-blue-800",
    "from-slate-800 to-slate-700",
    "from-amber-900 to-orange-800",
    "from-emerald-900 to-teal-800",
  ];

  return (
    <div className="animate-in fade-in duration-500">

      {/* Hero */}
      <div className="relative bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1486325212027-8081e485255e?q=80&w=2000')] bg-cover bg-center opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 to-slate-900" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center space-y-6">
          <span className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold px-4 py-2 rounded-full uppercase tracking-widest">
            ✦ Our Work Portfolio
          </span>
          <h1 className="text-5xl md:text-6xl font-black text-white leading-tight">
            Projects That Define<br />
            <span className="text-indigo-400">Excellence</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
            From luxury villas to commercial landmarks — explore our portfolio of transformative construction projects across India.
          </p>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map(s => (
              <div key={s.label} className="space-y-1">
                <p className="text-4xl font-black text-white">{s.value}</p>
                <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Projects Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">

        {/* Filter Tabs */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-slate-400">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-semibold">Filter:</span>
          </div>
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={cn(
                "px-5 py-2 rounded-full text-sm font-bold transition-all duration-200",
                activeFilter === f
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:scale-105"
              )}
            >
              {f}
            </button>
          ))}
          <span className="ml-auto text-sm text-slate-400 font-medium bg-slate-100 px-3 py-1 rounded-full">
            {filtered.length} project{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((p, i) => (
            <div
              key={p.id}
              onMouseEnter={() => setHoveredId(p.id)}
              onMouseLeave={() => setHoveredId(null)}
              className={cn(
                "group relative bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm transition-all duration-500 cursor-pointer",
                hoveredId === p.id ? "shadow-2xl shadow-indigo-100 -translate-y-1" : "",
                i === 0 ? "md:col-span-2" : ""
              )}
            >
              {/* Image area */}
              <div className={cn(
                "relative overflow-hidden bg-gradient-to-br",
                gradients[i % gradients.length],
                i === 0 ? "h-72" : "h-52"
              )}>
                <div className="absolute inset-0 flex items-center justify-center opacity-20">
                  <HardHat className="w-24 h-24 text-white" />
                </div>

                {/* Hover overlay */}
                <div className={cn(
                  "absolute inset-0 bg-indigo-600/20 transition-opacity duration-300",
                  hoveredId === p.id ? "opacity-100" : "opacity-0"
                )} />

                {/* Status badge */}
                <div className="absolute top-4 left-4">
                  <span className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-lg",
                    p.status === "In Progress" ? "bg-green-500 text-white" :
                    p.status === "Completed" ? "bg-blue-500 text-white" :
                    "bg-amber-500 text-white"
                  )}>
                    {p.status}
                  </span>
                </div>

                {/* Progress bar overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-white/80 uppercase tracking-wider">Progress</span>
                    <span className="text-sm font-black text-white">{p.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-400 rounded-full transition-all duration-1000"
                      style={{ width: `${p.progress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 space-y-4">
                <div>
                  <h3 className={cn(
                    "text-xl font-black transition-colors duration-200",
                    hoveredId === p.id ? "text-indigo-600" : "text-slate-900"
                  )}>
                    {p.name}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-sm font-medium text-slate-500">{p.location}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-50">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Start Date</p>
                    <p className="text-sm font-semibold text-slate-700 mt-0.5">{p.startDate || "—"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Completion</p>
                    <p className="text-sm font-semibold text-slate-700 mt-0.5">{p.expectedCompletion || "—"}</p>
                  </div>
                </div>

                {/* Stage pills */}
                <div className="flex gap-1.5 flex-wrap">
                  {p.stages.slice(0, 5).map(s => (
                    <span key={s.name} className={cn(
                      "text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
                      s.status === "Completed" ? "bg-green-100 text-green-700" :
                      s.status === "In Progress" ? "bg-indigo-100 text-indigo-700 animate-pulse" :
                      "bg-slate-100 text-slate-400"
                    )}>
                      {s.name}
                    </span>
                  ))}
                  {p.stages.length > 5 && (
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-400">
                      +{p.stages.length - 5}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-24 space-y-4">
            <HardHat className="w-16 h-16 mx-auto text-slate-200" />
            <p className="text-slate-400 font-semibold text-lg">No projects match this filter.</p>
            <button onClick={() => setActiveFilter("All")} className="text-indigo-600 font-bold hover:underline">
              Show all projects
            </button>
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="bg-slate-900 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-4xl font-black text-white">Interested in working with us?</h2>
          <p className="text-slate-400 text-lg">Let's discuss your project and bring your vision to life.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <a href="tel:+919876543210"
              className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-10 rounded-2xl transition-all shadow-xl shadow-indigo-900/50 group">
              <Phone className="w-4 h-4" /> Call Us Now
            </a>
            <Link href="/"
              className="inline-flex items-center justify-center gap-2 border border-white/20 text-white hover:bg-white/10 font-bold py-4 px-10 rounded-2xl transition-all group">
              Back to Home <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
