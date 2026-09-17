"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { 
  FileText, BarChart2, ShieldCheck, RefreshCcw, Award, 
  CheckCircle, XCircle, AlertTriangle, Search, Filter, 
  Layers, Zap, Calendar, UserCheck, Eye, HelpCircle, Bot, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import HODService from "@/services/hod.service";

interface ExamAttempt {
  id: number;
  exam_id: number;
  student_id: number;
  started_at: string;
  submitted_at: string | null;
  status: string;
  total_score: number;
  mcq_score: number;
  coding_score: number;
  tab_switches: number;
  integrity_score: number;
  created_at: string;
  exam_title: string;
  exam_description: string;
  exam_duration_min: number;
  exam_total_marks: number;
  exam_passing_pct: number;
  exam_type: string;
  first_name: string;
  last_name: string;
  roll_number: string;
  department: string;
  graduation_year: number;
  contact_number: string;
  personal_email: string;
  batch_code: string;
}

export default function Reports() {
  const [activeTab, setActiveTab] = useState<"exams" | "interviews">("exams");
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deptFilter, setDeptFilter] = useState("all");
  const [examFilter, setExamFilter] = useState("all");
  const [selectedAttempt, setSelectedAttempt] = useState<ExamAttempt | null>(null);
  const [reassigningId, setReassigningId] = useState<number | null>(null);

  const fetchReportsData = async () => {
    try {
      setLoading(true);
      const response = await HODService.getReports();
      setAttempts(response.data?.data || response.data || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load exam attempts data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportsData();
  }, []);

  const handleReassign = async (attemptId: number) => {
    if (!confirm("Are you sure you want to reassign this exam? This will allow the student to retake the test from scratch.")) {
      return;
    }
    try {
      setReassigningId(attemptId);
      await HODService.reassignAttempt(String(attemptId), "Reassigned by HOD");
      toast.success("Exam reassigned successfully. The student can now restart their attempt.");
      fetchReportsData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to reassign exam attempt.");
    } finally {
      setReassigningId(null);
    }
  };

  // Compute stats
  const totalSubmissions = attempts.length;
  const completedAttempts = attempts.filter(a => a.status === "completed");
  const averageScorePct = completedAttempts.length > 0 
    ? Math.round(completedAttempts.reduce((sum, a) => sum + ((a.total_score / (a.exam_total_marks || 100)) * 100), 0) / completedAttempts.length)
    : 0;
  const averageIntegrity = completedAttempts.length > 0
    ? Math.round(completedAttempts.reduce((sum, a) => sum + (a.integrity_score ?? 100), 0) / completedAttempts.length)
    : 100;
  const passRate = completedAttempts.length > 0
    ? Math.round((completedAttempts.filter(a => {
        const pct = (a.total_score / (a.exam_total_marks || 100)) * 100;
        return pct >= (a.exam_passing_pct || 40);
      }).length / completedAttempts.length) * 100)
    : 0;

  // Filter list of attempts
  const filteredAttempts = attempts.filter(a => {
    const fullName = `${a.first_name || ""} ${a.last_name || ""}`.toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch = fullName.includes(query) || 
                          (a.roll_number || "").toLowerCase().includes(query) ||
                          (a.exam_title || "").toLowerCase().includes(query);
    
    const matchesStatus = statusFilter === "all" || a.status === statusFilter;
    const matchesDept = deptFilter === "all" || (a.department || "").toLowerCase() === deptFilter.toLowerCase();
    const matchesExam = examFilter === "all" || (a.exam_title || "").toLowerCase() === examFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesDept && matchesExam;
  });

  // Extract unique departments & exam titles
  const uniqueDepts = Array.from(new Set(attempts.map(a => a.department).filter(Boolean)));
  const uniqueExamTitles = Array.from(new Set(attempts.map(a => a.exam_title).filter(Boolean)));

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto min-h-screen">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div className="space-y-1">
          <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
            <BarChart2 className="w-6 h-6 text-primary" /> Reports & Analytics Dashboard
          </h1>
          <p className="text-xs text-muted-foreground">
            Monitor candidate performances, proctoring compliance records, and manage test evaluation scores.
          </p>
        </div>
        <div className="flex gap-2 bg-muted/60 p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab("exams")} 
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === "exams" ? "bg-background text-foreground shadow" : "text-muted-foreground hover:text-foreground"}`}
          >
            <FileText className="w-3.5 h-3.5" /> Exam Reports
          </button>
          <button 
            onClick={() => setActiveTab("interviews")} 
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === "interviews" ? "bg-background text-foreground shadow" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Bot className="w-3.5 h-3.5 text-primary" /> Interview Prep Reports
          </button>
        </div>
      </div>

      {activeTab === "exams" ? (
        <>
          {/* Performance stats grids */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Stat Card 1 */}
            <div className="bg-card border border-border p-5 rounded-2xl shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Total Submissions</p>
                <h3 className="text-2xl font-black font-mono">{totalSubmissions}</h3>
              </div>
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <UserCheck className="w-5 h-5" />
              </div>
            </div>

            {/* Stat Card 2 */}
            <div className="bg-card border border-border p-5 rounded-2xl shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Avg Test Performance</p>
                <h3 className="text-2xl font-black font-mono">{averageScorePct}%</h3>
              </div>
              <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-600">
                <Award className="w-5 h-5" />
              </div>
            </div>

            {/* Stat Card 3 */}
            <div className="bg-card border border-border p-5 rounded-2xl shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Avg Proctoring Integrity</p>
                <h3 className="text-2xl font-black font-mono">{averageIntegrity}%</h3>
              </div>
              <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-600">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>

            {/* Stat Card 4 */}
            <div className="bg-card border border-border p-5 rounded-2xl shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Pass Rate Ratio</p>
                <h3 className="text-2xl font-black font-mono">{passRate}%</h3>
              </div>
              <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-600">
                <CheckCircle className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Filters and Search box */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border border-border/80 p-4 rounded-2xl shadow-sm">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search candidate name, roll number, or exam title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-xs rounded-xl h-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <select
                value={examFilter}
                onChange={(e) => setExamFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-input bg-background font-bold text-xs cursor-pointer focus:ring-1 focus:ring-primary"
              >
                <option value="all">All Exam Titles / Categories</option>
                {uniqueExamTitles.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-input bg-background font-bold text-xs cursor-pointer focus:ring-1 focus:ring-primary"
              >
                <option value="all">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="in_progress">In Progress</option>
                <option value="reassigned">Reassigned</option>
              </select>

              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-input bg-background font-bold text-xs cursor-pointer focus:ring-1 focus:ring-primary"
              >
                <option value="all">All Departments</option>
                {uniqueDepts.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>

              <Button onClick={fetchReportsData} variant="outline" size="icon" className="rounded-xl h-10 w-10">
                <RefreshCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Results attempts Table */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/40 border-b border-border text-[10px] font-extrabold uppercase text-muted-foreground tracking-wider">
                    <th className="px-6 py-4">Student Details</th>
                    <th className="px-6 py-4">Exam Title</th>
                    <th className="px-6 py-4 text-center">Score Obtained</th>
                    <th className="px-6 py-4 text-center">Integrity Compliance</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12">
                        <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
                        <span className="text-xs text-muted-foreground font-semibold">Loading report databases...</span>
                      </td>
                    </tr>
                  ) : filteredAttempts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-muted-foreground italic text-xs">
                        No exam attempts found matching the current filter configurations.
                      </td>
                    </tr>
                  ) : (
                    filteredAttempts.map((item) => {
                      const scorePct = Math.round((item.total_score / (item.exam_total_marks || 100)) * 100);
                      const passed = scorePct >= (item.exam_passing_pct || 40);
                      const isComplete = item.status === "completed";

                      return (
                        <tr key={item.id} className="hover:bg-muted/10 transition-colors text-xs font-medium">
                          <td className="px-6 py-4 space-y-1">
                            <div className="font-bold text-foreground">{item.first_name} {item.last_name}</div>
                            <div className="text-[10px] text-muted-foreground font-mono">{item.roll_number} • {item.department}</div>
                          </td>
                          <td className="px-6 py-4 max-w-xs truncate" title={item.exam_title}>
                            <div className="font-semibold">{item.exam_title}</div>
                            <div className="text-[10px] text-muted-foreground">{item.exam_duration_min} mins • Max marks: {item.exam_total_marks}</div>
                          </td>
                          <td className="px-6 py-4 text-center font-mono font-bold">
                            {isComplete ? (
                              <span className={passed ? "text-emerald-600" : "text-destructive"}>
                                {item.total_score} / {item.exam_total_marks} ({scorePct}%)
                              </span>
                            ) : (
                              <span className="text-muted-foreground/60">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center font-mono">
                            {isComplete ? (
                              <span className={`font-bold ${item.integrity_score >= 80 ? "text-indigo-600" : item.integrity_score >= 50 ? "text-amber-600" : "text-destructive"}`}>
                                {item.integrity_score}%
                              </span>
                            ) : (
                              <span className="text-muted-foreground/60">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              item.status === "completed" ? "bg-emerald-100 text-emerald-800" :
                              item.status === "in_progress" ? "bg-blue-100 text-blue-800 animate-pulse" :
                              item.status === "reassigned" ? "bg-amber-100 text-amber-800" :
                              "bg-muted text-muted-foreground"
                            }`}>
                              {item.status.replace("_", " ")}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <Button 
                                onClick={() => setSelectedAttempt(item)} 
                                variant="outline" 
                                size="sm" 
                                className="h-8 rounded-xl px-2.5 text-[10px] font-bold flex items-center gap-1"
                              >
                                <Eye className="w-3.5 h-3.5" /> Details
                              </Button>
                              <Button 
                                onClick={() => handleReassign(item.id)} 
                                disabled={reassigningId === item.id || item.status === "in_progress"}
                                variant="outline" 
                                size="sm" 
                                className="h-8 rounded-xl px-2.5 text-[10px] font-bold text-amber-600 hover:text-amber-700 hover:bg-amber-50/50 flex items-center gap-1 border-amber-200"
                              >
                                <RefreshCcw className="w-3 h-3" /> Reassign
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Interviews reports tab ready stub */
        <div className="bg-card border border-border p-12 rounded-3xl text-center space-y-6 shadow-sm max-w-2xl mx-auto animate-in fade-in duration-300">
          <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto text-primary relative">
            <Bot className="w-10 h-10" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
            </span>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-black text-foreground">AI Mock Interview Prep Analytics</h2>
            <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
              Unlock speech confidence indexes, technical role-suitability indices, soft-skills behavior profiling, and automated resumes grading matching records.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto text-left">
            <div className="border border-border/80 p-4 rounded-2xl bg-muted/20 space-y-1">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Speech & Confidence Index</h4>
              <p className="text-[10px] text-muted-foreground">Analyzes grammatical fluidity, vocal jitter, vocabulary variations, and pauses during video simulation.</p>
            </div>
            <div className="border border-border/80 p-4 rounded-2xl bg-muted/20 space-y-1">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Confidence Scoring Metrics</h4>
              <p className="text-[10px] text-muted-foreground">AI-evaluated answer accuracy ratios matching coding requirements and industry-specific paradigms.</p>
            </div>
          </div>

          <div className="pt-4">
            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1.5 rounded-full">
              Feature Pipeline Setup • Mock Interface Ready <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      )}

      {/* Attempt detailed inspector modal */}
      {selectedAttempt && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-card border border-border w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden flex flex-col my-8">
            {/* Modal Header */}
            <div className="p-6 border-b border-border bg-muted/20 flex items-start justify-between">
              <div className="space-y-1">
                <h3 className="text-base font-black text-foreground">Attempt Performance Inspector</h3>
                <p className="text-[10px] text-muted-foreground font-mono">ID: AT-0{selectedAttempt.id} • Registered for Exam ID {selectedAttempt.exam_id}</p>
              </div>
              <button 
                onClick={() => setSelectedAttempt(null)}
                className="text-muted-foreground hover:text-foreground text-sm font-bold bg-muted w-7 h-7 rounded-full flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto max-h-[500px]">
              {/* Student Metadata Card */}
              <div className="grid grid-cols-2 gap-4 bg-muted/30 border border-border/60 p-4 rounded-xl text-xs">
                <div className="space-y-1">
                  <div className="text-[9px] text-muted-foreground uppercase font-bold">Candidate</div>
                  <div className="font-bold text-foreground">{selectedAttempt.first_name} {selectedAttempt.last_name}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-[9px] text-muted-foreground uppercase font-bold">Roll Number</div>
                  <div className="font-bold text-foreground font-mono">{selectedAttempt.roll_number}</div>
                </div>
                <div className="space-y-1 mt-2">
                  <div className="text-[9px] text-muted-foreground uppercase font-bold">Department</div>
                  <div className="font-bold text-foreground">{selectedAttempt.department}</div>
                </div>
                <div className="space-y-1 mt-2">
                  <div className="text-[9px] text-muted-foreground uppercase font-bold">Graduation Year</div>
                  <div className="font-bold text-foreground">{selectedAttempt.graduation_year || "2026"}</div>
                </div>
              </div>

              {/* Exam details summary */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Test Details</h4>
                <div className="border border-border/80 rounded-xl p-4 space-y-3 text-xs bg-card">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Test Title:</span>
                    <span className="font-bold">{selectedAttempt.exam_title}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Duration allocation:</span>
                    <span className="font-mono">{selectedAttempt.exam_duration_min} minutes</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Passing percentage limit:</span>
                    <span className="font-mono font-bold text-slate-800">{selectedAttempt.exam_passing_pct || 40}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Start timestamp:</span>
                    <span className="font-mono">{new Date(selectedAttempt.started_at).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Submission timestamp:</span>
                    <span className="font-mono">
                      {selectedAttempt.submitted_at 
                        ? new Date(selectedAttempt.submitted_at).toLocaleString() 
                        : "Session force closed / active"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Marks Allocation Detail */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-bold">Score Distribution Breakdowns</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="border border-border/85 p-3 rounded-xl text-center space-y-1">
                    <div className="text-[9px] font-bold uppercase text-muted-foreground">MCQ Score</div>
                    <div className="text-sm font-black font-mono text-indigo-600">{selectedAttempt.mcq_score}</div>
                  </div>
                  <div className="border border-border/85 p-3 rounded-xl text-center space-y-1">
                    <div className="text-[9px] font-bold uppercase text-muted-foreground">Coding Score</div>
                    <div className="text-sm font-black font-mono text-amber-600">{selectedAttempt.coding_score}</div>
                  </div>
                  <div className="border border-border/85 p-3 rounded-xl text-center bg-muted/20 space-y-1">
                    <div className="text-[9px] font-bold uppercase text-muted-foreground font-extrabold">Total Earned</div>
                    <div className="text-sm font-black font-mono text-emerald-600">{selectedAttempt.total_score}</div>
                  </div>
                </div>
              </div>

              {/* Proctoring integrity tracking summary */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Proctoring compliance logs</h4>
                <div className="border border-border/80 rounded-xl p-4 bg-card text-xs space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Window Tab shifts / focus blur events:</span>
                    <span className={`font-mono font-extrabold ${selectedAttempt.tab_switches > 0 ? "text-destructive" : "text-emerald-600"}`}>
                      {selectedAttempt.tab_switches} times
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">System integrity compliance score:</span>
                    <span className={`font-mono font-black ${selectedAttempt.integrity_score >= 80 ? "text-emerald-600" : selectedAttempt.integrity_score >= 50 ? "text-amber-600" : "text-destructive"}`}>
                      {selectedAttempt.integrity_score}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-border bg-muted/10 flex justify-end gap-2">
              <Button onClick={() => setSelectedAttempt(null)} variant="outline" size="sm" className="rounded-xl text-xs font-bold">
                Close Inspector
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
