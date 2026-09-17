"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Award, Clock, Calendar, CheckCircle2, AlertCircle, Eye, Brain, Loader2, Play, Search, ShieldAlert, Sparkles, AlertTriangle, ChevronRight, Activity, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import InterviewService from "@/services/interview.service";
import ProfileService from "@/services/profile.service";
import AuthService from "@/services/auth.service";
import { toast } from "sonner";

export default function StudentPrepReportsPage() {
  const router = useRouter();
  const [prepCategory, setPrepCategory] = useState<"all" | "role" | "project" | "weak" | "hr">("all");
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [prepAttempts, setPrepAttempts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const user = AuthService.getCurrentUser();
      if (!user) return;

      const [profileRes, prepData] = await Promise.all([
        ProfileService.getById(user.id),
        InterviewService.getTestResults()
      ]);

      setProfile(profileRes.data || null);
      setPrepAttempts(prepData || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load preparation reports history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getFilteredPrep = () => {
    let filtered = prepAttempts;
    
    // Filter by Category Sub-Tab
    if (prepCategory !== "all") {
      filtered = filtered.filter(p => p.section === prepCategory);
    }
    
    // Filter by search term
    const term = searchTerm.trim().toLowerCase();
    if (!term) return filtered;
    return filtered.filter(p => 
      (p.section && p.section.toLowerCase().includes(term)) ||
      (p.scope && p.scope.toLowerCase().includes(term))
    );
  };

  const filteredPrep = getFilteredPrep();

  return (
    <div className="space-y-6 animate-in fade-in duration-300 p-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-sans">Interview Preparation Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Access your SDE interview practice scores, dynamic AI mock questions, and detailed attempt progression.
          </p>
        </div>
      </div>

      {/* Main Tabs list & Search */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-3">
          <div className="flex flex-wrap gap-2 shrink-0">
            {[
              { id: "all", label: "All Reports" },
              { id: "role", label: "Role Based" },
              { id: "project", label: "Project Based" },
              { id: "weak", label: "Weak Areas" },
              { id: "hr", label: "HR Questions" }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setPrepCategory(cat.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  prepCategory === cat.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by section or topic..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-card border-border rounded-xl text-xs h-9"
            />
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="text-xs">Gathering SDE prep records...</span>
          </div>
        ) : filteredPrep.length > 0 ? (
          <Table className="w-full text-xs">
            <TableHeader className="bg-muted/40 border-b border-border">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold w-40">Attempt Date & Time</TableHead>
                <TableHead className="font-semibold">Category</TableHead>
                <TableHead className="font-semibold">Topic / Role / Project</TableHead>
                <TableHead className="font-semibold w-24">Difficulty</TableHead>
                <TableHead className="font-semibold w-16 text-center">Total</TableHead>
                <TableHead className="font-semibold w-20 text-center">Answered</TableHead>
                <TableHead className="font-semibold w-16 text-center text-green-600">Correct</TableHead>
                <TableHead className="font-semibold w-16 text-center text-red-500">Wrong</TableHead>
                <TableHead className="font-semibold w-16 text-center">Skipped</TableHead>
                <TableHead className="font-semibold w-16 text-center">Score</TableHead>
                <TableHead className="font-semibold w-16 text-center">Percentage</TableHead>
                <TableHead className="font-semibold w-24 text-center">Time Taken</TableHead>
                <TableHead className="font-semibold w-24">Status</TableHead>
                <TableHead className="font-semibold w-24 text-right pr-6">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border">
              {filteredPrep.map((p) => {
                const total = p.total_questions || p.total || 0;
                const score = p.score || 0;
                const isCompleted = p.status === "completed";
                
                let answered = 0;
                let skipped = 0;
                try {
                  const ansList = Array.isArray(p.answers) ? p.answers : JSON.parse(p.answers_json || "[]");
                  ansList.forEach((a: number) => {
                    if (a === -1 || a === undefined || a === null) skipped++;
                    else answered++;
                  });
                } catch (e) {
                  answered = score; 
                  skipped = total - score;
                }
                
                const wrong = answered - score;
                const categoryLabels: Record<string, string> = {
                  role: "Role Based",
                  project: "Project Based",
                  weak: "Weak Areas",
                  hr: "HR Questions"
                };

                return (
                  <TableRow key={p.id} className="hover:bg-muted/10 transition-all duration-200">
                    <td className="p-3 font-mono text-[10px] text-muted-foreground font-medium">
                      {new Date(p.started_at).toLocaleString()}
                    </td>
                    <td className="p-3 font-semibold text-foreground capitalize">
                      {categoryLabels[p.section] || p.section}
                    </td>
                    <td className="p-3 text-foreground/80 font-medium capitalize">
                      {p.scope || "General"}
                    </td>
                    <td className="p-3">
                      <span className={`inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold border uppercase ${
                        p.mcqs?.[0]?.difficulty === "hard"
                          ? "bg-red-500/10 text-red-600 border-red-500/20"
                          : p.mcqs?.[0]?.difficulty === "medium"
                          ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                          : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                      }`}>
                        {p.mcqs?.[0]?.difficulty || "Medium"}
                      </span>
                    </td>
                    <td className="p-3 text-center font-mono font-semibold">{total}</td>
                    <td className="p-3 text-center font-mono font-semibold">{answered}</td>
                    <td className="p-3 text-center font-mono font-bold text-green-600">{score}</td>
                    <td className="p-3 text-center font-mono font-bold text-destructive">{wrong}</td>
                    <td className="p-3 text-center font-mono font-semibold text-muted-foreground">{skipped}</td>
                    <td className="p-3 text-center font-mono font-bold text-foreground">{score}</td>
                    <td className="p-3 text-center font-mono font-bold text-indigo-600">{Math.round(p.percentage)}%</td>
                    <td className="p-3 text-center font-mono font-semibold text-muted-foreground">{p.duration_minutes} Mins</td>
                    <td className="p-3">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold border capitalize ${
                        isCompleted
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                          : "bg-blue-500/10 text-blue-600 border-blue-500/20"
                      }`}>
                        {p.status || "in_progress"}
                      </span>
                    </td>
                    <td className="p-3 text-right pr-6">
                      {isCompleted ? (
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => router.push(`/student/reports/preparation/${p.id}`)} 
                          className="h-8 rounded-lg text-primary hover:text-primary-hover hover:bg-muted font-bold text-xs"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          <span>Review</span>
                        </Button>
                      ) : (
                        <Button size="sm" variant="ghost" disabled className="h-8 rounded-lg text-muted-foreground/40 text-xs font-semibold">
                          Locked
                        </Button>
                      )}
                    </td>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <div className="p-16 text-center space-y-4 max-w-md mx-auto">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-foreground">No Preparation Reports</h3>
              <p className="text-xs text-muted-foreground">You don't have any SDE interview preparation attempts matching "{searchTerm}".</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
