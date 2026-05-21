import { Card } from "@/components/ui/Card";

export default function WorkingSOPPage() {
  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="space-y-4">
        <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">WORKING SOP</h2>
        <div className="h-1.5 w-20 bg-indigo-600 rounded-full" />
        <p className="text-lg font-medium text-slate-500 max-w-3xl">
          Standard operating procedures for project workflows and site execution.
        </p>
      </div>

      <Card className="p-10 border-slate-100 hover:shadow-xl transition-all duration-300 group">
        <h3 className="text-sm font-black text-indigo-600 uppercase tracking-widest mb-6">KAM KAI RITE THASE TENA SOP</h3>
        <p className="text-lg text-slate-700 leading-relaxed font-semibold">
          Step-by-step guidelines on our operational workflow, from initial layout to final handover.
        </p>
      </Card>

      <Card className="p-10 border-slate-100 hover:shadow-xl transition-all duration-300">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-sm font-black text-indigo-600 uppercase tracking-widest">VIDEO AVSHE BADHI AGENCY NA</h3>
          <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-full tracking-widest">COMING SOON</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {["Plumbing Agency", "Electrical Agency", "Structure Agency", "Interior Agency", "Painting Agency"].map((agency) => (
            <div key={agency} className="aspect-video bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-3 group hover:bg-slate-100 transition-colors cursor-pointer">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[12px] border-l-indigo-600 border-b-[8px] border-b-transparent ml-1" />
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{agency}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
