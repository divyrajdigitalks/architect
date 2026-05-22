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
        <div className="text-center mb-8 space-y-4">
          <div className="inline-flex bg-indigo-600 p-4 rounded-3xl shadow-2xl shadow-indigo-200">
            <Building2 className="w-10 h-10 text-white" />
          </div>

          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
              ArchiSite
            </h1>

            <p className="text-slate-500 font-medium mt-2">
              Construction Management Reinvented
            </p>
          </div>
        </div>

        {/* Login Card */}
        <Card className="p-10 rounded-[2.5rem] shadow-xl border border-slate-100 space-y-8">
          
          {/* Heading */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900">
              Welcome Back
            </h2>

            <p className="text-slate-500 mt-2">
              Login using your registered email
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-semibold p-3 rounded-xl text-center">
                {error}
              </div>
            )}

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">
                Work Email
              </label>

              <Input
                type="email"
                placeholder="name@company.com"
                icon={Mail}
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              {/* Auto Role Detect */}
              {currentRole && (
                <p className="text-xs font-semibold text-indigo-600 ml-1">
                    {currentRole}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-sm font-bold text-slate-700">
                  Password
                </label>

                <button
                  type="button"
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
                >
                  Forgot?
                </button>
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

            {/* Submit */}
            <Button
              type="submit"
              className="w-full py-4 text-base gap-2 group"
            >
              Sign In

              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </form>

          {/* Demo Credentials */}
          {/* <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200">
            <p className="text-sm font-bold text-slate-700">
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
              <p className="text-sm font-semibold text-slate-700">
                Common Password
              </p>

              <p className="text-lg font-bold text-slate-900 mt-1">
                123456
              </p>
            </div>
          </div> */}

          {/* Footer */}
          <div className="text-center">
            <p className="text-sm text-slate-500 font-medium">
              Don't have an account?{" "}
              <button
                type="button"
                className="text-indigo-600 font-bold hover:underline"
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