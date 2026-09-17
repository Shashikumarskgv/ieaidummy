"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  BarChart3, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  Zap, 
  FileText, 
  Award,
  RefreshCw,
  Search,
  RotateCcw,
  Database,
  Info,
  ChevronRight,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import HODService from "@/services/hod.service";

export default function HODAnalyticsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<any>({
    summary: {
      totalAttempts: 0,
      completedAttempts: 0,
      avgScore: 0,
      passingRate: 0,
      flaggedCount: 0,
      avgIntegrity: 100
    },
    examPerformance: [],
    attempts: [],
    activityLogs: []
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [reassigningId, setReassigningId] = useState<string | null>(null);

  const fetchAnalytics = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await HODService.getAnalytics();
      if (res.data?.success && res.data?.data) {
        setData(res.data.data);
      } else {
        // Fallback if backend returned empty array
        setData((prev: any) => ({ ...prev, ...res.data }));
      }
      if (isManualRefresh) toast.success("Analytics updated.");
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to load analytics data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleReassign = async (attemptId: string) => {
    if (!confirm("Are you sure you want to allow this student to re-take the exam?")) return;
    setReassigningId(attemptId);
    try {
      await HODService.reassignAttempt(attemptId, "HOD reassigned attempt from analytics portal");
      toast.success("Exam attempt reassigned successfully.");
      await fetchAnalytics(true);
    } catch {
      toast.error("Failed to reassign exam attempt.");
    } finally {
      setReassigningId(null);
    }
  };

  // Filtered Student Exam Reports
  const filteredAttempts = (data.attempts || []).filter((att: any) => {
    const q = searchQuery.toLowerCase();
    const studentName = (att.student?.full_name || "").toLowerCase();
    const roll = (att.student?.roll_number || "").toLowerCase();
    const examTitle = (att.exam?.title || "").toLowerCase();
    const dept = (att.student?.department || "").toLowerCase();

    const matchesSearch = studentName.includes(q) || roll.includes(q) || examTitle.includes(q) || dept.includes(q);

    if (statusFilter === "all") return matchesSearch;
    if (statusFilter === "completed") return matchesSearch && att.status === "completed";
    if (statusFilter === "passed") {
      const passPct = att.exam?.passing_pct || 40;
      const totalMarks = att.exam?.total_marks || 100;
      const scorePct = totalMarks > 0 ? (att.total_score / totalMarks) * 100 : att.total_score;
      return matchesSearch && att.status === "completed" && scorePct >= passPct;
    }
    if (statusFilter === "failed") {
      const passPct = att.exam?.passing_pct || 40;
      const totalMarks = att.exam?.total_marks || 100;
      const scorePct = totalMarks > 0 ? (att.total_score / totalMarks) * 100 : att.total_score;
      return matchesSearch && att.status === "completed" && scorePct < passPct;
    }
    if (statusFilter === "flagged") return matchesSearch && (att.tab_switches >= 3 || att.integrity_score < 70);

    return matchesSearch;
  });

  const summary = data.summary || {};
  const examPerformance = data.examPerformance || [];
  const activityLogs = data.activityLogs || [];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-muted-foreground min-h-[400px]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <span className="text-sm font-semibold">Generating Student Exam & Proctoring Analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-primary shrink-0" />
            <span>Department Exam & Proctor Analytics</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Complete student exam performance reports, attempt activity logs, passing ratios, and proctoring integrity diagnostics.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={() => router.push("/hod/analytics/student-performance")}
            className="h-9 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-1.5 transition-all"
          >
            <Users className="w-4 h-4" />
            <span>Check Each Student Performance</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
          <Button
            onClick={() => fetchAnalytics(true)}
            disabled={refreshing}
            className="h-9 text-xs font-semibold rounded-xl bg-primary text-primary-foreground flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            <span>{refreshing ? "Refreshing..." : "Refresh Report"}</span>
          </Button>
        </div>
      </div>

      {/* KPI Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border shadow-xs hover:shadow-sm transition-shadow">
          <CardContent className="pt-5 space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Average Exam Score</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black tracking-tight text-foreground">{summary.avgScore || 0}%</span>
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Award className="w-4 h-4 text-blue-600" />
              </div>
            </div>
            <span className="text-[10px] text-muted-foreground block font-medium">Mean percentage across completed attempts</span>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-xs hover:shadow-sm transition-shadow">
          <CardContent className="pt-5 space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Overall Passing Rate</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black tracking-tight text-emerald-600">{summary.passingRate || 0}%</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
            <span className="text-[10px] text-emerald-600 font-bold block">Students scoring above passing threshold</span>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-xs hover:shadow-sm transition-shadow">
          <CardContent className="pt-5 space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Proctor Warnings & Breaches</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black tracking-tight text-amber-600">{summary.flaggedCount || 0} Flagged</span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
              </div>
            </div>
            <span className="text-[10px] text-amber-600 font-bold block">Tab switch limits / low integrity logs</span>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-xs hover:shadow-sm transition-shadow">
          <CardContent className="pt-5 space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Total Exam Attempts</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black tracking-tight text-foreground">{summary.totalAttempts || 0}</span>
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                <Users className="w-4 h-4 text-indigo-600" />
              </div>
            </div>
            <span className="text-[10px] text-muted-foreground block font-medium">{summary.completedAttempts || 0} completed submissions</span>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs Content */}
      <Tabs defaultValue="reports" className="space-y-4">
        <TabsList className="bg-muted p-1 rounded-xl">
          <TabsTrigger value="reports" className="rounded-lg text-xs font-semibold">
            Student Exam Reports ({filteredAttempts.length})
          </TabsTrigger>
          <TabsTrigger value="performance" className="rounded-lg text-xs font-semibold">
            Exam-Wise Performance ({examPerformance.length})
          </TabsTrigger>
          <TabsTrigger value="logs" className="rounded-lg text-xs font-semibold">
            Activity & Proctor Logs ({activityLogs.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Complete Student Exam Reports */}
        <TabsContent value="reports" className="space-y-4">
          <Card className="bg-card border-border shadow-xs">
            <CardHeader className="pb-3 border-b border-border/60">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    <span>Complete Student Exam Submissions & Reports</span>
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Search and filter individual student test scores, pass/fail status, and proctor integrity.
                  </CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <div className="relative w-full sm:w-64">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                    <Input
                      placeholder="Search student, roll, or exam..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="pl-9 h-9 text-xs rounded-xl"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="h-9 px-3 rounded-xl border border-input bg-background text-xs cursor-pointer font-medium w-full sm:w-auto"
                  >
                    <option value="all">All Submissions</option>
                    <option value="completed">Completed Only</option>
                    <option value="passed">Passed Only</option>
                    <option value="failed">Failed Only</option>
                    <option value="flagged">Proctor Flagged Only</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              {filteredAttempts.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground space-y-2">
                  <FileText className="w-10 h-10 mx-auto text-muted-foreground/40" />
                  <p className="text-sm font-semibold">No student exam attempts found.</p>
                  <p className="text-xs">Try adjusting your search query or filters.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground font-semibold">
                        <th className="pb-3 px-2">Student Details</th>
                        <th className="pb-3 px-2">Exam Title & Type</th>
                        <th className="pb-3 px-2 text-center">Score / Marks</th>
                        <th className="pb-3 px-2 text-center">Result Status</th>
                        <th className="pb-3 px-2 text-center">Tab Switches</th>
                        <th className="pb-3 px-2 text-center">Integrity Score</th>
                        <th className="pb-3 px-2 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {filteredAttempts.map((att: any) => {
                        const totalMarks = att.exam?.total_marks || 100;
                        const passPct = att.exam?.passing_pct || 40;
                        const score = Number(att.total_score || 0);
                        const scorePct = totalMarks > 0 ? (score / totalMarks) * 100 : score;
                        const isPassed = scorePct >= passPct && att.status === "completed";
                        const isFlagged = att.tab_switches >= 3 || att.integrity_score < 70;

                        return (
                          <tr key={att.id} className="hover:bg-muted/30 transition-colors">
                            <td className="py-3 px-2">
                              <div className="font-bold text-foreground">{att.student?.full_name || "Student"}</div>
                              <div className="text-[10px] text-muted-foreground font-mono">
                                {att.student?.roll_number} {att.student?.department ? `• ${att.student.department}` : ""}
                              </div>
                            </td>
                            <td className="py-3 px-2">
                              <div className="font-semibold text-foreground">{att.exam?.title || "Exam"}</div>
                              <div className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider">
                                {att.exam?.type || "Mixed"} Assessment
                              </div>
                            </td>
                            <td className="py-3 px-2 text-center">
                              <div className="font-bold font-mono text-sm text-foreground">
                                {score} <span className="text-[10px] text-muted-foreground font-normal">/ {totalMarks}</span>
                              </div>
                              <div className="text-[10px] text-muted-foreground font-mono">
                                ({Math.round(scorePct)}%)
                              </div>
                            </td>
                            <td className="py-3 px-2 text-center">
                              {att.status === "completed" ? (
                                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                                  isPassed 
                                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" 
                                    : "bg-rose-500/10 text-rose-600 border-rose-500/20"
                                }`}>
                                  {isPassed ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                                  {isPassed ? "PASSED" : "FAILED"}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20 uppercase">
                                  {att.status}
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-2 text-center">
                              <span className={`font-mono font-bold text-xs ${att.tab_switches >= 3 ? "text-rose-600" : "text-foreground"}`}>
                                {att.tab_switches || 0}
                              </span>
                            </td>
                            <td className="py-3 px-2 text-center">
                              <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                att.integrity_score >= 85 
                                  ? "bg-emerald-500/10 text-emerald-600" 
                                  : att.integrity_score >= 70 
                                    ? "bg-amber-500/10 text-amber-600" 
                                    : "bg-rose-500/10 text-rose-600 font-mono"
                              }`}>
                                {att.integrity_score || 100}%
                              </span>
                            </td>
                            <td className="py-3 px-2 text-right">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleReassign(att.id)}
                                disabled={reassigningId === att.id}
                                className="h-7 text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg flex items-center gap-1 ml-auto"
                              >
                                <RotateCcw className="w-3 h-3" />
                                {reassigningId === att.id ? "Reassigning..." : "Reassign"}
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Exam-Wise Passing Performance */}
        <TabsContent value="performance" className="space-y-4">
          <Card className="bg-card border-border shadow-xs">
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
                <span>Exam-Wise Passing Performance & Analysis</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Aggregated statistics showing pass rates and average scores for every department exam.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-5 space-y-5">
              {examPerformance.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-8">No exam performance data available yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {examPerformance.map((exam: any, idx: number) => (
                    <div 
                      key={idx} 
                      onClick={() => router.push(`/hod/reports?examTitle=${encodeURIComponent(exam.title)}`)}
                      className="p-4 rounded-2xl bg-muted/20 border border-border/70 space-y-3 shadow-2xs cursor-pointer hover:border-primary/50 hover:bg-muted/40 transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                            <span>{exam.title}</span>
                            <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary" />
                          </h4>
                          <span className="text-[10px] text-muted-foreground uppercase font-mono font-semibold">
                            {exam.type} • {exam.totalAttempts} Submissions
                          </span>
                        </div>
                        <span className={`text-xs font-black px-2.5 py-1 rounded-xl border ${
                          exam.passingRate >= 75
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                            : exam.passingRate >= 50
                              ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                              : "bg-rose-500/10 text-rose-600 border-rose-500/20"
                        }`}>
                          {exam.passingRate}% Pass Rate
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-medium text-muted-foreground">
                          <span>Passing Ratio Progress</span>
                          <span className="font-mono font-bold text-foreground">{exam.passingRate}%</span>
                        </div>
                        <div className="w-full bg-border/50 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              exam.passingRate >= 75 ? "bg-emerald-500" : exam.passingRate >= 50 ? "bg-amber-500" : "bg-rose-500"
                            }`}
                            style={{ width: `${exam.passingRate}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1 text-xs text-muted-foreground border-t border-border/40">
                        <span>Average Exam Score:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground font-mono">{exam.avgScore}%</span>
                          <span className="text-[10px] text-primary group-hover:underline font-medium">View Category Reports &rarr;</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Students Exam Activity & Proctoring Logs */}
        <TabsContent value="logs" className="space-y-4">
          <Card className="bg-card border-border shadow-xs">
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-500" />
                <span>Student Exam Activity Logs & Integrity Audit</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Real-time activity diagnostics including tab switch events and proctoring warnings.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              {activityLogs.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-8">No activity logs recorded yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground font-semibold">
                        <th className="pb-3 px-2">Student</th>
                        <th className="pb-3 px-2">Exam Title</th>
                        <th className="pb-3 px-2 text-center">Tab Switches</th>
                        <th className="pb-3 px-2 text-center">Integrity Rating</th>
                        <th className="pb-3 px-2 text-center">Proctoring Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {activityLogs.map((log: any, idx: number) => (
                        <tr key={idx} className="hover:bg-muted/20 transition-colors">
                          <td className="py-3 px-2">
                            <div className="font-bold text-foreground">{log.studentName}</div>
                            <div className="text-[10px] text-muted-foreground font-mono">{log.rollNumber} • {log.department}</div>
                          </td>
                          <td className="py-3 px-2 font-medium text-foreground">{log.examTitle}</td>
                          <td className="py-3 px-2 text-center font-mono font-bold text-rose-600">{log.tabSwitches}</td>
                          <td className="py-3 px-2 text-center font-mono font-bold">{log.integrityScore}%</td>
                          <td className="py-3 px-2 text-center">
                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                              log.proctorStatus === "Flagged"
                                ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
                                : log.proctorStatus === "Warning"
                                  ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                                  : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                            }`}>
                              {log.proctorStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
