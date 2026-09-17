"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Search, Calendar, Clock, Award, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { toast } from "sonner";
import ExamService from "@/services/exam.service";

export default function HODExams() {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadExams = async (q: string = "") => {
    try {
      setLoading(true);
      const res = await ExamService.getAll(q);
      setExams(res.data || []);
    } catch {
      toast.error("Failed to load exams directory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExams();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadExams(search);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this exam?")) return;
    try {
      await ExamService.delete(id);
      toast.success("Exam deleted successfully.");
      await loadExams(search);
    } catch {
      toast.error("Failed to delete exam.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between border-b border-border pb-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Award className="w-8 h-8 text-primary shrink-0" />
            <span>Manage Assessments & Exams</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Design course evaluations, MCQs, and coding challenges.</p>
        </div>
        <Link href="/hod/exams/create">
          <Button className="bg-primary text-white rounded-xl text-xs font-semibold px-4 py-2 h-10 shadow-sm flex items-center gap-1">
            <Plus className="w-4 h-4" />
            <span>Create Exam</span>
          </Button>
        </Link>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search exams by title or description..."
            className="pl-9 rounded-xl border-border bg-card text-xs h-10"
          />
        </div>
        <Button type="submit" variant="secondary" className="rounded-xl text-xs h-10 px-4 font-semibold">
          Search
        </Button>
      </form>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="text-xs">Loading assessments directory...</span>
          </div>
        ) : exams.length > 0 ? (
          <Table className="w-full text-sm">
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="font-semibold">Exam Title</TableHead>
                <TableHead className="font-semibold">Schedule & Duration</TableHead>
                <TableHead className="font-semibold">Passing criteria</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border">
              {exams.map((e) => (
                <TableRow key={e.id} className="hover:bg-muted/10 transition-all">
                  <td className="p-4">
                    <div className="font-semibold text-foreground">{e.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{e.description || "No description provided."}</div>
                  </td>
                  <td className="p-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{e.duration} min</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-[10px]">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>
                        {new Date(e.start_date).toLocaleDateString()} - {new Date(e.end_date).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-xs">
                    <div>Pass percentage: <span className="font-bold text-primary">{e.pass_percentage}%</span></div>
                    {e.negative_marking ? (
                      <span className="text-[10px] text-destructive font-semibold">Negative marking enabled</span>
                    ) : (
                      <span className="text-[10px] text-muted-foreground">No negative marking</span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                      e.status === "Published"
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                    }`}>
                      {e.status}
                    </span>
                  </td>
                  <td className="p-4 text-right pr-6">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/hod/exams/edit/${e.id}`}>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-full hover:bg-muted text-muted-foreground">
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(e.id)} className="h-8 w-8 p-0 rounded-full hover:bg-muted text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="p-16 text-center text-muted-foreground text-xs italic">
            No exams created. Click "Create Exam" to get started.
          </div>
        )}
      </div>
    </div>
  );
}
