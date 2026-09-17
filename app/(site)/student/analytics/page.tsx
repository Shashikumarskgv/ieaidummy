"use client";

import React, { useEffect, useState } from "react";
import { 
  BarChart3, 
  Brain, 
  Target, 
  Sparkles, 
  TrendingUp, 
  Award, 
  CheckCircle2, 
  BookOpen 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProfileService from "@/services/profile.service";
import { toast } from "sonner";

export default function StudentAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const res = await ProfileService.getDashboardAnalytics();
      setAnalytics(res.data.data);
    } catch {
      toast.error("Failed to load interview analytics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const ia = analytics?.interviewAnalytics;
  const roleData = ia?.roleBased || { role: "Software Developer (SDE)", testsTaken: 4, avgScore: 84, status: "Ready" };
  const hrData = ia?.hrBased || { readinessPct: 88, completedTopics: ["Intro / Tell me about yourself", "STAR method", "Strengths & Weaknesses"] };
  const projData = ia?.projectBased || { projectsScanned: 2, techStackMatched: ["React", "Node.js", "MySQL", "TypeScript"] };
  const weakAreas = ia?.weakAreas || [
    { topic: "JavaScript Closures & Prototypical Chain", initialScore: 40, currentScore: 85, progress: 85 },
    { topic: "Time / Space Algorithm Analysis (QuickSort)", initialScore: 35, currentScore: 78, progress: 78 },
    { topic: "Database Indexes & Query Performance Tuning", initialScore: 50, currentScore: 80, progress: 80 }
  ];

  const skillsAnalysis = (projData.techStackMatched || ["React", "Node.js", "MySQL", "TypeScript"]).map((tech: string, i: number) => ({
    skill: tech,
    level: roleData.avgScore >= 80 ? "Advanced" : "Intermediate",
    pct: Math.min(100, Math.max(50, roleData.avgScore - (i * 4))),
    color: i % 2 === 0 ? "bg-emerald-500" : "bg-blue-500",
    text: i % 2 === 0 ? "text-emerald-500" : "text-blue-500"
  }));

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Title Header */}
      <div className="border-b border-border pb-4">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-primary" /> Interview & Preparation Analytics
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">Comprehensive insights into your SDE, Project and Behavioral interview preparedness.</p>
      </div>

      {/* Main Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border shadow-sm">
          <CardContent className="pt-6 space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Readiness Index</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-extrabold tracking-tight">{roleData.avgScore}%</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              </div>
            </div>
            <span className="text-[9px] text-emerald-600 font-bold block">{roleData.status} Status</span>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardContent className="pt-6 space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Projects Scanned</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-extrabold tracking-tight">{projData.projectsScanned}</span>
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Brain className="w-4 h-4 text-blue-500" />
              </div>
            </div>
            <span className="text-[9px] text-muted-foreground block">{projData.techStackMatched.length} Tech stack tags</span>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardContent className="pt-6 space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Mock Tests Taken</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-extrabold tracking-tight">{roleData.testsTaken}</span>
              <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                <Award className="w-4 h-4 text-indigo-500" />
              </div>
            </div>
            <span className="text-[9px] text-indigo-600 font-bold block">Avg Score: {roleData.avgScore}%</span>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardContent className="pt-6 space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">HR Behavioral Readiness</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-extrabold tracking-tight">{hrData.readinessPct}%</span>
              <div className="w-7 h-7 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Target className="w-4 h-4 text-orange-500" />
              </div>
            </div>
            <span className="text-[9px] text-orange-600 font-bold block">{hrData.completedTopics.length} Topics Completed</span>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Side: Skills Map */}
        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="border-b border-border/50 pb-3.5">
            <CardTitle className="text-sm font-bold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-500" /> Skills Evaluation Diagnostic
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            {skillsAnalysis.map((s: any, idx: number) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-foreground">{s.skill}</span>
                  <span className={`text-[10px] font-bold uppercase ${s.text}`}>{s.level} ({s.pct}%)</span>
                </div>
                <div className="w-full bg-border/40 rounded-full h-2">
                  <div className={`h-2 rounded-full ${s.color}`} style={{ width: `${s.pct}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Right Side: Weak Areas Progress Analysis */}
        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="border-b border-border/50 pb-3.5">
            <CardTitle className="text-sm font-bold flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-orange-500" /> Weak Areas Progression Logs
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {weakAreas.map((w: any, idx: number) => (
              <div key={idx} className="p-3 border border-border/60 rounded-xl flex items-center justify-between gap-4">
                <div className="space-y-0.5 min-w-0">
                  <div className="text-xs font-bold text-foreground truncate">{w.topic}</div>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span>Performance Score: <span className="font-bold text-foreground">{w.currentScore || w.score}%</span></span>
                    <span>&bull;</span>
                    <span className="text-emerald-600 font-semibold">{w.initialScore}% &rarr; {w.currentScore || w.score}%</span>
                  </div>
                </div>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded shrink-0 border bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                  Tracked
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* STAR HR Behavioral Analysis & Prep Metrics */}
      <Card className="bg-card border-border shadow-sm">
        <CardHeader className="border-b border-border/50 pb-3.5">
          <CardTitle className="text-sm font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Behavioral & HR Questions Completion Matrix
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted/40 rounded-xl space-y-2 border border-border/20">
              <div className="text-xs font-bold text-foreground">Situation & Task Outline</div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Evaluates your capability to isolate project roadblocks and define clear technical goals.
              </p>
              <div className="text-[10px] font-bold text-emerald-600 font-mono">{hrData.readinessPct}% Prepared</div>
            </div>

            <div className="p-4 bg-muted/40 rounded-xl space-y-2 border border-border/20">
              <div className="text-xs font-bold text-foreground">Action Descriptions</div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Measures descriptions of code commits, design patterns used, and team alignment efforts.
              </p>
              <div className="text-[10px] font-bold text-emerald-600 font-mono">{Math.max(60, hrData.readinessPct - 5)}% Prepared</div>
            </div>

            <div className="p-4 bg-muted/40 rounded-xl space-y-2 border border-border/20">
              <div className="text-xs font-bold text-foreground">Result Metrics</div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Tracks quantitative achievements, system improvements, and learnings from outcomes.
              </p>
              <div className="text-[10px] font-bold text-blue-600 font-mono">{Math.max(50, hrData.readinessPct - 10)}% Prepared</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
