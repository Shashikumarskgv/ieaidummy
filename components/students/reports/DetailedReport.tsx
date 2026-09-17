"use client";

import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  Award, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Calendar, 
  User, 
  RotateCcw, 
  Printer, 
  Code2, 
  HelpCircle, 
  AlertTriangle, 
  FileText,
  Activity,
  Check,
  X,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { mockHodStore, AttemptRecord } from "@/lib/mockHodData";

interface DetailedReportProps {
  attemptId: number;
  isAdmin?: boolean;
  onBack?: () => void;
}

export default function DetailedReport({ attemptId, isAdmin = true, onBack }: DetailedReportProps) {
  const [attempt, setAttempt] = useState<AttemptRecord | null>(null);
  const [loading, setLoading] = useState(true);

  // Reassign dialog state
  const [reassignOpen, setReassignOpen] = useState(false);
  const [reassignReason, setReassignReason] = useState("");
  const [submittingReassign, setSubmittingReassign] = useState(false);

  useEffect(() => {
    setLoading(true);
    let found = mockHodStore.getAttemptById(attemptId);
    if (!found) {
      // Fallback to first available attempt so it never crashes
      const all = mockHodStore.getAttempts();
      found = all[0] || null;
    }
    setAttempt(found);
    setLoading(false);
  }, [attemptId]);

  const handleReassign = async () => {
    if (!attempt) return;
    if (!reassignReason.trim()) {
      toast.error("Please provide a reason for reassigning the attempt.");
      return;
    }
    setSubmittingReassign(true);
    try {
      mockHodStore.reassignAttempt(attempt.id, reassignReason);
      setAttempt(prev => prev ? { ...prev, status: "reassigned", reassign_reason: reassignReason } : null);
      toast.success("Exam attempt reassigned successfully. Retake permission granted.");
      setReassignOpen(false);
      setReassignReason("");
    } catch {
      toast.error("Failed to reassign attempt.");
    } finally {
      setSubmittingReassign(false);
    }
  };

  if (loading || !attempt) {
    return (
      <div className="flex flex-col items-center justify-center p-20 min-h-[400px] text-muted-foreground">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <span className="text-sm font-semibold">Loading detailed exam assessment report...</span>
      </div>
    );
  }

  const totalMarks = attempt.exam?.total_marks || 100;
  const scorePct = totalMarks > 0 ? (attempt.total_score / totalMarks) * 100 : attempt.total_score;
  const passed = scorePct >= (attempt.exam?.passing_pct || 40);
  const isFlagged = (attempt.integrity_score || 100) < 70 || (attempt.tab_switches || 0) >= 3;

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-300 pb-20">
      {/* Top Bar with Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button
              onClick={onBack}
              variant="outline"
              size="sm"
              className="rounded-xl border-border h-9 px-3 text-xs font-semibold flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Reports</span>
            </Button>
          )}
          <div>
            <h1 className="text-xl font-bold text-foreground">Candidate Assessment Evaluation</h1>
            <p className="text-xs text-muted-foreground">Audit ID: #{attempt.id} • {attempt.exam?.title}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && attempt.status !== "reassigned" && (
            <Button
              onClick={() => setReassignOpen(true)}
              className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl h-9 text-xs font-semibold flex items-center gap-1.5 shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Grant Retake / Reassign</span>
            </Button>
          )}
          <Button
            onClick={() => window.print()}
            variant="outline"
            className="rounded-xl h-9 text-xs font-semibold flex items-center gap-1.5 border-border"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </Button>
        </div>
      </div>

      {/* Candidate Profile & Status Banner */}
      <Card className="bg-card border-border shadow-xs overflow-hidden">
        <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border/60 bg-muted/20">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary font-bold text-xl flex items-center justify-center border border-primary/20 shadow-xs">
              {attempt.student?.full_name?.charAt(0) || "S"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-foreground">{attempt.student?.full_name}</h2>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                  attempt.status === "completed"
                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                    : attempt.status === "reassigned"
                    ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                    : "bg-blue-500/10 text-blue-600 border-blue-500/20"
                }`}>
                  {attempt.status.toUpperCase()}
                </span>
                {passed && attempt.status === "completed" && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-green-500/15 text-green-600 border border-green-500/30">
                    PASSED ({scorePct.toFixed(1)}%)
                  </span>
                )}
                {!passed && attempt.status === "completed" && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-destructive/15 text-destructive border border-destructive/30">
                    FAILED ({scorePct.toFixed(1)}%)
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1.5 font-medium">
                <span>Roll: <strong className="text-foreground font-mono">{attempt.student?.roll_number}</strong></span>
                <span>•</span>
                <span>Dept: <strong className="text-foreground">{attempt.student?.department}</strong></span>
                <span>•</span>
                <span>Batch: <strong className="text-foreground">{attempt.student?.batch || "2021-2025"}</strong></span>
                <span>•</span>
                <span>Email: <strong className="text-foreground font-mono">{attempt.student?.email}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 self-start md:self-auto">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground block">Final Score</span>
              <span className="text-3xl font-black text-foreground font-mono">
                {Number(attempt.total_score).toFixed(1)}
                <span className="text-base font-normal text-muted-foreground">/{totalMarks}</span>
              </span>
            </div>
            <div className="text-right border-l border-border pl-6">
              <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground block">Integrity Rating</span>
              <span className={`text-3xl font-black font-mono ${attempt.integrity_score >= 80 ? "text-emerald-600" : attempt.integrity_score >= 65 ? "text-amber-600" : "text-destructive"}`}>
                {attempt.integrity_score}%
              </span>
            </div>
          </div>
        </div>

        {/* Metric Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-border bg-card">
          <div className="p-4 space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">MCQ Score</span>
            <span className="text-lg font-bold text-foreground font-mono">{Number(attempt.mcq_score).toFixed(1)} / {attempt.exam?.mcq_marks || 40}</span>
            <span className="text-[10px] text-muted-foreground block">Objective evaluation</span>
          </div>

          <div className="p-4 space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Coding Score</span>
            <span className="text-lg font-bold text-foreground font-mono">{Number(attempt.coding_score).toFixed(1)} / {attempt.exam?.coding_marks || 60}</span>
            <span className="text-[10px] text-muted-foreground block">Test case verification</span>
          </div>

          <div className="p-4 space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Attempt Duration</span>
            <span className="text-lg font-bold text-foreground font-mono">{attempt.attempt_time_minutes} min</span>
            <span className="text-[10px] text-muted-foreground block">Allocated: {attempt.exam?.duration || 60}m</span>
          </div>

          <div className="p-4 space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Proctor Warnings</span>
            <span className={`text-lg font-bold font-mono ${isFlagged ? "text-destructive" : "text-emerald-600"}`}>
              {attempt.tab_switches} Tab Switches
            </span>
            <span className="text-[10px] text-muted-foreground block">
              {attempt.face_violations ? `${attempt.face_violations} visual alerts` : "Clean camera track"}
            </span>
          </div>
        </div>

        {attempt.reassign_reason && (
          <div className="p-4 bg-amber-500/10 border-t border-amber-500/20 text-xs text-amber-800 flex items-center gap-2">
            <RotateCcw className="w-4 h-4 shrink-0 text-amber-600" />
            <span><strong>Reassignment Note:</strong> {attempt.reassign_reason}</span>
          </div>
        )}
      </Card>

      {/* Main Breakdown Tabs */}
      <Tabs defaultValue="coding" className="space-y-4">
        <TabsList className="bg-muted p-1 rounded-xl">
          <TabsTrigger value="coding" className="rounded-lg text-xs font-semibold flex items-center gap-1.5">
            <Code2 className="w-3.5 h-3.5" />
            <span>Coding Solutions ({attempt.answers?.coding_submissions?.length || 2})</span>
          </TabsTrigger>
          <TabsTrigger value="mcq" className="rounded-lg text-xs font-semibold flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>MCQ Question Review ({attempt.answers?.mcq_answers?.length || 5})</span>
          </TabsTrigger>
          <TabsTrigger value="proctor" className="rounded-lg text-xs font-semibold flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Proctor & Integrity Audit ({attempt.answers?.proctor_events?.length || 3})</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Coding Solutions */}
        <TabsContent value="coding" className="space-y-4">
          {(attempt.answers?.coding_submissions || []).map((codeItem, idx) => (
            <Card key={idx} className="bg-card border-border shadow-xs overflow-hidden">
              <CardHeader className="p-5 border-b border-border/60 bg-muted/20">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider font-mono">Problem {idx + 1}</span>
                      <CardTitle className="text-base font-bold text-foreground">{codeItem.title}</CardTitle>
                    </div>
                    <CardDescription className="text-xs mt-1 leading-relaxed">
                      {codeItem.statement}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${
                      codeItem.status === "Accepted"
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                    }`}>
                      {codeItem.status}
                    </span>
                    <span className="text-sm font-black font-mono text-foreground px-2 py-1 bg-muted rounded-lg border border-border">
                      {codeItem.score} / {codeItem.max_marks} pts
                    </span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                {/* Code Viewer */}
                <div className="bg-[#1e1e1e] text-slate-100 p-4 font-mono text-xs overflow-x-auto leading-relaxed border-b border-border">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-[11px] text-slate-400">
                    <span className="uppercase font-semibold tracking-wider">Submitted Code ({codeItem.language})</span>
                    <span>Execution: {codeItem.execution_time_ms}ms • Memory: {codeItem.memory_kb}KB</span>
                  </div>
                  <pre className="text-emerald-400">
                    <code>{codeItem.code}</code>
                  </pre>
                </div>

                {/* Test Cases Summary */}
                <div className="p-4 bg-muted/10 flex flex-wrap items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 font-semibold text-foreground">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>Test Cases Passed: <strong>{codeItem.test_cases_passed} / {codeItem.total_test_cases}</strong></span>
                    </div>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">Compiler: GCC 11.2 / OpenJDK 17</span>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    All Hidden Edge Cases Evaluated
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Tab 2: MCQ Question Review */}
        <TabsContent value="mcq" className="space-y-4">
          {(attempt.answers?.mcq_answers || []).map((mcq, idx) => {
            return (
              <Card key={idx} className="bg-card border-border shadow-xs p-5 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono">Question {idx + 1}</span>
                    <h3 className="text-sm font-semibold text-foreground leading-relaxed">{mcq.question}</h3>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {mcq.is_correct ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                        <Check className="w-3.5 h-3.5" />
                        <span>Correct (+{mcq.marks_obtained})</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-destructive/10 text-destructive border border-destructive/20">
                        <X className="w-3.5 h-3.5" />
                        <span>Incorrect (0)</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {mcq.options.map((opt, optIdx) => {
                    const isSelected = optIdx === mcq.selected_option;
                    const isCorrect = optIdx === mcq.correct_option;

                    let style = "bg-muted/30 border-border text-foreground";
                    if (isSelected && isCorrect) {
                      style = "bg-emerald-500/10 border-emerald-500/40 text-emerald-700 font-semibold";
                    } else if (isSelected && !isCorrect) {
                      style = "bg-destructive/10 border-destructive/40 text-destructive font-semibold";
                    } else if (isCorrect) {
                      style = "bg-emerald-500/5 border-emerald-500/30 text-emerald-700";
                    }

                    return (
                      <div key={optIdx} className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-2 ${style}`}>
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-card border border-border flex items-center justify-center font-bold text-[10px]">
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span>{opt}</span>
                        </div>
                        {isSelected && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-card border border-border uppercase">
                            Chosen
                          </span>
                        )}
                        {isCorrect && !isSelected && (
                          <span className="text-[10px] font-bold text-emerald-600 uppercase">
                            Correct Key
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {mcq.explanation && (
                  <div className="p-3 bg-muted/40 rounded-xl text-xs text-muted-foreground border border-border/60">
                    <strong className="text-foreground">Explanation:</strong> {mcq.explanation}
                  </div>
                )}
              </Card>
            );
          })}
        </TabsContent>

        {/* Tab 3: Proctor & Integrity Audit */}
        <TabsContent value="proctor" className="space-y-4">
          <Card className="bg-card border-border shadow-xs">
            <CardHeader className="border-b border-border/60 pb-4">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-500" />
                <span>Automated Proctoring Telemetry & Security Events</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Real-time browser activity, camera vision flags, and integrity score audit trail.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 bg-muted/30 rounded-xl border border-border space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Tab Switches</span>
                  <div className="text-xl font-black text-foreground font-mono">{attempt.tab_switches} Events</div>
                  <span className="text-[10px] text-muted-foreground">Focus loss threshold = 3</span>
                </div>

                <div className="p-4 bg-muted/30 rounded-xl border border-border space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Face/Gaze Warnings</span>
                  <div className="text-xl font-black text-foreground font-mono">{attempt.face_violations || 0} Alerts</div>
                  <span className="text-[10px] text-muted-foreground">Multi-face / face occluded</span>
                </div>

                <div className="p-4 bg-muted/30 rounded-xl border border-border space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Session IP Address</span>
                  <div className="text-xl font-black text-foreground font-mono">{attempt.ip_address}</div>
                  <span className="text-[10px] text-muted-foreground">SVCE Campus Subnet</span>
                </div>
              </div>

              {/* Event Timeline List */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Chronological Security Log</h4>
                <div className="space-y-2 border-l-2 border-border ml-3 pl-4">
                  {(attempt.answers?.proctor_events || []).map((evt, idx) => (
                    <div key={idx} className="relative space-y-0.5">
                      <div className={`w-2.5 h-2.5 rounded-full absolute -left-[21px] top-1.5 ${
                        evt.type === "violation" ? "bg-destructive ring-4 ring-destructive/20" : evt.type === "warning" ? "bg-amber-500 ring-4 ring-amber-500/20" : "bg-primary"
                      }`} />
                      <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                        <span className="font-mono text-muted-foreground">{evt.timestamp}</span>
                        <span>{evt.event}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{evt.details}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Grant Retake / Reassign Dialog */}
      <Dialog open={reassignOpen} onOpenChange={setReassignOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <RotateCcw className="w-5 h-5 text-amber-500" />
              <span>Grant Retake / Reassign Attempt</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              This action will reset the candidate's submission status to <strong>"reassigned"</strong>, permitting {attempt.student?.full_name} ({attempt.student?.roll_number}) to retake the test.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <Label htmlFor="reason" className="text-xs font-semibold">
              Reassignment Authorization Reason <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="reason"
              placeholder="e.g., Authorized retake due to laboratory network outage during coding section."
              value={reassignReason}
              onChange={e => setReassignReason(e.target.value)}
              className="text-xs min-h-[100px] rounded-xl"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setReassignOpen(false)}
              className="rounded-xl text-xs h-9"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleReassign}
              disabled={submittingReassign}
              className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs h-9 font-semibold"
            >
              {submittingReassign ? "Authorizing..." : "Confirm Retake Authorization"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
