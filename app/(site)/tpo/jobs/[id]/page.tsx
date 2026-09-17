"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, Briefcase, Download, Search, CheckCircle, XCircle, Award, 
  Sparkles, Users, UserCheck, ShieldCheck, FileSpreadsheet, Loader2, Info, Building2, MapPin, GraduationCap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { toast } from "sonner";
import JobsService from "@/services/jobs.service";

export default function TPOJobDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = Number(params?.id);

  const [job, setJob] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [shortlistingId, setShortlistingId] = useState<number | null>(null);

  const loadJobAndStudents = async () => {
    if (!jobId) return;
    try {
      setLoading(true);
      const [jobRes, studentsRes] = await Promise.all([
        JobsService.getJobById(jobId),
        JobsService.getEligibleStudents(jobId)
      ]);
      setJob(jobRes.data.data);
      setStudents(studentsRes.data.data || []);
    } catch (err: any) {
      toast.error("Failed to load job details and eligible students.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobAndStudents();
  }, [jobId]);

  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;
    const q = searchQuery.toLowerCase().trim();
    return students.filter(s => 
      (s.full_name || "").toLowerCase().includes(q) ||
      (s.roll_number || "").toLowerCase().includes(q) ||
      (s.department || "").toLowerCase().includes(q) ||
      (s.email || "").toLowerCase().includes(q)
    );
  }, [students, searchQuery]);

  const handleShortlist = async (studentId: number, name: string) => {
    try {
      setShortlistingId(studentId);
      await JobsService.shortlistCandidate(jobId, studentId);
      toast.success(`Candidate ${name} shortlisted successfully! Notification sent.`);
      setStudents(prev => prev.map(s => s.id === studentId ? { ...s, application_status: "shortlisted" } : s));
    } catch {
      toast.error("Failed to shortlist candidate.");
    } finally {
      setShortlistingId(null);
    }
  };

  const handleUpdateStatus = async (studentId: number, status: string, name: string) => {
    try {
      await JobsService.updateCandidateStatus(jobId, studentId, status);
      toast.success(`Updated ${name}'s status to ${status.toUpperCase()}.`);
      setStudents(prev => prev.map(s => s.id === studentId ? { ...s, application_status: status } : s));
    } catch {
      toast.error("Failed to update candidate status.");
    }
  };

  const handleExportExcel = () => {
    if (students.length === 0) {
      toast.error("No student data available to export.");
      return;
    }

    const headers = [
      "Rank", "Roll Number", "Full Name", "Department", "Section", "Graduation Year", 
      "CGPA", "Email", "Phone", "Total Attempts", "Pass Rate %", "Avg Score %", 
      "Integrity Score %", "IEAI Performance Score %", "Application Status"
    ];

    const rows = students.map((s, index) => [
      index + 1,
      `"${s.roll_number || ''}"`,
      `"${s.full_name || ''}"`,
      `"${s.department || ''}"`,
      `"${s.section || ''}"`,
      s.graduation_year || '',
      s.cgpa || '',
      `"${s.email || ''}"`,
      `"${s.phone || ''}"`,
      s.ieai_analytics?.total_attempts || 0,
      `${s.ieai_analytics?.pass_rate || 0}%`,
      `${s.ieai_analytics?.avg_score || 0}%`,
      `${s.ieai_analytics?.integrity_score || 0}%`,
      `${s.ieai_analytics?.overall_score || 0}%`,
      `"${(s.application_status || 'eligible').toUpperCase()}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${job?.company || 'Job'}_${job?.role || 'Eligible_Students'}_Ranked_List.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Eligible candidate ranking exported to CSV/Excel.");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading job preferences & calculating IEAI student scores...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Back Button & Top Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => router.push("/tpo/jobs")} className="rounded-xl gap-1 text-xs">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Jobs</span>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{job?.role}</h1>
            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
              <span className="font-semibold text-primary">{job?.company}</span> • 
              <span>{job?.location || "Remote"}</span> • 
              <span>{job?.employment_type || "Full Time"}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={handleExportExcel} variant="outline" className="rounded-xl text-xs font-semibold gap-1.5 border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10">
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Excel</span>
          </Button>
          <Button onClick={() => router.push("/tpo/hr-management")} className="bg-primary text-white rounded-xl text-xs font-semibold px-4 py-2 gap-1.5 shadow-sm">
            <UserCheck className="w-4 h-4" />
            <span>Manage HR Access</span>
          </Button>
        </div>
      </div>

      {/* Job Info Banner */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground font-medium flex items-center gap-1">
            <GraduationCap className="w-3.5 h-3.5 text-primary" />
            <span>Academic Requirements</span>
          </div>
          <p className="text-sm font-semibold text-foreground">
            {job?.program_level || "UG"} / {job?.degree || "B.Tech"}
          </p>
          <p className="text-xs text-emerald-600 font-medium">
            Min Academics: {job?.academics_percentage ? `${job.academics_percentage}%` : "No Min Barrier"}
          </p>
        </div>

        <div className="space-y-1">
          <div className="text-xs text-muted-foreground font-medium flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>IEAI Performance Req</span>
          </div>
          <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
            {job?.ieai_performance_percentage ? `${job.ieai_performance_percentage}% Min Overall` : "Calculated All"}
          </p>
          <p className="text-xs text-muted-foreground">Ranked from 100% to 10%</p>
        </div>

        <div className="space-y-1">
          <div className="text-xs text-muted-foreground font-medium flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-amber-500" />
            <span>Target Departments</span>
          </div>
          <p className="text-xs font-medium text-foreground truncate">
            {Array.isArray(job?.departments) && job.departments.length > 0 ? job.departments.join(", ") : "All Departments"}
          </p>
          <p className="text-xs text-muted-foreground">College-wide student evaluation</p>
        </div>

        <div className="space-y-1">
          <div className="text-xs text-muted-foreground font-medium flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-emerald-500" />
            <span>Eligible Candidates</span>
          </div>
          <p className="text-lg font-bold text-foreground">{students.length} Students</p>
          <p className="text-xs text-muted-foreground">Ranked across college</p>
        </div>
      </div>

      {/* Search & Filter Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card border border-border p-3.5 rounded-2xl shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Filter eligible students by name, roll number, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 rounded-xl border-border text-xs bg-background"
          />
        </div>
        <div className="text-xs text-muted-foreground font-medium shrink-0">
          Showing <span className="font-bold text-foreground">{filteredStudents.length}</span> of {students.length} students
        </div>
      </div>

      {/* Ranked Eligible Students Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        {filteredStudents.length > 0 ? (
          <Table className="w-full text-sm">
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="w-12 text-center font-semibold">Rank</TableHead>
                <TableHead className="font-semibold">Student Info</TableHead>
                <TableHead className="font-semibold">Dept & CGPA</TableHead>
                <TableHead className="font-semibold">
                  <div className="flex items-center gap-1">
                    <span>IEAI Performance 4-Factor Breakdown</span>
                    <span title="Calculated from Total Attempts, Pass Rate, Avg Score, and Integrity Score">
                      <Info className="w-3.5 h-3.5 text-muted-foreground" />
                    </span>
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-center">IEAI Overall %</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold text-right pr-6">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border">
              {filteredStudents.map((st, idx) => {
                const ieai = st.ieai_analytics || {};
                const isTopRank = idx < 3;

                return (
                  <TableRow key={st.id} className="hover:bg-muted/10 transition-all">
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                        idx === 0 ? "bg-amber-500/20 text-amber-600 border border-amber-500/30" :
                        idx === 1 ? "bg-slate-400/20 text-slate-600 border border-slate-400/30" :
                        idx === 2 ? "bg-amber-700/20 text-amber-800 border border-amber-700/30" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        #{idx + 1}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="font-bold text-foreground capitalize flex items-center gap-1.5">
                        <span>{st.full_name}</span>
                        {isTopRank && <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
                      </div>
                      <div className="text-xs text-muted-foreground font-mono mt-0.5">{st.roll_number}</div>
                      <div className="text-[11px] text-muted-foreground">{st.email}</div>
                    </td>

                    <td className="p-4 text-xs font-medium text-foreground">
                      <div>{st.department} ({st.section})</div>
                      <div className="text-muted-foreground mt-0.5">CGPA: <span className="font-bold text-foreground">{st.cgpa || "N/A"}</span></div>
                    </td>

                    <td className="p-4 text-xs">
                      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
                        <div>Attempts: <span className="font-semibold">{ieai.total_attempts}</span></div>
                        <div>Pass Rate: <span className="font-semibold text-emerald-600">{ieai.pass_rate}%</span></div>
                        <div>Avg Score: <span className="font-semibold text-indigo-600">{ieai.avg_score}%</span></div>
                        <div>Integrity: <span className="font-semibold text-amber-600">{ieai.integrity_score}%</span></div>
                      </div>
                    </td>

                    <td className="p-4 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className="text-base font-extrabold text-primary">{ieai.overall_score}%</span>
                        <div className="w-16 bg-muted h-1.5 rounded-full overflow-hidden mt-1">
                          <div 
                            className="bg-primary h-full rounded-full transition-all" 
                            style={{ width: `${Math.min(ieai.overall_score, 100)}%` }} 
                          />
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                        st.application_status === "selected"
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                          : st.application_status === "shortlisted"
                          ? "bg-indigo-500/10 text-indigo-600 border-indigo-500/20"
                          : st.application_status === "rejected"
                          ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
                          : "bg-muted text-muted-foreground border-border"
                      }`}>
                        {st.application_status?.toUpperCase()}
                      </span>
                    </td>

                    <td className="p-4 text-right pr-4">
                      <div className="flex items-center justify-end gap-1.5">
                        {st.application_status !== "shortlisted" && st.application_status !== "selected" ? (
                          <Button 
                            size="sm" 
                            disabled={shortlistingId === st.id}
                            onClick={() => handleShortlist(st.id, st.full_name)}
                            className="h-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs gap-1 shadow-sm"
                          >
                            {shortlistingId === st.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserCheck className="w-3.5 h-3.5" />}
                            <span>Shortlist</span>
                          </Button>
                        ) : (
                          <span className="text-xs text-emerald-600 font-bold flex items-center gap-1 mr-2">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Shortlisted
                          </span>
                        )}

                        <select
                          value={st.application_status || "eligible"}
                          onChange={(e) => handleUpdateStatus(st.id, e.target.value, st.full_name)}
                          className="h-8 px-2 rounded-xl border border-input bg-background text-xs font-semibold cursor-pointer"
                        >
                          <option value="eligible">Set Status...</option>
                          <option value="shortlisted">Shortlisted</option>
                          <option value="selected">Selected / Hired</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>
                    </td>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <div className="p-16 text-center text-muted-foreground text-xs italic">
            No eligible students found matching query.
          </div>
        )}
      </div>
    </div>
  );
}
