"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Clock, Award, CheckCircle2, XCircle, AlertTriangle, FileText, Brain, HelpCircle, Check, Play, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import InterviewService from "@/services/interview.service";
import ProfileService from "@/services/profile.service";
import AuthService from "@/services/auth.service";
import { toast } from "sonner";

export default function PrepDetailedReportPage() {
  const params = useParams();
  const router = useRouter();
  const testId = String(params?.id || "");

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (!testId) return;

    const loadDetails = async () => {
      try {
        setLoading(true);
        const user = AuthService.getCurrentUser();
        const [profileRes, testResult] = await Promise.all([
          ProfileService.getById(user.id),
          InterviewService.getTestResultById(testId)
        ]);

        setProfile(profileRes.data || null);
        setData(testResult);
      } catch (err: any) {
        toast.error("Failed to load preparation report details.");
      } finally {
        setLoading(false);
      }
    };

    loadDetails();
  }, [testId]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-2">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        <span className="text-xs text-muted-foreground font-semibold">Generating preparation report evaluation...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-[40vh] flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold text-foreground text-sm">Report Unavailable</h3>
          <p className="text-xs text-muted-foreground mt-1">We couldn't retrieve the metrics for this practice attempt.</p>
        </div>
        <Button onClick={() => router.push("/student/reports")} size="sm" variant="outline" className="rounded-xl text-xs font-bold">
          Go Back to Reports
        </Button>
      </div>
    );
  }

  const mcqs = data.mcqs || [];
  const answers = data.answers || [];
  const correctCount = data.score || 0;
  const totalCount = data.total_questions || mcqs.length;
  
  // Calculate stats
  let answeredCount = 0;
  let skippedCount = 0;
  answers.forEach((ans: number) => {
    if (ans === -1 || ans === undefined || ans === null) {
      skippedCount++;
    } else {
      answeredCount++;
    }
  });

  const wrongCount = answeredCount - correctCount;
  const accuracy = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;
  const percentage = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300 pb-16 p-6">
      {/* Header toolbar */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.push("/student/reports")} className="rounded-xl text-xs font-bold">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Reports
        </Button>
      </div>

      {/* Main Stats Block */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card border-border shadow-sm md:col-span-2">
          <CardHeader className="border-b border-border/50 pb-3">
            <CardTitle className="text-sm font-black flex items-center gap-2">
              <Brain className="w-4 h-4 text-primary" /> Practice Test & Candidate Details
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-xs">
            <div className="space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Practice Category</span>
              <div className="font-bold text-foreground capitalize">{data.section} Practice Assessment</div>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Student Name</span>
              <div className="font-bold text-foreground">{profile?.first_name} {profile?.last_name}</div>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Assessment Scope</span>
              <div className="font-bold text-foreground capitalize">{data.scope || "General"}</div>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Roll Number / Dept</span>
              <div className="font-bold text-foreground font-mono">{profile?.roll_number || "—"} • {profile?.department || "—"}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm flex flex-col justify-between">
          <CardHeader className="border-b border-border/50 pb-3">
            <CardTitle className="text-sm font-black flex items-center gap-2">
              <Award className="w-4 h-4 text-primary" /> Score Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 flex-1 flex flex-col justify-center items-center text-center space-y-2">
            <div className="text-4xl font-black text-foreground font-mono">
              {correctCount} <span className="text-lg text-muted-foreground">/ {totalCount}</span>
            </div>
            <div className="text-xs font-bold text-muted-foreground">
              Accuracy: {accuracy}% · Success: {percentage}%
            </div>
            <div className="w-full bg-muted/60 p-2 rounded-xl text-[10px] font-bold grid grid-cols-3 gap-1 border border-border/40">
              <div className="text-green-600">
                Correct: <span className="font-mono">{correctCount}</span>
              </div>
              <div className="text-destructive">
                Wrong: <span className="font-mono">{wrongCount}</span>
              </div>
              <div className="text-muted-foreground">
                Skipped: <span className="font-mono">{skippedCount}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 border border-border/80 rounded-xl bg-card shadow-sm space-y-1">
          <span className="text-[9px] text-muted-foreground uppercase font-black tracking-wider">Time Spent</span>
          <div className="text-lg font-black font-mono text-foreground">{data.duration_minutes} Mins</div>
        </Card>
        <Card className="p-4 border border-border/80 rounded-xl bg-card shadow-sm space-y-1">
          <span className="text-[9px] text-muted-foreground uppercase font-black tracking-wider">Success Rate</span>
          <div className="text-lg font-black font-mono text-indigo-600">{percentage}%</div>
        </Card>
        <Card className="p-4 border border-border/80 rounded-xl bg-card shadow-sm space-y-1">
          <span className="text-[9px] text-muted-foreground uppercase font-black tracking-wider">Accuracy Rate</span>
          <div className="text-lg font-black font-mono text-emerald-600">{accuracy}%</div>
        </Card>
        <Card className="p-4 border border-border/80 rounded-xl bg-card shadow-sm space-y-1">
          <span className="text-[9px] text-muted-foreground uppercase font-black tracking-wider">Attempt Status</span>
          <div className="text-lg font-black text-foreground capitalize flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Completed
          </div>
        </Card>
      </div>

      {/* Questions Review */}
      <div className="space-y-4">
        <h3 className="text-sm font-black text-foreground flex items-center gap-2 border-b border-border/60 pb-2">
          <Activity className="w-4 h-4 text-primary" /> Detailed Response Review
        </h3>

        {mcqs.map((m: any, i: number) => {
          const userAns = answers[i];
          const isCorrect = userAns === m.correctIndex;
          const isSkipped = userAns === -1 || userAns === undefined || userAns === null;

          return (
            <Card key={i} className="border border-border/80 rounded-2xl overflow-hidden bg-card shadow-sm">
              <CardHeader className="bg-muted/10 border-b border-border/40 p-4 flex flex-row items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-foreground">Question {i + 1}</div>
                  <div className="text-[10px] text-muted-foreground capitalize">Topic: {m.topic || "Core Concept"} · Difficulty: {m.difficulty || "Medium"}</div>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  <span className="text-[10px] font-bold text-muted-foreground">Score: {isCorrect ? "1" : "0"} / 1 Mark</span>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold border uppercase ${
                    isCorrect
                      ? "bg-green-500/10 text-green-600 border-green-500/20"
                      : isSkipped
                      ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                      : "bg-destructive/10 text-destructive border-destructive/20"
                  }`}>
                    {isCorrect ? "Correct" : isSkipped ? "Skipped" : "Incorrect"}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <p className="text-xs font-bold text-foreground leading-relaxed">{m.question}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {m.options?.map((opt: string, oi: number) => {
                    const isUser = userAns === oi;
                    const isRight = m.correctIndex === oi;
                    
                    let borderStyle = "border-border/80 bg-card text-foreground/80";
                    if (isRight) {
                      borderStyle = "bg-green-500/10 border-green-500/40 text-green-700 font-bold";
                    } else if (isUser) {
                      borderStyle = "bg-red-500/10 border-red-300 text-destructive font-bold";
                    }

                    return (
                      <div key={oi} className={`p-3 border rounded-xl flex items-center gap-2 ${borderStyle}`}>
                        <span className="text-[10px] bg-muted/80 w-5 h-5 rounded-full flex items-center justify-center shrink-0 font-extrabold">{String.fromCharCode(65 + oi)}</span>
                        <span className="truncate">{opt}</span>
                        {isRight && <span className="ml-auto text-green-600 text-[10px]">✓ Correct Option</span>}
                        {isUser && !isRight && <span className="ml-auto text-destructive text-[10px]">✗ Your Choice</span>}
                      </div>
                    );
                  })}
                </div>

                {m.explanation && (
                  <div className="text-[11px] p-3 rounded-xl bg-muted/30 border border-border/40 text-muted-foreground leading-relaxed space-y-1">
                    <div className="font-bold text-foreground flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-primary" /> Explanation
                    </div>
                    <div>{m.explanation}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
