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
  const [currentDate, setCurrentDate] = useState(new Date(2026, 4, 20)); // May 20, 2026 as in image
  const [activeTab, setActiveTab] = useState<"office" | "site">("office");
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
    <div className="min-h-screen bg-slate-50/50 pb-10">
      {/* Header Area */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-30">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Staff Attendance & Payroll</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-xl mr-4">
            <button 
              onClick={() => {
                setActiveTab("office");
                setNewStaff(s => ({ ...s, team: "office" }));
              }}
              className={cn(
                "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                activeTab === "office" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              Office Team
            </button>
            <button 
              onClick={() => {
                setActiveTab("site");
                setNewStaff(s => ({ ...s, team: "site" }));
              }}
              className={cn(
                "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                activeTab === "site" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              Site Team
            </button>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-9 gap-2 text-slate-600 font-bold text-xs tracking-wider"
            onClick={() => setIsSettingsModalOpen(true)}
          >
            Attendance settings
            <Settings className="w-4 h-4" />
          </Button>
          <Button 
            variant="primary" 
            size="sm" 
            className="h-9 gap-2 font-bold text-xs tracking-wider shadow-lg shadow-indigo-100"
            onClick={() => setIsAddStaffModalOpen(true)}
          >
            <Plus className="w-4 h-4" />
            Add staff
          </Button>
        </div>
      </div>

      <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
        {/* Date Picker & Stats Row */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-700">{formatDate(currentDate)}</h2>
            <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
              <button 
                onClick={() => {
                  const prev = new Date(currentDate);
                  prev.setDate(prev.getDate() - 1);
                  setCurrentDate(prev);
                }}
                className="p-2 hover:bg-slate-50 border-r border-slate-200 text-slate-400"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-50/50">
                Today: {formatDate(new Date(2026, 4, 20))}
              </div>
              <button 
                onClick={() => {
                  const next = new Date(currentDate);
                  next.setDate(next.getDate() + 1);
                  setCurrentDate(next);
                }}
                className="p-2 hover:bg-slate-50 border-l border-slate-200 text-slate-400"
              >
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
                <p className="text-[10px] font-bold text-slate-400 tracking-widest mb-1">{stat.label}</p>
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
                  <th className="px-6 py-4 text-[11px] font-black text-slate-500 tracking-widest">Staff name</th>
                  <th className="px-6 py-4 text-[11px] font-black text-slate-500 tracking-widest">Mobile number</th>
                  <th className="px-6 py-4 text-[11px] font-black text-slate-500 tracking-widest">Last month due</th>
                  <th className="px-6 py-4 text-[11px] font-black text-slate-500 tracking-widest">Balance</th>
                  <th className="px-6 py-4 text-[11px] font-black text-slate-500 tracking-widest">Mark attendance</th>
                  <th className="px-6 py-4 text-[11px] font-black text-slate-500 tracking-widest text-right">Actions</th>
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
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 text-[10px] font-black tracking-widest text-indigo-600 border-indigo-100 hover:bg-indigo-50"
                        onClick={() => handleClearDues(staff.id)}
                      >
                        Clear dues
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
                    <p className="text-sm font-black text-red-600">₹ {totalLastMonthDue.toLocaleString('en-IN')} <span className="text-[10px] font-bold text-red-400 ml-1">(overdue)</span></p>
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
              <label className="text-sm font-bold text-slate-700">Name<span className="text-red-500">*</span></label>
              <Input 
                placeholder="Enter Employee Name" 
                value={newStaff.name}
                onChange={(e) => setNewStaff({...newStaff, name: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Mobile Number<span className="text-red-500">*</span></label>
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
              <label className="text-sm font-bold text-slate-700">Salary Payout Type<span className="text-red-500">*</span></label>
              <select 
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white"
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
              <label className="text-sm font-bold text-slate-700">Salary<span className="text-red-500">*</span></label>
              <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white">
                <div className="pl-3 pr-1 text-sm font-bold text-slate-700">₹</div>
                <input 
                  type="number" 
                  placeholder="20000"
                  value={newStaff.salary}
                  onChange={(e) => setNewStaff({...newStaff, salary: parseInt(e.target.value) || 0})}
                  className="w-full py-2 text-sm font-bold focus:outline-none" 
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              Outstanding/Opening Balance
              <Info className="w-3.5 h-3.5 text-slate-400" />
            </label>
            <div className="flex items-center gap-0 border border-slate-200 rounded-lg overflow-hidden bg-white max-w-[300px]">
              <div className="pl-3 pr-1 text-sm font-bold text-slate-700">₹</div>
              <input 
                type="number"
                placeholder="0" 
                value={newStaff.balance}
                onChange={(e) => setNewStaff({...newStaff, balance: parseInt(e.target.value) || 0})}
                className="flex-1 py-2 text-sm font-bold focus:outline-none"
              />
              <select 
                className="bg-slate-50 border-l border-slate-200 px-3 py-2 text-sm font-bold focus:outline-none cursor-pointer"
                value={newStaff.balanceType}
                onChange={(e) => setNewStaff({...newStaff, balanceType: e.target.value as "To Pay" | "To Receive"})}
              >
                <option value="To Pay">To Pay</option>
                <option value="To Receive">To Receive</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Assign Team</label>
            <div className="flex bg-slate-100 p-1 rounded-xl w-full max-w-[300px]">
              <button 
                type="button"
                onClick={() => setNewStaff({...newStaff, team: "office"})}
                className={cn(
                  "flex-1 py-2 rounded-lg text-xs font-bold transition-all",
                  newStaff.team === "office" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
              >
                Office Team
              </button>
              <button 
                type="button"
                onClick={() => setNewStaff({...newStaff, team: "site"})}
                className={cn(
                  "flex-1 py-2 rounded-lg text-xs font-bold transition-all",
                  newStaff.team === "site" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
              >
                Site Team
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setIsAddStaffModalOpen(false)} className="px-8 rounded-lg text-xs font-bold h-10">
              Cancel
            </Button>
            <Button type="submit" className="px-10 rounded-lg text-xs font-bold h-10 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100">
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
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">General Rules</h3>
            <div className="space-y-3">
              {[
                { label: "Auto-mark Sunday as Weekly Off", enabled: true },
                { label: "Allow overtime logging", enabled: true },
                { label: "Enable payroll calculations", enabled: true },
              ].map((setting) => (
                <div key={setting.label} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                  <span className="text-xs font-bold text-slate-700">{setting.label}</span>
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
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Shift Timings</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500">In Time</label>
                <Input type="time" defaultValue="09:00" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500">Out Time</label>
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
              <p className="text-[11px] font-bold text-slate-400">Staff name</p>
              <p className="text-sm font-bold text-slate-900">{selectedStaffForOT?.name}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[11px] font-bold text-slate-400">Date</p>
              <p className="text-sm font-bold text-slate-900">{formatDate(currentDate)}</p>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-[11px] font-bold text-slate-400">Overtime Type</p>
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
                <span className="text-xs font-bold text-slate-700">Hourly rate</span>
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
                <span className="text-xs font-bold text-slate-700">Fixed amount</span>
                <Info className="w-3 h-3 text-slate-400" />
              </label>
            </div>
          </div>

          {overtimeType === "hourly" ? (
            <div className="bg-slate-50/50 p-6 rounded-xl border border-slate-100 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <p className="text-[11px] font-bold text-slate-500">Number of hours <span className="text-red-500">*</span></p>
                  <div className="flex items-center gap-1">
                    <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white">
                      <input 
                        type="text" 
                        value={otHours}
                        onChange={(e) => setOtHours(e.target.value)}
                        className="w-12 py-2 text-center text-sm font-bold focus:outline-none" 
                      />
                      <div className="px-2 py-2 bg-slate-50 border-l border-slate-200 text-[10px] font-bold text-slate-500">Hrs</div>
                    </div>
                    <span className="text-slate-400 font-bold">:</span>
                    <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white">
                      <select 
                        value={otMins}
                        onChange={(e) => setOtMins(e.target.value)}
                        className="w-12 py-2 text-center text-sm font-bold focus:outline-none appearance-none cursor-pointer"
                      >
                        <option value="00">00</option>
                        <option value="15">15</option>
                        <option value="30">30</option>
                        <option value="45">45</option>
                      </select>
                      <div className="px-2 py-2 bg-slate-50 border-l border-slate-200 text-[10px] font-bold text-slate-500">Min</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-[11px] font-bold text-slate-500">Overtime rate <span className="text-red-500">*</span></p>
                  <div className="flex items-center gap-2">
                    <select 
                      value={otRateType}
                      onChange={(e) => setOtRateType(e.target.value)}
                      className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none appearance-none cursor-pointer bg-white"
                    >
                      <option>1x Salary</option>
                      <option>1.5x Salary</option>
                      <option>2x Salary</option>
                    </select>
                    <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white min-w-[100px]">
                      <div className="pl-3 pr-1 text-sm font-bold text-slate-700">₹</div>
                      <input 
                        type="number" 
                        value={otHourlyRate}
                        onChange={(e) => setOtHourlyRate(parseInt(e.target.value))}
                        className="w-full py-2 text-sm font-bold focus:outline-none" 
                      />
                      <div className="pr-3 text-[10px] font-bold text-slate-400">/Hr</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <p className="text-[11px] font-bold text-slate-400">Total amount</p>
                <p className="text-sm font-bold text-slate-900">
                  {otHours}:{otMins} X ₹{otHourlyRate} = ₹{Math.round(totalOTAmount)}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50/50 p-6 rounded-xl border border-slate-100 space-y-4">
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-slate-500">Overtime amount <span className="text-red-500">*</span></p>
                <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white max-w-[200px]">
                  <input 
                    type="number" 
                    value={otFixedAmount}
                    onChange={(e) => setOtFixedAmount(parseInt(e.target.value))}
                    className="w-full px-4 py-2.5 text-sm font-bold focus:outline-none" 
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
              className="px-8 rounded-lg text-xs font-bold h-10"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveOvertime}
              className="px-10 rounded-lg text-xs font-bold h-10 bg-indigo-600 hover:bg-indigo-700"
            >
              Save
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
