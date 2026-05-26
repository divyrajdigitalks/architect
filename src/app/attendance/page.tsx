"use client";

import { useState, useEffect } from "react";
import { workers, supervisors, projects } from "@/lib/dummy-data";
import { Search, MoreVertical, ChevronLeft, ChevronRight, Settings, Plus, X, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/lib/auth-context";
import Modal from "@/components/ui/Modal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/Table";

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

type SalaryPayoutType = "Monthly" | "Daily" | "Hourly";

type StaffAttendance = {
  id: string;
  name: string;
  mobile: string;
  lastMonthDue: number;
  balance: number;
  status: AttendanceStatus;
  team: "office" | "site";
  payoutType: SalaryPayoutType;
  salary: number;
};

const initialStaff: StaffAttendance[] = [
  { id: "1", name: "Umang", mobile: "6353626531", lastMonthDue: 11750, balance: 14250, status: null, team: "office", payoutType: "Monthly", salary: 25000 },
  { id: "2", name: "Harshit", mobile: "6354479901", lastMonthDue: 5250, balance: 6183.33, status: "P", team: "office", payoutType: "Monthly", salary: 18000 },
  { id: "3", name: "Ravi Chovatiya", mobile: "7016268071", lastMonthDue: 38333.33, balance: 43333.33, status: null, team: "site", payoutType: "Daily", salary: 1200 },
  { id: "4", name: "Bhautik", mobile: "7600670744", lastMonthDue: 30666.67, balance: 36000, status: null, team: "site", payoutType: "Daily", salary: 1000 },
  { id: "5", name: "Hitarthi", mobile: "7859993930", lastMonthDue: 5366.67, balance: 6300, status: null, team: "office", payoutType: "Monthly", salary: 20000 },
  { id: "6", name: "Krinali", mobile: "8140156770", lastMonthDue: 11500, balance: 13000, status: null, team: "office", payoutType: "Monthly", salary: 22000 },
  { id: "7", name: "Meet", mobile: "8200199856", lastMonthDue: 30666.67, balance: 36000, status: null, team: "site", payoutType: "Daily", salary: 1000 },
  { id: "8", name: "Vala Bhavik", mobile: "8866779008", lastMonthDue: 38333.33, balance: 43333.33, status: null, team: "site", payoutType: "Daily", salary: 1200 },
  { id: "9", name: "Satvik", mobile: "9016096882", lastMonthDue: 3833.33, balance: 4500, status: null, team: "site", payoutType: "Daily", salary: 800 },
  { id: "10", name: "Doli", mobile: "9328733712", lastMonthDue: 7666.67, balance: 8833.33, status: null, team: "office", payoutType: "Monthly", salary: 15000 },
  { id: "11", name: "Sharad", mobile: "9510864584", lastMonthDue: 16866.67, balance: 19800, status: null, team: "office", payoutType: "Monthly", salary: 18000 },
  { id: "12", name: "Visvraj", mobile: "9537621911", lastMonthDue: 13033.33, balance: 14733.33, status: null, team: "site", payoutType: "Daily", salary: 900 },
  { id: "13", name: "Yogesh", mobile: "9909097033", lastMonthDue: 15333.33, balance: 17333.33, status: null, team: "site", payoutType: "Daily", salary: 1000 },
];

export default function AttendancePage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "architect" || user?.role === "director";
  const [currentDate, setCurrentDate] = useState(new Date(2026, 4, 20)); // May 20, 2026 as in image
  const [activeTab, setActiveTab] = useState<"office">("office");
  const [staffList, setStaffList] = useState<StaffAttendance[]>(initialStaff);
  const [searchQuery, setSearchQuery] = useState("");
  const [showMenuId, setShowMenuId] = useState<string | null>(null);

  // Overtime Modal State
  const [isOvertimeModalOpen, setIsOvertimeModalOpen] = useState(false);
  const [selectedStaffForOT, setSelectedStaffForOT] = useState<StaffAttendance | null>(null);
  const [overtimeType, setOvertimeType] = useState<"hourly" | "fixed">("hourly");
  const [otHours, setOtHours] = useState("00");
  const [otMins, setOtMins] = useState("00");
  const [otRateType, setOtRateType] = useState("1x Salary");
  const [otHourlyRate, setOtHourlyRate] = useState(125);
  const [otFixedAmount, setOtFixedAmount] = useState(0);

  // Add Staff Modal State
  const [isAddStaffModalOpen, setIsAddStaffModalOpen] = useState(false);
  const [newStaff, setNewStaff] = useState({ 
    name: "", 
    mobile: "", 
    lastMonthDue: 0, 
    balance: 0, 
    team: "office" as "office" | "site",
    payoutType: "Monthly" as SalaryPayoutType,
    salary: 0,
    balanceType: "To Pay" as "To Pay" | "To Receive"
  });

  // Settings Modal State
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const currentTeamStaff = staffList.filter(s => s.team === activeTab);

  const counts = {
    P: currentTeamStaff.filter(s => s.status === "P").length,
    A: currentTeamStaff.filter(s => s.status === "A").length,
    HD: currentTeamStaff.filter(s => s.status === "HD").length,
    PL: currentTeamStaff.filter(s => s.status === "PL").length,
    WO: currentTeamStaff.filter(s => s.status === "WO").length,
  };

  const handleStatusChange = (id: string, status: AttendanceStatus) => {
    if (status === "OT") {
      const staff = staffList.find(s => s.id === id);
      if (staff) {
        setSelectedStaffForOT(staff);
        setIsOvertimeModalOpen(true);
      }
    } else {
      setStaffList(prev => prev.map(s => {
        if (s.id !== id) return s;
        
        // Dynamic balance update logic
        let newBalance = s.balance;
        const dailyRate = s.payoutType === "Daily" ? s.salary : (s.salary / 30);
        
        // If changing FROM a status that affected balance
        if (s.status === "P") newBalance -= dailyRate;
        if (s.status === "HD") newBalance -= (dailyRate / 2);

        // If changing TO a status that affects balance
        if (status === "P") newBalance += dailyRate;
        if (status === "HD") newBalance += (dailyRate / 2);

        return { ...s, status, balance: Number(newBalance.toFixed(2)) };
      }));
    }
    setShowMenuId(null);
  };

  const handleSaveOvertime = () => {
    if (selectedStaffForOT) {
      setStaffList(prev => prev.map(s => {
        if (s.id === selectedStaffForOT.id) {
          return { ...s, status: "OT" as AttendanceStatus, balance: s.balance + totalOTAmount };
        }
        return s;
      }));
      setIsOvertimeModalOpen(false);
    }
  };

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaff.name || !newStaff.mobile) return;
    const staff: StaffAttendance = {
      id: String(Date.now()),
      name: newStaff.name,
      mobile: newStaff.mobile,
      lastMonthDue: newStaff.lastMonthDue,
      balance: newStaff.balanceType === "To Pay" ? newStaff.balance : -newStaff.balance,
      team: newStaff.team,
      payoutType: newStaff.payoutType,
      salary: newStaff.salary,
      status: null
    };
    setStaffList(prev => [...prev, staff]);
    setIsAddStaffModalOpen(false);
    setNewStaff({ 
      name: "", 
      mobile: "", 
      lastMonthDue: 0, 
      balance: 0, 
      team: activeTab,
      payoutType: "Monthly",
      salary: 0,
      balanceType: "To Pay"
    });
  };

  const handleClearDues = (id: string) => {
    setStaffList(prev => prev.map(s => {
      if (s.id === id) {
        return { ...s, balance: 0, lastMonthDue: 0 };
      }
      return s;
    }));
  };

  const filteredStaff = currentTeamStaff.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.mobile.includes(searchQuery)
  );

  const totalLastMonthDue = filteredStaff.reduce((sum, s) => sum + s.lastMonthDue, 0);
  const totalBalance = filteredStaff.reduce((sum, s) => sum + s.balance, 0);

  const totalOTAmount = overtimeType === "hourly" 
    ? (parseInt(otHours) + parseInt(otMins)/60) * otHourlyRate 
    : otFixedAmount;

  return (
    <div className="min-h-screen bg-slate-50/50 pb-6">
      <div className="max-w-[1400px] mx-auto space-y-4 p-4 md:p-6 animate-in fade-in duration-500">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 md:p-5 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-600 text-white p-2.5 rounded-lg shadow-sm">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-tight">Attendance System</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Manage staff presence and payroll</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
            <button onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 1)))} 
              className="p-1.5 hover:bg-white hover:shadow-sm rounded-md transition-all text-slate-600">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-700 px-3 min-w-[140px] text-center">{formatDate(currentDate)}</span>
            <button onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 1)))}
              className="p-1.5 hover:bg-white hover:shadow-sm rounded-md transition-all text-slate-600">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="text-xs h-9" onClick={() => setIsSettingsModalOpen(true)}>
              Settings
            </Button>
            <Button size="sm" className="text-xs h-9 gap-2" onClick={() => setIsAddStaffModalOpen(true)}>
              <Plus className="w-4 h-4" />
              Add Staff
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: "Present", count: counts.P, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
            { label: "Absent", count: counts.A, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-100" },
            { label: "Half Day", count: counts.HD, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
            { label: "Paid Leave", count: counts.PL, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
            { label: "Weekly Off", count: counts.WO, color: "text-slate-600", bg: "bg-slate-50", border: "border-slate-100" },
          ].map((stat) => (
            <div key={stat.label} className={cn("bg-white p-3 rounded-lg border shadow-sm flex flex-col items-center justify-center text-center", stat.border)}>
              <span className={cn("text-xl font-bold", stat.color)}>{stat.count}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{stat.label}</span>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          {/* Tabs & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border-b border-slate-100 bg-slate-50/30 gap-3">
            <div className="flex p-1 bg-slate-100 rounded-lg w-fit">
              <button onClick={() => setActiveTab("office")} 
                className={cn("px-6 py-1.5 text-xs font-bold rounded-md transition-all", 
                  activeTab === "office" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}>
                Office Staff
              </button>
              <button onClick={() => setActiveTab("site" as any)}
                className={cn("px-6 py-1.5 text-xs font-bold rounded-md transition-all", 
                  activeTab === "site" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}>
                Site Staff
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input type="text" placeholder="Search by name or mobile..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-md text-xs w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Staff Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>Last Month Due</TableHead>
                  <TableHead>Current Balance</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStaff.map((staff) => (
                  <TableRow key={staff.id} className="group hover:bg-slate-50/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-[10px] font-bold text-indigo-600 border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                          {staff.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">{staff.name}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{staff.payoutType} • ₹{staff.salary}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {["P", "A", "HD", "PL", "WO"].map((status) => (
                          <button
                            key={status}
                            onClick={() => handleStatusChange(staff.id, status as AttendanceStatus)}
                            className={cn(
                              "w-7 h-7 rounded-md text-[10px] font-bold transition-all border",
                              staff.status === status
                                ? status === "P" ? "bg-emerald-500 border-emerald-600 text-white shadow-sm" :
                                  status === "A" ? "bg-rose-500 border-rose-600 text-white shadow-sm" :
                                  status === "HD" ? "bg-amber-500 border-amber-600 text-white shadow-sm" :
                                  status === "PL" ? "bg-blue-500 border-blue-600 text-white shadow-sm" :
                                  "bg-slate-500 border-slate-600 text-white shadow-sm"
                                : "bg-white border-slate-200 text-slate-400 hover:border-slate-300 hover:bg-slate-50"
                            )}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-slate-500 font-medium">{staff.mobile}</TableCell>
                    <TableCell className="text-xs font-bold text-slate-700">₹{staff.lastMonthDue.toLocaleString()}</TableCell>
                    <TableCell>
                      <span className={cn("text-xs font-bold px-2 py-0.5 rounded-md", 
                        staff.balance > 0 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700")}>
                        ₹{staff.balance.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="relative inline-block">
                        <button onClick={() => setShowMenuId(showMenuId === staff.id ? null : staff.id)}
                          className="p-1.5 hover:bg-slate-100 rounded-md transition-all text-slate-400 hover:text-slate-600">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {showMenuId === staff.id && (
                          <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-slate-200 rounded-lg shadow-xl z-20 py-1 animate-in fade-in slide-in-from-top-2 duration-200">
                            <button onClick={() => handleStatusChange(staff.id, "OT")}
                              className="w-full px-3 py-1.5 text-left text-[11px] font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-2">
                              <Plus className="w-3.5 h-3.5" />
                              Add Overtime
                            </button>
                            <button onClick={() => handleClearDues(staff.id)}
                              className="w-full px-3 py-1.5 text-left text-[11px] font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-2">
                              <X className="w-3.5 h-3.5" />
                              Clear Dues
                            </button>
                            <button className="w-full px-3 py-1.5 text-left text-[11px] font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-2">
                              <Info className="w-3.5 h-3.5" />
                              View History
                            </button>
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter className="bg-slate-50/80 border-t-2 border-slate-200">
                <TableRow>
                  <TableCell colSpan={3} className="text-xs font-bold text-slate-900">Total Staff: {filteredStaff.length}</TableCell>
                  <TableCell className="text-xs font-bold text-slate-900">₹{totalLastMonthDue.toLocaleString()}</TableCell>
                  <TableCell className="text-xs font-bold text-indigo-600">₹{totalBalance.toLocaleString()}</TableCell>
                  <TableCell />
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </div>
      </div>

      {/* Overlay to close dropdown when clicking outside */}
      {showMenuId && (
        <div 
          className="fixed inset-0 z-30 bg-transparent" 
          onClick={() => setShowMenuId(null)} 
        />
      )}

      {/* Add Staff Modal */}
      <Modal 
        isOpen={isAddStaffModalOpen} 
        onClose={() => setIsAddStaffModalOpen(false)} 
        title="Add Staff"
        className="max-w-xl"
      >
        <form onSubmit={handleAddStaff} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Name<span className="text-red-500">*</span></label>
              <Input 
                placeholder="Enter Employee Name" 
                value={newStaff.name}
                onChange={(e) => setNewStaff({...newStaff, name: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Mobile Number<span className="text-red-500">*</span></label>
              <Input 
                placeholder="+91 9999999999" 
                value={newStaff.mobile}
                onChange={(e) => setNewStaff({...newStaff, mobile: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Salary Payout Type<span className="text-red-500">*</span></label>
              <select 
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white"
                value={newStaff.payoutType}
                onChange={(e) => setNewStaff({...newStaff, payoutType: e.target.value as SalaryPayoutType})}
                required
              >
                <option value="Monthly">Monthly</option>
                <option value="Daily">Daily</option>
                <option value="Hourly">Hourly</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Salary<span className="text-red-500">*</span></label>
              <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white">
                <div className="pl-3 pr-1 text-sm font-medium text-slate-700">₹</div>
                <input 
                  type="number" 
                  placeholder="20000"
                  value={newStaff.salary}
                  onChange={(e) => setNewStaff({...newStaff, salary: parseInt(e.target.value) || 0})}
                  className="w-full py-2 text-sm font-medium font-mono focus:outline-none" 
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              Outstanding/Opening Balance
              <Info className="w-3.5 h-3.5 text-slate-400" />
            </label>
            <div className="flex items-center gap-0 border border-slate-200 rounded-lg overflow-hidden bg-white max-w-[300px]">
              <div className="pl-3 pr-1 text-sm font-medium text-slate-700">₹</div>
              <input 
                type="number"
                placeholder="0" 
                value={newStaff.balance}
                onChange={(e) => setNewStaff({...newStaff, balance: parseInt(e.target.value) || 0})}
                className="flex-1 py-2 text-sm font-medium font-mono focus:outline-none"
              />
              <select 
                className="bg-slate-50 border-l border-slate-200 px-3 py-2 text-sm font-medium focus:outline-none cursor-pointer"
                value={newStaff.balanceType}
                onChange={(e) => setNewStaff({...newStaff, balanceType: e.target.value as "To Pay" | "To Receive"})}
              >
                <option value="To Pay">To Pay</option>
                <option value="To Receive">To Receive</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Assign Team</label>
            <div className="flex bg-slate-100 p-1 rounded-xl w-full max-w-[300px]">
              <button 
                type="button"
                onClick={() => setNewStaff({...newStaff, team: "office"})}
                className={cn(
                  "flex-1 py-2 rounded-lg text-xs font-medium transition-all",
                  newStaff.team === "office" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
              >
                Office Team
              </button>
              <button 
                type="button"
                onClick={() => setNewStaff({...newStaff, team: "site"})}
                className={cn(
                  "flex-1 py-2 rounded-lg text-xs font-medium transition-all",
                  newStaff.team === "site" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
              >
                Site Team
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setIsAddStaffModalOpen(false)} className="px-8 rounded-lg text-xs font-medium h-10">
              Cancel
            </Button>
            <Button type="submit" className="px-10 rounded-lg text-xs font-medium h-10 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100">
              Save
            </Button>
          </div>
        </form>
      </Modal>

      {/* Attendance Settings Modal */}
      <Modal 
        isOpen={isSettingsModalOpen} 
        onClose={() => setIsSettingsModalOpen(false)} 
        title="Attendance Settings"
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-xs font-medium text-slate-900 uppercase tracking-widest">General Rules</h3>
            <div className="space-y-3">
              {[
                { label: "Auto-mark Sunday as Weekly Off", enabled: true },
                { label: "Allow overtime logging", enabled: true },
                { label: "Enable payroll calculations", enabled: true },
              ].map((setting) => (
                <div key={setting.label} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                  <span className="text-xs font-medium text-slate-700">{setting.label}</span>
                  <div className={cn(
                    "w-10 h-5 rounded-full relative transition-colors",
                    setting.enabled ? "bg-indigo-600" : "bg-slate-300"
                  )}>
                    <div className={cn(
                      "absolute top-1 w-3 h-3 bg-white rounded-full transition-all",
                      setting.enabled ? "right-1" : "left-1"
                    )} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-medium text-slate-900 uppercase tracking-widest">Shift Timings</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-medium text-slate-500">In Time</label>
                <Input type="time" defaultValue="09:00" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-medium text-slate-500">Out Time</label>
                <Input type="time" defaultValue="18:00" />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <Button onClick={() => setIsSettingsModalOpen(false)}>Save Settings</Button>
          </div>
        </div>
      </Modal>

      {/* Advanced Overtime Modal */}
      <Modal 
        isOpen={isOvertimeModalOpen} 
        onClose={() => setIsOvertimeModalOpen(false)} 
        title="Add Overtime"
        className="max-w-xl"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-1">
              <p className="text-[11px] font-medium text-slate-400">Staff name</p>
              <p className="text-sm font-medium text-slate-900">{selectedStaffForOT?.name}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[11px] font-medium text-slate-400">Date</p>
              <p className="text-sm font-medium text-slate-900">{formatDate(currentDate)}</p>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-[11px] font-medium text-slate-400">Overtime Type</p>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div 
                  onClick={() => setOvertimeType("hourly")}
                  className={cn(
                    "w-4 h-4 rounded-full border flex items-center justify-center transition-all",
                    overtimeType === "hourly" ? "border-indigo-600 bg-indigo-600" : "border-slate-300 group-hover:border-slate-400"
                  )}
                >
                  {overtimeType === "hourly" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <span className="text-xs font-medium text-slate-700">Hourly rate</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer group">
                <div 
                  onClick={() => setOvertimeType("fixed")}
                  className={cn(
                    "w-4 h-4 rounded-full border flex items-center justify-center transition-all",
                    overtimeType === "fixed" ? "border-indigo-600 bg-indigo-600" : "border-slate-300 group-hover:border-slate-400"
                  )}
                >
                  {overtimeType === "fixed" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <span className="text-xs font-medium text-slate-700">Fixed amount</span>
                <Info className="w-3 h-3 text-slate-400" />
              </label>
            </div>
          </div>

          {overtimeType === "hourly" ? (
            <div className="bg-slate-50/50 p-6 rounded-xl border border-slate-100 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <p className="text-[11px] font-medium text-slate-500">Number of hours <span className="text-red-500">*</span></p>
                  <div className="flex items-center gap-1">
                    <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white">
                      <input 
                        type="text" 
                        value={otHours}
                        onChange={(e) => setOtHours(e.target.value)}
                        className="w-12 py-2 text-center text-sm font-medium font-mono focus:outline-none" 
                      />
                      <div className="px-2 py-2 bg-slate-50 border-l border-slate-200 text-[10px] font-medium text-slate-500">Hrs</div>
                    </div>
                    <span className="text-slate-400 font-medium">:</span>
                    <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white">
                      <select 
                        value={otMins}
                        onChange={(e) => setOtMins(e.target.value)}
                        className="w-12 py-2 text-center text-sm font-medium font-mono focus:outline-none appearance-none cursor-pointer"
                      >
                        <option value="00">00</option>
                        <option value="15">15</option>
                        <option value="30">30</option>
                        <option value="45">45</option>
                      </select>
                      <div className="px-2 py-2 bg-slate-50 border-l border-slate-200 text-[10px] font-medium text-slate-500">Min</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-[11px] font-medium text-slate-500">Overtime rate <span className="text-red-500">*</span></p>
                  <div className="flex items-center gap-2">
                    <select 
                      value={otRateType}
                      onChange={(e) => setOtRateType(e.target.value)}
                      className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none appearance-none cursor-pointer bg-white"
                    >
                      <option>1x Salary</option>
                      <option>1.5x Salary</option>
                      <option>2x Salary</option>
                    </select>
                    <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white min-w-[100px]">
                      <div className="pl-3 pr-1 text-sm font-medium text-slate-700">₹</div>
                      <input 
                        type="number" 
                        value={otHourlyRate}
                        onChange={(e) => setOtHourlyRate(parseInt(e.target.value))}
                        className="w-full py-2 text-sm font-medium font-mono focus:outline-none" 
                      />
                      <div className="pr-3 text-[10px] font-medium text-slate-400">/Hr</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <p className="text-[11px] font-medium text-slate-400">Total amount</p>
                <p className="text-sm font-medium font-mono text-slate-900">
                  {otHours}:{otMins} X ₹{otHourlyRate} = ₹{Math.round(totalOTAmount)}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50/50 p-6 rounded-xl border border-slate-100 space-y-4">
              <div className="space-y-2">
                <p className="text-[11px] font-medium text-slate-500">Overtime amount <span className="text-red-500">*</span></p>
                <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white max-w-[200px]">
                  <input 
                    type="number" 
                    value={otFixedAmount}
                    onChange={(e) => setOtFixedAmount(parseInt(e.target.value))}
                    className="w-full px-4 py-2.5 text-sm font-medium font-mono focus:outline-none" 
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button 
              variant="outline" 
              onClick={() => setIsOvertimeModalOpen(false)}
              className="px-8 rounded-lg text-xs font-medium h-10"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveOvertime}
              className="px-10 rounded-lg text-xs font-medium h-10 bg-indigo-600 hover:bg-indigo-700"
            >
              Save
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
