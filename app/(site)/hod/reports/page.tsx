"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowDownToLine, RotateCcw, FileText, Search, Loader2, CheckCircle2, AlertTriangle, AlertCircle, Eye, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { toast } from "sonner";
import HODService from "@/services/hod.service";

function ReportsContent() {
  const searchParams = useSearchParams();
  const urlExamTitle = searchParams?.get("examTitle") || searchParams?.get("exam") || searchParams?.get("category") || "";

  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "completed" | "reassigned" | "in_progress">("all");
  const [selectedExamTitle, setSelectedExamTitle] = useState<string>(urlExamTitle);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  useEffect(() => {
    if (urlExamTitle) {
      setSelectedExamTitle(urlExamTitle);
    }
  }, [urlExamTitle]);

  // Reassign Dialog states
  const [reassignOpen, setReassignOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [reassigning, setReassigning] = useState(false);
  const [attemptsToReassign, setAttemptsToReassign] = useState<any[]>([]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const res = await HODService.getReports();
      setRows(res.data.data || []);
    } catch {
      toast.error("Failed to load reports.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  // Toggle selection
  const toggleSelect = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = (filteredRows: any[]) => {
    const filteredIds = filteredRows.map(r => r.id);
    const allSelected = filteredIds.every(id => selectedIds.includes(id));

    if (allSelected) {
      setSelectedIds(prev => prev.filter(id => !filteredIds.includes(id)));
    } else {
      setSelectedIds(prev => [...new Set([...prev, ...filteredIds])]);
    }
  };

  // Open Reassign Dialog for Single attempt
  const openReassignSingle = (attempt: any) => {
    setAttemptsToReassign([attempt]);
    setReason("");
    setReassignOpen(true);
  };

  // Open Reassign Dialog for Bulk selection
  const openReassignBulk = () => {
    const selectedAttempts = rows.filter(r => selectedIds.includes(r.id));
    setAttemptsToReassign(selectedAttempts);
    setReason("");
    setReassignOpen(true);
  };

  // Run reassignment logic
  const handleReassign = async () => {
    if (attemptsToReassign.length === 0) return;
    if (!reason.trim()) {
      toast.error("Please enter a reassignment reason");
      return;
    }

    setReassigning(true);
    try {
      for (const attempt of attemptsToReassign) {
        await HODService.reassignAttempt(attempt.id, reason);
      }
      toast.success(`Successfully reassigned ${attemptsToReassign.length} exam(s)`);
      setReassignOpen(false);
      setAttemptsToReassign([]);
      setSelectedIds([]);
      await loadReports();
    } catch (e: any) {
      toast.error(e.message || "Failed to reassign exam attempts.");
    } finally {
      setReassigning(false);
    }
  };

  // Export CSV Action
  const handleExportCSV = () => {
    if (rows.length === 0) {
      toast.error("No reports to export.");
      return;
    }
    const headers = ["Student Name", "Roll Number", "Exam Title", "Score", "Integrity", "Status", "Submitted At"];
    const csvContent = [
      headers.join(","),
      ...rows.map(r => [
        `"${r.student?.full_name || ""}"`,
        `"${r.student?.roll_number || ""}"`,
        `"${r.exam?.title || ""}"`,
        `"${r.total_score}/${r.exam?.total_marks}"`,
        `"${r.integrity_score}%"`,
        `"${r.status}"`,
        `"${r.submitted_at ? new Date(r.submitted_at).toLocaleString() : "—"}"`
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `exam_attempts_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV report downloaded.");
  };

  const uniqueExamTitles = useMemo(() => {
    const titles = new Set<string>();
    rows.forEach(r => {
      const t = r.exam?.title || r.exam_title;
      if (t && typeof t === "string") titles.add(t.trim());
    });
    return Array.from(titles);
  }, [rows]);

  // Filter attempts based on search, active tab, and selected exam title
  const getFilteredRows = () => {
    let result = rows;
    
    if (activeTab !== "all") {
      result = result.filter(r => r.status === activeTab);
    }

    if (selectedExamTitle && selectedExamTitle !== "all") {
      result = result.filter(r => {
        const title = (r.exam?.title || r.exam_title || "").toLowerCase();
        return title.includes(selectedExamTitle.toLowerCase());
      });
    }

    if (searchTerm.trim() !== "") {
      const q = searchTerm.toLowerCase();
      result = result.filter(r => 
        (r.student?.full_name && r.student.full_name.toLowerCase().includes(q)) ||
        (r.student?.roll_number && r.student.roll_number.toLowerCase().includes(q)) ||
        (r.exam?.title && r.exam.title.toLowerCase().includes(q))
      );
    }

    return result;
  };

  const filteredRows = getFilteredRows();

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-sans">Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Analyze exam attempts, review security logs, and manage candidate retakes.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          {selectedIds.length > 0 && (
            <Button 
              onClick={openReassignBulk} 
              className="bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-1.5 rounded-xl text-xs font-semibold px-4 py-2 h-10 transition-all shadow-sm"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reassign Selected ({selectedIds.length})</span>
            </Button>
          )}
          <Button onClick={handleExportCSV} variant="outline" className="flex items-center gap-1.5 border-border rounded-xl text-xs font-semibold px-4 py-2 h-10 hover:bg-muted transition-all">
            <ArrowDownToLine className="w-4 h-4" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      {/* Tabs and Search Bar */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border/40 shrink-0">
            {(["all", "completed", "reassigned", "in_progress"] as const).map((tab) => {
              const count = tab === "all" 
                ? rows.length 
                : rows.filter(r => r.status === tab).length;
              
              const isSelected = activeTab === tab;
              
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.replace("_", " ")} <span className="opacity-70 text-[10px] ml-0.5">({count})</span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedExamTitle}
              onChange={(e) => setSelectedExamTitle(e.target.value)}
              className="h-9 px-3 rounded-xl border border-input bg-card font-semibold text-xs cursor-pointer focus:ring-1 focus:ring-primary text-foreground w-full sm:w-auto"
            >
              <option value="all">All Exam Titles / Categories</option>
              {uniqueExamTitles.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            <div className="relative w-full sm:w-60">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by student, roll, or exam..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-card border-border rounded-xl text-xs h-9"
              />
            </div>
          </div>
        </div>

        {selectedExamTitle && selectedExamTitle !== "all" && (
          <div className="flex items-center justify-between bg-primary/10 border border-primary/20 px-3.5 py-2 rounded-xl text-xs font-semibold text-primary">
            <span className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5" />
              <span>Filtered by Selected Exam Category: <strong>"{selectedExamTitle}"</strong></span>
            </span>
            <button
              onClick={() => setSelectedExamTitle("all")}
              className="hover:bg-primary/20 p-0.5 rounded-md transition-colors text-primary font-bold text-xs"
              title="Clear Category Filter"
            >
              Clear Filter ✕
            </button>
          </div>
        )}
      </div>

      {/* Results Table View */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="text-xs">Loading reports dashboard...</span>
          </div>
        ) : filteredRows.length > 0 ? (
          <Table className="w-full text-sm">
            <TableHeader className="bg-muted/40 border-b border-border">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-12 text-center pl-4">
                  <input 
                    type="checkbox" 
                    checked={filteredRows.length > 0 && filteredRows.every(r => selectedIds.includes(r.id))} 
                    onChange={() => toggleSelectAll(filteredRows)} 
                    className="rounded border-border text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                  />
                </TableHead>
                <TableHead className="font-semibold min-w-[180px]">Student</TableHead>
                <TableHead className="font-semibold min-w-[200px]">Exam</TableHead>
                <TableHead className="font-semibold w-48">Score</TableHead>
                <TableHead className="font-semibold w-32">Status</TableHead>
                <TableHead className="font-semibold w-40">Submitted At</TableHead>
                <TableHead className="font-semibold w-36 text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border">
              {filteredRows.map((r) => {
                const total = r.exam?.total_marks || 0;
                const pct = total > 0 ? (r.total_score / total) * 100 : 0;
                const passed = pct >= (r.exam?.passing_pct || 40);
                const isSelected = selectedIds.includes(r.id);

                return (
                  <TableRow key={r.id} className={`hover:bg-muted/20 transition-all duration-200 ${isSelected ? "bg-primary/5 hover:bg-primary/10" : ""}`}>
                    <td className="w-12 text-center pl-4">
                      <input 
                        type="checkbox" 
                        checked={isSelected} 
                        onChange={() => toggleSelect(r.id)} 
                        className="rounded border-border text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                      />
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-foreground text-sm">{r.student?.full_name || "—"}</div>
                      <div className="text-xs text-muted-foreground font-mono mt-0.5">{r.student?.roll_number || ""}</div>
                    </td>
                    <td className="p-4 font-semibold text-foreground text-sm">{r.exam?.title}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground text-sm">{Number(r.total_score).toFixed(1)} / {total}</span>
                        {r.status === "completed" && (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            passed 
                              ? "bg-green-500/10 text-green-600 border-green-500/20" 
                              : "bg-destructive/10 text-destructive border-destructive/20"
                          }`}>
                            {passed ? "PASS" : "FAIL"}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        MCQ {Number(r.mcq_score).toFixed(1)} • Code {Number(r.coding_score).toFixed(1)}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                        r.status === "completed" 
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" 
                          : r.status === "reassigned" 
                          ? "bg-amber-500/10 text-amber-600 border-amber-500/20" 
                          : r.status === "in_progress" 
                          ? "bg-blue-500/10 text-blue-600 border-blue-500/20" 
                          : "bg-muted text-muted-foreground border-border"
                      }`}>
                        {r.status === "completed" ? (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>completed</span>
                          </>
                        ) : r.status === "reassigned" ? (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            <span>reassigned</span>
                          </>
                        ) : (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            <span>in progress</span>
                          </>
                        )}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-muted-foreground font-medium">
                      {r.submitted_at ? new Date(r.submitted_at).toLocaleString() : "—"}
                    </td>
                    <td className="p-4 text-right pr-4">
                      <div className="flex items-center justify-end gap-1.5">
                        {r.status === "completed" && (
                          <Link href={`/hod/reports/results/${r.id}`}>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 rounded-lg text-primary hover:text-primary-hover hover:bg-muted font-semibold text-xs"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              <span>Details</span>
                            </Button>
                          </Link>
                        )}
                        {r.status !== "reassigned" && (
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => openReassignSingle(r)} 
                            className="h-8 rounded-lg text-amber-600 hover:text-amber-700 hover:bg-muted font-semibold text-xs" 
                            title="Reassign / Grant Retake"
                          >
                            <RotateCcw className="w-4 h-4 mr-1 text-amber-600" /> 
                            <span>Reassign</span>
                          </Button>
                        )}
                      </div>
                    </td>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <div className="p-16 text-center space-y-4 max-w-md mx-auto">
            <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
              <AlertCircle className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-lg text-foreground">No reports found</h3>
              <p className="text-xs text-muted-foreground">
                We couldn't find any results matching "{searchTerm}" under the {activeTab} view.
              </p>
            </div>
            {searchTerm && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchTerm("")}
                className="rounded-xl border-border text-xs"
              >
                Clear Search
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Reassign Dialog */}
      <Dialog open={reassignOpen} onOpenChange={(open) => !open && setReassignOpen(false)}>
        <DialogContent className="sm:max-w-md rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Reassign Exam (Grant Retake)</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              Grant a fresh exam retake for <strong className="text-foreground">{attemptsToReassign.length}</strong> student attempts.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-3 text-sm">
            <div className="text-muted-foreground leading-relaxed text-xs">
              Reassigning will preserve the historical attempt records, change their status to <strong className="text-foreground">"reassigned"</strong>, and generate a new <strong className="text-foreground">"in progress"</strong> attempt for the candidate to start.
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="reason" className="text-xs font-semibold text-muted-foreground">Reassignment Reason *</Label>
              <Textarea 
                id="reason" 
                value={reason} 
                onChange={(e) => setReason(e.target.value)} 
                placeholder="e.g. System crash during exam, network failure, power cut..." 
                rows={3} 
                className="rounded-xl border-border text-xs resize-none"
              />
            </div>
          </div>
          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={() => setReassignOpen(false)} 
              disabled={reassigning}
              className="rounded-xl border-border text-xs font-semibold"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleReassign} 
              disabled={reassigning} 
              className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold"
            >
              {reassigning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> 
                  <span>Processing...</span>
                </>
              ) : (
                "Reassign Exam"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function ResultsList() {
  return (
    <Suspense fallback={
      <div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <span className="text-xs">Loading reports dashboard...</span>
      </div>
    }>
      <ReportsContent />
    </Suspense>
  );
}
