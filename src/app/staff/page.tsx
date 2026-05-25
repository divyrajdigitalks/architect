"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Edit2, Trash2, Shield, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { DataTable, Column } from "@/components/ui/DataTable";
import Modal from "@/components/ui/Modal";
import { staffService, StaffMember } from "@/services/staff.service";
import { roleService, Role } from "@/services/role.service";

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "",
    team: "Office",
    experience: "" as string | number,
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [staffData, rolesData] = await Promise.all([
        staffService.getAllStaff(),
        roleService.getAllRoles(),
      ]);
      setStaff(staffData);
      setRoles(rolesData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (member: StaffMember | null = null) => {
    if (member) {
      setEditingStaff(member);
      setFormData({
        name: member.name,
        email: member.email,
        password: "",
        phone: member.phone || "",
        role: member.role?._id || "",
        team: member.team || "Office",
        experience: member.experience ?? "",
      });
    } else {
      setEditingStaff(null);
      setFormData({
        name: "",
        email: "",
        password: "",
        phone: "",
        role: "",
        team: "Office",
        experience: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        ...formData,
        experience: formData.experience !== "" ? Number(formData.experience) : undefined,
      };
      if (editingStaff && !payload.password) {
        delete payload.password;
      }

      if (editingStaff) {
        await staffService.updateStaff(editingStaff._id, payload);
      } else {
        await staffService.createStaff(payload);
      }

      fetchData();
      setIsModalOpen(false);
    } catch (error: any) {
      console.error("Error saving staff:", error);
      alert(error.message || "Failed to save staff member");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this staff member?")) return;
    try {
      await staffService.deleteStaff(id);
      fetchData();
    } catch (error: any) {
      console.error("Error deleting staff:", error);
      alert(error.message || "Failed to delete staff member");
    }
  };

  const columns: Column<StaffMember>[] = [
    {
      header: "Member",
      render: (member) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-bold border border-slate-200">
            {member.name[0]}
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">{member.name}</p>
            <p className="text-xs text-slate-500">{member.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Role",
      render: (member) => (
        <Badge variant="outline" className="text-[10px] font-black uppercase bg-indigo-50 text-indigo-600 border-indigo-100">
          <Shield className="w-3 h-3 mr-1" />
          {member.role?.name || "No Role"}
        </Badge>
      ),
    },
    {
      header: "Team",
      render: (member) => (
        <Badge
          variant="secondary"
          className={`text-[10px] font-bold uppercase ${
            member.team === "Site"
              ? "bg-amber-50 text-amber-700 border-amber-100"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {member.team}
        </Badge>
      ),
    },
    {
      header: "Experience",
      render: (member) => (
        <div className="flex items-center gap-1.5">
          <Briefcase className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-semibold text-slate-700 font-mono">
            {member.experience != null ? `${member.experience} yrs` : "—"}
          </span>
        </div>
      ),
    },
    {
      header: "Status",
      render: (member) => (
        <div className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${member.isActive ? "bg-emerald-500" : "bg-slate-300"}`} />
          <span className="text-xs font-medium text-slate-600">{member.isActive ? "Active" : "Inactive"}</span>
        </div>
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      render: (member) => (
        <div className="flex justify-end gap-2">
          <button onClick={() => handleOpenModal(member)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
            <Edit2 className="w-4 h-4" />
          </button>
          <button onClick={() => handleDelete(member._id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const filteredStaff = staff.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.role?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 p-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Staff Management</h1>
          <p className="text-sm font-medium text-slate-500 uppercase tracking-widest mt-1">Manage your team and their system access</p>
        </div>
        <div className="flex items-center gap-3">
          <Input
            placeholder="Search staff..."
            icon={Search}
            className="w-64"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button onClick={() => handleOpenModal()} className="gap-2 rounded-2xl shadow-lg shadow-indigo-100">
            <Plus className="w-5 h-5" />
            Add Staff Member
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden border-slate-200 p-0 shadow-sm">
        <DataTable columns={columns} data={filteredStaff} />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStaff ? "Edit Staff Member" : "Add Staff Member"}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
              <Input
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
              <Input
                type="email"
                placeholder="john@archisite.pro"
                value={formData.email}
                onChange={(e) => setFormData((f) => ({ ...f, email: e.target.value }))}
                required
              />
            </div>
            {!editingStaff && (
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData((f) => ({ ...f, password: e.target.value }))}
                  required
                />
              </div>
            )}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Phone Number</label>
              <Input
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={(e) => setFormData((f) => ({ ...f, phone: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Assigned Role</label>
              <select
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={formData.role}
                onChange={(e) => setFormData((f) => ({ ...f, role: e.target.value }))}
                required
              >
                <option value="">Select a Role</option>
                {roles.map((r) => (
                  <option key={r._id} value={r._id}>{r.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Team</label>
              <select
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={formData.team}
                onChange={(e) => setFormData((f) => ({ ...f, team: e.target.value }))}
                required
              >
                <option value="Office">Office Team</option>
                <option value="Site">Site Team</option>
              </select>
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">
                Experience (Years)
              </label>
              <Input
                type="number"
                min="0"
                max="50"
                placeholder="e.g., 5"
                value={formData.experience}
                onChange={(e) => setFormData((f) => ({ ...f, experience: e.target.value }))}
                className="font-mono"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">
              {editingStaff ? "Update Staff" : "Add Staff"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
