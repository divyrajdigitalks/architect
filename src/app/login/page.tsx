"use client";

import { useState } from "react";
import { Building2, Mail, Lock, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useRoles } from "@/lib/role-context";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

const COLOR_DOT: Record<string, string> = {
  indigo: "bg-indigo-600", blue: "bg-blue-600", orange: "bg-orange-500",
  green: "bg-green-600",  purple: "bg-purple-600", rose: "bg-rose-600",
  slate: "bg-slate-600",  teal: "bg-teal-600",
};

const COLOR_SELECTED: Record<string, { bg: string; text: string; border: string }> = {
  indigo: { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-500" },
  blue:   { bg: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-500" },
  orange: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-500" },
  green:  { bg: "bg-green-50",  text: "text-green-700",  border: "border-green-500" },
  purple: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-500" },
  rose:   { bg: "bg-rose-50",   text: "text-rose-700",   border: "border-rose-500" },
  slate:  { bg: "bg-slate-50",  text: "text-slate-700",  border: "border-slate-500" },
  teal:   { bg: "bg-teal-50",   text: "text-teal-700",   border: "border-teal-500" },
};

export default function LoginPage() {
  const { login } = useAuth();
  const { roles } = useRoles();
  const [selectedRole, setSelectedRole] = useState(roles[0]?.id ?? "architect");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(selectedRole);
  };

  const selected = roles.find(r => r.id === selectedRole);
  const selColors = COLOR_SELECTED[selected?.color ?? "indigo"];

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 -left-20 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl animate-pulse delay-700" />

      <div className="w-full max-w-lg space-y-8 relative z-10">
        <div className="text-center space-y-4">
          <div className="inline-flex bg-indigo-600 p-4 rounded-3xl shadow-2xl shadow-indigo-200">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">ArchiSite</h1>
          <p className="text-slate-500 font-medium">Construction Management Reinvented</p>
        </div>

        <Card className="p-10 rounded-[2.5rem] shadow-xl border border-slate-100 space-y-8">
          {/* Dynamic Role Selector */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Select Your Role</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-64 overflow-y-auto pr-1">
              {roles.map((r) => {
                const isSelected = selectedRole === r.id;
                const c = COLOR_SELECTED[r.color] ?? COLOR_SELECTED.slate;
                const dot = COLOR_DOT[r.color] ?? COLOR_DOT.slate;
                return (
                  <button key={r.id} type="button" onClick={() => setSelectedRole(r.id)}
                    className={cn(
                      "flex flex-col items-center gap-2.5 p-4 rounded-2xl transition-all duration-200 border-2 text-center",
                      isSelected
                        ? `${c.bg} ${c.border} shadow-md`
                        : "bg-slate-50 border-transparent hover:bg-white hover:border-slate-200"
                    )}>
                    <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center", isSelected ? c.bg : "bg-white border border-slate-200")}>
                      <div className={cn("w-3 h-3 rounded-full", dot)} />
                    </div>
                    <div>
                      <p className={cn("text-xs font-bold leading-tight", isSelected ? c.text : "text-slate-600")}>
                        {r.name}
                      </p>
                      <p className="text-[9px] font-medium text-slate-400 mt-0.5">
                        {r.pages.length} pages
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Work Email</label>
              <Input type="email" placeholder="name@company.com" icon={Mail} required />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-sm font-bold text-slate-700">Password</label>
                <button type="button" className="text-xs font-bold text-indigo-600 hover:text-indigo-700">Forgot?</button>
              </div>
              <Input type="password" placeholder="••••••••" icon={Lock} required />
            </div>
            <Button type="submit" className="w-full py-4 text-base gap-2 group">
              Sign In as {selected?.name ?? "User"}
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </form>

          <div className="text-center">
            <p className="text-sm text-slate-500 font-medium">
              Don't have an account?{" "}
              <button type="button" className="text-indigo-600 font-bold hover:underline">Request Access</button>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
