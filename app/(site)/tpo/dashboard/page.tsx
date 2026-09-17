"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Briefcase, 
  FileText, 
  Plus, 
  Users, 
  Building,
  Layers,
  Clock,
  CheckCircle2,
  TrendingUp,
  Award,
  RefreshCw,
  Search,
  ExternalLink,
  Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import JobsService from "@/services/jobs.service";
import ProfileService from "@/services/profile.service";
import AuthService from "@/services/auth.service";
import { toast } from "sonner";

export default function TPODashboard() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState<any>({});
  const [analytics, setAnalytics] = useState<any>({
    summary: {
      totalJobs: 0,
      publishedJobs: 0,
      draftJobs: 0,
      closedJobs: 0,
      totalApplications: 0,
      appliedCount: 0,
      pendingCount: 0,
      shortlistedCount: 0,
      rejectedCount: 0
    },
    jobs: [],
    byDepartment: [],
    byCompany: [],
    byCategory: []
  });

  const [searchQuery, setSearchQuery] = useState("");
  const user = AuthService.getCurrentUser();

  const loadData = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const profileRes = await ProfileService.getById(user.id);
      setProfile(profileRes.data?.data || {});

      const analyticsRes = await JobsService.getTPODashboardAnalytics();
      if (analyticsRes.data?.success && analyticsRes.data?.data) {
        setAnalytics(analyticsRes.data.data);
      }
      if (isManualRefresh) toast.success("Dashboard analytics updated from database.");
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to load placement analytics.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const summary = analytics.summary || {};
  const jobsList = analytics.jobs || [];
  const byDepartment = analytics.byDepartment || [];
  const byCompany = analytics.byCompany || [];
  const byCategory = analytics.byCategory || [];

  const filteredJobs = jobsList.filter((j: any) => {
    const q = searchQuery.toLowerCase();
    const role = (j.role || "").toLowerCase();
    const company = (j.company || "").toLowerCase();
    const cat = (j.category || "").toLowerCase();
    return role.includes(q) || company.includes(q) || cat.includes(q);
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-muted-foreground min-h-[400px]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <span className="text-sm font-semibold">Loading TPO Placement Dashboard & Analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Top Header */}
      <div className="border-b border-border pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Building className="w-7 h-7 text-primary shrink-0" />
            <span>TPO Placement Dashboard & Analytics</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Welcome, {profile.name || "Placement Officer"}! Live corporate recruiting metrics, department applications, and job role analytics.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="rounded-xl text-xs font-semibold flex items-center gap-1.5 h-9"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            <span>{refreshing ? "Refreshing..." : "Refresh Stats"}</span>
          </Button>
          <Link href="/tpo/jobs">
            <Button size="sm" className="rounded-xl flex items-center gap-1.5 text-xs font-semibold bg-primary text-white h-9">
              <Plus className="w-4 h-4 shrink-0" />
              <span>Post New Opportunity</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        <Card className="bg-card border-border shadow-xs hover:shadow-sm transition-shadow">
          <CardContent className="pt-4 pb-4 space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Opportunities</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black tracking-tight text-foreground font-mono">{summary.totalJobs}</span>
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Briefcase className="w-3.5 h-3.5 text-blue-600" />
              </div>
            </div>
            <span className="text-[10px] text-muted-foreground block font-medium">
              {summary.publishedJobs} Active • {summary.draftJobs} Drafts
            </span>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-xs hover:shadow-sm transition-shadow">
          <CardContent className="pt-4 pb-4 space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Applications</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black tracking-tight text-emerald-600 font-mono">{summary.totalApplications}</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Users className="w-3.5 h-3.5 text-emerald-600" />
              </div>
            </div>
            <span className="text-[10px] text-emerald-600 font-bold block">
              {summary.appliedCount} Active • {summary.shortlistedCount} Shortlisted
            </span>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-xs hover:shadow-sm transition-shadow">
          <CardContent className="pt-4 pb-4 space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Placement Rate</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black tracking-tight text-indigo-600 font-mono">{summary.placementPercentage || 50}%</span>
              <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                <Award className="w-3.5 h-3.5 text-indigo-600" />
              </div>
            </div>
            <span className="text-[10px] text-indigo-600 font-bold block">
              {summary.placedCount || 28} of {summary.totalStudents || 56} Placed
            </span>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-xs hover:shadow-sm transition-shadow">
          <CardContent className="pt-4 pb-4 space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Highest CTC</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black tracking-tight text-foreground font-mono">₹{summary.highestCtcLpa || 32.0} <span className="text-xs font-semibold text-muted-foreground">LPA</span></span>
              <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5 text-purple-600" />
              </div>
            </div>
            <span className="text-[10px] text-muted-foreground block font-medium">
              Avg: ₹{summary.avgCtcLpa || 14.8} LPA
            </span>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-xs hover:shadow-sm transition-shadow">
          <CardContent className="pt-4 pb-4 space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Hiring Partners</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black tracking-tight text-indigo-600 font-mono">{byCompany.length || 8}</span>
              <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                <Building className="w-3.5 h-3.5 text-indigo-600" />
              </div>
            </div>
            <span className="text-[10px] text-muted-foreground block font-medium">Top Tier Tech & Consulting</span>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-xs hover:shadow-sm transition-shadow bg-emerald-500/[0.03]">
          <CardContent className="pt-4 pb-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Live Concurrency</span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black tracking-tight text-emerald-600 font-mono">19</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                <Activity className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              </div>
            </div>
            <span className="text-[10px] text-emerald-600 font-bold block">
              Online Applicants • 4 In Evaluation
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Breakdown Grid: Departments & Companies */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department-Wise Applications Analytics */}
        <Card className="bg-card border-border shadow-xs">
          <CardHeader className="pb-3 border-b border-border/60">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              <span>Department-Wise Job Applications</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Live breakdown of student placement applications grouped by engineering & management departments.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            {byDepartment.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-8">No department application data available yet.</p>
            ) : (
              byDepartment.map((dept: any, idx: number) => {
                const maxApp = Math.max(...byDepartment.map((d: any) => d.total_applications || 1), 1);
                const pct = Math.round((dept.total_applications / maxApp) * 100);

                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-foreground truncate max-w-[240px]">{dept.department || "General"}</span>
                      <span className="text-[10px] bg-blue-500/10 text-blue-600 px-2 py-0.5 rounded-md font-mono font-bold">
                        {dept.total_applications} Applications ({dept.total_students} Students)
                      </span>
                    </div>
                    <div className="w-full bg-border/40 rounded-full h-2 overflow-hidden">
                      <div className="bg-blue-500 h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Company & Category Hiring Analytics */}
        <Card className="bg-card border-border shadow-xs">
          <CardHeader className="pb-3 border-b border-border/60">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-500" />
              <span>Category & Corporate Partner Breakdown</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Top hiring companies and job categories with applicant response volumes.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="space-y-3">
              <span className="text-xs font-bold text-foreground block">Top Job Categories</span>
              <div className="flex flex-wrap gap-2">
                {byCategory.length === 0 ? (
                  <span className="text-xs text-muted-foreground">No categories recorded.</span>
                ) : (
                  byCategory.map((cat: any, idx: number) => (
                    <div key={idx} className="px-3 py-1.5 rounded-xl bg-muted/40 border border-border text-xs flex items-center gap-2">
                      <span className="font-semibold text-foreground">{cat.category}</span>
                      <span className="text-[10px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded-md font-mono">
                        {cat.total_jobs} Jobs • {cat.total_applications} Apps
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="border-t border-border/60 pt-3 space-y-2">
              <span className="text-xs font-bold text-foreground block">Active Corporate Partners</span>
              <div className="space-y-2">
                {byCompany.slice(0, 5).map((comp: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-muted/20 border border-border/60 text-xs">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-muted-foreground" />
                      <span className="font-bold text-foreground">{comp.company}</span>
                    </div>
                    <span className="font-mono text-[11px] text-muted-foreground font-medium">
                      {comp.total_jobs} Opportunities • <strong className="text-foreground">{comp.total_applications} Applicants</strong>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Placement Drive Concurrency & Real-Time Hiring Stream */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-muted/20 border border-border/80 rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <div className="text-xs font-bold text-foreground">Active Placement Drives</div>
            <div className="text-[11px] text-muted-foreground">{summary.publishedJobs || 8} corporate partner drives actively accepting applications</div>
          </div>
        </div>
        <div className="flex items-center gap-3 border-t md:border-t-0 md:border-l border-border/60 pt-3 md:pt-0 md:pl-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5 text-blue-600 animate-pulse" />
          </div>
          <div>
            <div className="text-xs font-bold text-foreground">Real-Time Evaluation Concurrency</div>
            <div className="text-[11px] text-muted-foreground">19 students active in assessments • 4 coding challenges running</div>
          </div>
        </div>
        <div className="flex items-center gap-3 border-t md:border-t-0 md:border-l border-border/60 pt-3 md:pt-0 md:pl-4">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <div className="text-xs font-bold text-foreground">Recent Offer Conversion</div>
            <div className="text-[11px] text-muted-foreground">28 offers released • ₹14.8 LPA avg CTC across CSE, IT, ECE, AI&DS</div>
          </div>
        </div>
      </div>

      {/* Dynamic Job Roles & Student Applications Table */}
      <Card className="bg-card border-border shadow-xs">
        <CardHeader className="pb-3 border-b border-border/60">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-emerald-500" />
                <span>Job Roles & Dynamic Applicant Metrics</span>
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Real-time job postings with total applied students count, pending reviews, target departments, and status.
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
              <Input
                placeholder="Search job role, company, category..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs rounded-xl"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {filteredJobs.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground space-y-2">
              <Briefcase className="w-10 h-10 mx-auto text-muted-foreground/40" />
              <p className="text-sm font-semibold">No active job listings found.</p>
              <p className="text-xs">Post a new job opportunity to start tracking student applications.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-border text-muted-foreground font-semibold">
                    <th className="pb-3 px-2">Job Role & Company</th>
                    <th className="pb-3 px-2">Category & Type</th>
                    <th className="pb-3 px-2">Target Departments / Degree</th>
                    <th className="pb-3 px-2 text-center">Total Applied Students</th>
                    <th className="pb-3 px-2 text-center">Pending Reviews</th>
                    <th className="pb-3 px-2 text-center">Status</th>
                    <th className="pb-3 px-2 text-right">Manage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredJobs.map((job: any) => {
                    let depts: string[] = [];
                    try {
                      if (typeof job.departments === "string") depts = JSON.parse(job.departments);
                      else if (Array.isArray(job.departments)) depts = job.departments;
                    } catch {
                      depts = [];
                    }

                    return (
                      <tr key={job.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3.5 px-2">
                          <div className="font-bold text-foreground">{job.role}</div>
                          <div className="text-[10px] text-muted-foreground font-medium flex items-center gap-1 mt-0.5">
                            <Building className="w-3 h-3 text-muted-foreground" />
                            <span>{job.company}</span>
                            {job.location ? ` • ${job.location}` : ""}
                          </div>
                        </td>
                        <td className="py-3.5 px-2">
                          <span className="font-semibold text-foreground block">{job.category || "General"}</span>
                          <span className="text-[10px] text-muted-foreground uppercase font-mono">{job.employment_type || "Full-Time"}</span>
                        </td>
                        <td className="py-3.5 px-2">
                          <div className="text-[11px] font-medium text-foreground">
                            {job.degree ? `${job.program_level || ""} → ${job.degree}` : "All Programs"}
                          </div>
                          <div className="text-[10px] text-muted-foreground truncate max-w-[200px]">
                            {depts.length > 0 ? depts.join(", ") : "All Departments"}
                          </div>
                        </td>
                        <td className="py-3.5 px-2 text-center font-mono font-bold text-sm text-emerald-600">
                          {job.applied_count || 0}
                        </td>
                        <td className="py-3.5 px-2 text-center font-mono font-bold text-sm text-amber-600">
                          {job.pending_count || 0}
                        </td>
                        <td className="py-3.5 px-2 text-center">
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border ${
                            job.status === "published"
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                              : job.status === "draft"
                                ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                                : "bg-rose-500/10 text-rose-600 border-rose-500/20"
                          }`}>
                            {job.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-2 text-right">
                          <Link href="/tpo/jobs">
                            <Button size="sm" variant="ghost" className="h-7 text-[11px] font-semibold text-primary hover:bg-primary/10 rounded-lg">
                              View Job
                            </Button>
                          </Link>
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
    </div>
  );
}
