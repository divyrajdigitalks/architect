"use client";

import { useState } from "react";
import {
  Building2,
  Mail,
  Lock,
  ChevronRight,
  Phone,
  Eye,
  Briefcase,
  Users,
  Camera,
  FileText,
} from "lucide-react";

import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mobile, setMobile] = useState("");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      if (isGuest) {
        if (mobile.length < 10) {
          setError("Please enter a valid mobile number.");
          return;
        }
        await login("", "", true, mobile);
        return;
      }

      await login(email, password);
    } catch (err: any) {
      setError(err.message || "Invalid email or password.");
    }
  };

  const guestFeatures = [
    { icon: Briefcase, label: "Work Portfolio", desc: "Explore completed projects" },
    { icon: Camera, label: "Site Photos", desc: "View construction progress" },
    { icon: Users, label: "Meet the Team", desc: "Our architects & engineers" },
    { icon: FileText, label: "Our Process", desc: "How we build excellence" },
  ];

  return (
    <div className="min-h-screen flex">

      {/* ── Left Panel (visible on lg+) ── */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 flex-col justify-between p-12 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1503387762-592dea58ef23?q=80&w=2000')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/80 via-slate-900/60 to-slate-900" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-xl">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">ArchiSite</span>
        </div>

        <div className="relative z-10 space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/20">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs font-semibold text-green-300 uppercase tracking-widest">Public Showcase</span>
            </div>
            <h2 className="text-4xl font-bold text-white leading-tight">
              Crafting Spaces,<br />
              <span className="text-indigo-400">Building Legacies.</span>
            </h2>
            <p className="text-slate-300 text-base leading-relaxed max-w-sm">
              Explore our portfolio, meet the team, and discover how we turn architectural visions into reality.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {guestFeatures.map((f) => (
              <div key={f.label} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 space-y-2 hover:bg-white/10 transition-all">
                <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                  <f.icon className="w-4 h-4 text-indigo-300" />
                </div>
                <p className="text-sm font-semibold text-white">{f.label}</p>
                <p className="text-xs text-slate-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-xs text-slate-500">© 2025 ArchiSite. All rights reserved.</p>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50 relative overflow-hidden">
        <div className="absolute top-0 -right-20 w-80 h-80 bg-indigo-100/40 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -left-20 w-80 h-80 bg-blue-100/40 rounded-full blur-3xl" />

        <div className="w-full max-w-md relative z-10 space-y-8">

          {/* Mobile Logo */}
          <div className="lg:hidden text-center space-y-3">
            <div className="inline-flex bg-indigo-600 p-3.5 rounded-2xl shadow-xl shadow-indigo-200">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">ArchiSite</h1>
          </div>

          {/* Mode Switcher */}
          <div className="flex p-1 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <button
              onClick={() => setIsGuest(false)}
              className={cn(
                "flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all",
                !isGuest ? "bg-indigo-600 text-white shadow-md" : "text-slate-500 hover:text-slate-700"
              )}
            >
              Staff Login
            </button>
            <button
              onClick={() => setIsGuest(true)}
              className={cn(
                "flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all",
                isGuest ? "bg-indigo-600 text-white shadow-md" : "text-slate-500 hover:text-slate-700"
              )}
            >
              Guest / Public
            </button>
          </div>

          {/* ── GUEST PANEL ── */}
          {isGuest ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center space-y-1">
                <h2 className="text-2xl font-bold text-slate-900">Explore as Guest</h2>
                <p className="text-sm text-slate-500">Enter your mobile number to browse our public showcase</p>
              </div>

              {/* What you can see */}
              <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 space-y-3">
                <p className="text-xs font-bold text-indigo-700 uppercase tracking-widest">What you'll get access to</p>
                <div className="grid grid-cols-2 gap-2">
                  {guestFeatures.map((f) => (
                    <div key={f.label} className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-indigo-100 rounded flex items-center justify-center flex-shrink-0">
                        <f.icon className="w-3 h-3 text-indigo-600" />
                      </div>
                      <span className="text-xs font-medium text-indigo-800">{f.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <p className="text-red-500 text-xs font-medium text-center bg-red-50 p-2.5 rounded-xl border border-red-100">{error}</p>
                )}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Mobile Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all placeholder:text-slate-300"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 pl-1">No account needed — just your number to continue</p>
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-200 group"
                >
                  <Eye className="w-4 h-4" />
                  Explore ArchiSite
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>

              <p className="text-center text-xs text-slate-400">
                Are you a team member?{" "}
                <button onClick={() => setIsGuest(false)} className="text-indigo-600 font-semibold hover:underline">
                  Staff Login →
                </button>
              </p>
            </div>
          ) : (
            /* ── STAFF LOGIN PANEL ── */
            <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
              <div className="text-center space-y-1">
                <h2 className="text-2xl font-bold text-slate-900">Welcome back</h2>
                <p className="text-sm text-slate-500">Sign in to your ArchiSite workspace</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <p className="text-red-500 text-xs font-medium text-center bg-red-50 p-2.5 rounded-xl border border-red-100">{error}</p>
                )}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Work Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all placeholder:text-slate-300"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-slate-700">Password</label>
                    <button type="button" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">Forgot?</button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all placeholder:text-slate-300"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3.5 rounded-xl transition-all group"
                >
                  Sign In
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>

              <p className="text-center text-xs text-slate-400">
                Just browsing?{" "}
                <button onClick={() => setIsGuest(true)} className="text-indigo-600 font-semibold hover:underline">
                  Continue as Guest →
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}