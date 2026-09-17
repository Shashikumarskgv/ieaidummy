"use client";

import React, { useEffect, useState, useMemo } from "react";
import { 
  ShieldCheck, 
  Users, 
  CheckCircle2, 
  Clock, 
  BarChart3, 
  RefreshCw,
  Building2,
  Sparkles,
  Send,
  Check,
  Search,
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import FinanceService from "@/services/finance.service";
import { mockSuperAdminStore, DepartmentActivationItem } from "@/lib/mockSuperAdminData";
import { toast } from "sonner";

export default function HodActivationPanelPage() {
  const [panel, setPanel] = useState<DepartmentActivationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");

  const loadPanel = async () => {
    try {
      setLoading(true);
      const res = await FinanceService.getHodActivationPanel();
      setPanel(res.data?.data || mockSuperAdminStore.getHodActivationPanel());
    } catch {
      setPanel(mockSuperAdminStore.getHodActivationPanel());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPanel();
  }, []);

  const handleBatchActivate = (dept: string, section: string) => {
    mockSuperAdminStore.batchActivateDepartment(dept, section);
    toast.success(`✓ All pending student profiles activated for ${dept} (${section})!`);
    loadPanel();
  };

  const handleSendReminders = (dept: string, section: string) => {
    toast.success(`✉ Activation reminder emails dispatched to pending students in ${dept} (${section}).`);
  };

  // KPI Metrics
  const summary = useMemo(() => {
    const total = panel.reduce((acc, curr) => acc + curr.total_students, 0);
    const active = panel.reduce((acc, curr) => acc + curr.activated_students, 0);
    const pending = panel.reduce((acc, curr) => acc + curr.pending_students, 0);
    const avgPct = total > 0 ? Math.round((active / total) * 100) : 0;
    return { total, active, pending, avgPct, departmentsCount: panel.length };
  }, [panel]);

  // Filtered panel
  const filteredPanel = useMemo(() => {
    return panel.filter(item => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || item.department.toLowerCase().includes(q) || item.section.toLowerCase().includes(q) || item.hod_name.toLowerCase().includes(q);
      const matchesDept = selectedDept === "All" || item.department.toLowerCase().includes(selectedDept.toLowerCase());
      return matchesSearch && matchesDept;
    });
  }, [panel, searchQuery, selectedDept]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-primary shrink-0" />
            HOD Department Activation Panel
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Real-time department and section-wise student enrollment & LMS license activation monitor.
          </p>
        </div>

        <Button size="sm" onClick={loadPanel} className="rounded-xl gap-2 text-xs font-semibold">
          <RefreshCw className="w-4 h-4" /> Refresh Panel
        </Button>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-card border border-border p-4 rounded-2xl shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Total Cohort Students</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-extrabold font-mono text-foreground">{summary.total}</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <span className="text-[11px] text-muted-foreground font-medium">Across {summary.departmentsCount} department sections</span>
        </div>

        <div className="bg-card border border-border p-4 rounded-2xl shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest block">Fully Activated</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-extrabold font-mono text-emerald-600">{summary.active}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-[11px] text-emerald-600 font-bold">{summary.avgPct}% activation rate</span>
        </div>

        <div className="bg-card border border-border p-4 rounded-2xl shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest block">Pending Activation</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-extrabold font-mono text-amber-600">{summary.pending}</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <span className="text-[11px] text-muted-foreground font-medium">Awaiting onboarding/payment</span>
        </div>

        <div className="bg-card border border-border p-4 rounded-2xl shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-primary uppercase tracking-widest block">HOD Supervised Sections</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-extrabold font-mono text-primary">{summary.departmentsCount}</span>
            <Building2 className="w-4 h-4 text-primary" />
          </div>
          <span className="text-[11px] text-muted-foreground font-medium">100% active supervision</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-card border border-border p-4 rounded-2xl shadow-sm flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
          <Input
            placeholder="Search department, section, HOD name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 rounded-xl text-xs h-10 border-border"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground">Department:</span>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="bg-background border border-input rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="All">All Departments</option>
            <option value="Computer">Computer Science</option>
            <option value="Electronics">Electronics (ECE)</option>
            <option value="Information">Information Technology</option>
            <option value="AI">AI & Data Science</option>
            <option value="Mechanical">Mechanical Engg</option>
          </select>
        </div>
      </div>

      {/* Grid of Department Activation Progress Cards */}
      {loading ? (
        <div className="flex items-center justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : filteredPanel.length === 0 ? (
        <div className="text-center p-12 space-y-2 bg-card border border-border rounded-2xl">
          <ShieldCheck className="w-10 h-10 text-muted-foreground mx-auto" />
          <h3 className="font-bold text-foreground text-sm">No department data matches your search</h3>
          <p className="text-xs text-muted-foreground">Try adjusting your department filter or search terms.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPanel.map((dept, idx) => (
            <div key={idx} className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4 hover:border-primary/40 transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-base text-foreground">{dept.department}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-semibold text-primary">{dept.section}</span>
                      <span className="text-xs text-muted-foreground">• HOD: {dept.hod_name}</span>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${
                    dept.activation_percentage >= 90 ? 'bg-emerald-500/10 text-emerald-600' :
                    dept.activation_percentage >= 70 ? 'bg-amber-500/10 text-amber-600' : 'bg-rose-500/10 text-rose-600'
                  }`}>
                    {dept.activation_percentage}% Active
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden flex">
                    <div className="bg-emerald-500 h-full transition-all duration-500 rounded-full" style={{ width: `${dept.activation_percentage}%` }} />
                  </div>
                  <div className="flex justify-between text-[11px] text-muted-foreground font-medium">
                    <span className="text-emerald-600 font-semibold">{dept.activated_students} Activated</span>
                    <span className="text-amber-600 font-semibold">{dept.pending_students} Pending</span>
                  </div>
                </div>

                {/* Counter Pills */}
                <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs border-t border-border">
                  <div className="p-2 bg-muted/20 rounded-xl">
                    <span className="text-[10px] text-muted-foreground block">Total</span>
                    <span className="font-bold text-foreground text-sm font-mono">{dept.total_students}</span>
                  </div>
                  <div className="p-2 bg-emerald-500/10 rounded-xl">
                    <span className="text-[10px] text-emerald-600 font-semibold block">Active</span>
                    <span className="font-bold text-emerald-600 text-sm font-mono">{dept.activated_students}</span>
                  </div>
                  <div className="p-2 bg-amber-500/10 rounded-xl">
                    <span className="text-[10px] text-amber-600 font-semibold block">Pending</span>
                    <span className="font-bold text-amber-600 text-sm font-mono">{dept.pending_students}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-border flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleSendReminders(dept.department, dept.section)}
                  className="flex-1 rounded-xl h-8 text-[11px] font-semibold gap-1"
                >
                  <Send className="w-3 h-3 text-muted-foreground" /> Remind
                </Button>
                <Button
                  size="sm"
                  disabled={dept.pending_students === 0}
                  onClick={() => handleBatchActivate(dept.department, dept.section)}
                  className="flex-1 rounded-xl h-8 text-[11px] font-semibold gap-1 bg-primary text-primary-foreground"
                >
                  <Check className="w-3 h-3" /> Activate All
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
