"use client";

import { supervisors as initialSupervisors } from "@/lib/dummy-data";
import { useState } from "react";
import { Plus, Search, MapPin, Phone, HardHat, MoreVertical, ShieldCheck, CheckCircle2, Construction } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";
import { useAuth } from "@/lib/auth-context";

type SiteMember = typeof initialSupervisors[0];

export default function SiteTeamPage() {
  const { user } = useAuth();
  const [members, setMembers] = useState<SiteMember[]>(initialSupervisors);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newMember, setNewMember] = useState({ name: "", type: "Site Supervisor", phone: "", experience: "" });

  const canEdit = user?.role === "architect" || user?.role === "super-admin";

  const filteredMembers = members.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMember.name.trim()) return;
    const created: SiteMember = {
      id: String(Date.now()),
      ...newMember,
      assignedProjects: [],
      joinDate: new Date().toISOString().split("T")[0],
      address: "",
      rate: "₹800/day",
      email: `${newMember.name.toLowerCase().replace(/\s+/g, ".")}@archisite.pro`
    } as any;
    setMembers(prev => [...prev, created]);
    setNewMember({ name: "", type: "Site Supervisor", phone: "", experience: "" });
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Site Team</h2>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">Manage supervisors, engineers, and site contractors</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:block">
            <Input 
              placeholder="Search site team..." 
              icon={Search} 
              className="w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {canEdit && (
            <Button onClick={() => setIsAddModalOpen(true)} className="gap-2 shadow-lg shadow-orange-200 bg-orange-600 hover:bg-orange-700 border-orange-700">
              <Plus className="w-5 h-5" />
              Add Site Member
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredMembers.map((member) => (
          <Card key={member.id} className="p-8 space-y-6 group hover:border-orange-200 transition-all duration-500 hover:shadow-xl hover:shadow-orange-500/5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-2xl font-black text-orange-600 border border-orange-100 group-hover:bg-orange-600 group-hover:text-white transition-all duration-500 shadow-inner">
                  {member.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-orange-600 transition-colors">{member.name}</h3>
                  <div className="flex items-center gap-2">
                    <HardHat className="w-3 h-3 text-orange-500" />
                    <p className="text-xs font-black text-orange-500 uppercase tracking-widest">{member.type}</p>
                  </div>
                </div>
              </div>
              <button className="p-2 text-slate-300 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 pt-2 border-t border-slate-50">
              <div className="flex items-center gap-3 text-slate-500 group-hover:text-orange-600 transition-colors">
                <MapPin className="w-4 h-4 text-slate-400 group-hover:text-orange-400" />
                <span className="text-sm font-medium">{member.experience || "Senior"} Level</span>
              </div>
              <div className="flex items-center gap-3 text-slate-500 group-hover:text-orange-600 transition-colors">
                <Phone className="w-4 h-4 text-slate-400 group-hover:text-orange-400" />
                <span className="text-sm font-medium">{member.phone}</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group-hover:bg-orange-50/50 group-hover:border-orange-100 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Managing Sites</span>
                <span className="text-[10px] font-black text-orange-600 uppercase">{member.assignedProjects.length} Sites</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {member.assignedProjects.length > 0 ? member.assignedProjects.map(p => (
                  <span key={p} className="px-2 py-0.5 bg-white text-[10px] font-bold text-slate-600 rounded-lg border border-slate-200 group-hover:border-orange-200">
                    {p}
                  </span>
                )) : (
                  <span className="text-[10px] font-medium text-slate-400 italic">No sites assigned</span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <Construction className="w-4 h-4 text-orange-500" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Site Status</span>
              </div>
              <span className="px-3 py-1 bg-green-50 text-green-700 text-[10px] font-black rounded-lg border border-green-100 uppercase tracking-widest">
                On Duty
              </span>
            </div>

            <Button variant="secondary" className="w-full text-xs font-bold py-3 rounded-2xl group-hover:bg-orange-600 group-hover:text-white transition-all">
              View Work Logs
            </Button>
          </Card>
        ))}
      </div>

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Site Team Member">
        <form onSubmit={handleAdd} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Full Name</label>
              <Input placeholder="e.g., Mike Ross" value={newMember.name} onChange={e => setNewMember(f => ({ ...f, name: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Role</label>
              <select 
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={newMember.type}
                onChange={e => setNewMember(f => ({ ...f, type: e.target.value }))}
                required
              >
                <option>Site Supervisor</option>
                <option>Civil Engineer</option>
                <option>Site Contractor</option>
                <option>Quality Inspector</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Phone</label>
              <Input placeholder="+1 (555) 000-0000" value={newMember.phone} onChange={e => setNewMember(f => ({ ...f, phone: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Experience</label>
              <Input placeholder="e.g., 5 Years" value={newMember.experience} onChange={e => setNewMember(f => ({ ...f, experience: e.target.value }))} />
            </div>
          </div>
          <div className="flex justify-end gap-4 pt-4 border-t border-slate-100">
            <Button variant="secondary" type="button" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button type="submit" className="bg-orange-600 hover:bg-orange-700 border-orange-700">Add Member</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
