import { Card } from "@/components/ui/Card";

export default function SiteTeamPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Site Team</h1>
        <p className="text-sm text-slate-500">Manage supervisors, site engineers, contractors and labour teams.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h3 className="font-bold text-lg">Site Assignments</h3>
          <p className="text-sm text-slate-600 mt-2">Site-wise assignments, geo-location attendance, photo check-ins.</p>
        </Card>
        <Card className="p-6">
          <h3 className="font-bold text-lg">Wages & Reports</h3>
          <p className="text-sm text-slate-600 mt-2">Daily wages, material handlers, labour performance and site reports.</p>
        </Card>
      </div>
    </div>
  );
}
