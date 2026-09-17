"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Users, 
  BarChart3, 
  ArrowLeft, 
  Search, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  TrendingUp, 
  Award, 
  Brain, 
  ShieldAlert, 
  RotateCcw, 
  FileText, 
  BookOpen, 
  Mail, 
  Phone, 
  GraduationCap, 
  Hash, 
  Filter, 
  Sparkles,
  Loader2,
  RefreshCw
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import TPOService from "@/services/tpo.service";

function StudentPerformanceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialStudentId = searchParams.get("studentId") || searchParams.get("id");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [allAttempts, setAllAttempts] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>(initialStudentId || "all");
  const [searchQuery, setSearchQuery] = useState("");
  const [examStatusFilter, setExamStatusFilter] = useState("all");
  const [reassigningId, setReassigningId] = useState<string | null>(null);

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [studentsRes, reportsRes] = await Promise.all([
        TPOService.getStudentsList().catch(() => ({ data: { success: false, data: [] } })),
        TPOService.getReports().catch(() => ({ data: { success: false, data: [] } }))
      ]);

      const loadedAttempts = reportsRes.data?.data || reportsRes.data || [];
      setAllAttempts(loadedAttempts);

      let loadedStudents = studentsRes.data?.data || [];
      if (!Array.isArray(loadedStudents) || loadedStudents.length === 0) {
        // Fallback: build student list from attempts if students API returns empty
        const studentMap = new Map();
        loadedAttempts.forEach((att: any) => {
          if (att.student_id && !studentMap.has(String(att.student_id))) {
            studentMap.set(String(att.student_id), {
              id: att.student_id,
              first_name: att.student?.full_name?.split(" ")[0] || "Student",
              last_name: att.student?.full_name?.split(" ").slice(1).join(" ") || "",
              roll_number: att.student?.roll_number || `STU-${att.student_id}`,
              department: att.student?.department || "General",
              personal_email: att.student?.email || "",
              contact_number: att.student?.phone || "",
              batch: att.student?.batch || "N/A"
            });
          }
        });
        loadedStudents = Array.from(studentMap.values());
      }

      setStudents(loadedStudents);

      if (isRefresh) toast.success("Student performance data refreshed.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to load student performance data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter students based on search query
  const filteredStudents = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return students;
    return students.filter((s) => {
      const name = `${s.first_name || ""} ${s.last_name || ""}`.toLowerCase();
      const roll = (s.roll_number || "").toLowerCase();
      const dept = (s.department || "").toLowerCase();
      const email = (s.personal_email || "").toLowerCase();
      return name.includes(q) || roll.includes(q) || dept.includes(q) || email.includes(q);
    });
  }, [students, searchQuery]);

  // Selected Student Details
  const selectedStudent = useMemo(() => {
    if (selectedStudentId === "all" || !selectedStudentId) return null;
    return students.find((s) => String(s.id) === String(selectedStudentId)) || null;
  }, [students, selectedStudentId]);

  // Attempts for the selected student (or all students if selectedStudentId is 'all')
  const studentAttempts = useMemo(() => {
    if (!selectedStudentId || selectedStudentId === "all") return allAttempts;
    return allAttempts.filter((att) => String(att.student_id) === String(selectedStudentId));
  }, [allAttempts, selectedStudentId]);

  // Filtered attempts based on examStatusFilter
  const filteredStudentAttempts = useMemo(() => {
    if (examStatusFilter === "all") return studentAttempts;
    if (examStatusFilter === "completed") return studentAttempts.filter((a) => a.status === "completed");
    if (examStatusFilter === "passed") {
      return studentAttempts.filter((a) => {
        const passPct = a.exam?.passing_pct || 40;
        const totalMarks = a.exam?.total_marks || 100;
        const scorePct = totalMarks > 0 ? (a.total_score / totalMarks) * 100 : a.total_score;
        return a.status === "completed" && scorePct >= passPct;
      });
    }
    if (examStatusFilter === "failed") {
      return studentAttempts.filter((a) => {
        const passPct = a.exam?.passing_pct || 40;
        const totalMarks = a.exam?.total_marks || 100;
        const scorePct = totalMarks > 0 ? (a.total_score / totalMarks) * 100 : a.total_score;
        return a.status === "completed" && scorePct < passPct;
      });
    }
    if (examStatusFilter === "flagged") {
      return studentAttempts.filter((a) => a.tab_switches >= 3 || a.integrity_score < 70);
    }
    return studentAttempts;
  }, [studentAttempts, examStatusFilter]);

  // Student Performance Analytical Metrics
  const studentMetrics = useMemo(() => {
    const total = studentAttempts.length;
    const completed = studentAttempts.filter((a) => a.status === "completed");
    
    let totalScoreSumPct = 0;
    let totalMcqSum = 0;
    let totalCodingSum = 0;
    let passedCount = 0;
    let totalIntegrity = 0;
    let totalTabSwitches = 0;
    let highestScorePct = 0;
    let lowestScorePct = 100;

    completed.forEach((a) => {
      const totalMarks = a.exam?.total_marks || 100;
      const passPct = a.exam?.passing_pct || 40;
      const score = Number(a.total_score || 0);
      const scorePct = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : score;

      totalScoreSumPct += scorePct;
      totalMcqSum += Number(a.mcq_score || 0);
      totalCodingSum += Number(a.coding_score || 0);

      if (scorePct > highestScorePct) highestScorePct = scorePct;
      if (scorePct < lowestScorePct) lowestScorePct = scorePct;

      if (scorePct >= passPct) passedCount++;
    });

    studentAttempts.forEach((a) => {
      totalIntegrity += Number(a.integrity_score || 100);
      totalTabSwitches += Number(a.tab_switches || 0);
    });

    if (completed.length === 0) lowestScorePct = 0;

    const avgScorePct = completed.length > 0 ? Math.round(totalScoreSumPct / completed.length) : 0;
    const passRate = completed.length > 0 ? Math.round((passedCount / completed.length) * 100) : 0;
    const avgIntegrity = total > 0 ? Math.round(totalIntegrity / total) : 100;
    const avgMcq = completed.length > 0 ? Math.round(totalMcqSum / completed.length) : 0;
    const avgCoding = completed.length > 0 ? Math.round(totalCodingSum / completed.length) : 0;

    return {
      total,
      completedCount: completed.length,
      passedCount,
      failedCount: completed.length - passedCount,
      avgScorePct,
      passRate,
      highestScorePct,
      lowestScorePct,
      avgIntegrity,
      totalTabSwitches,
      avgMcq,
      avgCoding
    };
  }, [studentAttempts]);

  const handleReassign = async (attemptId: string) => {
    if (!confirm("Are you sure you want to allow this student to re-take the exam?")) return;
    setReassigningId(attemptId);
    try {
      await TPOService.reassignAttempt(attemptId, "TPO reassigned attempt from student analytics portal");
      toast.success("Exam attempt reassigned successfully.");
      await fetchData(true);
    } catch {
      toast.error("Failed to reassign exam attempt.");
    } finally {
      setReassigningId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-muted-foreground min-h-[450px]">
        <Loader2 className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4 text-primary" />
        <span className="text-sm font-semibold">Loading Student Performance Analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="space-y-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/tpo/analytics")}
            className="text-xs text-muted-foreground hover:text-foreground pl-0 flex items-center gap-1.5 h-7 mb-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to TPO Analytics</span>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Users className="w-7 h-7 text-emerald-500 shrink-0" />
            <span>College Student Performance Analytics</span>
          </h1>
          <p className="text-xs text-muted-foreground">
            Complete analytical report, exam history, skill breakdown, and proctoring integrity per student profile across all college departments.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            variant="outline"
            className="h-9 text-xs font-semibold rounded-xl border-border flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            <span>{refreshing ? "Refreshing..." : "Refresh Data"}</span>
          </Button>
        </div>
      </div>

      {/* Student Selector Toolbar */}
      <Card className="bg-card border-border shadow-xs">
        <CardContent className="pt-5 pb-5">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search student by name, roll number, department, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-card border-border rounded-xl text-xs h-9.5"
                />
              </div>

              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="h-9.5 px-3.5 rounded-xl border border-input bg-card font-bold text-xs cursor-pointer focus:ring-1 focus:ring-primary text-foreground min-w-[220px]"
              >
                <option value="all">📊 All College Students Combined Overview ({students.length})</option>
                {filteredStudents.map((s) => (
                  <option key={s.id} value={String(s.id)}>
                    👤 {s.first_name} {s.last_name} ({s.roll_number || `ID: ${s.id}`}) - {s.department || "Dept"}
                  </option>
                ))}
              </select>
            </div>

            {selectedStudentId !== "all" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedStudentId("all")}
                className="text-xs font-bold text-primary hover:bg-primary/10 rounded-xl h-9"
              >
                Show All Students
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Student Profile Card (If specific student selected) */}
      {selectedStudent ? (
        <Card className="bg-gradient-to-r from-emerald-500/10 via-card to-card border-emerald-500/20 shadow-xs">
          <CardContent className="pt-6 space-y-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-border/50 pb-4">
              <div className="flex items-center gap-3.5">
                <div className="w-13 h-13 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center font-bold text-xl text-emerald-600 dark:text-emerald-400 shrink-0 shadow-inner">
                  {selectedStudent.first_name ? selectedStudent.first_name[0] : "S"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-extrabold text-foreground">
                      {selectedStudent.first_name} {selectedStudent.last_name}
                    </h2>
                    <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 border border-emerald-500/30">
                      Verified Student
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                    <span className="font-mono font-bold text-foreground">Roll No: {selectedStudent.roll_number || "N/A"}</span>
                    <span>•</span>
                    <span className="font-semibold">{selectedStudent.department || "General"}</span>
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted/40 border border-border/60">
                  <Mail className="w-3.5 h-3.5 text-primary" />
                  <span>{selectedStudent.personal_email || selectedStudent.email || "No email"}</span>
                </div>
                {selectedStudent.contact_number && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted/40 border border-border/60">
                    <Phone className="w-3.5 h-3.5 text-primary" />
                    <span>{selectedStudent.contact_number}</span>
                  </div>
                )}
                {selectedStudent.batch && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted/40 border border-border/60">
                    <GraduationCap className="w-3.5 h-3.5 text-primary" />
                    <span>Batch: {selectedStudent.batch}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-muted/30 border border-border/50">
                <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Total Attempts</span>
                <span className="text-lg font-black text-foreground">{studentMetrics.total}</span>
              </div>
              <div className="p-3 rounded-xl bg-muted/30 border border-border/50">
                <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Pass Rate</span>
                <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">{studentMetrics.passRate}%</span>
              </div>
              <div className="p-3 rounded-xl bg-muted/30 border border-border/50">
                <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Average Score</span>
                <span className="text-lg font-black text-foreground">{studentMetrics.avgScorePct}%</span>
              </div>
              <div className="p-3 rounded-xl bg-muted/30 border border-border/50">
                <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Integrity Score</span>
                <span className={`text-lg font-black ${studentMetrics.avgIntegrity >= 85 ? "text-emerald-500" : studentMetrics.avgIntegrity >= 70 ? "text-amber-500" : "text-rose-500"}`}>
                  {studentMetrics.avgIntegrity}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-gradient-to-r from-primary/10 via-card to-card border-primary/20 shadow-xs">
          <CardContent className="pt-5 pb-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center font-bold text-primary shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-foreground">Showing Combined Analytics for All College Students ({students.length})</h3>
                <p className="text-xs text-muted-foreground">Select a specific student above to view individual profile diagnostics and exam history.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analytical KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border shadow-xs hover:shadow-sm transition-shadow">
          <CardContent className="pt-5 space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Average Exam Score</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-foreground">{studentMetrics.avgScorePct}%</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              </div>
            </div>
            <span className="text-[11px] text-muted-foreground block">
              Highest: <strong className="text-foreground">{studentMetrics.highestScorePct}%</strong> | Lowest: <strong className="text-foreground">{studentMetrics.lowestScorePct}%</strong>
            </span>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-xs hover:shadow-sm transition-shadow">
          <CardContent className="pt-5 space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Exam Pass Percentage</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{studentMetrics.passRate}%</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Award className="w-4 h-4 text-emerald-500" />
              </div>
            </div>
            <span className="text-[11px] text-muted-foreground block">
              Passed: <strong className="text-emerald-600">{studentMetrics.passedCount}</strong> | Failed: <strong className="text-rose-500">{studentMetrics.failedCount}</strong>
            </span>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-xs hover:shadow-sm transition-shadow">
          <CardContent className="pt-5 space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Proctor Integrity Score</span>
            <div className="flex items-center justify-between">
              <span className={`text-2xl font-black ${studentMetrics.avgIntegrity >= 85 ? "text-emerald-500" : studentMetrics.avgIntegrity >= 70 ? "text-amber-500" : "text-rose-500"}`}>
                {studentMetrics.avgIntegrity}%
              </span>
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                <ShieldAlert className="w-4 h-4 text-indigo-500" />
              </div>
            </div>
            <span className="text-[11px] text-muted-foreground block">
              Total Tab Switches: <strong className="text-foreground">{studentMetrics.totalTabSwitches}</strong>
            </span>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-xs hover:shadow-sm transition-shadow">
          <CardContent className="pt-5 space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Completed Submissions</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-foreground">{studentMetrics.completedCount} / {studentMetrics.total}</span>
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-blue-500" />
              </div>
            </div>
            <span className="text-[11px] text-muted-foreground block">
              MCQ Avg: <strong className="text-foreground">{studentMetrics.avgMcq} pts</strong> | Coding: <strong className="text-foreground">{studentMetrics.avgCoding} pts</strong>
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytical Reports & Exam History Section */}
      <Card className="bg-card border-border shadow-xs">
        <CardHeader className="pb-3 border-b border-border/60">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                <span>Student Exam Performance & Diagnostic History</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Detailed exam submissions, MCQ vs Coding score breakdowns, tab switch logs, and reassignment controls.
              </CardDescription>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border/40">
              {(["all", "completed", "passed", "failed", "flagged"] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setExamStatusFilter(st)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                    examStatusFilter === st
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          {filteredStudentAttempts.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground space-y-2">
              <BookOpen className="w-8 h-8 mx-auto text-muted-foreground/50" />
              <p className="text-xs font-medium">No exam attempts found for the selected student and status filter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border/60">
              <Table className="w-full text-xs">
                <TableHeader className="bg-muted/40 border-b border-border">
                  <TableRow>
                    <TableHead className="font-bold">Exam Title & Type</TableHead>
                    <TableHead className="font-bold">Student Name & Roll</TableHead>
                    <TableHead className="font-bold text-center">Total Score</TableHead>
                    <TableHead className="font-bold text-center">MCQ / Coding</TableHead>
                    <TableHead className="font-bold text-center">Proctor Integrity</TableHead>
                    <TableHead className="font-bold text-center">Attempt Date</TableHead>
                    <TableHead className="font-bold text-center">Result Status</TableHead>
                    <TableHead className="font-bold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudentAttempts.map((att: any, idx: number) => {
                    const totalMarks = att.exam?.total_marks || 100;
                    const passPct = att.exam?.passing_pct || 40;
                    const score = Number(att.total_score || 0);
                    const scorePct = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : score;
                    const isPassed = att.status === "completed" && scorePct >= passPct;

                    return (
                      <TableRow key={att.id || idx} className="hover:bg-muted/20 transition-colors">
                        <TableCell>
                          <div className="space-y-0.5">
                            <span className="font-bold text-foreground block">{att.exam?.title || att.exam_title || `Exam #${att.exam_id}`}</span>
                            <span className="text-[10px] text-muted-foreground font-mono uppercase font-semibold">
                              {att.exam?.type || att.exam_type || "Mixed"} • Duration: {att.exam?.duration_min || 60}m
                            </span>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="space-y-0.5">
                            <span className="font-bold text-foreground block">{att.student?.full_name || "Student"}</span>
                            <span className="text-[10px] text-muted-foreground font-mono">
                              Roll: {att.student?.roll_number || "N/A"} • {att.student?.department || "Dept"}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="text-center">
                          <div className="inline-flex flex-col items-center">
                            <span className="font-black text-sm font-mono">{score} / {totalMarks}</span>
                            <span className={`text-[10px] font-bold ${isPassed ? "text-emerald-600" : "text-rose-500"}`}>
                              ({scorePct}%)
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="text-center font-mono">
                          <div className="text-[11px] font-medium space-y-0.5">
                            <div>MCQ: <strong className="text-foreground">{att.mcq_score || 0}</strong></div>
                            <div>Coding: <strong className="text-foreground">{att.coding_score || 0}</strong></div>
                          </div>
                        </TableCell>

                        <TableCell className="text-center">
                          <div className="inline-flex flex-col items-center">
                            <span className={`text-xs font-bold ${att.integrity_score >= 85 ? "text-emerald-600" : att.integrity_score >= 70 ? "text-amber-600" : "text-rose-600"}`}>
                              {att.integrity_score || 100}% Integrity
                            </span>
                            <span className="text-[10px] text-muted-foreground font-mono">
                              {att.tab_switches || 0} Tab Switches
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="text-center text-muted-foreground font-mono text-[11px]">
                          {att.started_at ? new Date(att.started_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A"}
                        </TableCell>

                        <TableCell className="text-center">
                          {att.status === "completed" ? (
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${
                              isPassed 
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" 
                                : "bg-rose-500/10 text-rose-600 border-rose-500/20"
                            }`}>
                              {isPassed ? "Passed" : "Failed"}
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20 capitalize">
                              {att.status || "In Progress"}
                            </span>
                          )}
                        </TableCell>

                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={reassigningId === String(att.id)}
                            onClick={() => handleReassign(String(att.id))}
                            className="h-7 text-[11px] font-bold rounded-lg border-amber-500/30 text-amber-600 hover:bg-amber-500/10 flex items-center gap-1 ml-auto"
                          >
                            <RotateCcw className={`w-3 h-3 ${reassigningId === String(att.id) ? "animate-spin" : ""}`} />
                            <span>Reassign</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function StudentPerformancePage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center p-20 text-muted-foreground min-h-[400px]">
        <Loader2 className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4 text-primary" />
        <span className="text-sm font-semibold">Loading Student Performance Dashboard...</span>
      </div>
    }>
      <StudentPerformanceContent />
    </Suspense>
  );
}
