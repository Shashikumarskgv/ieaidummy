"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, Plus, Edit, Trash2, Users, FileText, Loader2, CheckCircle, XCircle, Award, Search, Sparkles, Percent, Code2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { toast } from "sonner";
import JobsService from "@/services/jobs.service";

export default function TPOJobs() {
  const router = useRouter();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Applications Drawer State
  const [appsOpen, setAppsOpen] = useState(false);
  const [selectedJobTitle, setSelectedJobTitle] = useState("");
  const [applicants, setApplicants] = useState<any[]>([]);
  const [appsLoading, setAppsLoading] = useState(false);

  const loadJobs = async () => {
    try {
      const res = await JobsService.getTPOJobs();
      setJobs(res.data.data || []);
    } catch {
      toast.error("Failed to load jobs directory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const handleDeleteJob = async (jobId: number) => {
    if (!confirm("Are you sure you want to delete this job posting?")) return;
    try {
      await JobsService.deleteJob(jobId);
      toast.success("Job posting removed.");
      await loadJobs();
    } catch {
      toast.error("Failed to delete job.");
    }
  };

  const handleToggleStatus = async (jobId: number, currentStatus: string) => {
    const nextStatus = currentStatus === "published" ? "closed" : "published";
    try {
      await JobsService.updateJobStatus(jobId, nextStatus);
      toast.success(`Job posting is now ${nextStatus}.`);
      await loadJobs();
    } catch {
      toast.error("Failed to update status.");
    }
  };

  const openApplicantsModal = async (jobId: number, jobTitle: string) => {
    setSelectedJobTitle(jobTitle);
    setApplicants([]);
    setAppsLoading(true);
    setAppsOpen(true);
    try {
      const res = await JobsService.getJobApplications(jobId);
      setApplicants(res.data.data || []);
    } catch {
      toast.error("Failed to load candidate applications.");
    } finally {
      setAppsLoading(false);
    }
  };

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDeptFilter, setSelectedDeptFilter] = useState("All");

  const allDeptsList = useMemo(() => {
    const set = new Set<string>();
    jobs.forEach(j => {
      if (Array.isArray(j.departments)) {
        j.departments.forEach((d: string) => d && set.add(d.trim()));
      } else if (j.department) {
        set.add(j.department.trim());
      }
    });
    return Array.from(set);
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    return jobs.filter((j) => {
      // Search Query (Role, Company, Location)
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const matchesRole = (j.role || "").toLowerCase().includes(q);
        const matchesCompany = (j.company || "").toLowerCase().includes(q);
        const matchesLocation = (j.location || "").toLowerCase().includes(q);
        if (!matchesRole && !matchesCompany && !matchesLocation) return false;
      }

      // Department Filter
      if (selectedDeptFilter !== "All") {
        const depts = Array.isArray(j.departments) ? j.departments : [j.department];
        if (!depts.some((d: string) => d && d.trim() === selectedDeptFilter)) return false;
      }

      return true;
    });
  }, [jobs, searchQuery, selectedDeptFilter]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between border-b border-border pb-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Briefcase className="w-8 h-8 text-primary shrink-0" />
            <span>Manage Job Postings</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Publish new placement listings and review student applications.</p>
        </div>
        <Button onClick={() => router.push("/tpo/jobs/create")} className="bg-primary text-white rounded-xl text-xs font-semibold px-4 py-2 h-10 shadow-sm flex items-center gap-1">
          <Plus className="w-4 h-4" />
          <span>Post a Job</span>
        </Button>
      </div>

      {/* Filter & Search Bar Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-card border border-border p-3.5 rounded-2xl shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search job postings by role, company, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 rounded-xl border-border text-xs bg-background"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <label className="text-xs font-bold text-muted-foreground shrink-0 uppercase tracking-wider">Department:</label>
          <select
            value={selectedDeptFilter}
            onChange={(e) => setSelectedDeptFilter(e.target.value)}
            className="h-10 px-3 rounded-xl border border-input bg-background text-xs font-medium focus-visible:ring-primary/20 cursor-pointer min-w-[200px]"
          >
            <option value="All">All Departments</option>
            {allDeptsList.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="text-xs">Loading jobs directory...</span>
          </div>
        ) : filteredJobs.length > 0 ? (
          <Table className="w-full text-sm">
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="font-semibold">Role & Company</TableHead>
                <TableHead className="font-semibold">Eligibility Criteria</TableHead>
                <TableHead className="font-semibold">IEAI & Skills Criteria</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border">
              {filteredJobs.map((j) => (
                <TableRow key={j.id} className="hover:bg-muted/10 transition-all">
                  <td className="p-4">
                    <div className="font-semibold text-foreground">{j.role}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{j.company} • {j.category || "General"}</div>
                    <div className="text-[11px] text-muted-foreground mt-1 font-medium">{j.employment_type} • {j.location || "Remote"}</div>
                  </td>
                  <td className="p-4 text-xs text-foreground font-semibold">
                    <div>{j.program_level || "UG"} &rarr; {j.degree || "B.Tech"}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5 truncate max-w-[180px]">{j.departments?.join(", ") || "All Departments"}</div>
                    {j.academics_percentage !== null && j.academics_percentage !== undefined && (
                      <div className="text-[11px] text-emerald-600 font-bold mt-1">Min Academics: {j.academics_percentage}%</div>
                    )}
                  </td>
                  <td className="p-4 text-xs">
                    {j.ieai_performance_percentage !== null && j.ieai_performance_percentage !== undefined && (
                      <div className="font-bold text-indigo-600 dark:text-indigo-400">
                        IEAI Score Req: {j.ieai_performance_percentage}%
                      </div>
                    )}
                    {Array.isArray(j.skills) && j.skills.length > 0 && (
                      <div className="text-[11px] text-muted-foreground mt-0.5 max-w-[200px] truncate">
                        Skills: <span className="font-medium text-foreground">{j.skills.join(", ")}</span>
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                      j.status === "published" 
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" 
                        : "bg-muted text-muted-foreground border-border"
                    }`}>
                      {j.status}
                    </span>
                  </td>
                  <td className="p-4 text-right pr-4">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button size="sm" onClick={() => router.push(`/tpo/jobs/${j.id}`)} className="h-8 rounded-lg bg-primary text-white hover:bg-primary/90 font-semibold text-xs gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Details</span>
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => openApplicantsModal(j.id, `${j.role} (${j.company})`)} className="h-8 rounded-lg text-primary hover:text-primary hover:bg-muted font-semibold text-xs gap-1">
                        <Users className="w-4 h-4 text-primary" />
                        <span>Applicants</span>
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => router.push(`/tpo/jobs/create?id=${j.id}`)} className="h-8 rounded-lg text-muted-foreground hover:bg-muted text-xs">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleToggleStatus(j.id, j.status)} className="h-8 rounded-lg text-amber-600 hover:bg-muted text-xs font-semibold">
                        {j.status === "published" ? "Close" : "Publish"}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDeleteJob(j.id)} className="h-8 rounded-lg text-destructive hover:text-destructive hover:bg-muted text-xs">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="p-16 text-center text-muted-foreground text-xs italic">
            No job postings created. Click "Post a Job" to get started.
          </div>
        )}
      </div>

      {/* Applicants Drawer Dialog */}
      <Dialog open={appsOpen} onOpenChange={open => !open && setAppsOpen(false)}>
        <DialogContent className="sm:max-w-2xl rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Applications for: {selectedJobTitle}</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">List of students who submitted applications for this posting.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {appsLoading ? (
              <div className="text-center py-10 flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <span className="text-xs text-muted-foreground">Loading applications...</span>
              </div>
            ) : applicants.length > 0 ? (
              <div className="max-h-[50vh] overflow-y-auto border border-border rounded-xl">
                <Table className="w-full text-xs">
                  <TableHeader className="bg-muted/40">
                    <TableRow>
                      <TableHead className="font-semibold">Student Name</TableHead>
                      <TableHead className="font-semibold">Roll Number</TableHead>
                      <TableHead className="font-semibold">Department & CGPA</TableHead>
                      <TableHead className="font-semibold text-center">Status</TableHead>
                      <TableHead className="font-semibold text-right pr-6">Resume</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-border">
                    {applicants.map((a) => (
                      <TableRow key={a.id}>
                        <td className="p-3 font-semibold text-foreground capitalize">{a.student?.full_name}</td>
                        <td className="p-3 font-mono">{a.student?.roll_number}</td>
                        <td className="p-3">{a.student?.department} • CGPA: {a.student?.cgpa || "—"}</td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                            a.status === "offered" ? "bg-purple-500/10 text-purple-600 border-purple-500/20" :
                            a.status === "shortlisted" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                            a.status === "interview_scheduled" ? "bg-blue-500/10 text-blue-600 border-blue-500/20" :
                            a.status === "rejected" ? "bg-rose-500/10 text-rose-600 border-rose-500/20" :
                            "bg-muted text-muted-foreground border-border"
                          }`}>
                            {a.status?.replace("_", " ")}
                          </span>
                        </td>
                        <td className="p-3 text-right pr-4">
                          {a.student?.resume_url ? (
                            <a href={a.student.resume_url} target="_blank" rel="noreferrer" className="text-primary hover:underline font-bold">
                              Open Link
                            </a>
                          ) : (
                            <span className="text-muted-foreground italic">None</span>
                          )}
                        </td>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-10 text-muted-foreground text-xs italic">
                No students have applied to this posting yet.
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setAppsOpen(false)} className="rounded-xl text-xs font-semibold bg-primary text-white">Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
