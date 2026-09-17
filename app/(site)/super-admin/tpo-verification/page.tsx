"use client";

import React, { useEffect, useState } from "react";
import { 
  BookOpen, 
  Search, 
  Download, 
  CheckCircle2, 
  XCircle, 
  RefreshCw,
  Award,
  Building2,
  ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import FinanceService from "@/services/finance.service";
import { toast } from "sonner";

export default function TpoVerificationLedgerPage() {
  const [roster, setRoster] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadRoster = async () => {
    try {
      setLoading(true);
      const res = await FinanceService.getTpoVerificationLedger(undefined, search || undefined);
      setRoster(res.data.data || []);
    } catch (err: any) {
      toast.error(err?.message || "Failed to load TPO verification roster");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoster();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadRoster();
  };

  const handleExportCSV = () => {
    if (roster.length === 0) return toast.error("No records to export");
    const headers = ["Roll Number", "Student Name", "College", "Department", "Section", "CGPA", "Payment Verified", "License Status", "Placement Eligible", "Verification Date"];
    const rows = roster.map(r => [
      r.roll_number,
      `"${r.student_name}"`,
      `"${r.college_name}"`,
      r.department,
      r.section,
      r.cgpa,
      r.payment_verified,
      r.license_active,
      r.placement_eligible,
      r.verification_date
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `TPO_Placement_Verification_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("TPO Verification Roster exported successfully!");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-primary shrink-0" />
            TPO Placement Drive Verification Roster
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Pre-placement drive verification list certifying active student payment status and active LMS licenses.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="rounded-xl gap-2 text-xs font-semibold">
            <Download className="w-4 h-4" /> Export CSV
          </Button>
          <Button size="sm" onClick={loadRoster} className="rounded-xl gap-2 text-xs font-semibold">
            <RefreshCw className="w-4 h-4" /> Refresh Roster
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="flex gap-3 max-w-xl">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by Student Name, Roll No, Department, College..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 rounded-xl border-border text-xs h-10"
            />
          </div>
          <Button type="submit" className="rounded-xl h-10 text-xs font-semibold px-4">
            Search
          </Button>
        </form>
      </div>

      {/* Verification Data Table */}
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : roster.length === 0 ? (
          <div className="text-center p-12 space-y-2">
            <BookOpen className="w-10 h-10 text-muted-foreground mx-auto" />
            <h3 className="font-bold text-foreground text-sm">No students found</h3>
            <p className="text-xs text-muted-foreground">Adjust your search to find students for placement verification.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-muted/40 border-b border-border text-muted-foreground font-semibold">
                  <th className="p-3.5 pl-4">Roll Number</th>
                  <th className="p-3.5">Student Name</th>
                  <th className="p-3.5">College & Department</th>
                  <th className="p-3.5 text-center">CGPA</th>
                  <th className="p-3.5">Payment Verified</th>
                  <th className="p-3.5">License Status</th>
                  <th className="p-3.5">Placement Eligible</th>
                  <th className="p-3.5">Verification Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 font-sans">
                {roster.map((row, idx) => (
                  <tr key={idx} className="hover:bg-muted/20 transition-colors">
                    <td className="p-3.5 pl-4 font-mono font-bold text-foreground">{row.roll_number}</td>
                    <td className="p-3.5 font-bold text-foreground">{row.student_name}</td>
                    <td className="p-3.5 text-muted-foreground">
                      <div className="font-semibold text-foreground">{row.college_name}</div>
                      <div className="text-[11px] text-muted-foreground">{row.department} ({row.section})</div>
                    </td>
                    <td className="p-3.5 text-center font-bold text-blue-600">{row.cgpa}</td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                        row.payment_verified === 'Verified' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'
                      }`}>
                        {row.payment_verified === 'Verified' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        <span>{row.payment_verified}</span>
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase inline-flex items-center gap-1 ${
                        row.license_active === 'Active' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                      }`}>
                        <ShieldCheck className="w-3 h-3" /> {row.license_active}
                      </span>
                    </td>
                    <td className="p-3.5 font-semibold text-emerald-600">{row.placement_eligible}</td>
                    <td className="p-3.5 text-muted-foreground">{new Date(row.verification_date).toLocaleDateString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
