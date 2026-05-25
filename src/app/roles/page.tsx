"use client";

import { useState, useEffect } from "react";
import { Plus, Shield, Check, X, Edit2, Trash2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { roleService, Role } from "@/services/role.service";

const MODULES = [
  "projects", "tasks", "office-work", "site-work", "office-team", "site-team", 
  "clients", "site-updates", "site-photos", "attendance", "payments", 
  "reports", "messages", "staff", "roles", "settings", "working-sop", "calendar"
];

const ALL_AVAILABLE_PERMISSIONS = [
  "all",
  "dashboard.view",
  ...MODULES.flatMap(m => [`${m}.view`, `${m}.create`, `${m}.edit`, `${m}.delete`])
];

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    permissions: [] as string[]
  });

  const fetchRoles = async () => {
    try {
      setIsLoading(true);
      const data = await roleService.getAllRoles();
      setRoles(data);
    } catch (error) {
      console.error("Error fetching roles:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleOpenModal = (role: Role | null = null) => {
    if (role) {
      setEditingRole(role);
      setFormData({
        name: role.name,
        description: role.description || "",
        permissions: role.permissions
      });
    } else {
      setEditingRole(null);
      setFormData({
        name: "",
        description: "",
        permissions: []
      });
    }
    setIsModalOpen(true);
  };

  const handleTogglePermission = (perm: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter(p => p !== perm)
        : [...prev.permissions, perm]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingRole) {
        await roleService.updateRole(editingRole._id, formData);
      } else {
        await roleService.createRole(formData);
      }
      fetchRoles();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving role:", error);
      alert(error instanceof Error ? error.message : "Failed to save role");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this role?")) return;
    try {
      await roleService.deleteRole(id);
      fetchRoles();
    } catch (error) {
      console.error("Error deleting role:", error);
      alert(error instanceof Error ? error.message : "Failed to delete role");
    }
  };

  return (
    <div className="space-y-8 p-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Role Management</h1>
          <p className="text-slate-500 mt-1 uppercase text-xs font-black tracking-widest">Define roles and granular permissions</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="gap-2 rounded-2xl shadow-lg shadow-indigo-100">
          <Plus className="w-5 h-5" />
          Create New Role
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center py-10 text-slate-500 font-medium">Loading roles...</div>
        ) : (
          roles.map((role) => (
            <Card key={role._id} className="p-6 border-slate-200 hover:border-indigo-300 transition-colors group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  <Shield className="w-6 h-6" />
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleOpenModal(role)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(role._id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-900">{role.name}</h3>
              <p className="text-sm text-slate-500 mt-1 mb-4">{role.description || "No description provided."}</p>
              
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Permissions</p>
                <div className="flex flex-wrap gap-1.5">
                  {role.permissions.slice(0, 5).map(p => (
                    <Badge key={p} variant="secondary" className="text-[10px] bg-slate-100 text-slate-600 border-none px-2">
                      {p}
                    </Badge>
                  ))}
                  {role.permissions.length > 5 && (
                    <Badge variant="secondary" className="text-[10px] bg-slate-100 text-slate-600 border-none px-2">
                      +{role.permissions.length - 5} more
                    </Badge>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingRole ? "Edit Role" : "Create New Role"}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-bold text-slate-700 mb-1 block">Role Name</label>
              <Input 
                placeholder="e.g., Project Manager" 
                value={formData.name} 
                onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="text-sm font-bold text-slate-700 mb-1 block">Description</label>
              <Input 
                placeholder="What does this role do?" 
                value={formData.description} 
                onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-bold text-slate-700 mb-3 block">Permissions</label>
              
              <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                {/* Special Permissions */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">System Access</p>
                  <div className="grid grid-cols-2 gap-3">
                    {["all", "dashboard.view"].map(perm => (
                      <button
                        key={perm}
                        type="button"
                        onClick={() => handleTogglePermission(perm)}
                        className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all ${
                          formData.permissions.includes(perm)
                            ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100"
                            : "bg-white border-slate-200 text-slate-600 hover:border-indigo-100"
                        }`}
                      >
                        {formData.permissions.includes(perm) ? (
                          <ShieldCheck className="w-4 h-4 text-white" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-slate-200" />
                        )}
                        <span className="text-xs font-bold capitalize">{perm.replace('.', ' ')}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Module Permissions */}
                {MODULES.map(module => (
                  <div key={module} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{module.replace('-', ' ')} Module</p>
                    <div className="grid grid-cols-2 gap-2">
                      {["view", "create", "edit", "delete"].map(action => {
                        const perm = `${module}.${action}`;
                        const isSelected = formData.permissions.includes(perm) || formData.permissions.includes("all");
                        return (
                          <button
                            key={perm}
                            type="button"
                            onClick={() => handleTogglePermission(perm)}
                            disabled={formData.permissions.includes("all")}
                            className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
                              isSelected
                                ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                                : "bg-white border-slate-100 text-slate-500 hover:border-indigo-100"
                            } ${formData.permissions.includes("all") ? "opacity-50 cursor-not-allowed" : ""}`}
                          >
                            {isSelected ? (
                              <Check className="w-3.5 h-3.5 text-indigo-600" />
                            ) : (
                              <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-200" />
                            )}
                            <span className="text-[11px] font-medium capitalize">{action}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">
              {editingRole ? "Update Role" : "Create Role"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
