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

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-medium text-slate-900 tracking-tight">Site Team</h2>
          <p className="text-sm font-medium text-slate-500 hidden sm:block">Manage supervisors, engineers, and site contractors</p>
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
            <Button onClick={() => setIsAddModalOpen(true)} className="gap-2 shadow-lg shadow-indigo-200 bg-indigo-600 hover:bg-indigo-700 border-indigo-700 font-medium">
              <Plus className="w-5 h-5" />
              Add Member
            </Button>
          )}
        </div>
      </div>

      <Card className="overflow-hidden p-0 border-slate-200">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50">
              <TableHead className="text-[11px] font-medium text-slate-500 tracking-widest uppercase py-4 px-6">Member</TableHead>
              <TableHead className="text-[11px] font-medium text-slate-500 tracking-widest uppercase py-4 px-6">Role</TableHead>
              <TableHead className="text-[11px] font-medium text-slate-500 tracking-widest uppercase py-4 px-6">Contact</TableHead>
              <TableHead className="text-[11px] font-medium text-slate-500 tracking-widest uppercase py-4 px-6">Experience</TableHead>
              <TableHead className="text-[11px] font-medium text-slate-500 tracking-widest uppercase py-4 px-6">Assigned Sites</TableHead>
              <TableHead className="text-[11px] font-medium text-slate-500 tracking-widest uppercase py-4 px-6 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMembers.map((member) => (
              <TableRow key={member.id} className="group hover:bg-slate-50/50 transition-colors">
                <TableCell className="py-4 px-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-sm font-medium text-indigo-600 border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-all font-mono">
                      {member.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{member.name}</p>
                      <p className="text-[10px] font-normal text-slate-500 font-mono">{member.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4 px-6">
                  <Badge variant="outline" className="text-[10px] font-medium text-indigo-600 bg-indigo-50 border-indigo-100 uppercase">
                    {member.type}
                  </Badge>
                </TableCell>
                <TableCell className="py-4 px-6">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xs font-normal font-mono">{member.phone}</span>
                  </div>
                </TableCell>
                <TableCell className="py-4 px-6">
                  <span className="text-xs font-medium text-slate-700">{member.experience || "—"}</span>
                </TableCell>
                <TableCell className="py-4 px-6">
                  <div className="flex flex-wrap gap-1">
                    {member.assignedProjects.length > 0 ? member.assignedProjects.map(p => (
                      <span key={p} className="px-1.5 py-0.5 bg-slate-100 text-[9px] font-medium text-slate-600 rounded-md border border-slate-200">
                        {p}
                      </span>
                    )) : (
                      <span className="text-[10px] font-medium text-slate-400 italic">None</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="py-4 px-6 text-right">
                  <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Site Team Member">
        <form onSubmit={handleAdd} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 ml-1">Full Name</label>
              <Input placeholder="e.g., Mike Ross" value={newMember.name} onChange={e => setNewMember(f => ({ ...f, name: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 ml-1">Role</label>
              <select 
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
              <label className="text-sm font-medium text-slate-700 ml-1">Phone</label>
              <Input placeholder="+1 (555) 000-0000" value={newMember.phone} onChange={e => setNewMember(f => ({ ...f, phone: e.target.value }))} className="font-mono" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 ml-1">Experience</label>
              <Input placeholder="e.g., 5 Years" value={newMember.experience} onChange={e => setNewMember(f => ({ ...f, experience: e.target.value }))} />
            </div>
          </div>
          <div className="flex justify-end gap-4 pt-4 border-t border-slate-100">
            <Button variant="secondary" type="button" onClick={() => setIsAddModalOpen(false)} className="font-medium">Cancel</Button>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 border-indigo-700 font-medium">Add Member</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
