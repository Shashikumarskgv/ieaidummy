"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Briefcase, 
  User, 
  Award, 
  CheckCircle, 
  ArrowRight, 
  ArrowUpRight, 
  Brain, 
  TrendingUp, 
  Sparkles,
  BookOpen,
  Activity,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import JobsService from "@/services/jobs.service";
import ProfileService from "@/services/profile.service";
import AuthService from "@/services/auth.service";
import { toast } from "sonner";

export default function StudentDashboard() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>({});
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const user = AuthService.getCurrentUser();

  const loadData = async () => {
    try {
      if (!user) return;
      
      const [profileRes, jobsRes, analyticsRes] = await Promise.all([
        ProfileService.getById(user.id),
        JobsService.getStudentJobs(),
        ProfileService.getDashboardAnalytics()
      ]);

      setProfile(profileRes.data.data || {});
      setJobs(jobsRes.data.data || []);
      setAnalytics(analyticsRes.data.data || null);
    } catch {
      toast.error("Failed to load dashboard analytics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const appliedJobs = jobs.filter(j => j.application_status === "applied");
  const savedJobs = jobs.filter(j => j.application_status === "saved");

  const cards = [
    { label: "Applied Roles", count: analytics?.appliedCount ?? appliedJobs.length, icon: Briefcase, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Bookmarked Positions", count: analytics?.savedCount ?? savedJobs.length, icon: Briefcase, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Earned Points", count: analytics?.earnedPoints ?? (profile.earned_points || 0), icon: Award, color: "text-indigo-500", bg: "bg-indigo-500/10" },
    { label: "Profile Status", count: analytics?.placementStatus ?? (profile.placement_status || "Eligible"), icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-500/10" }
  ];

  // Dynamic Interview Preparation Analytics
  const interviewAnalytics = analytics?.interviewAnalytics || {
    hasStarted: false,
    roleBased: {
      role: profile.target_role || `${profile.department || 'Software'} Developer (SDE)`,
      testsTaken: 0,
      avgScore: 0,
      status: "Analytics not started",
      breakdown: { fundamentals: 0, advanced: 0, systemDesign: 0 }
    },
    projectBased: {
      projectsScanned: 0,
      evaluation: "Analytics not started. Complete practice tests to generate metrics.",
      techStackMatched: []
    },
    hrBased: {
      readinessPct: 0,
      completedTopics: []
    },
    weakAreas: []
  };

  const getRecommendedJobs = () => {
    if (!profile) return [];
    
    let studentSkills: string[] = [];
    try {
      studentSkills = typeof profile.skills === "string" ? JSON.parse(profile.skills) : (profile.skills || []);
    } catch (e) {
      studentSkills = [];
    }
    const cleanStudentSkills = studentSkills.map((s: string) => s.trim().toLowerCase());
    const studentRole = (profile.target_role || "").trim().toLowerCase();

    return jobs.filter(job => {
      const matchesRole = studentRole && job.role.toLowerCase().includes(studentRole);
      const matchesSkills = (job.skills || []).some((skill: string) => 
        cleanStudentSkills.includes(skill.trim().toLowerCase())
      );
      return matchesRole || matchesSkills;
    });
  };

  const recJobs = getRecommendedJobs();
  const recentJobs = jobs.slice(0, 3);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="border-b border-border pb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Student Dashboard</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Welcome back, {profile.name || "Student"}! Track your job applications and placement scores.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/student/profile">
            <Button size="sm" variant="outline" className="rounded-xl flex items-center gap-1.5 text-xs font-semibold">
              <span>My Profile</span>
              <User className="w-3.5 h-3.5" />
            </Button>
          </Link>
          <Link href="/student/jobs">
            <Button size="sm" className="rounded-xl flex items-center gap-1.5 text-xs font-semibold bg-primary text-white">
              <span>Browse Openings</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(item => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="bg-card border border-border p-5 rounded-2xl shadow-sm space-y-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">{item.label}</span>
              <div className="flex items-center justify-between">
                {loading ? (
                  <div className="h-9 w-14 rounded bg-muted animate-pulse" />
                ) : (
                  <span className="text-3xl font-extrabold tracking-tight font-mono">{item.count}</span>
                )}
                <div className={`w-8 h-8 rounded-xl ${item.bg} flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${item.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* --- Interview Preparation Analytics Panel Section (Dynamic) --- */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-border/60 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-base text-foreground">Interview Preparation Analytics</h3>
              <p className="text-[11px] text-muted-foreground">Self-assessment and practices statistics dashboard</p>
            </div>
          </div>
          <Link href="/student/interview">
            <Button size="sm" variant="outline" className="h-8 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
              <span>Practice Portal</span>
              <ArrowUpRight className="w-3 h-3" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Section 1: Role Based & Project Based Analytics */}
          <div className="space-y-6 lg:border-r lg:border-border/60 lg:pr-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-blue-500" /> Role-Based Prep Status
                </span>
                <span className="text-[10px] bg-blue-500/10 text-blue-600 px-2 py-0.5 rounded-full font-bold uppercase">
                  {interviewAnalytics.roleBased.status}
                </span>
              </div>
              <div className="bg-muted/40 p-4 rounded-xl space-y-2 border border-border/20">
                <div className="text-xs font-bold">{interviewAnalytics.roleBased.role}</div>
                <div className="grid grid-cols-2 gap-2 pt-1.5">
                  <div className="text-center bg-card p-2 rounded-lg border border-border/10">
                    <div className="text-[10px] text-muted-foreground">Tests Taken</div>
                    <div className="text-lg font-extrabold text-foreground">{interviewAnalytics.roleBased.testsTaken}</div>
                  </div>
                  <div className="text-center bg-card p-2 rounded-lg border border-border/10">
                    <div className="text-[10px] text-muted-foreground">Average Score</div>
                    <div className="text-lg font-extrabold text-foreground">{interviewAnalytics.roleBased.avgScore}%</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-500" /> Project-Based Metrics
              </span>
              <div className="bg-muted/40 p-4 rounded-xl space-y-2.5 border border-border/20">
                <div className="text-[11px] text-muted-foreground italic leading-relaxed">
                  "{interviewAnalytics.projectBased.evaluation}"
                </div>
                <div className="flex flex-wrap gap-1">
                  {interviewAnalytics.projectBased.techStackMatched.map((tech: string) => (
                    <span key={tech} className="text-[9px] font-bold bg-purple-500/10 text-purple-600 px-2 py-0.5 rounded border border-purple-500/20">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: HR Behavioral Metrics */}
          <div className="space-y-6 lg:border-r lg:border-border/60 lg:pr-6">
            <div className="space-y-3">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-green-500" /> HR / Behavioral Score
              </span>
              <div className="bg-muted/40 p-4 rounded-xl space-y-4 border border-border/20">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">Behavioral Readiness</span>
                  <span className="text-sm font-extrabold font-mono text-emerald-600">{interviewAnalytics.hrBased.readinessPct}%</span>
                </div>
                <div className="w-full bg-border/40 rounded-full h-2">
                  <div 
                    className="bg-emerald-500 h-2 rounded-full transition-all" 
                    style={{ width: `${interviewAnalytics.hrBased.readinessPct}%` }}
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Completed Outline Topics</div>
                  <div className="space-y-1">
                    {interviewAnalytics.hrBased.completedTopics.map((topic: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-1.5 text-xs">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                        <span className="text-muted-foreground text-[11px] leading-tight">{topic}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Weak Areas Mapped & Diagnostics */}
          <div className="space-y-3">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-orange-500" /> Weak Area Diagnostics Mapped
            </span>
            <div className="bg-muted/40 p-4 rounded-xl space-y-4 border border-border/20">
              {interviewAnalytics.weakAreas.map((area: any, idx: number) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[11px] font-medium text-foreground truncate max-w-[170px]">{area.topic}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {area.initialScore}% &rarr; <span className="font-bold text-orange-600">{area.currentScore}%</span>
                    </span>
                  </div>
                  <div className="w-full bg-border/40 rounded-full h-1.5">
                    <div 
                      className="bg-orange-500 h-1.5 rounded-full transition-all" 
                      style={{ width: `${area.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Recommended Jobs */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" /> Recommended Jobs
          </h3>
          {loading ? (
            <div className="h-20 w-full bg-muted animate-pulse rounded-lg" />
          ) : recJobs.length > 0 ? (
            <div className="space-y-3">
              {recJobs.slice(0, 3).map(j => (
                <div key={j.id} className="flex justify-between items-center p-3.5 border border-border/80 rounded-xl hover:border-primary/20 transition-all">
                  <div>
                    <h4 className="font-semibold text-xs truncate max-w-[140px]">{j.role}</h4>
                    <p className="text-[10px] text-muted-foreground">{j.company}</p>
                  </div>
                  <Link href="/student/jobs">
                    <Button size="sm" variant="outline" className="h-7 text-[10px] font-bold rounded-lg px-2">Apply</Button>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground text-xs italic">
              No recommended jobs matching your profile.
            </div>
          )}
        </div>

        {/* Recent Openings */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-foreground flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-blue-500" /> Recent Openings
          </h3>
          {loading ? (
            <div className="h-20 w-full bg-muted animate-pulse rounded-lg" />
          ) : recentJobs.length > 0 ? (
            <div className="space-y-3">
              {recentJobs.slice(0, 3).map(j => (
                <div key={j.id} className="flex justify-between items-center p-3.5 border border-border/80 rounded-xl hover:border-primary/20 transition-all">
                  <div>
                    <h4 className="font-semibold text-xs truncate max-w-[140px]">{j.role}</h4>
                    <p className="text-[10px] text-muted-foreground">{j.company}</p>
                  </div>
                  <Link href="/student/jobs">
                    <Button size="sm" variant="outline" className="h-7 text-[10px] font-bold rounded-lg px-2">View</Button>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground text-xs italic">
              No recent jobs available.
            </div>
          )}
        </div>

        {/* Applied jobs log */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-foreground flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> My Applications
          </h3>
          {loading ? (
            <div className="h-20 w-full bg-muted animate-pulse rounded-lg" />
          ) : appliedJobs.length > 0 ? (
            <div className="space-y-3">
              {appliedJobs.slice(0, 3).map(j => (
                <div key={j.id} className="flex justify-between items-center p-3.5 border border-border/80 rounded-xl hover:border-primary/20 transition-all">
                  <div>
                    <h4 className="font-semibold text-xs truncate max-w-[140px]">{j.role}</h4>
                    <p className="text-[10px] text-muted-foreground">{j.company}</p>
                  </div>
                  <span className="text-[9px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Applied
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground text-xs italic">
              You haven't applied to any job openings yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
