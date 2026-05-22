"use client";

import { useState } from "react";
import {
  Building2,
  Mail,
  Lock,
  ChevronRight,
} from "lucide-react";

import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

export default function LoginPage() {
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Email → Role Mapping
  const roleCredentials: Record<string, string> = {
    "admin@gmail.com": "architect",
    "office@gmail.com": "client",
    "client@gmail.com": "supervisor",
    "agency@gmail.com": "worker",
    "academy@gmail.com": "accountant",
  };

  // Optional Role Names
  const roleNames: Record<string, string> = {
    architect: "Admin",
    client: "Office",
    supervisor: "Client",
    worker: "Agency",
    accountant: "Accountant",
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const matchedRole = roleCredentials[email.trim().toLowerCase()];

    // Common password for all demo users
    if (matchedRole && password === "123456") {
      login(matchedRole);
    } else {
      setError("Invalid email or password.");
    }
  };

  const currentRole =
    roleNames[
      roleCredentials[email.trim().toLowerCase()]
    ];

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background Blur Effects */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl animate-pulse delay-700" />

      <div className="w-full max-w-lg relative z-10">
        
        {/* Logo Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex bg-indigo-600 p-4 rounded-3xl shadow-2xl shadow-indigo-200">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-medium text-slate-900 tracking-tight">ArchiSite</h1>
          <p className="text-slate-500 font-medium">Construction Management Reinvented</p>
        </div>

        <Card className="p-10 rounded-[2.5rem] shadow-xl border border-slate-100 space-y-8">
          {/* Dynamic Role Selector */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-64 overflow-y-auto pr-1">
              {roles.filter(r => r.id !== "super-admin").map((r) => {
                const isSelected = selectedRole === r.id;
                const c = COLOR_SELECTED[r.color] ?? COLOR_SELECTED.slate;
                const dot = COLOR_DOT[r.color] ?? COLOR_DOT.slate;
                // Proper casing for roles
                const roleName = r.name.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
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
                      <p className={cn("text-xs font-medium leading-tight", isSelected ? c.text : "text-slate-600")}>
                        {roleName}
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
            {error && <p className="text-red-500 text-xs font-medium text-center bg-red-50 p-2 rounded-lg">{error}</p>}
            {isGuest ? (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 ml-1">Mobile Number</label>
                <Input type="tel" placeholder=" +91 00000 00000" icon={Phone} value={mobile} onChange={(e) => setMobile(e.target.value)} required className="font-mono" />
                <p className="text-[10px] font-medium text-slate-400 ml-1 tracking-widest">Guest login mate mobile number jaruri che</p>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 ml-1">Work Email</label>
                  <Input 
                    type="email" 
                    placeholder="name@company.com" 
                    icon={Mail} 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between ml-1">
                    <label className="text-sm font-medium text-slate-700">Password</label>
                    <button type="button" className="text-xs font-medium text-indigo-600 hover:text-indigo-700">Forgot?</button>
                  </div>
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    icon={Lock} 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </>
            )}
            <Button type="submit" className="w-full py-4 text-base gap-2 group font-medium">
              {isGuest ? "Continue as Guest" : `Sign In as ${selected?.name.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') ?? "User"}`}
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </form>

          {/* Demo Credentials */}
          {/* <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200">
            <p className="text-sm font-medium text-slate-700">
              Demo Login Credentials
            </p>

            <div className="mt-4 space-y-3 text-sm text-slate-700">

              <div className="flex justify-between">
                <span>Admin</span>
                <span className="font-semibold">
                  admin@gmail.com
                </span>
              </div>

              <div className="flex justify-between">
                <span>Office</span>
                <span className="font-semibold">
                  office@gmail.com
                </span>
              </div>

              <div className="flex justify-between">
                <span>Client</span>
                <span className="font-semibold">
                  client@gmail.com
                </span>
              </div>

              <div className="flex justify-between">
                <span>Agency</span>
                <span className="font-semibold">
                  agency@gmail.com
                </span>
              </div>

              <div className="flex justify-between">
                <span>Accountant</span>
                <span className="font-semibold">
                  academy@gmail.com
                </span>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-200">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">Master Password</p>
              <p className="text-lg font-medium text-slate-900 mt-1 font-mono">123456</p>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-200">
              <p className="text-[10px] text-slate-400 text-center">
                Need help? Contact <span className="text-indigo-600 font-medium hover:underline cursor-pointer">Support Team</span>
              </p>
            </div>
          </div> */}

          {/* Footer */}
          <div className="text-center">
            <p className="text-sm text-slate-500 font-medium">
              Don't have an account?{" "}
              <button
                type="button"
                className="text-indigo-600 font-medium hover:underline"
              >
                Request Access
              </button>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}