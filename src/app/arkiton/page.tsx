import { Card } from "@/components/ui/Card";
import { Building2, Users, Rocket, Database, Briefcase, Star, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function ArkitonPage() {
  const sections = [
    { title: "ABOUT US", icon: Building2, content: "Arkiton blends architecture, engineering, and project management to deliver modern construction solutions for commercial and residential sites.", color: "text-indigo-600", bg: "bg-indigo-50" },
    { title: "TEAM INTRODUCTION", icon: Users, content: "Our team includes architects, designers, supervisors, and site engineers working together to deliver every project on time.", color: "text-blue-600", bg: "bg-blue-50" },
    { title: "ARKITON INTRODUCTION", icon: Rocket, content: "Experience the Arkiton advantage - where innovative design meets precise engineering for sustainable construction.", color: "text-orange-600", bg: "bg-orange-50" },
    { title: "PROJECT DETAIL - DATA", icon: Database, content: "Detailed project data, including layouts, structural plans, and technical specifications for all our active developments.", color: "text-green-600", bg: "bg-green-50" },
    { title: "WORK PORTFOLIO", icon: Briefcase, content: "Browse our gallery of completed villas, commercial spaces, and multi-story apartment complexes across the country.", color: "text-purple-600", bg: "bg-purple-50" },
    { title: "TESTIMONIAL", icon: Star, content: "What our clients say about our commitment to quality, transparency, and timely delivery of their dream projects.", color: "text-rose-600", bg: "bg-rose-50" },
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="bg-slate-900 rounded-[3rem] p-12 text-white relative overflow-hidden group shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-indigo-600/30 transition-all duration-700" />
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-4xl font-black tracking-tight">ARKITON</h2>
          </div>
          <p className="text-xl text-slate-400 max-w-2xl font-medium leading-relaxed">
            Redefining construction through <span className="text-white">design excellence</span> and <span className="text-white">technical precision</span>. We build more than just structures; we build legacies.
          </p>
          <div className="flex gap-4">
            <Button className="rounded-2xl h-12 px-8 font-bold">Explore Our Work</Button>
            <Button variant="outline" className="rounded-2xl h-12 px-8 font-bold text-white border-white/20 hover:bg-white/10">Contact Us</Button>
          </div>
        </div>
      </div>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {sections.map((s) => (
          <Card key={s.title} className="p-8 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all duration-500 border-slate-100 group flex flex-col justify-between">
            <div className="space-y-6">
              <div className={`w-14 h-14 ${s.bg} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500`}>
                <s.icon className={`w-7 h-7 ${s.color}`} />
              </div>
              <div className="space-y-3">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] group-hover:text-indigo-600 transition-colors">{s.title}</h3>
                <p className="text-base text-slate-600 leading-relaxed font-semibold">{s.content}</p>
              </div>
            </div>
            <button className="mt-8 flex items-center gap-2 text-xs font-black text-indigo-600 uppercase tracking-widest hover:gap-3 transition-all">
              Learn More <ChevronRight className="w-4 h-4" />
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
}
