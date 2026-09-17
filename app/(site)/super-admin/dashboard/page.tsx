"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Users, 
  ShieldCheck, 
  Globe, 
  ArrowRight, 
  BookOpen, 
  FileText, 
  Award, 
  Activity, 
  TrendingUp, 
  Layers,
  Sparkles,
  Building2,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardService from "@/services/dashboard.service";

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState({
    totalStaff: 14,
    totalStudents: 56,
    verifiedDomains: 4,
    pendingStaffInvitations: 2,
    pendingStudentInvitations: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const data = await DashboardService.getStats();
      if (data) setStats(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    { label: "Onboarded Staff", count: stats.totalStaff, icon: Users, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Total Students", count: stats.totalStudents, icon: BookOpen, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Verified Domains", count: stats.verifiedDomains, icon: Globe, color: "text-indigo-500", bg: "bg-indigo-500/10" },
    { label: "Pending Staff Invites", count: stats.pendingStaffInvitations, icon: ShieldCheck, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Pending Student Invites", count: stats.pendingStudentInvitations, icon: ShieldCheck, color: "text-rose-500", bg: "bg-rose-500/10" }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="border-b border-border pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Super Admin Dashboard</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Overview of staff onboarding, students roster, and platform operations.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/super-admin/analytics">
            <Button variant="outline" size="sm" className="rounded-xl text-xs font-semibold gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-primary" /> View Analytics
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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

      {/* 4 Core Management Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Module 1: Manage Staff */}
        <div className="bg-card border border-border rounded-2xl shadow-sm p-6 flex flex-col justify-between space-y-4 hover:border-emerald-500/30 transition-all">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-emerald-500" />
            </div>
            <h3 className="font-bold text-base text-foreground">Manage Staff (HOD & TPO)</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Onboard and allocate Heads of Departments (HOD) and Training & Placement Officers (TPOs) across all academic departments.
            </p>
          </div>
          <Link href="/super-admin/hod-tpo">
            <Button size="sm" className="rounded-xl w-fit flex items-center gap-1 text-xs font-bold bg-primary text-primary-foreground">
              Manage Staff Directory <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>

        {/* Module 2: Manage Student */}
        <div className="bg-card border border-border rounded-2xl shadow-sm p-6 flex flex-col justify-between space-y-4 hover:border-blue-500/30 transition-all">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-blue-500" />
            </div>
            <h3 className="font-bold text-base text-foreground">Manage Students ({stats.totalStudents} Cohort)</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Browse 50+ students, filter by sections & graduation years, bulk import spreadsheets, and view individual profiles.
            </p>
          </div>
          <Link href="/super-admin/student">
            <Button size="sm" className="rounded-xl w-fit flex items-center gap-1 text-xs font-bold bg-primary text-primary-foreground">
              Manage Student Directory <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>

        {/* Module 3: HOD Activation */}
        <div className="bg-card border border-border rounded-2xl shadow-sm p-6 flex flex-col justify-between space-y-4 hover:border-amber-500/30 transition-all">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-amber-500" />
            </div>
            <h3 className="font-bold text-base text-foreground">HOD Department Activation</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Monitor real-time department and section-wise student enrollment & payment activation progress with 1-click batch activation.
            </p>
          </div>
          <Link href="/super-admin/hod-activation">
            <Button size="sm" className="rounded-xl w-fit flex items-center gap-1 text-xs font-bold bg-primary text-primary-foreground">
              View Activation Panel <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>

        {/* Module 4: TPO Verification */}
        <div className="bg-card border border-border rounded-2xl shadow-sm p-6 flex flex-col justify-between space-y-4 hover:border-indigo-500/30 transition-all">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
              <Award className="w-5 h-5 text-indigo-500" />
            </div>
            <h3 className="font-bold text-base text-foreground">TPO Placement Verification</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Pre-placement drive verification roster certifying student fee payment, active LMS licenses, and corporate drive eligibility.
            </p>
          </div>
          <Link href="/super-admin/tpo-verification">
            <Button size="sm" className="rounded-xl w-fit flex items-center gap-1 text-xs font-bold bg-primary text-primary-foreground">
              View Verification Roster <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}