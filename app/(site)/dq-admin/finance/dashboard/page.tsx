"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Users, 
  CreditCard, 
  DollarSign, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  RotateCcw, 
  Building2, 
  FileText, 
  ArrowUpRight, 
  ShieldCheck, 
  Award,
  RefreshCw,
  PieChart,
  BarChart3,
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import FinanceService from "@/services/finance.service";
import { toast } from "sonner";

export default function FinanceDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await FinanceService.getDashboardStats();
      setData(res.data.data);
    } catch (err: any) {
      toast.error(err?.message || "Failed to load finance dashboard stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const summary = data?.summary || {};
  const charts = data?.charts || {};

  const statCards = [
    { label: "Total Students", value: summary.total_students, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Activated Students", value: summary.activated_students, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Pending Payments", value: summary.pending_payments, icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Successful Payments", value: summary.successful_payments, icon: CreditCard, color: "text-indigo-500", bg: "bg-indigo-500/10" },
    { label: "Failed Payments", value: summary.failed_payments, icon: XCircle, color: "text-rose-500", bg: "bg-rose-500/10" },
    { label: "Refunded Payments", value: summary.refunded_payments, icon: RotateCcw, color: "text-gray-500", bg: "bg-gray-500/10" },
    { label: "Gross Revenue", value: `₹${summary.gross_revenue?.toLocaleString('en-IN')}`, icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-600/10" },
    { label: "DataQuotes Revenue", value: `₹${summary.dq_revenue?.toLocaleString('en-IN')}`, icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-600/10" },
    { label: "College Revenue", value: `₹${summary.college_revenue?.toLocaleString('en-IN')}`, icon: Building2, color: "text-cyan-600", bg: "bg-cyan-600/10" },
    { label: "Monthly Revenue", value: `₹${summary.monthly_revenue?.toLocaleString('en-IN')}`, icon: Calendar, color: "text-teal-600", bg: "bg-teal-600/10" },
    { label: "Today's Revenue", value: `₹${summary.today_revenue?.toLocaleString('en-IN')}`, icon: ArrowUpRight, color: "text-amber-600", bg: "bg-amber-600/10" },
    { label: "Settlement Pending", value: `₹${summary.settlement_pending?.toLocaleString('en-IN')}`, icon: Clock, color: "text-rose-600", bg: "bg-rose-600/10" },
    { label: "Settlement Completed", value: `₹${summary.settlement_completed?.toLocaleString('en-IN')}`, icon: ShieldCheck, color: "text-blue-600", bg: "bg-blue-600/10" },
    { label: "Active Licenses", value: summary.active_licenses, icon: Award, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Expired Licenses", value: summary.expired_licenses, icon: XCircle, color: "text-red-500", bg: "bg-red-500/10" }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <DollarSign className="w-8 h-8 text-primary shrink-0" />
            Finance & Revenue Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Real-time financial performance, revenue shares, settlements, and platform access metrics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadData} className="rounded-xl gap-2 text-xs font-semibold">
            <RefreshCw className="w-4 h-4" /> Refresh Data
          </Button>
          <Link href="/dq-admin/finance/transactions">
            <Button size="sm" className="rounded-xl gap-2 text-xs font-semibold">
              <FileText className="w-4 h-4" /> View Transactions
            </Button>
          </Link>
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="bg-card border border-border rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">{card.label}</span>
                <div className={`w-9 h-9 rounded-xl ${card.bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-xl font-bold text-foreground tracking-tight">{card.value}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Visual Charts & Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Chart */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" /> Monthly Revenue Trend (₹)
            </h3>
            <span className="text-xs font-semibold text-muted-foreground">Gross vs DQ vs College Share</span>
          </div>

          <div className="space-y-2.5 pt-2 max-h-[280px] overflow-y-auto pr-1">
            {(charts.monthly_revenue || []).map((m: any, i: number) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-foreground">{m.month}</span>
                  <span className="text-muted-foreground">Gross: ₹{m.gross?.toLocaleString('en-IN')} (DQ: ₹{m.dqShare?.toLocaleString('en-IN')})</span>
                </div>
                <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden flex">
                  <div className="bg-purple-500 h-full transition-all" style={{ width: `${m.gross > 0 ? Math.min(100, (m.dqShare / m.gross) * 100) : 0}%` }} />
                  <div className="bg-cyan-500 h-full transition-all" style={{ width: `${m.gross > 0 ? Math.min(100, (m.collegeShare / m.gross) * 100) : 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Collections Chart */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" /> Daily Collections (Last 7 Days)
            </h3>
            <span className="text-xs font-semibold text-muted-foreground">Daily Run Rate</span>
          </div>

          <div className="grid grid-cols-7 gap-2 pt-6 items-end h-44">
            {(() => {
              const collections = charts.daily_collections || [];
              const maxAmount = Math.max(10, ...collections.map((c: any) => c.amount || 0));
              return collections.map((d: any, i: number) => {
                const heightPx = d.amount > 0 ? Math.max(16, Math.min(120, (d.amount / maxAmount) * 120)) : 6;
                const formattedAmount = d.amount >= 1000 ? `₹${(d.amount / 1000).toFixed(1)}k` : `₹${d.amount}`;
                return (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <span className="text-[10px] font-bold text-primary">{formattedAmount}</span>
                    <div 
                      className={`w-full rounded-t-lg transition-all ${d.amount > 0 ? 'bg-primary hover:bg-primary/80' : 'bg-muted'}`} 
                      style={{ height: `${heightPx}px` }} 
                    />
                    <span className="text-[11px] font-semibold text-muted-foreground">{d.day}</span>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      </div>

      {/* Recent Activity Ledger Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-primary" /> Recent Transactions
            </h3>
            <Link href="/dq-admin/finance/transactions" className="text-xs font-bold text-primary hover:underline">
              View All →
            </Link>
          </div>

          <div className="space-y-3">
            {(data?.recent_transactions || []).map((t: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-3 bg-muted/20 border border-border/60 rounded-xl text-xs">
                <div>
                  <div className="font-bold text-foreground">{t.student_name}</div>
                  <div className="text-muted-foreground text-[11px]">{t.college_name} · {t.department}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-emerald-600">₹{t.total_amount?.toLocaleString('en-IN')}</div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 capitalize">
                    {t.payment_status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Settlements */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <Building2 className="w-4 h-4 text-cyan-500" /> Recent College Settlements
            </h3>
            <Link href="/dq-admin/finance/settlements" className="text-xs font-bold text-primary hover:underline">
              View All →
            </Link>
          </div>

          <div className="space-y-3">
            {(data?.recent_settlements || []).map((s: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-3 bg-muted/20 border border-border/60 rounded-xl text-xs">
                <div>
                  <div className="font-bold text-foreground">{s.college_name || `College #${s.college_id}`}</div>
                  <div className="text-muted-foreground text-[11px]">Month: {s.month_key} · Ref: {s.reference_number || 'N/A'}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-cyan-600">₹{Number(s.net_settlement)?.toLocaleString('en-IN')}</div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 capitalize">
                    {s.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
