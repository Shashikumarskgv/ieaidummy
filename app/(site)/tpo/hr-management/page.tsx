"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Building2, UserPlus, Key, Clock, ShieldCheck, CheckCircle2, AlertTriangle, 
  Loader2, RefreshCw, Lock, Mail, User, Briefcase
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { toast } from "sonner";
import JobsService from "@/services/jobs.service";

export default function TPOHRManagementPage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    company_name: "",
    hr_name: "",
    email: "",
    phone: "",
    password: "",
    job_id: ""
  });

  const [resetOpen, setResetOpen] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [selectedHr, setSelectedHr] = useState<any>(null);
  const [newPassword, setNewPassword] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const [accRes, jobsRes] = await Promise.all([
        JobsService.getHRAccounts(),
        JobsService.getTPOJobs()
      ]);
      setAccounts(accRes.data.data || []);
      setJobs(jobsRes.data.data || []);
    } catch {
      toast.error("Failed to load HR accounts directory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateHRAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.company_name || !formData.hr_name || !formData.email || !formData.password) {
      toast.error("Company Name, HR Name, Email, and Password are required.");
      return;
    }

    try {
      setCreating(true);
      await JobsService.createHRAccount({
        ...formData,
        job_id: formData.job_id ? Number(formData.job_id) : null
      });
      toast.success("HR Account created successfully with 3-day temporary access!");
      setCreateOpen(false);
      setFormData({ company_name: "", hr_name: "", email: "", phone: "", password: "", job_id: "" });
      await loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create HR account.");
    } finally {
      setCreating(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !selectedHr) return;

    try {
      setResetting(true);
      await JobsService.resetHRPassword(selectedHr.id, newPassword);
      toast.success(`Password reset successfully for ${selectedHr.hr_name}.`);
      setResetOpen(false);
      setNewPassword("");
      setSelectedHr(null);
    } catch {
      toast.error("Failed to reset password.");
    } finally {
      setResetting(false);
    }
  };

  const calculateDaysLeft = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - new Date().getTime();
    if (diff <= 0) return "Expired";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    const remHours = hours % 24;
    return `${days}d ${remHours}h remaining`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Building2 className="w-7 h-7 text-primary" />
            <span>Company HR Access Management</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Grant temporary 3-day secured access to company HRs for candidate screening, status updates, and skill assessments.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="bg-primary text-white rounded-xl text-xs font-semibold px-4 py-2 h-10 gap-1.5 shadow-sm">
          <UserPlus className="w-4 h-4" />
          <span>Create HR Access</span>
        </Button>
      </div>

      {/* Info Card */}
      <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-4 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-bold text-indigo-950 dark:text-indigo-200">3-Day Temporary Access & End-to-End Encrypted Auth Policy</p>
          <p className="text-indigo-800 dark:text-indigo-300 leading-relaxed">
            Company HR logins automatically expire after 72 hours (3 days) from creation. TPOs retain administrative control to reset passwords or extend accounts at any time.
          </p>
        </div>
      </div>

      {/* Accounts Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="text-xs">Loading HR access accounts...</span>
          </div>
        ) : accounts.length > 0 ? (
          <Table className="w-full text-sm">
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="font-semibold">Company & HR Info</TableHead>
                <TableHead className="font-semibold">Assigned Job</TableHead>
                <TableHead className="font-semibold">Access Validity (3 Days)</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border">
              {accounts.map((hr) => {
                const daysLeftText = calculateDaysLeft(hr.expires_at);
                const isExpired = daysLeftText === "Expired";

                return (
                  <TableRow key={hr.id} className="hover:bg-muted/10 transition-all">
                    <td className="p-4">
                      <div className="font-bold text-foreground">{hr.company_name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5 font-medium">{hr.hr_name}</div>
                      <div className="text-[11px] text-muted-foreground font-mono">{hr.email}</div>
                    </td>

                    <td className="p-4 text-xs font-semibold text-foreground">
                      {hr.job_role ? (
                        <div className="flex items-center gap-1.5 text-primary">
                          <Briefcase className="w-3.5 h-3.5" />
                          <span>{hr.job_role}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground italic">All Company Postings</span>
                      )}
                    </td>

                    <td className="p-4 text-xs">
                      <div className="flex items-center gap-1.5 font-semibold text-foreground">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        <span>{daysLeftText}</span>
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        Expires: {new Date(hr.expires_at).toLocaleString()}
                      </div>
                    </td>

                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                        !isExpired && hr.is_active
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-600 border-rose-500/20"
                      }`}>
                        {!isExpired && hr.is_active ? "Active" : "Expired"}
                      </span>
                    </td>

                    <td className="p-4 text-right pr-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedHr(hr);
                          setResetOpen(true);
                        }}
                        className="h-8 rounded-xl text-xs font-semibold gap-1 text-primary border-primary/20 hover:bg-primary/10"
                      >
                        <Key className="w-3.5 h-3.5" />
                        <span>Reset Password</span>
                      </Button>
                    </td>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <div className="p-16 text-center text-muted-foreground text-xs italic">
            No HR accounts created. Click "Create HR Access" to add a company HR.
          </div>
        )}
      </div>

      {/* Create HR Modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Create Temporary HR Account</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Provide credentials for company HR access. The login will remain active for 3 days.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateHRAccount} className="space-y-4 py-2">
            <div className="space-y-1">
              <label className="text-xs font-bold text-foreground">Company Name *</label>
              <Input
                placeholder="e.g. Google India / TCS"
                value={formData.company_name}
                onChange={(e) => setFormData(p => ({ ...p, company_name: e.target.value }))}
                className="h-9 rounded-xl text-xs"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-foreground">HR Full Name *</label>
              <Input
                placeholder="e.g. Rajesh Kumar"
                value={formData.hr_name}
                onChange={(e) => setFormData(p => ({ ...p, hr_name: e.target.value }))}
                className="h-9 rounded-xl text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Email *</label>
                <Input
                  type="email"
                  placeholder="hr@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                  className="h-9 rounded-xl text-xs"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Password *</label>
                <Input
                  type="password"
                  placeholder="Set Password"
                  value={formData.password}
                  onChange={(e) => setFormData(p => ({ ...p, password: e.target.value }))}
                  className="h-9 rounded-xl text-xs"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-foreground">Assigned Job Posting (Optional)</label>
              <select
                value={formData.job_id}
                onChange={(e) => setFormData(p => ({ ...p, job_id: e.target.value }))}
                className="w-full h-9 px-3 rounded-xl border border-input bg-background text-xs font-medium"
              >
                <option value="">All Company Jobs</option>
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.role} ({j.company})
                  </option>
                ))}
              </select>
            </div>

            <DialogFooter className="pt-3">
              <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)} className="rounded-xl text-xs font-semibold">
                Cancel
              </Button>
              <Button type="submit" disabled={creating} className="rounded-xl text-xs font-semibold bg-primary text-white">
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create HR Account"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reset Password Modal */}
      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent className="sm:max-w-sm rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Reset HR Password</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Set a new password for <span className="font-semibold text-foreground">{selectedHr?.hr_name}</span> ({selectedHr?.company_name}).
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleResetPassword} className="space-y-4 py-2">
            <div className="space-y-1">
              <label className="text-xs font-bold text-foreground">New Password *</label>
              <Input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="h-9 rounded-xl text-xs"
                required
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" onClick={() => setResetOpen(false)} className="rounded-xl text-xs font-semibold">
                Cancel
              </Button>
              <Button type="submit" disabled={resetting} className="rounded-xl text-xs font-semibold bg-primary text-white">
                {resetting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update Password"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
