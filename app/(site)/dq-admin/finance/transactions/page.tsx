"use client";

import React, { useEffect, useState } from "react";
import { 
  CreditCard, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  FileText, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Building2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FinanceService from "@/services/finance.service";
import { toast } from "sonner";

export default function TransactionsLedgerPage() {
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedTxn, setSelectedTxn] = useState<any>(null);

  // Filter states
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [gateway, setGateway] = useState("all");
  const [department, setDepartment] = useState("all");
  const [page, setPage] = useState(1);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const res = await FinanceService.getTransactions({
        search: search || undefined,
        status: status !== "all" ? status : undefined,
        gateway: gateway !== "all" ? gateway : undefined,
        department: department !== "all" ? department : undefined,
        page,
        limit: 20
      });
      setData(res.data.data.transactions || []);
      setTotal(res.data.data.total || 0);
    } catch (err: any) {
      toast.error(err?.message || "Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [page, status, gateway, department]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadTransactions();
  };

  const handleExportCSV = () => {
    if (data.length === 0) return toast.error("No transactions to export");
    const headers = ["Internal Transaction ID", "Gateway Payment ID", "Gateway Order ID", "Gateway", "Student", "College", "Department", "Amount", "GST", "Total", "Status", "Payment Date"];
    const rows = data.map(t => [
      t.internal_transaction_id || t.transaction_id,
      t.gateway_payment_id || "Not available",
      t.gateway_order_id || "Not available",
      t.gateway,
      `"${t.student_name}"`,
      `"${t.college_name}"`,
      t.department,
      t.base_amount,
      t.gst_amount,
      t.total_amount,
      t.payment_status,
      t.payment_date
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Transactions_Export_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Transactions exported successfully");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <CreditCard className="w-8 h-8 text-primary shrink-0" />
            Transactions & Payment Ledger
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Complete itemized audit of all student payments, tax calculations, gateway status, and receipts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="rounded-xl gap-2 text-xs font-semibold">
            <Download className="w-4 h-4" /> Export CSV
          </Button>
          <Button size="sm" onClick={loadTransactions} className="rounded-xl gap-2 text-xs font-semibold">
            <RefreshCw className="w-4 h-4" /> Refresh
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-card border border-border rounded-2xl p-4 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search Student, Txn ID, Payment ID, College..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 rounded-xl border-border text-xs h-10"
            />
          </div>

          {/* Status Filter */}
          <Select value={status} onValueChange={(val) => { setStatus(val); setPage(1); }}>
            <SelectTrigger className="rounded-xl border-border text-xs h-10">
              <SelectValue placeholder="Payment Status" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border text-xs">
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>

          {/* Gateway Filter */}
          <Select value={gateway} onValueChange={(val) => { setGateway(val); setPage(1); }}>
            <SelectTrigger className="rounded-xl border-border text-xs h-10">
              <SelectValue placeholder="Payment Gateway" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border text-xs">
              <SelectItem value="all">All Gateways</SelectItem>
              <SelectItem value="Razorpay">Razorpay</SelectItem>
              <SelectItem value="Zoho Payments">Zoho Payments</SelectItem>
            </SelectContent>
          </Select>

          {/* Search Button */}
          <Button type="submit" className="rounded-xl h-10 text-xs font-semibold gap-2">
            <Filter className="w-4 h-4" /> Apply Filters
          </Button>
        </form>
      </div>

      {/* Transactions Data Table */}
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : data.length === 0 ? (
          <div className="text-center p-12 space-y-2">
            <CreditCard className="w-10 h-10 text-muted-foreground mx-auto" />
            <h3 className="font-bold text-foreground text-sm">No transactions found</h3>
            <p className="text-xs text-muted-foreground">Try adjusting your search query or filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-muted/40 border-b border-border text-muted-foreground font-semibold">
                  <th className="p-3.5 pl-4">Transaction / Gateway ID</th>
                  <th className="p-3.5">Student & Department</th>
                  <th className="p-3.5">College</th>
                  <th className="p-3.5">Gateway</th>
                  <th className="p-3.5">Amount (INR)</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5 text-right pr-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 font-sans">
                {data.map((txn, idx) => (
                  <tr key={idx} className="hover:bg-muted/20 transition-colors">
                    <td className="p-3.5 pl-4 font-mono text-foreground">
                      <div className="font-bold text-xs">{txn.internal_transaction_id || txn.transaction_id}</div>
                      <div className="text-[11px] text-primary font-medium mt-0.5">
                        {txn.gateway_payment_id ? `Payment ID: ${txn.gateway_payment_id}` : "Gateway Payment ID: Not available"}
                      </div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-bold text-foreground">{txn.student_name}</div>
                      <div className="text-[11px] text-muted-foreground">{txn.department} ({txn.section}) · Roll: {txn.roll_number}</div>
                    </td>
                    <td className="p-3.5 font-medium text-foreground">{txn.college_name}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-1 rounded-lg bg-muted text-foreground text-[11px] font-semibold">
                        {txn.gateway}
                      </span>
                    </td>
                    <td className="p-3.5 font-bold text-foreground">
                      ₹{txn.total_amount?.toLocaleString('en-IN')}
                      <div className="text-[10px] text-muted-foreground font-normal">Base: ₹{txn.base_amount} + GST: ₹{txn.gst_amount}</div>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                        txn.payment_status === 'success' ? 'bg-emerald-500/10 text-emerald-600' :
                        txn.payment_status === 'pending' ? 'bg-amber-500/10 text-amber-600' : 'bg-rose-500/10 text-rose-600'
                      }`}>
                        {txn.payment_status === 'success' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        <span className="capitalize">{txn.payment_status}</span>
                      </span>
                    </td>
                    <td className="p-3.5 text-muted-foreground">{new Date(txn.payment_date).toLocaleDateString('en-IN')}</td>
                    <td className="p-3.5 text-right pr-4">
                      <Button variant="outline" size="sm" onClick={() => setSelectedTxn(txn)} className="rounded-xl h-8 px-2.5 text-[11px] font-semibold gap-1">
                        <Eye className="w-3.5 h-3.5" /> Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="p-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <span>Showing {data.length} of {total} transactions</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="rounded-xl h-8 text-xs">
              <ChevronLeft className="w-4 h-4 mr-1" /> Previous
            </Button>
            <span className="font-semibold text-foreground">Page {page}</span>
            <Button variant="outline" size="sm" disabled={data.length < 20} onClick={() => setPage(p => p + 1)} className="rounded-xl h-8 text-xs">
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>

      {/* Transaction Details Modal */}
      {selectedTxn && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" /> Gateway Transaction Details
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setSelectedTxn(null)} className="rounded-xl h-8 w-8 p-0">✕</Button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-2 p-3 bg-muted/20 rounded-xl font-mono">
                <div className="flex justify-between border-b border-border/50 pb-1">
                  <span className="text-muted-foreground font-sans">Internal Transaction ID:</span>
                  <span className="font-bold text-foreground">{selectedTxn.internal_transaction_id || selectedTxn.transaction_id}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 pb-1">
                  <span className="text-muted-foreground font-sans">Gateway Payment ID:</span>
                  <span className="font-bold text-primary">{selectedTxn.gateway_payment_id || "Not available"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-sans">Gateway Order ID:</span>
                  <span className="font-bold text-foreground">{selectedTxn.gateway_order_id || "Not available"}</span>
                </div>
              </div>

              <div className="space-y-1 pt-1">
                <div className="flex justify-between"><span>Payment Gateway:</span> <strong className="text-foreground">{selectedTxn.gateway}</strong></div>
                <div className="flex justify-between"><span>Student Name:</span> <strong className="text-foreground">{selectedTxn.student_name}</strong></div>
                <div className="flex justify-between"><span>Roll Number:</span> <strong className="text-foreground">{selectedTxn.roll_number}</strong></div>
                <div className="flex justify-between"><span>Email / Mobile:</span> <strong className="text-foreground">{selectedTxn.email} ({selectedTxn.mobile})</strong></div>
                <div className="flex justify-between"><span>College:</span> <strong className="text-foreground">{selectedTxn.college_name}</strong></div>
                <div className="flex justify-between"><span>Department:</span> <strong className="text-foreground">{selectedTxn.department} ({selectedTxn.section})</strong></div>
              </div>

              <div className="border-t border-border pt-3 space-y-1">
                <div className="flex justify-between"><span>Base Subscription Amount:</span> <strong>₹{selectedTxn.base_amount}</strong></div>
                <div className="flex justify-between"><span>GST Tax (18%):</span> <strong>₹{selectedTxn.gst_amount}</strong></div>
                <div className="flex justify-between text-sm font-bold text-emerald-600 border-t border-border pt-1"><span>Total Paid:</span> <span>₹{selectedTxn.total_amount}</span></div>
              </div>

              <div className="border-t border-border pt-3 space-y-1">
                <div className="flex justify-between"><span>DataQuotes Share:</span> <strong className="text-purple-600">₹{selectedTxn.dq_share}</strong></div>
                <div className="flex justify-between"><span>College Share:</span> <strong className="text-cyan-600">₹{selectedTxn.college_share}</strong></div>
                <div className="flex justify-between"><span>LMS License Status:</span> <strong className="text-emerald-600 uppercase">{selectedTxn.license_status}</strong></div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button onClick={() => setSelectedTxn(null)} className="rounded-xl text-xs font-semibold">Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
