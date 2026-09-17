"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  FileBarChart2, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Activity, 
  Award, 
  TrendingUp, 
  Zap, 
  ShieldAlert, 
  Layers,
  Users, 
  XCircle, 
  Clock, 
  RefreshCw,
  Radio,
  Wifi,
  Server,
  ChevronRight,
  Eye,
  GraduationCap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import HODService from "@/services/hod.service";
import { mockHodStore } from "@/lib/mockHodData";
import { toast } from "sonner";

export default function HODDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [topStudents, setTopStudents] = useState<any[]>([]);
  const [recentAttempts, setRecentAttempts] = useState<any[]>([]);

  const loadData = async () => {
    try {
      const res = await HODService.getDashboardStats();
      setStats(res.data.data);

      const attempts = mockHodStore.getAttempts();
      // Top 5 completed students by total_score
      const completed = attempts
        .filter(a => a.status === "completed")
        .sort((a, b) => b.total_score - a.total_score)
        .slice(0, 5);
      setTopStudents(completed);

      // 5 most recent attempts
      setRecentAttempts(attempts.slice(0, 6));
    } catch {
      toast.error("Failed to load dashboard metrics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const row1Cards = [
    { label: "Total Students", count: stats?.totalStudents ?? 56, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Total Exams", count: stats?.totalExams ?? 6, icon: FileText, color: "text-indigo-500", bg: "bg-indigo-500/10" },
    { label: "Completed Exams", count: stats?.completedExams ?? 2, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Upcoming Exams", count: stats?.upcomingExams ?? 3, icon: Activity, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Average Score", count: stats?.averageScore ?? "72.4", icon: TrendingUp, color: "text-rose-500", bg: "bg-rose-500/10" },
    { label: "Integrity Score", count: `${stats?.integrityScore ?? 92}%`, icon: ShieldAlert, color: "text-orange-500", bg: "bg-orange-500/10" }
  ];

  const row2Cards = [
    { label: "Pass Percentage", count: `${stats?.passPercentage ?? 78.6}%`, icon: Award, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Fail Percentage", count: `${stats?.failPercentage ?? 21.4}%`, icon: XCircle, color: "text-red-500", bg: "bg-red-500/10" },
    { label: "Highest Score", count: stats?.highestScore ?? "98.5", icon: Zap, color: "text-yellow-500", bg: "bg-yellow-500/10" },
    { label: "Lowest Score", count: stats?.lowestScore ?? "28.0", icon: Layers, color: "text-slate-500", bg: "bg-slate-500/10" },
    { label: "Average Attempt Time", count: `${stats?.avgAttemptTimeMinutes ?? 48}m`, icon: Clock, color: "text-cyan-500", bg: "bg-cyan-500/10" },
    { label: "Reattempt Rate", count: `${stats?.reattemptRate ?? 7.1}%`, icon: RefreshCw, color: "text-purple-500", bg: "bg-purple-500/10" }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header Panel */}
      <div className="border-b border-border pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">HOD Department Dashboard</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary/10 text-primary border border-primary/20">
              CSE Dept • 56 Students
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Department exam metrics, live concurrent examinees, integrity diagnostics, and student evaluations.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/hod/analytics/student-performance">
            <Button size="sm" variant="outline" className="rounded-xl flex items-center gap-1.5 text-xs font-semibold">
              <Users className="w-3.5 h-3.5" />
              <span>50+ Students Performance</span>
            </Button>
          </Link>
          <Link href="/hod/exams">
            <Button size="sm" className="rounded-xl flex items-center gap-1.5 text-xs font-semibold bg-primary text-white">
              <span>Manage Exams</span>
              <FileText className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Real-time Concurrency & Infrastructure Health Banner */}
      <Card className="bg-gradient-to-r from-primary/5 via-blue-500/5 to-emerald-500/5 border-primary/20 shadow-xs">
        <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary">
                <Radio className="w-6 h-6 animate-pulse" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-foreground">Live Assessment Concurrency</span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  SYSTEM ACTIVE
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                <strong className="text-foreground">{stats?.activeConcurrentStudents || 8} students</strong> actively taking exams in real-time. Peak concurrency recorded: <strong className="text-foreground">{stats?.peakConcurrency || 48} concurrent test-takers</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 divide-x divide-border/60 self-start md:self-auto text-xs">
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-muted-foreground block">Proctor Stream</span>
              <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
                <Wifi className="w-3.5 h-3.5" />
                <span>WebRTC 1080p (0 drops)</span>
              </div>
            </div>
            <div className="pl-6 space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-muted-foreground block">Exam Server Latency</span>
              <div className="flex items-center gap-1.5 text-foreground font-mono font-bold">
                <Server className="w-3.5 h-3.5 text-primary" />
                <span>18ms • Optimal</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Row 1: Overview KPIs */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Department Overview KPIs</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {row1Cards.map(item => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="bg-card border border-border p-5 rounded-2xl shadow-xs space-y-2 hover:border-primary/40 transition-colors">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">{item.label}</span>
                <div className="flex items-center justify-between">
                  {loading ? (
                    <div className="h-9 w-14 rounded bg-muted animate-pulse" />
                  ) : (
                    <span className="text-2xl font-extrabold tracking-tight font-mono">{item.count}</span>
                  )}
                  <div className={`w-8 h-8 rounded-xl ${item.bg} flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${item.color}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Row 2: Performance KPIs */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Assessment Performance KPIs</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {row2Cards.map(item => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="bg-card border border-border p-5 rounded-2xl shadow-xs space-y-2 hover:border-primary/40 transition-colors">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">{item.label}</span>
                <div className="flex items-center justify-between">
                  {loading ? (
                    <div className="h-9 w-14 rounded bg-muted animate-pulse" />
                  ) : (
                    <span className="text-2xl font-extrabold tracking-tight font-mono">{item.count}</span>
                  )}
                  <div className={`w-8 h-8 rounded-xl ${item.bg} flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${item.color}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Columns: Top Performers & Recent Attempts Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Top Department Performers */}
        <Card className="bg-card border-border shadow-xs">
          <CardHeader className="pb-3 border-b border-border/60">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-500" />
                  <span>Top Performing Candidates</span>
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">Highest scores in CS401 End-Term Assessment</CardDescription>
              </div>
              <Link href="/hod/reports">
                <Button variant="ghost" size="sm" className="text-xs text-primary font-semibold h-8 px-2">
                  <span>View All 56</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>

          <CardContent className="p-0 divide-y divide-border">
            {topStudents.map((att, idx) => (
              <div key={att.id} className="p-4 flex items-center justify-between gap-3 hover:bg-muted/20 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                    idx === 0 ? "bg-yellow-500/15 text-yellow-600 border border-yellow-500/30" :
                    idx === 1 ? "bg-slate-300/30 text-slate-700 border border-slate-400/30" :
                    idx === 2 ? "bg-amber-600/15 text-amber-700 border border-amber-600/30" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    #{idx + 1}
                  </div>
                  <div>
                    <span className="font-semibold text-foreground text-xs block">{att.student?.full_name}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">{att.student?.roll_number} • Section {att.student?.section}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-sm font-black text-foreground font-mono">{att.total_score} / 100</span>
                    <span className="text-[10px] text-emerald-600 block font-bold">Passed (99% int)</span>
                  </div>
                  <Link href={`/hod/reports/results/${att.id}`}>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-full hover:bg-muted">
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Card 2: Recent Attempts & Submissions Feed */}
        <Card className="bg-card border-border shadow-xs">
          <CardHeader className="pb-3 border-b border-border/60">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  <span>Recent Assessment Submissions</span>
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">Live examination submissions and integrity status</CardDescription>
              </div>
              <Link href="/hod/reports">
                <Button variant="ghost" size="sm" className="text-xs text-primary font-semibold h-8 px-2">
                  <span>Audit Feed</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>

          <CardContent className="p-0 divide-y divide-border">
            {recentAttempts.map((att) => (
              <div key={att.id} className="p-4 flex items-center justify-between gap-3 hover:bg-muted/20 transition-colors">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground text-xs">{att.student?.full_name}</span>
                    <span className={`px-2 py-0.2 rounded text-[10px] font-bold border ${
                      att.status === "completed" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                      att.status === "reassigned" ? "bg-amber-500/10 text-amber-600 border-amber-500/20" :
                      "bg-blue-500/10 text-blue-600 border-blue-500/20"
                    }`}>
                      {att.status}
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">
                    {att.exam_title}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs font-bold text-foreground font-mono">{att.total_score} pts</span>
                    <span className={`text-[10px] block font-medium ${att.integrity_score < 70 ? "text-destructive font-bold" : "text-muted-foreground"}`}>
                      {att.integrity_score}% integrity
                    </span>
                  </div>
                  <Link href={`/hod/reports/results/${att.id}`}>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-full hover:bg-muted">
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
