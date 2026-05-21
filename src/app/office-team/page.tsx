import { Card } from "@/components/ui/Card";

export default function OfficeTeamPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Office Team</h1>
        <p className="text-sm text-slate-500">Manage office employees: architects, designers, managers, accounts, HR.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h3 className="font-bold text-lg">Employees</h3>
          <p className="text-sm text-slate-600 mt-2">Employee profiles, roles, contact and assigned projects.</p>
        </Card>
        <Card className="p-6">
          <h3 className="font-bold text-lg">Attendance & Payroll</h3>
          <p className="text-sm text-slate-600 mt-2">Monthly reports, working hours, payroll integration and leaves.</p>
        </Card>
      </div>
    </div>
  );
}
