"use client";

import { useState } from "react";
import {
  Building2,
  Mail,
  Lock,
  ChevronRight,
  Phone,
  User,
} from "lucide-react";

import { useAuth } from "@/lib/auth-context";
import { useRoles } from "@/lib/role-context";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

const COLOR_SELECTED: Record<string, any> = {
  slate: { bg: "bg-slate-50", border: "border-slate-400", text: "text-slate-900" },
  indigo: { bg: "bg-indigo-50", border: "border-indigo-400", text: "text-indigo-900" },
  blue: { bg: "bg-blue-50", border: "border-blue-400", text: "text-blue-900" },
  orange: { bg: "bg-orange-50", border: "border-orange-400", text: "text-orange-900" },
  green: { bg: "bg-green-50", border: "border-green-400", text: "text-green-900" },
  purple: { bg: "bg-purple-50", border: "border-purple-400", text: "text-purple-900" },
  rose: { bg: "bg-rose-50", border: "border-rose-400", text: "text-rose-900" },
};

const COLOR_DOT: Record<string, string> = {
  slate: "bg-slate-400",
  indigo: "bg-indigo-400",
  blue: "bg-blue-400",
  orange: "bg-orange-400",
  green: "bg-green-400",
  purple: "bg-purple-400",
  rose: "bg-rose-400",
};

export default function LoginPage() {
  const { login } = useAuth();
  const { roles } = useRoles();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mobile, setMobile] = useState("");
  const [selectedRole, setSelectedRole] = useState("architect");
  const [isGuest, setIsGuest] = useState(false);
  const [error, setError] = useState("");

  // Email → Role Mapping
  const roleCredentials: Record<string, string> = {
    "director@gmail.com": "director",
    "architect@gmail.com": "architect",
    "office@gmail.com": "office-team",
    "engineer@gmail.com": "site-engineer",
    "supervisor@gmail.com": "supervisor",
    "accountant@gmail.com": "accountant",
    "client@gmail.com": "client",
  };

  // Optional Role Names
  const roleNames: Record<string, string> = {
    director: "Director",
    architect: "Architect",
    "office-team": "Office Team",
    "site-engineer": "Site Engineer",
    supervisor: "Supervisor",
    accountant: "Accountant",
    client: "Client Portal",
    guest: "Guest Mode",
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (isGuest) {
      if (mobile.length < 10) {
        setError("Please enter a valid mobile number.");
        return;
      }
      // Guest login
      login("guest", { name: "Guest User", mobile });
      return;
    }

    const matchedRole = roleCredentials[email.trim().toLowerCase()];

    // Common password for all demo users
    if (matchedRole && password === "123456") {
      login(matchedRole);
    } else {
      setError("Invalid email or password.");
    }
  };

  const selected = roles.find(r => r.id === selectedRole);

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
          
          {/* Mode Switcher */}
          <div className="flex p-1 bg-slate-100 rounded-2xl">
            <button 
              onClick={() => setIsGuest(false)}
              className={cn(
                "flex-1 py-2.5 text-sm font-medium rounded-xl transition-all",
                !isGuest ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              Standard Login
            </button>
            <button 
              onClick={() => setIsGuest(true)}
              className={cn(
                "flex-1 py-2.5 text-sm font-medium rounded-xl transition-all",
                isGuest ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              Guest Mode
            </button>
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

            <div className="mt-4 space-y-2 text-xs text-slate-700">
              <div className="flex justify-between">
                <span>Director</span>
                <span className="font-semibold">director@gmail.com</span>
              </div>
              <div className="flex justify-between">
                <span>Architect</span>
                <span className="font-semibold">architect@gmail.com</span>
              </div>
              <div className="flex justify-between">
                <span>Office Team</span>
                <span className="font-semibold">office@gmail.com</span>
              </div>
              <div className="flex justify-between">
                <span>Site Engineer</span>
                <span className="font-semibold">engineer@gmail.com</span>
              </div>
              <div className="flex justify-between">
                <span>Supervisor</span>
                <span className="font-semibold">supervisor@gmail.com</span>
              </div>
              <div className="flex justify-between">
                <span>Accountant</span>
                <span className="font-semibold">accountant@gmail.com</span>
              </div>
              <div className="flex justify-between">
                <span>Client Portal</span>
                <span className="font-semibold">client@gmail.com</span>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-200">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">Master Password</p>
              <p className="text-lg font-medium text-slate-900 mt-1 font-mono">123456</p>
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