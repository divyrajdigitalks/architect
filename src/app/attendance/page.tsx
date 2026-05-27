"use client";

import { useState, useEffect } from "react";
import { Search, ChevronLeft, ChevronRight, Settings, Plus, Clock, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/lib/auth-context";
import Modal from "@/components/ui/Modal";
import { attendanceService } from "@/services/attendance.service";
import { staffService } from "@/services/staff.service";
import { roleService, Role } from "@/services/role.service";
import toast from "react-hot-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
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

type AttendanceStatus = "Present" | "Absent" | "Half Day" | "Leave" | "Weekly Off" | "Overtime" | null;

type SalaryPayoutType = "Monthly" | "Daily" | "Hourly";

type AttendanceLog = {
  checkIn: string;
  checkOut?: string;
  duration: number;
};

type StaffAttendance = {
  _id: string;
  name: string;
  role: { name: string; _id: string };
  email: string;
  phone: string;
  team: "Office" | "Site";
  payoutType: SalaryPayoutType;
  salaryAmount: number;
  config: {
    hoursPerDay: number;
    daysPerMonth: number;
  };
  attendance?: {
    _id?: string;
    status: AttendanceStatus;
    totalMinutes: number;
    logs: AttendanceLog[];
  };
};

export default function AttendancePage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "architect" || user?.role === "director";
  const [currentDate, setCurrentDate] = useState(new Date());
  const [staffList, setStaffList] = useState<StaffAttendance[]>([]);
  const [myAttendance, setMyAttendance] = useState<any[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Global Config (Director defined)
  const [globalConfig, setGlobalConfig] = useState({
    hoursPerDay: 8,
    daysPerMonth: 26
  });

  // Manual Time Edit State
  const [isEditTimeModalOpen, setIsEditTimeModalOpen] = useState(false);
  const [selectedStaffForEdit, setSelectedStaffForEdit] = useState<StaffAttendance | null>(null);
  const [manualHours, setManualHours] = useState(0);
  const [manualStatus, setManualStatus] = useState<AttendanceStatus>("Present");

  // Add Staff Modal State
  const [isAddStaffModalOpen, setIsAddStaffModalOpen] = useState(false);
  const [untrackedStaff, setUntrackedStaff] = useState<StaffMember[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [newStaffConfig, setNewStaffConfig] = useState({ 
    payoutType: "Monthly" as SalaryPayoutType,
    salaryAmount: 0,
  });

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const dateStr = currentDate.toISOString().split('T')[0];
      
      if (isAdmin) {
        const [staffData, attendanceData, rolesData, allOfficeStaff]: [any, any, any, any] = await Promise.all([
          staffService.getAllStaff({ team: "Office", trackAttendance: "true" }),
          attendanceService.getAllAttendance({ date: dateStr }),
          roleService.getAllRoles(),
          staffService.getAllStaff({ team: "Office" })
        ]);

        setRoles(rolesData);
        setUntrackedStaff(allOfficeStaff.filter((s: any) => !s.trackAttendance));
        
        const combined = staffData.map((s: any) => {
          const att = attendanceData.find((a: any) => (a.user?._id || a.user) === s._id);
          return { ...s, attendance: att };
        });

        setStaffList(combined);
      } else {
        // For Staff - show their own monthly history
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString().split('T')[0];
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString().split('T')[0];
        
        const history = await attendanceService.getAllAttendance({ 
          user: user?._id,
          startDate: startOfMonth,
          endDate: endOfMonth
        });
        setMyAttendance(history);
      }
    } catch (error) {
      toast.error("Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchData();
  }, [currentDate, user]);

  const handleStatusChange = async (staffId: string, status: AttendanceStatus) => {
    try {
      const staff = staffList.find(s => s._id === staffId);
      const dateStr = currentDate.toISOString().split('T')[0];
      
      let totalMinutes = 0;
      if (status === "Present") totalMinutes = (staff?.config?.hoursPerDay || 8) * 60;
      else if (status === "Half Day") totalMinutes = ((staff?.config?.hoursPerDay || 8) / 2) * 60;

      const payload = {
        user: staffId,
        date: dateStr,
        status,
        totalMinutes,
        isManual: true
      };

      await attendanceService.updateAttendance(staff?.attendance?._id || "new", payload);
      
      toast.success("Attendance updated");
      fetchData();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleManualUpdate = async () => {
    if (!selectedStaffForEdit) return;
    try {
      const dateStr = currentDate.toISOString().split('T')[0];
      const payload = {
        user: selectedStaffForEdit._id,
        date: dateStr,
        status: manualStatus,
        totalMinutes: manualHours * 60,
        isManual: true
      };

      await attendanceService.updateAttendance(selectedStaffForEdit.attendance?._id || "new", payload);
      
      toast.success("Manual update saved");
      setIsEditTimeModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error("Failed to update");
    }
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaffId) {
      toast.error("Please select a staff member");
      return;
    }
    try {
      await staffService.updateStaff(selectedStaffId, {
        ...newStaffConfig,
        trackAttendance: true,
        config: globalConfig
      });
      toast.success("Staff added to attendance tracking");
      setIsAddStaffModalOpen(false);
      setSelectedStaffId("");
      setNewStaffConfig({
        payoutType: "Monthly",
        salaryAmount: 0,
      });
      fetchData();
    } catch (error) {
      toast.error("Failed to add staff");
    }
  };

  const filteredStaff = staffList.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.phone?.includes(searchQuery)
  );

  const myTotalMinutes = myAttendance.reduce((sum, record) => sum + (record.totalMinutes || 0), 0);
  const myPresentDays = myAttendance.filter(r => r.status === "Present").length;
  const myHalfDays = myAttendance.filter(r => r.status === "Half Day").length;

  const counts = {
    P: staffList.filter(s => s.attendance?.status === "Present").length,
    A: staffList.filter(s => !s.attendance || s.attendance.status === "Absent").length,
    HD: staffList.filter(s => s.attendance?.status === "Half Day").length,
    L: staffList.filter(s => s.attendance?.status === "Leave").length,
    WO: staffList.filter(s => s.attendance?.status === "Weekly Off").length,
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50/50 pb-6">
        <div className="max-w-[1000px] mx-auto space-y-4 p-4 md:p-6 animate-in fade-in duration-500">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 md:p-5 rounded-lg border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="bg-indigo-600 text-white p-2.5 rounded-lg shadow-sm">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 leading-tight">My Attendance</h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">View your monthly work history</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
              <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))} 
                className="p-1.5 hover:bg-white hover:shadow-sm rounded-md transition-all text-slate-600">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold text-slate-700 px-3 min-w-[140px] text-center">
                {currentDate.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
              </span>
              <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}
                className="p-1.5 hover:bg-white hover:shadow-sm rounded-md transition-all text-slate-600">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-bold text-indigo-600 font-mono">
                {Math.floor(myTotalMinutes / 60)}h {myTotalMinutes % 60}m
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Total Hours This Month</span>
            </div>
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-bold text-emerald-600">
                {myPresentDays}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Days Present</span>
            </div>
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-bold text-amber-600">
                {myHalfDays}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Half Days</span>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-slate-50/50">
              <h2 className="text-xs font-bold text-slate-700 uppercase tracking-widest">Attendance Logs</h2>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Check-In/Out Logs</TableHead>
                    <TableHead>Total Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-10"><div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"/></TableCell></TableRow>
                  ) : myAttendance.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-20 text-slate-400 text-xs font-bold uppercase tracking-widest">No records found for this month</TableCell></TableRow>
                  ) : myAttendance.map((record) => (
                    <TableRow key={record._id}>
                      <TableCell className="text-xs font-bold text-slate-900">{record.date}</TableCell>
                      <TableCell>
                        <Badge className={cn(
                          "text-[9px] font-black uppercase px-2 py-0.5",
                          record.status === "Present" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                          record.status === "Absent" ? "bg-rose-50 text-rose-700 border-rose-100" :
                          "bg-slate-50 text-slate-700 border-slate-100"
                        )}>
                          {record.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {record.logs?.map((log: any, idx: number) => (
                            <div key={idx} className="text-[10px] text-slate-500 font-medium">
                              {new Date(log.checkIn).toLocaleTimeString()} - {log.checkOut ? new Date(log.checkOut).toLocaleTimeString() : "Ongoing"}
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs font-bold text-slate-900 font-mono">
                        {Math.floor(record.totalMinutes / 60)}h {record.totalMinutes % 60}m
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Office Staff Management</p>
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
            {isAdmin && (
              <>
                <Button size="sm" variant="outline" className="text-xs h-9" onClick={() => setIsSettingsModalOpen(true)}>
                  Settings
                </Button>
                <Button size="sm" className="text-xs h-9 gap-2" onClick={() => setIsAddStaffModalOpen(true)}>
                  <Plus className="w-4 h-4" />
                  Add Office Staff
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: "Present", count: counts.P, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
            { label: "Absent", count: counts.A, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-100" },
            { label: "Half Day", count: counts.HD, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
            { label: "Leave", count: counts.L, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
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
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              <h2 className="text-xs font-bold text-slate-700 uppercase tracking-widest">Office Staff Attendance</h2>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input type="text" placeholder="Search staff..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-md text-xs w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Staff Member</TableHead>
                  <TableHead>Payout Info</TableHead>
                  <TableHead>Today's Status</TableHead>
                  <TableHead>Time Logged</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-10"><div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"/></TableCell></TableRow>
                ) : filteredStaff.map((staff) => (
                  <TableRow key={staff._id} className="group hover:bg-slate-50/50">
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-[10px] font-bold text-indigo-600 border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                          {staff.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-900">{staff.name}</span>
                          <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-wider">{staff.role?.name || "Staff"}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{staff.payoutType}</span>
                        <span className="text-xs font-bold text-slate-900">₹{staff.salaryAmount}/{staff.payoutType === "Hourly" ? "hr" : "mo"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {["Present", "Absent", "Half Day", "Leave", "Weekly Off"].map((status) => (
                          <button
                            key={status}
                            disabled={!isAdmin}
                            onClick={() => handleStatusChange(staff._id, status as AttendanceStatus)}
                            className={cn(
                              "px-2 py-1 rounded-md text-[9px] font-black transition-all border shadow-sm",
                              (staff.attendance?.status || (status === "Absent" && !staff.attendance ? "Absent" : null)) === status
                                ? (status === "Present" ? "bg-emerald-600 border-emerald-600 text-white" :
                                   status === "Absent" ? "bg-rose-600 border-rose-600 text-white" :
                                   status === "Half Day" ? "bg-amber-500 border-amber-500 text-white" :
                                   status === "Leave" ? "bg-blue-600 border-blue-600 text-white" :
                                   "bg-slate-600 border-slate-600 text-white")
                                : "bg-white border-slate-200 text-slate-400 hover:border-slate-300 hover:bg-slate-50"
                            )}
                          >
                            {status[0]}
                          </button>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-900 font-mono">
                          {staff.attendance?.totalMinutes ? `${Math.floor(staff.attendance.totalMinutes / 60)}h ${staff.attendance.totalMinutes % 60}m` : "0h 0m"}
                        </span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                          {staff.attendance?.logs?.length || 0} Sessions
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {isAdmin && (
                        <button 
                          onClick={() => {
                            setSelectedStaffForEdit(staff);
                            setManualHours(staff.attendance?.totalMinutes ? Number((staff.attendance.totalMinutes / 60).toFixed(1)) : (staff.config?.hoursPerDay || 8));
                            setManualStatus(staff.attendance?.status || "Present");
                            setIsEditTimeModalOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-all"
                          title="Manual Update"
                        >
                          <Settings className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {!isLoading && filteredStaff.length === 0 && (
                  <TableRow><TableCell colSpan={5} className="text-center py-20 text-slate-400 text-xs font-bold uppercase tracking-widest">No office staff found</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Add Staff Modal */}
      <Modal 
        isOpen={isAddStaffModalOpen} 
        onClose={() => setIsAddStaffModalOpen(false)} 
        title="Add Staff to Attendance"
        className="max-w-md"
      >
        <form onSubmit={handleAddStaff} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Select Office Staff</label>
              <select 
                className="w-full h-10 px-3 bg-white border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-indigo-500/20"
                value={selectedStaffId}
                onChange={(e) => setSelectedStaffId(e.target.value)}
                required
              >
                <option value="">Choose a member...</option>
                {untrackedStaff.map(s => (
                  <option key={s._id} value={s._id}>{s.name} ({s.role?.name})</option>
                ))}
              </select>
              {untrackedStaff.length === 0 && (
                <p className="text-[10px] text-amber-600 font-bold uppercase tracking-tight">No more office staff to add</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Payout Type</label>
                <select 
                  className="w-full h-10 px-3 bg-white border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-indigo-500/20"
                  value={newStaffConfig.payoutType}
                  onChange={(e) => setNewStaffConfig({...newStaffConfig, payoutType: e.target.value as SalaryPayoutType})}
                >
                  <option value="Monthly">Monthly</option>
                  <option value="Daily">Daily</option>
                  <option value="Hourly">Hourly</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Salary/Rate (₹)</label>
                <Input 
                  type="number"
                  placeholder="Amount" 
                  value={newStaffConfig.salaryAmount}
                  onChange={(e) => setNewStaffConfig({...newStaffConfig, salaryAmount: Number(e.target.value)})}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setIsAddStaffModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={!selectedStaffId}>Enable Tracking</Button>
          </div>
        </form>
      </Modal>

      {/* Settings Modal */}
      <Modal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        title="Attendance Settings"
        className="max-w-md"
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Standard Working Hours</h3>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Hours per Full Day</label>
              <Input 
                type="number" 
                value={globalConfig.hoursPerDay} 
                onChange={(e) => setGlobalConfig({...globalConfig, hoursPerDay: Number(e.target.value)})}
              />
              <p className="text-[10px] text-slate-400">Used for "Present" status calculation (default: 8)</p>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Working Days per Month</label>
              <Input 
                type="number" 
                value={globalConfig.daysPerMonth} 
                onChange={(e) => setGlobalConfig({...globalConfig, daysPerMonth: Number(e.target.value)})}
              />
              <p className="text-[10px] text-slate-400">Used for monthly salary calculation (default: 26)</p>
            </div>
          </div>
          <div className="flex justify-end pt-4 border-t">
            <Button onClick={() => {
              toast.success("Settings saved for new staff");
              setIsSettingsModalOpen(false);
            }}>
              Save Settings
            </Button>
          </div>
        </div>
      </Modal>

      {/* Manual Update Modal */}
      <Modal
        isOpen={isEditTimeModalOpen}
        onClose={() => setIsEditTimeModalOpen(false)}
        title="Manual Attendance Update"
        className="max-w-md"
      >
        <div className="space-y-6">
          <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-xs font-bold text-indigo-600 border border-indigo-200">
              {selectedStaffForEdit?.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">{selectedStaffForEdit?.name}</p>
              <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">{selectedStaffForEdit?.role?.name}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Attendance Status</label>
              <select 
                className="w-full h-10 px-3 bg-white border border-slate-200 rounded-md text-sm"
                value={manualStatus || "Present"}
                onChange={(e) => setManualStatus(e.target.value as AttendanceStatus)}
              >
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="Half Day">Half Day</option>
                <option value="Leave">Leave</option>
                <option value="Weekly Off">Weekly Off</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Work Hours</label>
              <Input 
                type="number" 
                step="0.5"
                value={manualHours} 
                onChange={(e) => setManualHours(Number(e.target.value))}
              />
              <p className="text-[10px] text-slate-400">Specify total hours worked for this day</p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsEditTimeModalOpen(false)}>Cancel</Button>
            <Button onClick={handleManualUpdate} className="gap-2">
              <Save className="w-4 h-4" />
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
