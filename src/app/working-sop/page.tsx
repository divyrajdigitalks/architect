import { Card } from "@/components/ui/Card";
import { PlayCircle, CheckCircle2, ClipboardList, HardHat, PenTool, Hammer, Droplets, Zap, ShieldCheck } from "lucide-react";

export default function WorkingSOPPage() {
  const sopStages = [
    { 
      title: "Plumbing Agency", 
      icon: Droplets,
      desc: "Water line layout, drainage mapping, and fixture installation standards.",
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    { 
      title: "Electrical Agency", 
      icon: Zap,
      desc: "Conduit placement, wiring safety protocols, and point distribution.",
      color: "text-orange-600",
      bg: "bg-orange-50"
    },
    { 
      title: "Structure Agency", 
      icon: Hammer,
      desc: "Column casting, beam reinforcement, and slab curing guidelines.",
      color: "text-indigo-600",
      bg: "bg-indigo-50"
    },
    { 
      title: "Interior Agency", 
      icon: PenTool,
      desc: "Furniture framing, false ceiling heights, and finishing quality checks.",
      color: "text-purple-600",
      bg: "bg-purple-50"
    },
    { 
      title: "Painting Agency", 
      icon: Droplets,
      desc: "Wall preparation, putty application, and final coat finishing.",
      color: "text-teal-600",
      bg: "bg-teal-50"
    },
    { 
      title: "Safety & QA", 
      icon: ShieldCheck,
      desc: "Site safety equipment, material quality audits, and safety checks.",
      color: "text-rose-600",
      bg: "bg-rose-50"
    },
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-white p-12 rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-2 h-full bg-indigo-600" />
        <div className="space-y-6 max-w-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100">
              <ClipboardList className="w-5 h-5 text-indigo-600" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">WORKING SOP</h2>
          </div>
          <p className="text-lg font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
            Standard operating procedures for project workflows and site execution. KAM KAI RITE THASE TENA SOP.
          </p>
        </div>
        <div className="flex -space-x-4 overflow-hidden">
          {[1,2,3,4].map(i => (
            <div key={i} className="inline-block h-16 w-16 rounded-3xl ring-4 ring-white bg-slate-100 flex items-center justify-center text-slate-400 font-black border border-slate-200">
              {i}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 p-10 bg-slate-900 text-white border-slate-800 space-y-8 shadow-2xl">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
            <HardHat className="w-8 h-8 text-indigo-400" />
          </div>
          <div className="space-y-4">
            <h3 className="text-2xl font-black tracking-tight leading-tight">Master Workflow <br /> Guidelines</h3>
            <p className="text-slate-400 font-medium leading-relaxed">
              Our SOPs ensure consistent quality across all sites. Every agency follows these strict technical specifications.
            </p>
          </div>
          <div className="space-y-4 pt-6 border-t border-white/10">
            {[
              "Site Preparation Checklist",
              "Material Receiving SOP",
              "Daily Log Submission",
              "Quality Audit Reports"
            ].map(item => (
              <div key={item} className="flex items-center gap-3 text-sm font-bold text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                {item}
              </div>
            ))}
          </div>
        </Card>

        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {sopStages.map((sop) => (
            <div key={sop.title} className="p-8 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm group hover:border-indigo-300 transition-all duration-500 cursor-pointer relative overflow-hidden">
              <div className="flex items-start justify-between relative z-10">
                <div className={`w-14 h-14 ${sop.bg} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500 border border-transparent group-hover:border-indigo-100`}>
                  <sop.icon className={`w-7 h-7 ${sop.color}`} />
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 text-[10px] font-black text-slate-400 rounded-lg uppercase tracking-widest group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  <PlayCircle className="w-3.5 h-3.5" />
                  Watch Video
                </div>
              </div>
              <div className="mt-8 space-y-3 relative z-10">
                <h3 className="text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{sop.title}</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed line-clamp-2">
                  {sop.desc}
                </p>
              </div>
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-indigo-50/50 rounded-full group-hover:scale-150 transition-all duration-700 -z-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
