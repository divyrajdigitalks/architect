"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Briefcase, CheckSquare, Users, ClipboardList,
  CreditCard, Building2, UserCircle2, Calendar, BarChart3,
  Settings, LogOut, MessageSquare, Camera, X, HardHat, BookOpen,
  PenTool, Hammer
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useRoles } from "@/lib/role-context";
import { Button } from "@/components/ui/Button";

const PAGE_ICONS: Record<string, React.ElementType> = {
  dashboard:    LayoutDashboard,
  projects:     Briefcase,
  "office-work": PenTool,
  "site-work":   Hammer,
  tasks:        CheckSquare,
  "office-team": Users,
  "site-team":   HardHat,
  clients:      UserCircle2,
  "site-updates": ClipboardList,
  "site-photos":  Camera,
  attendance:   BookOpen,
  arkiton:      BookOpen,
  "working-sop": ClipboardList,
  payments:     CreditCard,
  calendar:     Calendar,
  reports:      BarChart3,
  messages:     MessageSquare,
  settings:     Settings,
};

const PAGE_LABELS: Record<string, string> = {
  dashboard:      "Dashboard",
  projects:       "Projects",
  "office-work":  "Office Work",
  "site-work":    "Site Work",
  tasks:          "Tasks",
  "office-team":  "OFFICE TEAM",
  "site-team":    "SITE TEAM",
  clients:        "OFFICE TEAM",
  supervisors:    "CLIENTS",
  workers:        "AGENCY",
  "site-updates": "Site Updates",
  "site-photos":  "Site Photos",
  attendance:     "Attendance",
  arkiton:        "ARKITON",
  "working-sop":  "WORKING SOP",
  payments:       "Payments",
  calendar:       "Calendar",
  reports:        "Reports",
  messages:       "Messages",
  settings:       "Settings",
};

// Worker dashboard shows as "My Tasks", worker projects as "Job Locations"
const ROLE_PAGE_LABELS: Record<string, Record<string, string>> = {
  worker: {
    dashboard: "Agency Tasks",
    projects:  "Job Locations",
  },
  client: {
    dashboard: "Office Dashboard",
  },
  supervisor: {
    dashboard: "Client Dashboard",
    projects:  "My Projects",
    tasks:     "Today's Tasks",
    "site-updates": "Site Logs",
  },
  "site-engineer": {
    dashboard: "Guest Dashboard",
    projects: "Work Portfolio",
    arkiton: "Arkiton Introduction",
    "working-sop": "Working Style",
    "site-updates": "Project & Achievement",
    messages: "Agency Contact",
   }
};

export default function Sidebar({ onMobileClose }: { onMobileClose?: () => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { getRoleById } = useRoles();

  if (pathname === "/login") return null;

  const roleId = typeof user?.role === 'string' ? user.role : "";
  const roleConfig = getRoleById(roleId);
  const allowedPages = roleConfig?.pages ?? [];

  const menuItems = allowedPages.map(pageKey => {
    const roleLabels = ROLE_PAGE_LABELS[roleId] ?? {};
    return {
      key: pageKey,
      name: roleLabels[pageKey] ?? PAGE_LABELS[pageKey] ?? pageKey,
      href: pageKey === "dashboard" ? "/" : `/${pageKey}`,
      icon: PAGE_ICONS[pageKey] ?? LayoutDashboard,
    };
  });

  return (
    <div className="w-60 h-screen bg-slate-900 text-slate-300 flex flex-col relative border-r border-slate-800">
      <div className="px-6 py-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary-600 p-1.5 rounded">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-white tracking-tight">ArchiSite</span>
        </div>
        <Button variant="ghost" size="icon" className="lg:hidden text-slate-400 hover:text-white hover:bg-slate-800" onClick={onMobileClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto custom-scrollbar">
        <p className="px-3 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Main Menu</p>
        {menuItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link key={item.key} href={item.href} onClick={onMobileClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2 text-sm font-bold rounded transition-colors duration-150 uppercase tracking-tight",
                isActive 
                  ? "bg-slate-800 text-white border-l-2 border-primary-500" 
                  : "hover:bg-slate-800 hover:text-white"
              )}>
              <item.icon className={cn("w-4 h-4", isActive ? "text-primary-400" : "text-slate-500")} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="px-3 py-3 mb-4 rounded bg-slate-800/50 border border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-primary-900/50 border border-primary-800 flex items-center justify-center text-primary-400 text-xs font-bold">
              {user?.name?.[0] ?? "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-slate-500 truncate uppercase font-semibold tracking-wider">
                {roleConfig?.name || (typeof user?.role === 'string' ? user.role : 'User')}
              </p>
            </div>
          </div>
        </div>
        <button 
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2 text-xs font-bold text-slate-400 hover:text-red-400 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
