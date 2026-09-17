"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Building2, Users, Briefcase, Plus, FileSpreadsheet, Clock, ShieldCheck, 
  CheckCircle, UserCheck, Loader2, Sparkles, LogOut, FileText, X, CheckCircle2, XCircle, Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { toast } from "sonner";
import JobsService from "@/services/jobs.service";

export default function HRDashboardPage() {
  const router = useRouter();
  const [hrUser, setHrUser] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [candidatesLoading, setCandidatesLoading] = useState(false);
  const [selectedCandidateModal, setSelectedCandidateModal] = useState<any | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("hr_user");
    if (!savedUser) {
      router.push("/hr/login");
      return;
    }
    const userObj = JSON.parse(savedUser);
    setHrUser(userObj);
    loadJobs(userObj);
  }, []);

  const loadJobs = async (user: any) => {
    try {
      setLoading(true);
      const res = await JobsService.getHRJobs();
      const jobList = res.data.data || [];
      setJobs(jobList);
      if (jobList.length > 0) {
        const initialJobId = user.job_id || jobList[0].id;
        setSelectedJobId(initialJobId);
        loadCandidates(initialJobId);
      }
    } catch {
      toast.error("Failed to load HR dashboard data or session expired.");
      router.push("/hr/login");
    } finally {
      setLoading(false);
    }
  };

  const loadCandidates = async (jobId: number) => {
    try {
      setCandidatesLoading(true);
      const res = await JobsService.getHRCandidates(jobId);
      setCandidates(res.data.data || []);
    } catch {
      toast.error("Failed to load candidate applications.");
    } finally {
      setCandidatesLoading(false);
    }
  };

  const handleJobSelect = (jobId: number) => {
    setSelectedJobId(jobId);
    loadCandidates(jobId);
  };

  const handleUpdateStatus = async (studentId: number, status: string, name: string) => {
    if (!selectedJobId) return;
    try {
      await JobsService.updateHRCandidateStatus(selectedJobId, studentId, status);
      toast.success(`Updated ${name}'s status to ${status.toUpperCase().replace('_', ' ')}.`);
      setCandidates(prev => prev.map(c => c.student_id === studentId ? { ...c, application_status: status } : c));
      if (selectedCandidateModal && selectedCandidateModal.student_id === studentId) {
        setSelectedCandidateModal((prev: any) => (prev ? { ...prev, application_status: status } : null));
      }
    } catch {
      toast.error("Failed to update candidate application status.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("hr_token");
    localStorage.removeItem("hr_user");
    document.cookie = "hr_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    toast.success("Logged out from HR Portal.");
    router.push("/hr/login");
  };

  const calculateRemainingHours = (expiresAt: string) => {
    if (!expiresAt) return "Active";
    const diff = new Date(expiresAt).getTime() - new Date().getTime();
    if (diff <= 0) return "Expired";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    return `${hours}h 3-Day Access Remaining`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Authenticating 3-Day Encrypted HR Session...</p>
      </div>
    );
  }

  const activeJob = jobs.find(j => j.id === selectedJobId) || jobs[0];

  return (
    <div className="min-h-screen bg-background p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top HR Header & Logout */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border border-border p-5 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-foreground">{hrUser?.company_name}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-600 border border-indigo-500/20 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{calculateRemainingHours(hrUser?.expires_at)}</span>
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Logged in as <span className="font-semibold text-foreground">{hrUser?.hr_name}</span> ({hrUser?.email})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={() => router.push("/hr/exams/create")} className="bg-primary text-white rounded-xl text-xs font-semibold px-4 py-2 gap-1.5 shadow-sm">
            <Plus className="w-4 h-4" />
            <span>Create HR Assessment</span>
          </Button>
          <Button onClick={handleLogout} variant="outline" className="rounded-xl text-xs font-semibold gap-1.5 text-destructive border-destructive/20 hover:bg-destructive/10">
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </Button>
        </div>
      </div>

      {/* Main Grid: Left Jobs List & Right Candidates Panel */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left Column: Job Postings Selector */}
        <div className="md:col-span-1 space-y-3">
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">Assigned Job Postings</h2>
          <div className="space-y-2">
            {jobs.map((j) => {
              const isSelected = j.id === selectedJobId;
              return (
                <div
                  key={j.id}
                  onClick={() => handleJobSelect(j.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected 
                      ? "bg-primary/10 border-primary text-primary shadow-sm" 
                      : "bg-card border-border hover:border-border/80 text-foreground"
                  }`}
                >
                  <div className="font-bold text-xs">{j.role}</div>
                  <div className="text-[11px] opacity-80 mt-1">{j.location || "Remote"} • {j.employment_type || "Full Time"}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Applicants & Candidate Ranking */}
        <div className="md:col-span-3 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <span>Applicants for {activeJob?.role || "Selected Job"}</span>
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Students evaluated and ranked by IEAI Performance & HR Exam Submissions. Review candidate test papers and update hiring status.
              </p>
            </div>
            <div className="text-xs font-semibold text-muted-foreground">
              Total Applicants: <span className="text-foreground font-bold">{candidates.length}</span>
            </div>
          </div>

          {/* Table */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            {candidatesLoading ? (
              <div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <span className="text-xs">Loading applicants, IEAI scores and HR exam results...</span>
              </div>
            ) : candidates.length > 0 ? (
              <Table className="w-full text-xs">
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead className="w-10 text-center font-semibold">#</TableHead>
                    <TableHead className="font-semibold">Candidate Info</TableHead>
                    <TableHead className="font-semibold">Dept & CGPA</TableHead>
                    <TableHead className="font-semibold text-center">IEAI Score</TableHead>
                    <TableHead className="font-semibold">HR Assessment Result</TableHead>
                    <TableHead className="font-semibold">Current Status</TableHead>
                    <TableHead className="font-semibold text-right pr-6">Hiring Decision</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-border">
                  {candidates.map((c, idx) => {
                    const st = c.student || {};
                    const ieai = c.ieai_analytics || {};
                    const hrResult = c.hr_exam_result;

                    const isCompleted = hrResult?.status === "completed";
                    const isPass = isCompleted && Number(hrResult.score) >= Number(hrResult.pass_percentage);

                    return (
                      <TableRow key={c.application_id || idx} className="hover:bg-muted/10 transition-all">
                        <td className="p-3 text-center font-bold text-muted-foreground">#{idx + 1}</td>
                        <td className="p-3">
                          <div className="font-bold text-foreground capitalize flex items-center gap-1">
                            <span>{st.full_name}</span>
                            {idx < 3 && <Sparkles className="w-3 h-3 text-amber-500 fill-amber-500" />}
                          </div>
                          <div className="text-[11px] text-muted-foreground font-mono">{st.roll_number}</div>
                          <div className="text-[10px] text-muted-foreground">{st.email}</div>
                        </td>

                        <td className="p-3 font-medium text-foreground">
                          <div>{st.department} ({st.section || 'A'})</div>
                          <div className="text-muted-foreground text-[10px] mt-0.5">CGPA: {st.cgpa || "N/A"}</div>
                        </td>

                        <td className="p-3 text-center">
                          <div className="font-extrabold text-primary text-sm">{ieai.overall_score || 0}%</div>
                          <div className="text-[10px] text-muted-foreground">Attempts: {ieai.total_attempts || 0}</div>
                        </td>

                        {/* HR Assessment Result Column */}
                        <td className="p-3">
                          {!hrResult ? (
                            <span className="text-[11px] text-muted-foreground italic">Not Taken Yet</span>
                          ) : (
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                                  isCompleted
                                    ? isPass 
                                      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                      : "bg-rose-500/10 text-rose-600 border-rose-500/20"
                                    : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                                }`}>
                                  {isCompleted ? (isPass ? "PASSED" : "FAILED") : "IN PROGRESS"}
                                </span>
                                {isCompleted && (
                                  <span className="font-bold text-foreground text-xs">
                                    Score: {hrResult.score}
                                  </span>
                                )}
                              </div>
                              {isCompleted && (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setSelectedCandidateModal(c)}
                                  className="h-6 text-[10px] rounded-lg gap-1 px-2 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-800 hover:bg-purple-50"
                                >
                                  <FileText className="w-3 h-3 text-purple-600" />
                                  <span>View Exam & Code</span>
                                </Button>
                              )}
                            </div>
                          )}
                        </td>

                        <td className="p-3">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                            c.application_status === "selected"
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                              : c.application_status === "exam_passed" || c.application_status === "shortlisted"
                              ? "bg-indigo-500/10 text-indigo-600 border-indigo-500/20"
                              : c.application_status === "exam_failed" || c.application_status === "rejected"
                              ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
                              : "bg-muted text-muted-foreground border-border"
                          }`}>
                            {(c.application_status || 'applied').toUpperCase().replace('_', ' ')}
                          </span>
                        </td>

                        <td className="p-3 text-right pr-4">
                          <select
                            value={c.application_status || "applied"}
                            onChange={(e) => handleUpdateStatus(c.student_id, e.target.value, st.full_name)}
                            className="h-8 px-2 rounded-xl border border-input bg-background text-xs font-semibold cursor-pointer"
                          >
                            <option value="applied">Applied</option>
                            <option value="shortlisted">Shortlisted</option>
                            <option value="exam_passed">Exam Passed</option>
                            <option value="exam_failed">Exam Failed</option>
                            <option value="selected">Selected for Job</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </td>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="p-12 text-center text-muted-foreground text-xs italic">
                No candidates have applied for this job posting yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Candidate Exam Submissions & Answers Modal */}
      {selectedCandidateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-card border border-border rounded-3xl max-w-3xl w-full p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold tracking-tight text-foreground">
                    {selectedCandidateModal.student?.full_name}'s Exam Submission
                  </h2>
                  <span className="text-xs font-mono px-2 py-0.5 bg-muted rounded-md text-muted-foreground">
                    {selectedCandidateModal.student?.roll_number}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {selectedCandidateModal.hr_exam_result?.exam_title || "HR Assessment Test"} · Submitted on {selectedCandidateModal.hr_exam_result?.submitted_at ? new Date(selectedCandidateModal.hr_exam_result.submitted_at).toLocaleString() : "N/A"}
                </p>
              </div>

              <button
                onClick={() => setSelectedCandidateModal(null)}
                className="p-1.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Score & Evaluation Banner */}
            <div className="grid grid-cols-3 gap-3 bg-muted/30 border border-border rounded-2xl p-4 text-center">
              <div>
                <span className="text-[10px] text-muted-foreground font-bold uppercase">Obtained Score</span>
                <div className="text-lg font-bold text-foreground mt-0.5">
                  {selectedCandidateModal.hr_exam_result?.score || 0} Points
                </div>
              </div>

              <div>
                <span className="text-[10px] text-muted-foreground font-bold uppercase">Passing Threshold</span>
                <div className="text-lg font-bold text-foreground mt-0.5">
                  {selectedCandidateModal.hr_exam_result?.pass_percentage || 40}%
                </div>
              </div>

              <div>
                <span className="text-[10px] text-muted-foreground font-bold uppercase">Assessment Status</span>
                <div className={`text-lg font-bold mt-0.5 ${
                  Number(selectedCandidateModal.hr_exam_result?.score) >= Number(selectedCandidateModal.hr_exam_result?.pass_percentage)
                    ? "text-emerald-600"
                    : "text-rose-600"
                }`}>
                  {Number(selectedCandidateModal.hr_exam_result?.score) >= Number(selectedCandidateModal.hr_exam_result?.pass_percentage)
                    ? "PASSED"
                    : "FAILED"}
                </div>
              </div>
            </div>

            {/* Question Breakdown */}
            <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Candidate Submissions & Answers</h3>

              {(selectedCandidateModal.hr_exam_result?.submissions || []).length === 0 ? (
                <p className="text-xs text-muted-foreground italic">No submission details recorded.</p>
              ) : (
                selectedCandidateModal.hr_exam_result.submissions.map((sub: any, sIdx: number) => (
                  <div key={sub.id || sIdx} className="bg-muted/20 border border-border rounded-2xl p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <span className="text-xs font-bold text-muted-foreground uppercase">
                        Q{sIdx + 1} ({sub.question_type.toUpperCase()}) · Marks: {sub.score_obtained} / {sub.max_marks}
                      </span>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        sub.score_obtained > 0 ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"
                      }`}>
                        {sub.score_obtained > 0 ? "CORRECT / CREDIT" : "INCORRECT / UNATTEMPTED"}
                      </span>
                    </div>

                    <p className="text-xs font-medium text-foreground whitespace-pre-wrap">{sub.question}</p>

                    {sub.question_type === "mcq" ? (
                      <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                        {sub.options?.map((opt: string, oIdx: number) => {
                          const isUserAnswer = sub.mcq_answer_index === oIdx;
                          const isCorrectOption = sub.correct_index === oIdx;
                          return (
                            <div
                              key={oIdx}
                              className={`p-2 rounded-xl border text-[11px] font-medium flex items-center justify-between ${
                                isCorrectOption
                                  ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-700 dark:text-emerald-300"
                                  : isUserAnswer
                                  ? "bg-rose-500/10 border-rose-500/40 text-rose-700 dark:text-rose-300"
                                  : "bg-card border-border text-muted-foreground"
                              }`}
                            >
                              <span>{opt}</span>
                              {isCorrectOption && <span className="text-[10px] font-bold text-emerald-600">(Correct)</span>}
                              {isUserAnswer && !isCorrectOption && <span className="text-[10px] font-bold text-rose-600">(Student Answer)</span>}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="space-y-1.5 text-xs pt-1">
                        <span className="text-[11px] font-bold text-foreground">Submitted Code:</span>
                        <pre className="p-3 bg-slate-900 text-slate-100 rounded-xl font-mono text-[11px] whitespace-pre-wrap max-h-48 overflow-y-auto">
                          {sub.coding_code || "// No code submitted"}
                        </pre>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Decision Action Bar inside Modal */}
            <div className="pt-3 border-t border-border flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-foreground">Update Hiring Decision:</span>
                <select
                  value={selectedCandidateModal.application_status || "applied"}
                  onChange={(e) => handleUpdateStatus(selectedCandidateModal.student_id, e.target.value, selectedCandidateModal.student?.full_name)}
                  className="h-8 px-2 rounded-xl border border-input bg-background text-xs font-semibold cursor-pointer"
                >
                  <option value="applied">Applied</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="exam_passed">Exam Passed</option>
                  <option value="exam_failed">Exam Failed</option>
                  <option value="selected">Selected for Job</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => setSelectedCandidateModal(null)}
                className="rounded-xl h-9 text-xs font-bold px-4"
              >
                Close Review
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

