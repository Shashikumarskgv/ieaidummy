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
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardService from "@/services/dashboard.service";

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState({
    totalStaff: 0,
    totalStudents: 0,
    verifiedDomains: 0,
    pendingStaffInvitations: 0,
    pendingStudentInvitations: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const data = await DashboardService.getStats();
      setStats(data);
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
    { label: "Pending Staff Invitations", count: stats.pendingStaffInvitations, icon: ShieldCheck, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Pending Student Invitations", count: stats.pendingStudentInvitations, icon: ShieldCheck, color: "text-rose-500", bg: "bg-rose-500/10" }
  ];

  // College-Admin Consolidated Analytics
  const collegeAnalytics = {
    exams: {
      totalConducted: 14,
      totalSubmissions: 240,
      averageScore: 76,
      passRatio: 82
    },
    placements: {
      activeJobs: 8,
      placedRatio: 40,
      placedCount: 48,
      totalEligible: 120
    },
    engagement: [
      { role: "Heads of Department (HOD)", active: 4, count: 4 },
      { role: "Placement Officers (TPO)", active: 2, count: 2 },
      { role: "Students Portal Access", active: 112, count: 124 }
    ]
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="border-b border-border pb-6">
        <h1 className="text-2xl font-bold tracking-tight">Super Admin Dashboard</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Overview of staff onboarding, students and platform activity.</p>
      </div>

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-2xl shadow-sm p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-emerald-500" />
            </div>
            <h3 className="font-bold text-base text-foreground">Colleges Staff Management</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Onboard and allocate Heads of Departments (HOD) and Training & Placement Officers (TPOs) for each college.
            </p>
          </div>
          <Link href="/super-admin/hod-tpo">
            <Button size="sm" className="rounded-xl w-fit flex items-center gap-1 text-xs font-bold bg-primary text-primary-foreground">
              Manage Staff Directory<ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>

        <div className="bg-card border border-border rounded-2xl shadow-sm p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-indigo-500" />
            </div>
            <h3 className="font-bold text-base text-foreground">Student Management</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Bulk import student records, validate academic details and manage invitations.
            </p>
          </div>
          <Link href="/super-admin/student">
            <Button size="sm" className="rounded-xl w-fit flex items-center gap-1 text-xs font-bold bg-primary text-primary-foreground">
              Manage Student Directory<ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}