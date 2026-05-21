"use client";

import { useState } from "react";
import { workers, supervisors, projects } from "@/lib/dummy-data";
import { Search, MoreVertical, ChevronLeft, ChevronRight, Settings, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/lib/auth-context";

// Helper to get formatted date like "Wed, 20 May 2026"
const formatDate = (date: Date) => {
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

type AttendanceStatus = "P" | "A" | "HD" | "PL" | "WO" | "OT" | null;

type StaffAttendance = {
  id: string;
  name: string;
  mobile: string;
  lastMonthDue: number;
  balance: number;
  status: AttendanceStatus;
};

const initialStaff: StaffAttendance[] = [
  { id: "1", name: "Umang", mobile: "6353626531", lastMonthDue: 11750, balance: 14250, status: null },
  { id: "2", name: "Harshit", mobile: "6354479901", lastMonthDue: 5250, balance: 6183.33, status: "P" },
  { id: "3", name: "Ravi Chovatiya", mobile: "7016268071", lastMonthDue: 38333.33, balance: 43333.33, status: null },
  { id: "4", name: "Bhautik", mobile: "7600670744", lastMonthDue: 30666.67, balance: 36000, status: null },
  { id: "5", name: "Hitarthi", mobile: "7859993930", lastMonthDue: 5366.67, balance: 6300, status: null },
  { id: "6", name: "Krinali", mobile: "8140156770", lastMonthDue: 11500, balance: 13000, status: null },
  { id: "7", name: "Meet", mobile: "8200199856", lastMonthDue: 30666.67, balance: 36000, status: null },
  { id: "8", name: "Vala Bhavik", mobile: "8866779008", lastMonthDue: 38333.33, balance: 43333.33, status: null },
  { id: "9", name: "Satvik", mobile: "9016096882", lastMonthDue: 3833.33, balance: 4500, status: null },
  { id: "10", name: "Doli", mobile: "9328733712", lastMonthDue: 7666.67, balance: 8833.33, status: null },
  { id: "11", name: "Sharad", mobile: "9510864584", lastMonthDue: 16866.67, balance: 19800, status: null },
  { id: "12", name: "Visvraj", mobile: "9537621911", lastMonthDue: 13033.33, balance: 14733.33, status: null },
  { id: "13", name: "Yogesh", mobile: "9909097033", lastMonthDue: 15333.33, balance: 17333.33, status: null },
];

export default function AttendancePage() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date(2026, 4, 20)); // May 20, 2026 as in image
  const [staffList, setStaffList] = useState<StaffAttendance[]>(initialStaff);
  const [searchQuery, setSearchQuery] = useState("");
  const [showMenuId, setShowMenuId] = useState<string | null>(null);

  const counts = {
    P: staffList.filter(s => s.status === "P").length,
    A: staffList.filter(s => s.status === "A").length,
    HD: staffList.filter(s => s.status === "HD").length,
    PL: staffList.filter(s => s.status === "PL").length,
    WO: staffList.filter(s => s.status === "WO").length,
  };

  const handleStatusChange = (id: string, status: AttendanceStatus) => {
    setStaffList(prev => prev.map(s => s.id === id ? { ...s, status } : s));
    setShowMenuId(null);
  };

  const filteredStaff = staffList.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.mobile.includes(searchQuery)
  );

  const totalLastMonthDue = staffList.reduce((sum, s) => sum + s.lastMonthDue, 0);
  const totalBalance = staffList.reduce((sum, s) => sum + s.balance, 0);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-10">
      {/* Header Area */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-30">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Staff Attendance & Payroll</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="h-9 gap-2 text-slate-600 font-bold text-xs uppercase tracking-wider">
            Attendance Settings
            <Settings className="w-4 h-4" />
          </Button>
          <Button variant="primary" size="sm" className="h-9 gap-2 font-bold text-xs uppercase tracking-wider shadow-lg shadow-indigo-100">
            <Plus className="w-4 h-4" />
            Add Staff
          </Button>
        </div>
      </div>

      <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
        {/* Date Picker & Stats Row */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-700">{formatDate(currentDate)}</h2>
            <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
              <button className="p-2 hover:bg-slate-50 border-r border-slate-200 text-slate-400">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-50/50">
                Today: {formatDate(currentDate)}
              </div>
              <button className="p-2 hover:bg-slate-50 border-l border-slate-200 text-slate-400">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 divide-x divide-slate-100">
            {[
              { label: "Present (P)", value: counts.P, color: "text-green-600" },
              { label: "Absent (A)", value: counts.A, color: "text-red-600" },
              { label: "Half day (HD)", value: counts.HD, color: "text-orange-600" },
              { label: "Paid Leave (PL)", value: counts.PL, color: "text-blue-600" },
              { label: "Weekly off (WO)", value: counts.WO, color: "text-slate-600" },
            ].map((stat) => (
              <div key={stat.label} className="p-4 text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <p className={cn("text-xl font-black", stat.color)}>{stat.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Table Area */}
        <Card className="p-0 border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200">
                  <th className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-widest">Staff Name</th>
                  <th className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-widest">Mobile Number</th>
                  <th className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-widest">Last Month Due</th>
                  <th className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-widest">Balance</th>
                  <th className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-widest">Mark Attendance</th>
                  <th className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredStaff.map((staff) => (
                  <tr key={staff.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-900">{staff.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-slate-600">{staff.mobile}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-700">₹ {staff.lastMonthDue.toLocaleString('en-IN')}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="text-red-500 rotate-180 bg-red-50 p-0.5 rounded">
                          <Plus className="w-3 h-3 rotate-45" />
                        </div>
                        <p className="text-sm font-bold text-slate-700">₹ {staff.balance.toLocaleString('en-IN')}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 relative">
                        <button 
                          onClick={() => handleStatusChange(staff.id, "P")}
                          className={cn(
                            "w-8 h-8 rounded border text-[10px] font-black flex items-center justify-center transition-all",
                            staff.status === "P" 
                              ? "bg-green-500 border-green-500 text-white shadow-sm" 
                              : "bg-white border-slate-200 text-slate-400 hover:border-green-300 hover:text-green-500"
                          )}
                        >
                          P
                        </button>
                        <button 
                          onClick={() => handleStatusChange(staff.id, "A")}
                          className={cn(
                            "w-8 h-8 rounded border text-[10px] font-black flex items-center justify-center transition-all",
                            staff.status === "A" 
                              ? "bg-red-500 border-red-500 text-white shadow-sm" 
                              : "bg-white border-slate-200 text-slate-400 hover:border-red-300 hover:text-red-500"
                          )}
                        >
                          A
                        </button>
                        <button 
                          onClick={() => setShowMenuId(showMenuId === staff.id ? null : staff.id)}
                          className={cn(
                            "w-8 h-8 rounded border flex items-center justify-center transition-all",
                            staff.status && staff.status !== "P" && staff.status !== "A"
                              ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                              : "bg-white border-slate-200 text-slate-400 hover:bg-slate-50"
                          )}
                        >
                          {staff.status && staff.status !== "P" && staff.status !== "A" ? (
                            <span className="text-[10px] font-black">{staff.status}</span>
                          ) : (
                            <MoreVertical className="w-4 h-4" />
                          )}
                        </button>

                        {/* Dropdown Menu */}
                        {showMenuId === staff.id && (
                          <div className="absolute top-full right-0 mt-2 w-40 bg-white border border-slate-200 rounded-xl shadow-xl z-40 py-2 animate-in fade-in zoom-in-95 duration-150">
                            {[
                              { label: "Half day", value: "HD" },
                              { label: "Paid leave", value: "PL" },
                              { label: "Week off", value: "WO" },
                              { label: "Add overtime", value: "OT" },
                            ].map((item) => (
                              <button
                                key={item.value}
                                onClick={() => handleStatusChange(staff.id, item.value as AttendanceStatus)}
                                className="w-full px-4 py-2 text-left text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                              >
                                {item.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="outline" size="sm" className="h-8 text-[10px] font-black uppercase tracking-widest text-indigo-600 border-indigo-100 hover:bg-indigo-50">
                        Clear Dues
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50/50 border-t border-slate-200">
                  <td colSpan={2} className="px-6 py-4">
                    <p className="text-sm font-black text-slate-900">Pending amount</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-black text-red-600">₹ {totalLastMonthDue.toLocaleString('en-IN')} <span className="text-[10px] font-bold text-red-400 uppercase ml-1">(overdue)</span></p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="text-red-500 rotate-180 bg-red-50 p-0.5 rounded">
                        <Plus className="w-3 h-3 rotate-45" />
                      </div>
                      <p className="text-sm font-black text-slate-900">₹ {totalBalance.toLocaleString('en-IN')}</p>
                    </div>
                  </td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>
      </div>

      {/* Overlay to close dropdown when clicking outside */}
      {showMenuId && (
        <div 
          className="fixed inset-0 z-30 bg-transparent" 
          onClick={() => setShowMenuId(null)} 
        />
      )}
    </div>
  );
}
