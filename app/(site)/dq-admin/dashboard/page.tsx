"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { GraduationCap, Users, ShieldCheck, ArrowRight, Activity, Calendar } from "lucide-react";
import { getStats } from "@/services/stats.services";

export default function DashboardHome() {
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    inactive: 0
  });

  useEffect(() => {
    const fetchStatsData = async () => {
      try {
        const res = await getStats();

        if (res?.data) {
          setStats({
            total: res.data.totalInstitutes ?? 0,
            active: res.data.activeColleges ?? 0,
            pending: res.data.pendingAction ?? 0,
            inactive: res.data.inactiveSuspended ?? 0,
          });
        }
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      }
    };

    fetchStatsData();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome to DQ Admin</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Platform orchestration and institutional onboarding control center.
        </p>
      </div>

      {/* Quick Overview Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Total Institutions</span>
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-primary" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold">{stats.total}</span>
            <span className="text-xs text-emerald-500 block mt-1 font-medium">Active registered entities</span>
          </div>
        </div>

        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Active Colleges</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-emerald-500">{stats.active}</span>
            <span className="text-xs text-muted-foreground block mt-1">Onboarded & verified</span>
          </div>
        </div>

        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Pending Action</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Activity className="w-4 h-4 text-amber-500" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-amber-500">{stats.pending}</span>
            <span className="text-xs text-muted-foreground block mt-1">Awaiting email verification</span>
          </div>
        </div>

        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Inactive / Paused</span>
            <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
              <Users className="w-4 h-4 text-destructive" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-destructive">{stats.inactive}</span>
            <span className="text-xs text-muted-foreground block mt-1">Access suspended</span>
          </div>
        </div>
      </div>

      {/* Navigation Shortcuts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Link href="/dq-admin/college/create" className="group block bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-8 rounded-3xl shadow-lg relative overflow-hidden transition-all duration-300 hover:scale-[1.01] hover:shadow-indigo-500/20">
          <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-4 -translate-y-4">
            <GraduationCap className="w-48 h-48" />
          </div>
          <div className="relative z-10 space-y-6">
            <div>
              <span className="bg-white/20 text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-wider">Onboarding System</span>
              <h2 className="text-2xl font-bold mt-4">College Management</h2>
              <p className="text-white/80 text-sm mt-2 max-w-sm">
                Register new institutions, verify domains, manage student capacities, and audit live logs.
              </p>
            </div>
            <div className="flex items-center gap-2 font-medium text-sm pt-4">
              <span>Go to Onboarding</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Link>

        <div className="bg-card border border-border p-8 rounded-3xl shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-xl font-bold">System Status: All systems operational</h2>
            <p className="text-muted-foreground text-sm">
              All Supabase functions, authentication routers, and educational telemetry dashboards are working normally.
            </p>
          </div>
          <div className="border-t border-border pt-6 mt-6 flex items-center justify-between text-xs text-muted-foreground">
            <span>Last checked: Just now</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              Operational
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
