"use client";

import { useState } from "react";
import { projects, siteUpdates as initialUpdates } from "@/lib/dummy-data";
import { ClipboardList, Calendar, Plus, Construction, TrendingUp, Camera, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/lib/auth-context";

type Update = {
  id: string;
  project: string;
  update: string;
  date: string;
  progress: number;
  photos: number;
  stage?: string;
  addedBy?: string;
};

const stageOptions = ["Layout", "Excavation", "Foundation", "Structure", "Brick Work", "Plumbing", "Electrical", "Plaster", "Flooring", "Painting", "Interior", "Final Handover"];

export default function SiteUpdatesPage() {
  const { user } = useAuth();
  const [updates, setUpdates] = useState<Update[]>(initialUpdates.map(u => ({ ...u, id: String(u.id) })));
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ project: projects[0].name, update: "", stage: stageOptions[0], progress: "" });

  const canAdd = user?.role === "supervisor" || user?.role === "architect";

  const visibleUpdates = user?.role === "client"
    ? updates.filter(u => u.project === projects.find(p => p.id === user.projectId)?.name)
    : updates;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.update.trim()) return;
    const newUpdate: Update = {
      id: String(Date.now()),
      project: form.project,
      update: form.update,
      date: new Date().toISOString().split("T")[0],
      progress: Number(form.progress) || 0,
      photos: 0,
      stage: form.stage,
      addedBy: user?.name,
    };
    setUpdates(prev => [newUpdate, ...prev]);
    setForm({ project: projects[0].name, update: "", stage: stageOptions[0], progress: "" });
    setShowForm(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Site Updates</h2>
          <p className="text-sm font-medium text-slate-500">Chronological log of construction progress</p>
        </div>
        {canAdd && (
          <Button onClick={() => setShowForm(true)} className="gap-2 self-start">
            <Plus className="w-5 h-5" />
            Add Site Update
          </Button>
        )}
      </div>

      {/* Add Update Form */}
      {showForm && (
        <Card className="p-8 border-2 border-indigo-100 bg-indigo-50/30">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900">New Site Update</h3>
            <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}>
              <X className="w-5 h-5 text-slate-400" />
            </Button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Project</label>
                <select
                  value={form.project}
                  onChange={e => setForm(f => ({ ...f, project: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {projects.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Current Stage</label>
                <select
                  value={form.stage}
                  onChange={e => setForm(f => ({ ...f, stage: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {stageOptions.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Update Description</label>
              <textarea
                value={form.update}
                onChange={e => setForm(f => ({ ...f, update: e.target.value }))}
                placeholder="Describe today's site progress..."
                rows={3}
                required
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Overall Progress (%)</label>
              <Input
                type="number"
                min="0"
                max="100"
                value={form.progress}
                onChange={e => setForm(f => ({ ...f, progress: e.target.value }))}
                placeholder="e.g., 55"
                className="w-40"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
              <Button variant="secondary" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit">Post Update</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Updates Timeline */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 space-y-10">
        {visibleUpdates.length === 0 && (
          <p className="text-center text-slate-400 font-medium py-10">No updates yet.</p>
        )}
        {visibleUpdates.map((update, idx) => (
          <div key={update.id} className="flex gap-8 group">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-100 group-hover:bg-indigo-600 transition-all duration-500 shadow-sm">
                <Construction className="w-6 h-6 text-indigo-600 group-hover:text-white transition-all duration-500" />
              </div>
              {idx !== visibleUpdates.length - 1 && <div className="w-px flex-1 bg-slate-100 my-4" />}
            </div>
            <div className="pb-10 border-b border-slate-50 last:border-0 last:pb-0 flex-1 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight">{update.project}</h3>
                  {update.stage && (
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                      {update.stage}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-slate-400">
                  <Calendar className="w-4 h-4" />
                  {update.date}
                </div>
              </div>
              <p className="text-slate-600 leading-relaxed text-sm font-medium">{update.update}</p>
              <div className="flex items-center gap-6 pt-1">
                <span className="flex items-center gap-2 text-[10px] font-black text-indigo-500 uppercase tracking-widest">
                  <TrendingUp className="w-4 h-4" />
                  {update.progress}% Complete
                </span>
                <span className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <Camera className="w-4 h-4" />
                  {update.photos} Photos
                </span>
                {update.addedBy && (
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    By {update.addedBy}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
