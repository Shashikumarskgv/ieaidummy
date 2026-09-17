"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Award, Clock, Calendar, CheckCircle2, AlertCircle, Eye, Brain, Loader2, Play, Search, ShieldAlert, Sparkles, AlertTriangle, ChevronRight, Activity, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import ExamService from "@/services/exam.service";
import InterviewService from "@/services/interview.service";
import ProfileService from "@/services/profile.service";
import AuthService from "@/services/auth.service";
import JobsService from "@/services/jobs.service";
import DetailedReport from "@/components/students/reports/DetailedReport";
import { toast } from "sonner";

export default function StudentReportsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"exams" | "preparation" | "hr_assessments">("exams");
  const [prepCategory, setPrepCategory] = useState<"all" | "role" | "project" | "weak" | "hr">("all");
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [examAttempts, setExamAttempts] = useState<any[]>([]);
  const [prepAttempts, setPrepAttempts] = useState<any[]>([]);
  const [hrAssessments, setHrAssessments] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Detailed view state for exams
  const [selectedExamAttemptId, setSelectedExamAttemptId] = useState<number | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const user = AuthService.getCurrentUser();
      if (!user) return;

      const [profileRes, examsData, prepData, hrData] = await Promise.all([
        ProfileService.getById(user.id),
        ExamService.studentList(),
        InterviewService.getTestResults(),
        JobsService.getStudentHRAssessments().catch(() => ({ data: { data: [] } }))
      ]);

      setProfile(profileRes.data || null);
      setExamAttempts(examsData.data || []);
      setPrepAttempts(prepData || []);
      setHrAssessments(hrData.data?.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load reports history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (selectedExamAttemptId) {
    return (
      <div className="p-2 sm:p-4">
        <DetailedReport
          attemptId={selectedExamAttemptId}
          isAdmin={false}
          onBack={() => setSelectedExamAttemptId(null)}
        />
      </div>
    );
  }

  const getFilteredExams = () => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return examAttempts;
    return examAttempts.filter(e => 
      (e.title && e.title.toLowerCase().includes(term)) ||
      (e.description && e.description.toLowerCase().includes(term))
    );
  };

  const getFilteredPrep = () => {
    let filtered = prepAttempts;
    
    // Filter by Category Sub-Tab
    if (prepCategory !== "all") {
      filtered = filtered.filter(p => p.section === prepCategory);
    }
    
    // Filter by search term
    const term = searchTerm.trim().toLowerCase();
    if (!term) return filtered;
    return filtered.filter(p => 
      (p.section && p.section.toLowerCase().includes(term)) ||
      (p.scope && p.scope.toLowerCase().includes(term))
    );
  };

  const filteredExams = getFilteredExams();
  const filteredPrep = getFilteredPrep();

  return (
    <div className="space-y-6 animate-in fade-in duration-300 p-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-sans">My Performance Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Access exam results, detailed question breakdowns, SDE interview practice scores, and progression metrics.
          </p>
        </div>
      </div>

      {/* Main Tabs list & Search */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-3">
          <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border/40 shrink-0">
            <button
              onClick={() => { setActiveTab("exams"); setSearchTerm(""); }}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                activeTab === "exams"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Exam Reports <span className="opacity-70 text-[10px] ml-0.5">({examAttempts.length})</span>
            </button>
            <button
              onClick={() => { setActiveTab("preparation"); setSearchTerm(""); }}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                activeTab === "preparation"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Preparation Reports <span className="opacity-70 text-[10px] ml-0.5">({prepAttempts.length})</span>
            </button>
            <button
              onClick={() => { setActiveTab("hr_assessments"); setSearchTerm(""); }}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                activeTab === "hr_assessments"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              HR Assessments <span className="opacity-70 text-[10px] ml-0.5">({hrAssessments.length})</span>
            </button>
          </div>

          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={activeTab === "exams" ? "Search by exam title..." : activeTab === "hr_assessments" ? "Search by company or title..." : "Search by section or topic..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-card border-border rounded-xl text-xs h-9"
            />
          </div>
        </div>

        {/* Preparation Reports Category Sub-tabs */}
        {activeTab === "preparation" && (
          <div className="flex flex-wrap gap-2 border-b border-border pb-2">
            {[
              { id: "all", label: "All Reports" },
              { id: "role", label: "Role Based" },
              { id: "project", label: "Project Based" },
              { id: "weak", label: "Weak Areas" },
              { id: "hr", label: "HR Questions" }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setPrepCategory(cat.id as any)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  prepCategory === cat.id
                    ? "bg-muted text-foreground border border-border"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Table Container */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="text-xs">Gathering performance records...</span>
          </div>
        ) : activeTab === "exams" ? (
          filteredExams.length > 0 ? (
            <Table className="w-full text-sm">
              <TableHeader className="bg-muted/40 border-b border-border">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold">Exam Details</TableHead>
                  <TableHead className="font-semibold w-32">Academic Info</TableHead>
                  <TableHead className="font-semibold w-40">Status</TableHead>
                  <TableHead className="font-semibold w-44">Timeline</TableHead>
                  <TableHead className="font-semibold w-36">Results Summary</TableHead>
                  <TableHead className="font-semibold w-24 text-right pr-6">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border">
                {filteredExams.map((e) => {
                  const isCompleted = e.attempt_status === "completed";
                  const isReleased = new Date() >= new Date(e.end_date);
                  const total = e.exam_total_marks || 100;
                  const pct = total > 0 ? (e.total_score / total) * 100 : 0;
                  const isPass = pct >= (e.pass_percentage || 40);

                  return (
                    <TableRow key={e.attempt_id ? `attempt-${e.attempt_id}` : `exam-${e.id}`} className="hover:bg-muted/10 transition-all duration-200">
                      <td className="p-4">
                        <div className="font-semibold text-foreground text-sm">{e.title}</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5 capitalize">{e.exam_type || "Mixed"} Exam · {e.duration} Mins</div>
                      </td>
                      <td className="p-4">
                        <div className="text-xs text-foreground font-semibold">{profile?.department || "—"}</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">{profile?.batch_code || "Graduation"}</div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border capitalize ${
                          isCompleted
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                            : e.attempt_status === "in_progress"
                            ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                            : "bg-muted text-muted-foreground border-border"
                        }`}>
                          {isCompleted ? "Submitted" : e.attempt_status === "in_progress" ? "In Progress" : "Pending"}
                        </span>
                      </td>
                      <td className="p-4 text-xs text-muted-foreground font-medium">
                        {e.submitted_at ? (
                          <div className="space-y-0.5">
                            <div>Submitted:</div>
                            <div className="font-mono text-[10px]">{new Date(e.submitted_at).toLocaleString()}</div>
                          </div>
                        ) : (
                          <span>Ends: {new Date(e.end_date).toLocaleDateString()}</span>
                        )}
                      </td>
                      <td className="p-4">
                        {isCompleted ? (
                          isReleased ? (
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-foreground text-sm">{e.total_score} / {total}</span>
                                <span className={`inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold border ${
                                  isPass 
                                    ? "bg-green-500/10 text-green-600 border-green-500/20" 
                                    : "bg-destructive/10 text-destructive border-destructive/20"
                                }`}>
                                  {isPass ? "PASS" : "FAIL"}
                                </span>
                              </div>
                              <div className="text-[10px] text-muted-foreground">Percentage: {Math.round(pct)}%</div>
                            </div>
                          ) : (
                            <span className="text-[10px] text-muted-foreground italic font-semibold text-amber-600">Locked until end time</span>
                          )
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="p-4 text-right pr-6">
                        {isCompleted && isReleased ? (
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => setSelectedExamAttemptId(e.attempt_id)} 
                            className="h-8 rounded-lg text-primary hover:text-primary-hover hover:bg-muted font-bold text-xs"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            <span>Details</span>
                          </Button>
                        ) : (
                          <Button size="sm" variant="ghost" disabled className="h-8 rounded-lg text-muted-foreground/40 text-xs font-semibold">
                            Locked
                          </Button>
                        )}
                      </td>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="p-16 text-center space-y-4 max-w-md mx-auto">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-foreground">No Exam Reports</h3>
                <p className="text-xs text-muted-foreground">You don't have any assigned or conducted exams records matching "{searchTerm}".</p>
              </div>
            </div>
          )
        ) : activeTab === "preparation" ? (
          filteredPrep.length > 0 ? (
            <Table className="w-full text-xs">
              <TableHeader className="bg-muted/40 border-b border-border">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold w-36">Attempt Date</TableHead>
                  <TableHead className="font-semibold">Category</TableHead>
                  <TableHead className="font-semibold">Scope / Topic</TableHead>
                  <TableHead className="font-semibold w-24">Difficulty</TableHead>
                  <TableHead className="font-semibold w-16 text-center">Questions</TableHead>
                  <TableHead className="font-semibold w-16 text-center">Answered</TableHead>
                  <TableHead className="font-semibold w-16 text-center text-green-600">Correct</TableHead>
                  <TableHead className="font-semibold w-16 text-center text-red-500">Wrong</TableHead>
                  <TableHead className="font-semibold w-16 text-center">Skipped</TableHead>
                  <TableHead className="font-semibold w-16 text-center">Score</TableHead>
                  <TableHead className="font-semibold w-16 text-center">Percentage</TableHead>
                  <TableHead className="font-semibold w-24 text-center">Time Taken</TableHead>
                  <TableHead className="font-semibold w-24">Status</TableHead>
                  <TableHead className="font-semibold w-24 text-right pr-6">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border">
                {filteredPrep.map((p) => {
                  const total = p.total_questions || p.total || 0;
                  const score = p.score || 0;
                  const isCompleted = p.status === "completed";
                  
                  // Calculate answered vs skipped
                  let answered = 0;
                  let skipped = 0;
                  try {
                    const ansList = Array.isArray(p.answers) ? p.answers : JSON.parse(p.answers_json || "[]");
                    ansList.forEach((a: number) => {
                      if (a === -1 || a === undefined || a === null) skipped++;
                      else answered++;
                    });
                  } catch (e) {
                    answered = score; 
                    skipped = total - score;
                  }
                  
                  const wrong = answered - score;

                  // Friendly category labels
                  const categoryLabels: Record<string, string> = {
                    role: "Role Based",
                    project: "Project Based",
                    weak: "Weak Areas",
                    hr: "HR Questions"
                  };

                  return (
                    <TableRow key={p.id} className="hover:bg-muted/10 transition-all duration-200">
                      <td className="p-3 font-mono text-[10px] text-muted-foreground font-medium">
                        {new Date(p.started_at).toLocaleString()}
                      </td>
                      <td className="p-3 font-semibold text-foreground capitalize">
                        {categoryLabels[p.section] || p.section}
                      </td>
                      <td className="p-3 text-foreground/80 font-medium capitalize">
                        {p.scope || "General"}
                      </td>
                      <td className="p-3">
                        <span className={`inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold border uppercase ${
                          p.mcqs?.[0]?.difficulty === "hard"
                            ? "bg-red-500/10 text-red-600 border-red-500/20"
                            : p.mcqs?.[0]?.difficulty === "medium"
                            ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                            : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                        }`}>
                          {p.mcqs?.[0]?.difficulty || "Medium"}
                        </span>
                      </td>
                      <td className="p-3 text-center font-mono font-semibold">{total}</td>
                      <td className="p-3 text-center font-mono font-semibold">{answered}</td>
                      <td className="p-3 text-center font-mono font-bold text-green-600">{score}</td>
                      <td className="p-3 text-center font-mono font-bold text-destructive">{wrong}</td>
                      <td className="p-3 text-center font-mono font-semibold text-muted-foreground">{skipped}</td>
                      <td className="p-3 text-center font-mono font-bold text-foreground">{score}</td>
                      <td className="p-3 text-center font-mono font-bold text-indigo-600">{Math.round(p.percentage)}%</td>
                      <td className="p-3 text-center font-mono font-semibold text-muted-foreground">{p.duration_minutes} Mins</td>
                      <td className="p-3">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold border capitalize ${
                          isCompleted
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                            : "bg-blue-500/10 text-blue-600 border-blue-500/20"
                        }`}>
                          {p.status || "in_progress"}
                        </span>
                      </td>
                      <td className="p-3 text-right pr-6">
                        {isCompleted ? (
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => router.push(`/student/reports/preparation/${p.id}`)} 
                            className="h-8 rounded-lg text-primary hover:text-primary-hover hover:bg-muted font-bold text-xs"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            <span>Review</span>
                          </Button>
                        ) : (
                          <Button size="sm" variant="ghost" disabled className="h-8 rounded-lg text-muted-foreground/40 text-xs font-semibold">
                            Locked
                          </Button>
                        )}
                      </td>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="p-16 text-center space-y-4 max-w-md mx-auto">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-foreground">No Preparation Reports</h3>
                <p className="text-xs text-muted-foreground">You don't have any SDE interview preparation attempts matching "{searchTerm}".</p>
              </div>
            </div>
          )
        ) : (
          /* HR Assessments Tab */
          hrAssessments.length > 0 ? (
            <Table className="w-full text-sm">
              <TableHeader className="bg-muted/40 border-b border-border">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold">Company & Job Title</TableHead>
                  <TableHead className="font-semibold">Assessment Title</TableHead>
                  <TableHead className="font-semibold text-center">Duration</TableHead>
                  <TableHead className="font-semibold text-center">Pass %</TableHead>
                  <TableHead className="font-semibold text-center">Candidate Status</TableHead>
                  <TableHead className="font-semibold text-center">Attempt Status</TableHead>
                  <TableHead className="font-semibold text-right pr-6">Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border">
                {hrAssessments
                  .filter(h => !searchTerm || h.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) || h.title?.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((h) => (
                    <TableRow key={h.id} className="hover:bg-muted/10 transition-all">
                      <td className="p-4">
                        <div className="font-bold text-foreground">{h.company_name}</div>
                        <div className="text-xs text-primary font-medium mt-0.5">{h.job_title}</div>
                      </td>

                      <td className="p-4 text-xs font-semibold text-foreground">
                        <div>{h.title}</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">{h.description || "Company Evaluation Test"}</div>
                      </td>

                      <td className="p-4 text-center text-xs font-semibold">{h.duration} Mins</td>

                      <td className="p-4 text-center text-xs font-bold text-indigo-600">{h.pass_percentage}%</td>

                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border capitalize ${
                          h.candidate_status === "selected" 
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                            : "bg-indigo-500/10 text-indigo-600 border-indigo-500/20"
                        }`}>
                          {h.candidate_status}
                        </span>
                      </td>

                      <td className="p-4 text-center text-xs">
                        {h.attempt ? (
                          <span className="font-bold text-emerald-600 capitalize">{h.attempt.status}</span>
                        ) : (
                          <span className="text-muted-foreground italic">Assigned</span>
                        )}
                      </td>

                      <td className="p-4 text-right pr-6 font-mono font-bold text-sm">
                        {h.attempt ? `${h.attempt.total_score} pts` : "—"}
                      </td>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-16 text-center space-y-4 max-w-md mx-auto">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                <Award className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-foreground">No HR Assessments Yet</h3>
                <p className="text-xs text-muted-foreground">Once company HRs shortlist your profile and assign custom assessments, your lifetime reports will be displayed here.</p>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
