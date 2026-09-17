"use client";

import React, { useEffect, useState } from "react";
import { 
  ShieldCheck, 
  Users, 
  CheckCircle2, 
  Clock, 
  BarChart3, 
  RefreshCw,
  Building2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import FinanceService from "@/services/finance.service";
import { toast } from "sonner";

export default function HodActivationPanelPage() {
  const [panel, setPanel] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPanel = async () => {
    try {
      setLoading(true);
      const res = await FinanceService.getHodActivationPanel();
      setPanel(res.data.data || []);
    } catch (err: any) {
      toast.error(err?.message || "Failed to load HOD activation stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPanel();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-primary shrink-0" />
            HOD Department Activation Panel
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Real-time department and section-wise student enrollment & payment activation progress.
          </p>
        </div>

        <Button size="sm" onClick={loadPanel} className="rounded-xl gap-2 text-xs font-semibold">
          <RefreshCw className="w-4 h-4" /> Refresh Panel
        </Button>
      </div>

      {/* Grid of Department Activation Progress Cards */}
      {loading ? (
        <div className="flex items-center justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : panel.length === 0 ? (
        <div className="text-center p-12 space-y-2 bg-card border border-border rounded-2xl">
          <ShieldCheck className="w-10 h-10 text-muted-foreground mx-auto" />
          <h3 className="font-bold text-foreground text-sm">No department data available</h3>
          <p className="text-xs text-muted-foreground">Department rosters will automatically compute upon student registration.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {panel.map((dept, idx) => (
            <div key={idx} className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4 hover:border-primary/40 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-foreground">{dept.department} - {dept.section}</h3>
                  <p className="text-xs text-muted-foreground">{dept.college_name}</p>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  dept.activation_percentage >= 80 ? 'bg-emerald-500/10 text-emerald-600' :
                  dept.activation_percentage >= 50 ? 'bg-amber-500/10 text-amber-600' : 'bg-rose-500/10 text-rose-600'
                }`}>
                  {dept.activation_percentage}% Active
                </span>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5 pt-1">
                <div className="h-3 w-full bg-muted rounded-full overflow-hidden flex">
                  <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${dept.activation_percentage}%` }} />
                </div>
                <div className="flex justify-between text-[11px] text-muted-foreground font-semibold">
                  <span>{dept.activated_students} Activated</span>
                  <span>{dept.pending_students} Pending</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs border-t border-border">
                <div className="p-2 bg-muted/20 rounded-xl">
                  <span className="text-[10px] text-muted-foreground block">Total</span>
                  <span className="font-bold text-foreground text-sm">{dept.total_students}</span>
                </div>
                <div className="p-2 bg-emerald-500/10 rounded-xl">
                  <span className="text-[10px] text-emerald-600 font-semibold block">Activated</span>
                  <span className="font-bold text-emerald-600 text-sm">{dept.activated_students}</span>
                </div>
                <div className="p-2 bg-amber-500/10 rounded-xl">
                  <span className="text-[10px] text-amber-600 font-semibold block">Pending</span>
                  <span className="font-bold text-amber-600 text-sm">{dept.pending_students}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
