"use client";

import { useState } from "react";
import { workers, supervisors, projects } from "@/lib/dummy-data";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/lib/auth-context";

const today = new Date().toISOString().split("T")[0];

type AttendanceRecord = {
  id: number;
  workerId: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: string;
};

const initialAttendance: AttendanceRecord[] = [
  { id: 1, workerId: "1", date: today, checkIn: "08:02 AM", checkOut: "05:05 PM", status: "Present" },
  { id: 2, workerId: "2", date: today, checkIn: "08:15 AM", checkOut: "05:00 PM", status: "Present" },
  { id: 3, workerId: "3", date: today, checkIn: null, checkOut: null, status: "Leave" },
  { id: 4, workerId: "4", date: today, checkIn: "08:05 AM", checkOut: "03:30 PM", status: "Half-day" },
];

const statusOptions = ["Present", "Absent", "Half-day", "Leave"];

export default function AttendancePage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(initialAttendance);
  const [selectedDate, setSelectedDate] = useState(today);
  const [attendanceType, setAttendanceType] = useState<"office" | "site">("office");

  const getMinutes = (time: string) => {
    const [value, modifier] = time.split(" ");
    const [hour, minute] = value.split(":").map(Number);
    const normalized = hour === 12 ? 0 : hour;
    return normalized * 60 + minute + (modifier === "PM" ? 12 * 60 : 0);
  };

  const formatHours = (checkIn?: string | null, checkOut?: string | null) => {
    if (!checkIn || !checkOut) return "—";
    const diff = getMinutes(checkOut) - getMinutes(checkIn);
    if (diff <= 0) return "—";
    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;
    return `${hours}h ${minutes}m`;
  };

  const selectedTeamLabel = attendanceType === "office" ? "Office Team" : "Site Team";
  const canEdit = user?.role === "architect" || user?.role === "supervisor";

  // Supervisor sees only workers from their assigned projects
  const visibleWorkers = user?.role === "supervisor"
    ? (() => {
        const sup = supervisors.find(s => s.name === user.name);
        const assignedProjectNames = (sup?.assignedProjects || []).map(
          pid => projects.find(p => p.id === pid)?.name || ""
        );
        return workers.filter(w =>
          w.assignedProjects.some(ap => assignedProjectNames.includes(ap))
        );
      })()
    : workers;

  const teamWorkers = visibleWorkers.filter(w =>
    w.team === (attendanceType === "office" ? "Office" : "Site")
  );

  const filteredWorkers = teamWorkers.filter(w =>
    w.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalHours = attendance.reduce((sum, record) => {
    const worker = filteredWorkers.find(w => w.id === record.workerId);
    if (!worker) return sum;
    if (!record.checkIn || !record.checkOut) return sum;
    return sum + Math.max(0, getMinutes(record.checkOut) - getMinutes(record.checkIn));
  }, 0);

  const updateStatus = (workerId: string, newStatus: string) => {
    setAttendance(prev =>
      prev.map(a =>
        a.workerId === workerId
          ? { ...a, status: newStatus, checkIn: newStatus === "Absent" ? null : a.checkIn || "08:00 AM", checkOut: newStatus === "Absent" ? null : a.checkOut }
          : a
      )
    );
  };

  const markCheckIn = (workerId: string) => {
    const now = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    setAttendance(prev =>
      prev.map(a => a.workerId === workerId ? { ...a, checkIn: now, status: "Present" } : a)
    );
  };

  const markCheckOut = (workerId: string) => {
    const now = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    setAttendance(prev =>
      prev.map(a => a.workerId === workerId ? { ...a, checkOut: now } : a)
    );
  };

  const presentCount = attendance.filter(a => a.status === "Present" && teamWorkers.some(w => w.id === a.workerId)).length;
  const absentCount = attendance.filter(a => a.status === "Absent" && teamWorkers.some(w => w.id === a.workerId)).length;
  const halfDayCount = attendance.filter(a => a.status === "Half-day" && teamWorkers.some(w => w.id === a.workerId)).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            {[
              { key: "office", label: "OFFICE TEAM ATTENDANCE" },
              { key: "site", label: "SITE TEAM ATTENDANCE" },
            ].map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => setAttendanceType(option.key as "office" | "site")}
                className={cn(
                  "rounded-2xl px-6 py-3 text-sm font-bold transition-all duration-300",
                  attendanceType === option.key
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100 scale-105"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              <span className="line-through text-slate-300 mr-2">Worker</span>
              Attendance
            </h2>
            <p className="text-sm font-medium text-slate-500 max-w-2xl">
              {attendanceType === "office"
                ? "Track office team hourly counts, monthly hours, and salary estimates."
                : "Track site team daily attendance and project site logs."}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Input
            placeholder="Search team member..."
            icon={Search}
            className="w-64 hidden md:flex"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: `Total ${selectedTeamLabel}`, value: filteredWorkers.length, color: "bg-white border-slate-200 text-slate-900" },
          { label: "Present", value: presentCount, color: "bg-white border-green-100 text-green-700" },
          { label: "Absent", value: absentCount, color: "bg-white border-red-100 text-red-700" },
          { label: "Half-day", value: halfDayCount, color: "bg-white border-orange-100 text-orange-700" },
        ].map((s) => (
          <Card key={s.label} className={cn("p-6 border shadow-sm hover:shadow-md transition-shadow", s.color)}>
            <p className="text-xs font-bold uppercase tracking-widest opacity-60 mb-1">{s.label}</p>
            <p className="text-3xl font-black">{s.value}</p>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden p-0 border-slate-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="px-8 py-5 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Team Member</th>
                {attendanceType === "office" && (
                  <th className="px-8 py-5 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Hourly Salary</th>
                )}
                <th className="px-8 py-5 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Check-in</th>
                <th className="px-8 py-5 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Check-out</th>
                <th className="px-8 py-5 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                  {attendanceType === "office" ? "Daily/Monthly Hours" : "Total Hours"}
                </th>
                <th className="px-8 py-5 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                {canEdit && <th className="px-8 py-5 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredWorkers.map((worker) => {
                const att = attendance.find(a => a.workerId === worker.id);
                return (
                  <tr key={worker.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 bg-slate-100 rounded-2xl flex items-center justify-center text-xs font-bold text-slate-600 border border-slate-200 shadow-sm">
                          {worker.name.split(" ").map(n => n[0]).join("")}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{worker.name}</p>
                          <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mt-0.5">{worker.type}</p>
                        </div>
                      </div>
                    </td>
                    {attendanceType === "office" && (
                      <td className="px-8 py-6">
                        <span className="text-sm font-bold text-slate-900">{worker.rate || "₹250/hour"}</span>
                        <p className="text-[10px] font-medium text-slate-400">rate</p>
                      </td>
                    )}
                    <td className="px-8 py-6">
                      {canEdit && !att?.checkIn && att?.status !== "Absent" && att?.status !== "Leave" ? (
                        <Button variant="outline" size="sm" onClick={() => markCheckIn(worker.id)} className="text-green-600 border-green-200 hover:bg-green-50 text-[11px] font-bold rounded-lg px-4">
                          Mark In
                        </Button>
                      ) : (
                        <span className="text-sm font-medium text-slate-600">{att?.checkIn || "—"}</span>
                      )}
                    </td>
                    <td className="px-8 py-6">
                      {canEdit && att?.checkIn && !att?.checkOut ? (
                        <Button variant="outline" size="sm" onClick={() => markCheckOut(worker.id)} className="text-orange-600 border-orange-200 hover:bg-orange-50 text-[11px] font-bold rounded-lg px-4">
                          Mark Out
                        </Button>
                      ) : (
                        <span className="text-sm font-medium text-slate-600">{att?.checkOut || "—"}</span>
                      )}
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-0.5">
                        <p className="text-sm font-bold text-slate-700">{formatHours(att?.checkIn, att?.checkOut)}</p>
                        {attendanceType === "office" && (
                          <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">164h this month</p>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      {canEdit ? (
                        <select
                          value={att?.status || "Absent"}
                          onChange={(e) => updateStatus(worker.id, e.target.value)}
                          className={cn(
                            "px-4 py-2 rounded-xl text-[10px] font-bold border uppercase tracking-widest cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all",
                            att?.status === "Present" ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100" :
                            att?.status === "Absent" ? "bg-red-50 text-red-700 border-red-200 hover:bg-red-100" :
                            att?.status === "Half-day" ? "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100" :
                            "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100"
                          )}
                        >
                          {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      ) : (
                        <span className={cn(
                          "px-4 py-2 rounded-xl text-[10px] font-bold border uppercase tracking-widest",
                          att?.status === "Present" ? "bg-green-50 text-green-700 border-green-200" :
                          att?.status === "Absent" ? "bg-red-50 text-red-700 border-red-200" :
                          att?.status === "Leave" ? "bg-indigo-50 text-indigo-700 border-indigo-200" :
                          "bg-orange-50 text-orange-700 border-orange-200"
                        )}>
                          {att?.status}
                        </span>
                      )}
                    </td>
                    {canEdit && (
                      <td className="px-8 py-6 text-right">
                        <Button variant="ghost" size="sm" className="text-indigo-600 hover:bg-indigo-50 text-xs font-bold">
                          View Details
                        </Button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
