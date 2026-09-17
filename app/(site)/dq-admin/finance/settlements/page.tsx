"use client";

import React, { useEffect, useState } from "react";
import { 
  Building2, 
  Plus, 
  Download, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  FileText, 
  RefreshCw,
  Sliders,
  ShieldCheck,
  CreditCard,
  UserCheck,
  ArrowUpRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FinanceService from "@/services/finance.service";
import { toast } from "sonner";

export default function SettlementsPage() {
  const [settlements, setSettlements] = useState<any[]>([]);
  const [colleges, setColleges] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  // Settlement Form State
  const [selectedCollege, setSelectedCollege] = useState<string>("");
  const [monthKey, setMonthKey] = useState<string>(new Date().toISOString().substring(0, 7));
  const [adjustments, setAdjustments] = useState<number>(0);
  const [refNumber, setRefNumber] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [generating, setGenerating] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await FinanceService.getSettlements();
      setSettlements(res.data.data || []);

      const colRes = await FinanceService.getCollegeLedger();
      setColleges(colRes.data.data || []);

      const txnRes = await FinanceService.getTransactions({ limit: 100 });
      setTransactions(txnRes.data.data.transactions || []);
    } catch (err: any) {
      toast.error(err?.message || "Failed to load settlements data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openSettleModalForCollege = (collegeId: number) => {
    setSelectedCollege(String(collegeId));
    setShowGenerateModal(true);
  };

  const handleGenerateSettlement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCollege) return toast.error("Please select a college");

    try {
      setGenerating(true);
      await FinanceService.createSettlement({
        collegeId: parseInt(selectedCollege),
        monthKey,
        adjustments,
        referenceNumber: refNumber || `REF_${Date.now()}`,
        notes: notes || `Monthly settlement payout for ${monthKey}`
      });
      toast.success("Monthly settlement payout generated successfully!");
      setShowGenerateModal(false);
      loadData();
    } catch (err: any) {
      toast.error(err?.message || "Failed to generate settlement");
    } finally {
      setGenerating(false);
    }
  };

  const handleExportCSV = () => {
    if (settlements.length === 0 && colleges.length === 0) return toast.error("No settlement data to export");
    const headers = ["College Name", "Total Students Activated", "Gross Collection (INR)", "DQ Share", "College Share", "Settlement Status"];
    const rows = colleges.map(c => [
      `"${c.college_name || 'College'}"`,
      c.activated_students || 0,
      c.gross_collection || 0,
      c.dq_share || 0,
      c.college_share || 0,
      c.settlement_status || 'Pending'
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Monthly_Settlements_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Settlements summary exported successfully");
  };

  // Calculations for current month summary
  const totalGrossCollection = colleges.reduce((sum, c) => sum + (Number(c.gross_collection) || 0), 0);
  const totalDqShare = colleges.reduce((sum, c) => sum + (Number(c.dq_share) || 0), 0);
  const totalCollegeShare = colleges.reduce((sum, c) => sum + (Number(c.college_share) || 0), 0);
  const totalSettlementPending = colleges.reduce((sum, c) => sum + (Number(c.settlement_pending) || 0), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Building2 className="w-8 h-8 text-primary shrink-0" />
            College Revenue Settlements
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Monthly settlement calculations, payouts, adjustments, and student payment audits.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="rounded-xl gap-2 text-xs font-semibold">
            <Download className="w-4 h-4" /> Export CSV
          </Button>
          <Button size="sm" onClick={() => setShowGenerateModal(true)} className="rounded-xl gap-2 text-xs font-semibold">
            <Plus className="w-4 h-4" /> Generate Settlement
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Total Payments Collected</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-foreground">₹{totalGrossCollection.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">DataQuotes Platform Share</span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-purple-600">₹{totalDqShare.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">College Share (Total Payouts)</span>
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-600 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-cyan-600">₹{totalCollegeShare.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Settlement Payout Pending</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-amber-600">₹{totalSettlementPending.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>

      {/* SECTION 1: Current Month College Revenue & Settlement Payout Summary */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            Current Month College Revenue & Payout Summary
          </h2>
          <span className="text-xs text-muted-foreground font-medium">Month: {new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' })}</span>
        </div>

        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : colleges.length === 0 ? (
            <div className="text-center p-8 space-y-1">
              <Building2 className="w-8 h-8 text-muted-foreground mx-auto" />
              <p className="text-xs text-muted-foreground">No college records found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-muted/40 border-b border-border text-muted-foreground font-semibold">
                    <th className="p-3.5 pl-4">College Name</th>
                    <th className="p-3.5 text-center">Activated Students</th>
                    <th className="p-3.5">Gross Collection</th>
                    <th className="p-3.5">DataQuotes Share</th>
                    <th className="p-3.5 font-bold text-cyan-600">College Payout Share</th>
                    <th className="p-3.5">Pending Payout</th>
                    <th className="p-3.5">Settlement Status</th>
                    <th className="p-3.5 text-right pr-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {colleges.map((c, idx) => (
                    <tr key={idx} className="hover:bg-muted/20 transition-colors">
                      <td className="p-3.5 pl-4 font-bold text-foreground">
                        <div>{c.college_name}</div>
                        <div className="text-[10px] text-muted-foreground font-normal">Code: {c.college_code}</div>
                      </td>
                      <td className="p-3.5 text-center font-bold text-blue-600">{c.activated_students || 0} / {c.total_students || 0}</td>
                      <td className="p-3.5 font-medium text-foreground">₹{Number(c.gross_collection || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td className="p-3.5 font-medium text-purple-600">₹{Number(c.dq_share || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td className="p-3.5 font-bold text-cyan-600">₹{Number(c.college_share || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td className="p-3.5 font-bold text-amber-600">₹{Number(c.settlement_pending || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 uppercase ${
                          c.settlement_status === 'Completed' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                        }`}>
                          {c.settlement_status === 'Completed' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          {c.settlement_status || 'Pending'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right pr-4">
                        <Button 
                          size="sm" 
                          onClick={() => openSettleModalForCollege(c.college_id)} 
                          className="rounded-xl h-8 px-3 text-[11px] font-semibold gap-1 bg-primary text-white"
                        >
                          <Plus className="w-3.5 h-3.5" /> Settle Payout
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 2: This Month's Student Payments List */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-500" />
            This Month's Student Payments Audit List
          </h2>
          <span className="text-xs text-muted-foreground font-medium">Real-time Payments ({transactions.length} Records)</span>
        </div>

        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center p-8 space-y-1">
              <CreditCard className="w-8 h-8 text-muted-foreground mx-auto" />
              <p className="text-xs text-muted-foreground">No student payments recorded for this month yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-muted/40 border-b border-border text-muted-foreground font-semibold">
                    <th className="p-3.5 pl-4">Payment / Order ID</th>
                    <th className="p-3.5">Student Name</th>
                    <th className="p-3.5">College</th>
                    <th className="p-3.5">Gateway</th>
                    <th className="p-3.5">Amount Paid</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Payment Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {transactions.map((t, idx) => (
                    <tr key={idx} className="hover:bg-muted/20 transition-colors">
                      <td className="p-3.5 pl-4 font-mono font-bold text-foreground">
                        <div>{t.payment_id}</div>
                        <div className="text-[10px] text-muted-foreground font-normal">{t.order_id}</div>
                      </td>
                      <td className="p-3.5 font-bold text-foreground">
                        <div>{t.student_name}</div>
                        <div className="text-[10px] text-muted-foreground font-normal">{t.department} · Roll: {t.roll_number}</div>
                      </td>
                      <td className="p-3.5 font-medium text-foreground">{t.college_name}</td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-lg bg-muted text-foreground text-[10px] font-semibold">
                          {t.gateway}
                        </span>
                      </td>
                      <td className="p-3.5 font-bold text-foreground">
                        ₹{Number(t.total_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        <div className="text-[10px] text-muted-foreground font-normal">Base: ₹{t.base_amount} + GST: ₹{t.gst_amount}</div>
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 capitalize ${
                          t.payment_status === 'success' ? 'bg-emerald-500/10 text-emerald-600' :
                          t.payment_status === 'pending' ? 'bg-amber-500/10 text-amber-600' : 'bg-rose-500/10 text-rose-600'
                        }`}>
                          {t.payment_status === 'success' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          {t.payment_status}
                        </span>
                      </td>
                      <td className="p-3.5 text-muted-foreground">
                        {t.payment_date ? new Date(t.payment_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 3: Completed Settlement History Log */}
      {settlements.length > 0 && (
        <div className="space-y-3 pt-2">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-500" />
            Historical Generated Settlement Payouts Log
          </h2>

          <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-muted/40 border-b border-border text-muted-foreground font-semibold">
                    <th className="p-3.5 pl-4">Settlement ID / Month</th>
                    <th className="p-3.5">College</th>
                    <th className="p-3.5 text-center">Activated Students</th>
                    <th className="p-3.5">Gross Collection</th>
                    <th className="p-3.5">DQ Share</th>
                    <th className="p-3.5">College Share</th>
                    <th className="p-3.5 font-bold text-cyan-600">Net Settlement</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Reference No</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {settlements.map((s, idx) => (
                    <tr key={idx} className="hover:bg-muted/20 transition-colors">
                      <td className="p-3.5 pl-4 font-mono font-bold text-foreground">
                        <div>{s.settlement_id}</div>
                        <div className="text-[10px] text-muted-foreground font-normal">Month: {s.month_key}</div>
                      </td>
                      <td className="p-3.5 font-bold text-foreground">{s.college_name || `College #${s.college_id}`}</td>
                      <td className="p-3.5 text-center font-bold text-blue-600">{s.total_students_activated}</td>
                      <td className="p-3.5 font-medium text-foreground">₹{Number(s.gross_collection)?.toLocaleString('en-IN')}</td>
                      <td className="p-3.5 font-medium text-purple-600">₹{Number(s.dq_share)?.toLocaleString('en-IN')}</td>
                      <td className="p-3.5 font-medium text-cyan-600">₹{Number(s.college_share)?.toLocaleString('en-IN')}</td>
                      <td className="p-3.5 font-bold text-emerald-600 text-sm">₹{Number(s.net_settlement)?.toLocaleString('en-IN')}</td>
                      <td className="p-3.5">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 inline-flex items-center gap-1 uppercase">
                          <CheckCircle2 className="w-3 h-3" /> {s.status}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-muted-foreground">{s.reference_number || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Generate Settlement Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary" /> Generate Monthly Settlement
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setShowGenerateModal(false)} className="rounded-xl h-8 w-8 p-0">✕</Button>
            </div>

            <form onSubmit={handleGenerateSettlement} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <Label>Select College *</Label>
                <Select value={selectedCollege} onValueChange={setSelectedCollege}>
                  <SelectTrigger className="rounded-xl border-border text-xs h-10">
                    <SelectValue placeholder="Choose Institution" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border text-xs">
                    {colleges.map((c) => (
                      <SelectItem key={c.college_id} value={String(c.college_id)}>
                        {c.college_name} (Pending: ₹{Number(c.settlement_pending || 0).toLocaleString('en-IN')})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Settlement Month (YYYY-MM) *</Label>
                <Input
                  type="month"
                  value={monthKey}
                  onChange={(e) => setMonthKey(e.target.value)}
                  className="rounded-xl border-border text-xs h-10"
                />
              </div>

              <div className="space-y-1.5">
                <Label>Adjustments / Deductions (INR)</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={adjustments}
                  onChange={(e) => setAdjustments(parseFloat(e.target.value) || 0)}
                  className="rounded-xl border-border text-xs h-10"
                />
              </div>

              <div className="space-y-1.5">
                <Label>Payment Reference Number</Label>
                <Input
                  type="text"
                  placeholder="e.g. UTR_BANK_REF_998822"
                  value={refNumber}
                  onChange={(e) => setRefNumber(e.target.value)}
                  className="rounded-xl border-border text-xs h-10"
                />
              </div>

              <div className="space-y-1.5">
                <Label>Settlement Notes</Label>
                <Input
                  type="text"
                  placeholder="Monthly payout notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="rounded-xl border-border text-xs h-10"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowGenerateModal(false)} className="rounded-xl text-xs">
                  Cancel
                </Button>
                <Button type="submit" disabled={generating} className="rounded-xl text-xs font-semibold">
                  {generating ? "Processing..." : "Generate Settlement"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
