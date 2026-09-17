"use client";

import React, { useEffect, useState, useMemo } from "react";
import { 
  BookOpen, 
  Search, 
  Download, 
  CheckCircle2, 
  XCircle, 
  RefreshCw,
  Award,
  Building2,
  ShieldCheck,
  Check,
  RotateCcw,
  Sparkles,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import FinanceService from "@/services/finance.service";
import { mockSuperAdminStore } from "@/lib/mockSuperAdminData";
import { toast } from "sonner";

export default function TpoVerificationLedgerPage() {
  const [roster, setRoster] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [placementFilter, setPlacementFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const loadRoster = async () => {
    try {
      setLoading(true);
      const res = await FinanceService.getTpoVerificationLedger(undefined, search || undefined);
      setRoster(res.data?.data || mockSuperAdminStore.getTpoVerificationLedger(undefined, search));
    } catch {
      setRoster(mockSuperAdminStore.getTpoVerificationLedger(undefined, search));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoster();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadRoster();
  };

  const handleToggleVerification = (rollNumber: string, studentName: string) => {
    mockSuperAdminStore.toggleTpoStudentVerification(rollNumber);
    toast.success(`Updated verification status for ${studentName} (${rollNumber})`);
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

  // Metrics
  const metrics = useMemo(() => {
    const total = roster.length;
    const paid = roster.filter(r => r.payment_verified === "Verified").length;
    const licensed = roster.filter(r => r.license_active === "Active").length;
    const eligible = roster.filter(r => r.placement_eligible === "Eligible").length;
    return { total, paid, licensed, eligible };
  }, [roster]);

  // Filtered Roster
  const filteredRoster = useMemo(() => {
    return roster.filter(r => {
      if (paymentFilter !== "All" && r.payment_verified !== paymentFilter) return false;
      if (placementFilter !== "All" && r.placement_eligible !== placementFilter) return false;
      return true;
    });
  }, [roster, paymentFilter, placementFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRoster.length / pageSize));
  const paginatedRoster = useMemo(() => {
    return filteredRoster.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  }, [filteredRoster, currentPage, pageSize]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-20">
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

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-card border border-border p-4 rounded-2xl shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Total Cohort</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-extrabold font-mono text-foreground">{metrics.total}</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <span className="text-[11px] text-muted-foreground font-medium">Enrolled candidates</span>
        </div>

        <div className="bg-card border border-border p-4 rounded-2xl shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest block">Payment Verified</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-extrabold font-mono text-emerald-600">{metrics.paid}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-[11px] text-emerald-600 font-bold">{metrics.total > 0 ? Math.round((metrics.paid / metrics.total) * 100) : 0}% verified</span>
        </div>

        <div className="bg-card border border-border p-4 rounded-2xl shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest block">Active License</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-extrabold font-mono text-indigo-600">{metrics.licensed}</span>
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
          </div>
          <span className="text-[11px] text-muted-foreground font-medium">Valid LMS platform pass</span>
        </div>

        <div className="bg-card border border-border p-4 rounded-2xl shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest block">Placement Eligible</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-extrabold font-mono text-emerald-600">{metrics.eligible}</span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-[11px] text-emerald-600 font-bold">Cleared CGPA & Attendance</span>
        </div>
      </div>

      {/* Search & Filters Bar */}
      <div className="bg-card border border-border rounded-2xl p-4 shadow-sm flex flex-wrap items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2 flex-1 min-w-[240px]">
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

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground">Payment:</span>
          <select
            value={paymentFilter}
            onChange={(e) => { setPaymentFilter(e.target.value); setCurrentPage(1); }}
            className="bg-background border border-input rounded-xl px-3 py-2 text-xs font-medium focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Verified">Verified Only</option>
            <option value="Pending">Pending Only</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground">Placement:</span>
          <select
            value={placementFilter}
            onChange={(e) => { setPlacementFilter(e.target.value); setCurrentPage(1); }}
            className="bg-background border border-input rounded-xl px-3 py-2 text-xs font-medium focus:outline-none"
          >
            <option value="All">All Clearance</option>
            <option value="Eligible">Eligible Only</option>
            <option value="Needs Clearance">Needs Clearance</option>
          </select>
        </div>
      </div>

      {/* Verification Data Table */}
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : filteredRoster.length === 0 ? (
          <div className="text-center p-12 space-y-2">
            <BookOpen className="w-10 h-10 text-muted-foreground mx-auto" />
            <h3 className="font-bold text-foreground text-sm">No students found</h3>
            <p className="text-xs text-muted-foreground">Adjust your search to find students for placement verification.</p>
          </div>
        ) : (
          <div>
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
                    <th className="p-3.5 pr-4 text-right">Quick Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 font-sans">
                  {paginatedRoster.map((row, idx) => (
                    <tr key={idx} className="hover:bg-muted/20 transition-colors">
                      <td className="p-3.5 pl-4 font-mono font-bold text-primary">{row.roll_number}</td>
                      <td className="p-3.5 font-bold text-foreground">{row.student_name}</td>
                      <td className="p-3.5 text-muted-foreground">
                        <div className="font-semibold text-foreground">{row.college_name}</div>
                        <div className="text-[11px] text-muted-foreground">{row.department} ({row.section})</div>
                      </td>
                      <td className="p-3.5 text-center font-mono font-bold text-blue-600">{row.cgpa}</td>
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
                      <td className="p-3.5">
                        <span className={`text-[11px] font-semibold ${row.placement_eligible === "Eligible" ? "text-emerald-600" : "text-amber-600"}`}>
                          {row.placement_eligible}
                        </span>
                      </td>
                      <td className="p-3.5 text-muted-foreground font-mono">{row.verification_date}</td>
                      <td className="p-3.5 pr-4 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleToggleVerification(row.roll_number, row.student_name)}
                          className="h-7 px-2.5 text-[10px] font-bold rounded-lg hover:bg-primary/10 hover:text-primary transition-all"
                        >
                          <RotateCcw className="w-3 h-3 mr-1" /> Toggle
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {filteredRoster.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-border bg-card/60">
                <div className="text-xs text-muted-foreground font-medium">
                  Showing <span className="font-bold text-foreground">{(currentPage - 1) * pageSize + 1}</span> to{" "}
                  <span className="font-bold text-foreground">{Math.min(currentPage * pageSize, filteredRoster.length)}</span> of{" "}
                  <span className="font-bold text-foreground">{filteredRoster.length}</span> students
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className="h-8 px-3 rounded-xl text-xs font-semibold"
                  >
                    Previous
                  </Button>
                  <span className="text-xs font-semibold px-2 text-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    className="h-8 px-3 rounded-xl text-xs font-semibold"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
