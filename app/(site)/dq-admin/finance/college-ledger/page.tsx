"use client";

import React, { useEffect, useState } from "react";
import { 
  Building2, 
  Settings, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Users, 
  TrendingUp, 
  RefreshCw,
  Edit,
  ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FinanceService from "@/services/finance.service";
import { toast } from "sonner";

export default function CollegeLedgerPage() {
  const [ledger, setLedger] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCollege, setSelectedCollege] = useState<any>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);

  // Pricing config state
  const [basePrice, setBasePrice] = useState<number>(0);
  const [collegeSharePrice, setCollegeSharePrice] = useState<number>(0);
  const [gstRate, setGstRate] = useState<number>(0);
  const [saving, setSaving] = useState(false);

  const loadLedger = async () => {
    try {
      setLoading(true);
      const res = await FinanceService.getCollegeLedger();
      setLedger(res.data.data || []);
    } catch (err: any) {
      toast.error(err?.message || "Failed to load college ledger");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLedger();
  }, []);

  const handleOpenConfig = (college: any) => {
    setSelectedCollege(college);
    const cfg = college.pricing_config || {};
    setBasePrice(Number.isFinite(Number(cfg.base_dq_price)) ? Number(cfg.base_dq_price) : 0);
    setCollegeSharePrice(Number.isFinite(Number(cfg.college_share_price)) ? Number(cfg.college_share_price) : 0);
    setGstRate(Number.isFinite(Number(cfg.gst_rate_percent)) ? Number(cfg.gst_rate_percent) : 0);
    setShowConfigModal(true);
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCollege) return;
    try {
      setSaving(true);
      await FinanceService.updateCollegePricing({
        collegeId: selectedCollege.college_id,
        baseDqPrice: basePrice,
        collegeSharePrice,
        gstRatePercent: gstRate
      });
      toast.success("College pricing configuration updated!");
      setShowConfigModal(false);
      loadLedger();
    } catch (err: any) {
      toast.error(err?.message || "Failed to update pricing configuration");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Building2 className="w-8 h-8 text-primary shrink-0" />
            College Management Ledger
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Institutional revenue tracking, custom pricing tiers, and settlement balances per college.
          </p>
        </div>

        <Button size="sm" onClick={loadLedger} className="rounded-xl gap-2 text-xs font-semibold">
          <RefreshCw className="w-4 h-4" /> Refresh Ledger
        </Button>
      </div>

      {/* College Ledger Cards & Table */}
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : ledger.length === 0 ? (
          <div className="text-center p-12 space-y-2">
            <Building2 className="w-10 h-10 text-muted-foreground mx-auto" />
            <h3 className="font-bold text-foreground text-sm">No colleges onboarded yet</h3>
            <p className="text-xs text-muted-foreground">Onboard colleges to track revenue collections and custom pricing.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-muted/40 border-b border-border text-muted-foreground font-semibold">
                  <th className="p-3.5 pl-4">College Name & Code</th>
                  <th className="p-3.5 text-center">Total Students</th>
                  <th className="p-3.5 text-center">Activated</th>
                  <th className="p-3.5 text-center">Pending</th>
                  <th className="p-3.5">Gross Collection</th>
                  <th className="p-3.5">DQ Share</th>
                  <th className="p-3.5">College Share</th>
                  <th className="p-3.5 font-bold text-rose-600">Settlement Pending</th>
                  <th className="p-3.5">Settlement Status</th>
                  <th className="p-3.5 text-right pr-4">Configure Pricing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 font-sans">
                {ledger.map((item, idx) => (
                  <tr key={idx} className="hover:bg-muted/20 transition-colors">
                    <td className="p-3.5 pl-4 font-bold text-foreground">
                      <div>{item.college_name}</div>
                      <div className="text-[10px] text-muted-foreground font-mono font-normal">Code: {item.college_code}</div>
                    </td>
                    <td className="p-3.5 text-center font-semibold text-foreground">{item.total_students}</td>
                    <td className="p-3.5 text-center font-bold text-emerald-600">{item.activated_students}</td>
                    <td className="p-3.5 text-center font-bold text-amber-600">{item.pending_students}</td>
                    <td className="p-3.5 font-medium text-foreground">₹{item.gross_collection?.toLocaleString('en-IN')}</td>
                    <td className="p-3.5 font-medium text-purple-600">₹{item.dq_share?.toLocaleString('en-IN')}</td>
                    <td className="p-3.5 font-medium text-cyan-600">₹{item.college_share?.toLocaleString('en-IN')}</td>
                    <td className="p-3.5 font-bold text-rose-600">₹{item.settlement_pending?.toLocaleString('en-IN')}</td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                        item.settlement_status === 'Completed' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'
                      }`}>
                        {item.settlement_status === 'Completed' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        <span>{item.settlement_status}</span>
                      </span>
                    </td>
                    <td className="p-3.5 text-right pr-4">
                      <Button variant="outline" size="sm" onClick={() => handleOpenConfig(item)} className="rounded-xl h-8 px-2.5 text-[11px] font-semibold gap-1">
                        <Edit className="w-3.5 h-3.5" /> Pricing
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pricing Configuration Modal */}
      {showConfigModal && selectedCollege && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" /> Pricing Configuration
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setShowConfigModal(false)} className="rounded-xl h-8 w-8 p-0">✕</Button>
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-4 text-xs">
              <div className="p-3 bg-muted/20 border border-border/60 rounded-xl">
                <span className="font-bold text-foreground text-sm">{selectedCollege.college_name}</span>
                <p className="text-[11px] text-muted-foreground mt-0.5">Customize base subscription price and college revenue share.</p>
              </div>

              <div className="space-y-1.5">
                <Label>DataQuotes Base Subscription Price (INR) *</Label>
                <Input
                  type="number"
                  value={basePrice}
                  onChange={(e) => setBasePrice(parseFloat(e.target.value) || 0)}
                  className="rounded-xl border-border text-xs h-10"
                />
              </div>

              <div className="space-y-1.5">
                <Label>College Share Price (INR) *</Label>
                <Input
                  type="number"
                  value={collegeSharePrice}
                  onChange={(e) => setCollegeSharePrice(parseFloat(e.target.value) || 0)}
                  className="rounded-xl border-border text-xs h-10"
                />
              </div>

              <div className="space-y-1.5">
                <Label>GST Tax Rate (%)</Label>
                <Input
                  type="number"
                  value={gstRate}
                  onChange={(e) => setGstRate(parseFloat(e.target.value) || 0)}
                  className="rounded-xl border-border text-xs h-10"
                />
              </div>

              <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl space-y-1">
                <div className="flex justify-between font-bold text-foreground">
                  <span>Student Total Fee (excl. GST):</span>
                  <span>₹{(basePrice + collegeSharePrice).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Total Payable (+{gstRate}% GST):</span>
                  <span className="font-bold text-emerald-600">
                    ₹{((basePrice + collegeSharePrice) * (1 + gstRate / 100)).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowConfigModal(false)} className="rounded-xl text-xs">
                  Cancel
                </Button>
                <Button type="submit" disabled={saving} className="rounded-xl text-xs font-semibold">
                  {saving ? "Saving..." : "Save Pricing Config"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
