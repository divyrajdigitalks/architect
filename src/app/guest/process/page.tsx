"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2, ClipboardList, HardHat, PenTool, Hammer,
  Droplets, Zap, ShieldCheck, ChevronDown, ChevronUp,
  ArrowRight, Phone, Clock, Users, Star, PlayCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    step: "01", title: "Initial Consultation", duration: "1–2 Days", icon: Users,
    desc: "We meet with you to understand your vision, requirements, budget, and timeline.",
    details: ["Site visit and assessment", "Budget planning discussion", "Timeline estimation", "Requirement documentation"],
  },
  {
    step: "02", title: "Design & Planning", duration: "2–4 Weeks", icon: PenTool,
    desc: "Our design team creates detailed architectural drawings, 3D models, and structural plans.",
    details: ["Architectural drawings", "3D visualization", "Structural engineering plans", "Interior design concepts"],
  },
  {
    step: "03", title: "Approvals & Permits", duration: "1–3 Weeks", icon: ClipboardList,
    desc: "We handle all government approvals, building permits, and regulatory compliance.",
    details: ["Municipal approvals", "Building permits", "Environmental clearances", "Safety certifications"],
  },
  {
    step: "04", title: "Site Preparation", duration: "1 Week", icon: HardHat,
    desc: "Ground preparation, excavation, and foundation work begins with our certified site team.",
    details: ["Site clearing", "Soil testing", "Excavation", "Foundation marking"],
  },
  {
    step: "05", title: "Construction Execution", duration: "3–12 Months", icon: Hammer,
    desc: "Systematic construction following our SOPs — from foundation to finishing.",
    details: ["Foundation & structure", "Brick work & plaster", "Plumbing & electrical", "Flooring & painting"],
  },
  {
    step: "06", title: "Final Handover", duration: "1 Week", icon: Star,
    desc: "Complete quality inspection, snag list resolution, and formal handover with all documentation.",
    details: ["Final quality audit", "Snag list resolution", "Documentation handover", "Warranty registration"],
  },
];

const AGENCIES = [
  {
    id: "plumbing",   title: "Plumbing Agency",   icon: Droplets,    color: "text-blue-600",   bg: "bg-blue-50",   border: "border-blue-200",
    desc: "Complete water supply, drainage, and sanitation solutions.",
    sops: ["Water line layout & pressure testing", "Drainage mapping & slope calculation", "Fixture installation standards", "Leak detection & waterproofing", "Hot water system installation"],
  },
  {
    id: "electrical", title: "Electrical Agency", icon: Zap,          color: "text-amber-600",  bg: "bg-amber-50",  border: "border-amber-200",
    desc: "Safe and efficient electrical systems for every project.",
    sops: ["Conduit placement & routing", "Wiring safety protocols (IS standards)", "Point distribution & load calculation", "MCB & earthing installation", "Testing & commissioning"],
  },
  {
    id: "structure",  title: "Structure Agency",  icon: Hammer,       color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-200",
    desc: "Structural integrity from foundation to roof.",
    sops: ["Column casting & curing schedule", "Beam reinforcement standards", "Slab thickness & mix design", "Shuttering & de-shuttering timeline", "Quality cube testing"],
  },
  {
    id: "interior",   title: "Interior Agency",   icon: PenTool,      color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200",
    desc: "Transforming spaces with precision and style.",
    sops: ["Furniture framing & dimensions", "False ceiling height standards", "Finishing quality checklist", "Material selection process", "Final snag inspection"],
  },
  {
    id: "painting",   title: "Painting Agency",   icon: Droplets,     color: "text-teal-600",   bg: "bg-teal-50",   border: "border-teal-200",
    desc: "Premium finishes that last a lifetime.",
    sops: ["Wall preparation & crack filling", "Putty application (2 coats)", "Primer & base coat standards", "Final coat application", "Touch-up & quality check"],
  },
  {
    id: "safety",     title: "Safety & QA",       icon: ShieldCheck,  color: "text-rose-600",   bg: "bg-rose-50",   border: "border-rose-200",
    desc: "Zero-compromise safety and quality assurance.",
    sops: ["Daily safety briefing protocol", "PPE compliance checklist", "Material quality audit", "Incident reporting system", "Weekly safety inspection"],
  },
];

export default function GuestProcessPage() {
  const [openStep, setOpenStep] = useState<number | null>(0);
  const [activeAgency, setActiveAgency] = useState<string | null>(null);

  return (
    <div className="animate-in fade-in duration-500">

      {/* ── Hero ── */}
      <div className="relative bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/60 to-slate-900" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center space-y-6">
          <span className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold px-4 py-2 rounded-full uppercase tracking-widest">
            ✦ How We Work
          </span>
          <h1 className="text-5xl md:text-6xl font-black text-white leading-tight">
            Our Working <span className="text-indigo-400">Process</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Transparent, systematic, and quality-driven — every project follows our proven Standard Operating Procedures.
          </p>
          <div className="flex flex-wrap justify-center gap-8 pt-4">
            {[["6", "Process Stages"], ["100%", "Quality Assured"], ["0", "Compromise on Safety"]].map(([val, label]) => (
              <div key={label} className="text-center">
                <p className="text-3xl font-black text-indigo-400">{val}</p>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">

        {/* ── 6-Step Accordion ── */}
        <section className="space-y-8">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Step by Step</span>
            <h2 className="text-4xl font-black text-slate-900">Our 6-Step Process</h2>
            <p className="text-slate-500 max-w-xl mx-auto">From first meeting to final handover — here's exactly how we work.</p>
          </div>

          <div className="space-y-3">
            {STEPS.map((step, i) => (
              <div key={step.step}
                className={cn(
                  "rounded-2xl border-2 transition-all duration-300 overflow-hidden bg-white",
                  openStep === i ? "border-indigo-300 shadow-xl shadow-indigo-50" : "border-slate-100 hover:border-slate-200"
                )}>
                <button
                  onClick={() => setOpenStep(openStep === i ? null : i)}
                  className="w-full flex items-center gap-5 p-6 text-left"
                >
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 font-black text-sm transition-all duration-200",
                    openStep === i ? "bg-indigo-600 text-white scale-110" : "bg-slate-100 text-slate-500"
                  )}>
                    {step.step}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-lg font-black text-slate-900">{step.title}</h3>
                      <span className="hidden sm:flex items-center gap-1 text-xs font-semibold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100">
                        <Clock className="w-3 h-3" /> {step.duration}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 mt-0.5 line-clamp-1">{step.desc}</p>
                  </div>
                  {openStep === i
                    ? <ChevronUp className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                    : <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  }
                </button>

                {openStep === i && (
                  <div className="px-6 pb-6 animate-in slide-in-from-top-2 duration-200">
                    <div className="ml-[68px] border-l-2 border-indigo-100 pl-6 space-y-4">
                      <p className="text-slate-600 leading-relaxed">{step.desc}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {step.details.map(d => (
                          <div key={d} className="flex items-center gap-2.5">
                            <CheckCircle2 className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                            <span className="text-sm font-semibold text-slate-700">{d}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── Agency SOPs ── */}
        <section className="space-y-8">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Agency Standards</span>
            <h2 className="text-4xl font-black text-slate-900">Agency SOPs</h2>
            <p className="text-slate-500 max-w-xl mx-auto">Click any agency to expand their Standard Operating Procedures.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {AGENCIES.map(agency => (
              <div
                key={agency.id}
                onClick={() => setActiveAgency(activeAgency === agency.id ? null : agency.id)}
                className={cn(
                  "group rounded-3xl border-2 p-6 cursor-pointer transition-all duration-300 bg-white",
                  activeAgency === agency.id
                    ? `${agency.border} shadow-2xl -translate-y-1`
                    : "border-slate-100 hover:border-slate-200 hover:shadow-lg hover:-translate-y-0.5"
                )}
              >
                <div className="flex items-start justify-between mb-5">
                  <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110", agency.bg)}>
                    <agency.icon className={cn("w-7 h-7", agency.color)} />
                  </div>
                  <div className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    activeAgency === agency.id
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600"
                  )}>
                    <PlayCircle className="w-3 h-3" />
                    {activeAgency === agency.id ? "Hide" : "View SOP"}
                  </div>
                </div>

                <h3 className={cn(
                  "text-lg font-black transition-colors",
                  activeAgency === agency.id ? "text-indigo-600" : "text-slate-900 group-hover:text-indigo-600"
                )}>
                  {agency.title}
                </h3>
                <p className="text-sm text-slate-500 mt-1 leading-relaxed">{agency.desc}</p>

                {activeAgency === agency.id && (
                  <div className="mt-5 pt-5 border-t border-slate-100 space-y-2.5 animate-in slide-in-from-top-2 duration-200">
                    {agency.sops.map((sop, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <div className={cn("w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] font-black", agency.bg, agency.color)}>
                          {i + 1}
                        </div>
                        <span className="text-sm font-semibold text-slate-700">{sop}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── Quality Promise ── */}
        <section className="bg-slate-900 rounded-[3rem] p-12 md:p-16 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/20 rounded-full -mr-40 -mt-40 blur-3xl" />
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl font-black leading-tight">Our Quality Promise</h2>
              <p className="text-slate-400 text-lg leading-relaxed">
                Every project comes with our commitment to quality, transparency, and on-time delivery. No shortcuts, no compromises.
              </p>
              <div className="space-y-3">
                {[
                  "ISO certified construction standards",
                  "Daily progress reports to clients",
                  "3-year structural warranty",
                  "24/7 site supervisor availability",
                ].map(item => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span className="text-slate-300 font-semibold">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <a href="tel:+919876543210"
                className="flex items-center gap-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl p-5 transition-all group">
                <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Call Us Now</p>
                  <p className="text-xl font-black text-white font-mono">+91 98765 43210</p>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-400 ml-auto group-hover:translate-x-1 transition-transform" />
              </a>
              <Link href="/guest/portfolio"
                className="flex items-center gap-4 bg-indigo-600 hover:bg-indigo-700 rounded-2xl p-5 transition-all group">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <HardHat className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-indigo-200 uppercase tracking-widest">Explore</p>
                  <p className="text-lg font-black text-white">View Our Projects</p>
                </div>
                <ArrowRight className="w-5 h-5 text-indigo-200 ml-auto group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
