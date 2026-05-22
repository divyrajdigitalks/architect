"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useProjects } from "@/lib/projects-store";
import {
  ChevronRight, Phone, MapPin, ArrowRight, Star,
  Briefcase, HardHat, Users, PenTool, CheckCircle2,
  Play, X, Building2, Award, Zap, Heart,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Animated counter hook ──────────────────────────────────────────────────
function useCounter(target: number, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return count;
}

// ── Stats section with animated counters ──────────────────────────────────
function AnimatedStats() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const c1 = useCounter(50, 1800, visible);
  const c2 = useCounter(12, 1500, visible);
  const c3 = useCounter(200, 2000, visible);
  const c4 = useCounter(98, 1600, visible);

  const stats = [
    { value: c1, suffix: "+", label: "Projects Delivered" },
    { value: c2, suffix: "+", label: "Years Experience" },
    { value: c3, suffix: "+", label: "Happy Clients" },
    { value: c4, suffix: "%", label: "On-Time Delivery" },
  ];

  return (
    <div ref={ref} className="bg-indigo-600 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s) => (
            <div key={s.label} className="space-y-1">
              <p className="text-5xl font-black text-white tabular-nums">
                {s.value}{s.suffix}
              </p>
              <p className="text-indigo-200 text-sm font-semibold uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function GuestHomePage() {
  const { projects } = useProjects();
  const [activeService, setActiveService] = useState(0);
  const [videoOpen, setVideoOpen] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const services = [
    {
      icon: Briefcase, title: "Residential Villas",
      desc: "Custom luxury homes designed to reflect your lifestyle. From compact 2BHK to sprawling 5BHK villas — we craft every detail.",
      features: ["Custom floor plans", "3D visualization", "Premium materials", "Interior design included"],
      color: "bg-indigo-600",
    },
    {
      icon: Building2, title: "Commercial Spaces",
      desc: "Modern offices, retail outlets, and commercial complexes built to impress clients and maximize productivity.",
      features: ["Space optimization", "Modern aesthetics", "Structural safety", "On-time delivery"],
      color: "bg-slate-800",
    },
    {
      icon: PenTool, title: "Interior Design",
      desc: "End-to-end interior solutions — from concept boards to final handover. Every room tells your story.",
      features: ["Concept to completion", "Furniture planning", "Lighting design", "Material selection"],
      color: "bg-blue-700",
    },
    {
      icon: HardHat, title: "Project Management",
      desc: "Full-cycle construction management with real-time site tracking, daily reports, and transparent communication.",
      features: ["Real-time tracking", "Daily reports", "Budget control", "Quality audits"],
      color: "bg-emerald-700",
    },
  ];

  const testimonials = [
    { name: "Alice Johnson", project: "Modern Villa, Beverly Hills", rating: 5, text: "ArchiSite delivered our dream home on time and within budget. The attention to detail was extraordinary. Every corner of our home reflects the care they put into it." },
    { name: "Bob Smith", project: "City Heights Apartment", rating: 5, text: "Professional team, transparent process, and stunning results. The real-time tracking kept us informed at every stage. Highly recommend for any construction project." },
    { name: "Charlie Brown", project: "Lakeview Residence", rating: 5, text: "The site tracking system kept us informed at every stage. We always knew exactly what was happening. The quality of work exceeded our expectations completely." },
  ];

  const process = [
    { step: "01", title: "Consultation", desc: "Free site visit & requirement gathering" },
    { step: "02", title: "Design", desc: "Architectural drawings & 3D models" },
    { step: "03", title: "Approval", desc: "Permits & regulatory clearances" },
    { step: "04", title: "Build", desc: "Systematic construction with daily updates" },
    { step: "05", title: "Handover", desc: "Quality audit & documentation" },
  ];

  // Auto-rotate testimonials
  useEffect(() => {
    const t = setInterval(() => setActiveTestimonial(p => (p + 1) % testimonials.length), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="animate-in fade-in duration-500">

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-slate-950">
        {/* Background */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1503387762-592dea58ef23?q=80&w=2000')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-950/50" />

        {/* Floating shapes */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-40 w-48 h-48 bg-blue-600/10 rounded-full blur-2xl animate-pulse delay-1000" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-500/30 px-4 py-2 rounded-full">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs font-bold text-green-300 uppercase tracking-widest">Now Accepting New Projects</span>
              </div>

              <h1 className="text-6xl lg:text-7xl font-black text-white leading-[1.05] tracking-tight">
                Crafting<br />
                Spaces,<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">
                  Building<br />Legacies.
                </span>
              </h1>

              <p className="text-slate-300 text-xl leading-relaxed max-w-lg">
                We transform architectural visions into structural realities. From concept to completion — excellence at every stage.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link href="/guest/portfolio"
                  className="group inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 px-8 rounded-2xl transition-all shadow-2xl shadow-indigo-900/50">
                  Explore Portfolio
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <button
                  onClick={() => setVideoOpen(true)}
                  className="group inline-flex items-center gap-3 border border-white/20 text-white hover:bg-white/10 font-bold py-4 px-8 rounded-2xl transition-all">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                    <Play className="w-3.5 h-3.5 text-white ml-0.5" />
                  </div>
                  Watch Showreel
                </button>
              </div>

              {/* Trust badges */}
              <div className="flex items-center gap-6 pt-4 border-t border-white/10">
                {[["ISO Certified", "✓"], ["Award Winning", "★"], ["5-Star Rated", "♦"]].map(([label, icon]) => (
                  <div key={label} className="flex items-center gap-2">
                    <span className="text-indigo-400 font-black">{icon}</span>
                    <span className="text-xs font-semibold text-slate-400">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Project cards stack */}
            <div className="hidden lg:block relative h-[520px]">
              {projects.slice(0, 3).map((p, i) => (
                <div
                  key={p.id}
                  className={cn(
                    "absolute bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6 transition-all duration-500 hover:bg-white/10 hover:border-white/20 hover:-translate-y-2",
                    i === 0 && "top-0 left-0 w-72 z-30",
                    i === 1 && "top-16 left-24 w-72 z-20",
                    i === 2 && "top-32 left-48 w-72 z-10",
                  )}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className={cn(
                      "text-xs font-black px-2.5 py-1 rounded-full uppercase tracking-wider",
                      p.status === "In Progress" ? "bg-green-500/20 text-green-400" : "bg-amber-500/20 text-amber-400"
                    )}>
                      {p.status}
                    </span>
                    <span className="text-xs font-bold text-white/50 font-mono">{p.progress}%</span>
                  </div>
                  <h4 className="text-white font-black text-lg mb-1">{p.name}</h4>
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-4">
                    <MapPin className="w-3 h-3" /> {p.location}
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${p.progress}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <div className="w-px h-10 bg-white/20" />
          <span className="text-[10px] text-white/30 uppercase tracking-widest">Scroll</span>
        </div>
      </section>

      {/* ── ANIMATED STATS ───────────────────────────────────────────────── */}
      <AnimatedStats />

      {/* ── SERVICES ─────────────────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center space-y-4">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">What We Do</span>
            <h2 className="text-4xl font-black text-slate-900">Our Services</h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">End-to-end construction and design solutions tailored to your vision.</p>
          </div>

          {/* Service tabs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Tab buttons */}
            <div className="space-y-3">
              {services.map((s, i) => (
                <button
                  key={s.title}
                  onClick={() => setActiveService(i)}
                  className={cn(
                    "w-full flex items-center gap-4 p-5 rounded-2xl border-2 text-left transition-all duration-300",
                    activeService === i
                      ? "border-indigo-300 bg-indigo-50 shadow-lg shadow-indigo-100"
                      : "border-slate-100 bg-white hover:border-slate-200 hover:shadow-md"
                  )}
                >
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all",
                    activeService === i ? s.color : "bg-slate-100"
                  )}>
                    <s.icon className={cn("w-6 h-6", activeService === i ? "text-white" : "text-slate-500")} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={cn("font-black text-base transition-colors", activeService === i ? "text-indigo-600" : "text-slate-900")}>
                      {s.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{s.desc}</p>
                  </div>
                  <ChevronRight className={cn("w-5 h-5 flex-shrink-0 transition-all", activeService === i ? "text-indigo-600 translate-x-1" : "text-slate-300")} />
                </button>
              ))}
            </div>

            {/* Active service detail */}
            <div className={cn(
              "rounded-3xl p-10 text-white space-y-6 sticky top-24 transition-all duration-300",
              services[activeService].color
            )}>
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                {(() => { const Icon = services[activeService].icon; return <Icon className="w-8 h-8 text-white" />; })()}
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-black">{services[activeService].title}</h3>
                <p className="text-white/80 leading-relaxed text-base">{services[activeService].desc}</p>
              </div>
              <div className="space-y-2.5 pt-4 border-t border-white/20">
                {services[activeService].features.map(f => (
                  <div key={f} className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-white/70 flex-shrink-0" />
                    <span className="text-sm font-semibold text-white/90">{f}</span>
                  </div>
                ))}
              </div>
              <Link href="/guest/portfolio"
                className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white font-bold py-3 px-6 rounded-xl transition-all group">
                See Examples <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURED PROJECTS ────────────────────────────────────────────── */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="flex items-end justify-between">
            <div className="space-y-2">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Our Work</span>
              <h2 className="text-4xl font-black text-slate-900">Featured Projects</h2>
            </div>
            <Link href="/guest/portfolio"
              className="inline-flex items-center gap-2 text-indigo-600 font-bold hover:gap-3 transition-all text-sm">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {projects.map((p, i) => (
              <div
                key={p.id}
                className={cn(
                  "group relative rounded-3xl overflow-hidden cursor-pointer",
                  i === 0 ? "md:col-span-2 h-80" : "h-64"
                )}
              >
                {/* BG */}
                <div className={cn(
                  "absolute inset-0 bg-gradient-to-br transition-transform duration-700 group-hover:scale-105",
                  i === 0 ? "from-indigo-900 to-blue-800" :
                  i === 1 ? "from-slate-800 to-slate-700" :
                  "from-amber-900 to-orange-800"
                )} />
                <div className="absolute inset-0 flex items-center justify-center opacity-10">
                  <HardHat className="w-32 h-32 text-white" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Content */}
                <div className="absolute inset-0 p-8 flex flex-col justify-end space-y-3">
                  <span className={cn(
                    "self-start px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider",
                    p.status === "In Progress" ? "bg-green-500 text-white" : "bg-amber-500 text-white"
                  )}>
                    {p.status}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-indigo-300" />
                    <span className="text-xs font-bold text-indigo-300 uppercase tracking-widest">{p.location}</span>
                  </div>
                  <h4 className="text-2xl font-black text-white group-hover:text-indigo-300 transition-colors">{p.name}</h4>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${p.progress}%` }} />
                    </div>
                    <span className="text-xs font-black text-white/70">{p.progress}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROCESS STRIP ────────────────────────────────────────────────── */}
      <section className="py-20 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">How We Work</span>
            <h2 className="text-4xl font-black text-slate-900">Our 5-Step Process</h2>
          </div>
          <div className="relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-8 left-[10%] right-[10%] h-0.5 bg-slate-100" />
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              {process.map((p, i) => (
                <div key={p.step} className="relative flex flex-col items-center text-center space-y-3 group">
                  <div className="w-16 h-16 bg-white border-2 border-slate-200 rounded-2xl flex items-center justify-center font-black text-xl text-slate-400 group-hover:border-indigo-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-all duration-300 relative z-10 shadow-sm">
                    {p.step}
                  </div>
                  <h4 className="font-black text-slate-900 text-sm">{p.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="text-center">
            <Link href="/guest/process"
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 px-10 rounded-2xl transition-all group">
              See Full Process <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────────────── */}
      <section className="py-24 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Client Stories</span>
            <h2 className="text-4xl font-black text-white">What Our Clients Say</h2>
          </div>

          {/* Active testimonial */}
          <div className="max-w-3xl mx-auto">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-10 space-y-6 text-center">
              <div className="flex justify-center gap-1">
                {Array.from({ length: testimonials[activeTestimonial].rating }).map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-white text-xl leading-relaxed italic font-medium">
                "{testimonials[activeTestimonial].text}"
              </p>
              <div className="flex items-center justify-center gap-3 pt-4 border-t border-white/10">
                <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black">
                  {testimonials[activeTestimonial].name.split(" ").map(n => n[0]).join("")}
                </div>
                <div className="text-left">
                  <p className="font-black text-white">{testimonials[activeTestimonial].name}</p>
                  <p className="text-xs text-slate-400">{testimonials[activeTestimonial].project}</p>
                </div>
              </div>
            </div>

            {/* Dots */}
            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  className={cn(
                    "rounded-full transition-all duration-300",
                    i === activeTestimonial ? "w-8 h-2.5 bg-indigo-500" : "w-2.5 h-2.5 bg-white/20 hover:bg-white/40"
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-indigo-600 rounded-[3rem] p-12 md:p-20 text-center space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/30 rounded-full -mr-48 -mt-48 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/20 rounded-full -ml-32 -mb-32 blur-3xl" />
            <div className="relative z-10 space-y-6">
              <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
                Ready to build your dream?<br />
                <span className="text-indigo-200">Let's talk.</span>
              </h2>
              <p className="text-indigo-100 text-lg max-w-xl mx-auto">
                Get a free consultation and project estimate from our expert team. No commitment required.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <a href="tel:+919876543210"
                  className="group flex items-center gap-3 bg-white/10 hover:bg-white/20 border border-white/20 px-8 py-4 rounded-2xl transition-all">
                  <Phone className="w-5 h-5 text-white" />
                  <div className="text-left">
                    <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest">Call Us</p>
                    <p className="text-lg font-black text-white font-mono">+91 98765 43210</p>
                  </div>
                </a>
                <Link href="/guest/about"
                  className="group inline-flex items-center gap-2 bg-white text-indigo-600 hover:bg-slate-50 font-black py-4 px-10 rounded-2xl transition-all shadow-2xl text-base">
                  Meet Our Team <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── VIDEO MODAL ──────────────────────────────────────────────────── */}
      {videoOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setVideoOpen(false)}
        >
          <div className="relative w-full max-w-3xl aspect-video bg-slate-900 rounded-3xl overflow-hidden border border-white/10 shadow-2xl"
            onClick={e => e.stopPropagation()}>
            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 text-white">
              <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center shadow-2xl">
                <Play className="w-8 h-8 text-white ml-1" />
              </div>
              <p className="text-slate-400 font-semibold">Showreel coming soon</p>
            </div>
            <button
              onClick={() => setVideoOpen(false)}
              className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
