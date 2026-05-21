import { Card } from "@/components/ui/Card";

export default function ArkitonPage() {
  const sections = [
    { title: "ABOUT US", content: "Arkiton blends architecture, engineering, and project management to deliver modern construction solutions for commercial and residential sites." },
    { title: "TEAM INTRODUCTION", content: "Our team includes architects, designers, supervisors, and site engineers working together to deliver every project on time." },
    { title: "ARKITON INTRODUCTION", content: "Experience the Arkiton advantage - where innovative design meets precise engineering for sustainable construction." },
    { title: "PROJECT DETAIL - DATA", content: "Detailed project data, including layouts, structural plans, and technical specifications for all our active developments." },
    { title: "WORK PORTFOLIO", content: "Browse our gallery of completed villas, commercial spaces, and multi-story apartment complexes across the country." },
    { title: "TESTIMONIAL", content: "What our clients say about our commitment to quality, transparency, and timely delivery of their dream projects." },
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="space-y-4">
        <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">ARKITON</h2>
        <div className="h-1.5 w-20 bg-indigo-600 rounded-full" />
        <p className="text-lg font-medium text-slate-500 max-w-3xl">
          Redefining construction through design excellence and technical precision.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {sections.map((s) => (
          <Card key={s.title} className="p-8 hover:shadow-xl transition-all duration-300 border-slate-100 group">
            <h3 className="text-sm font-black text-indigo-600 uppercase tracking-widest mb-4 group-hover:translate-x-1 transition-transform">{s.title}</h3>
            <p className="text-base text-slate-600 leading-relaxed font-medium">
              {s.content}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
