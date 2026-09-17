import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClipboardList, Search, Filter, Calendar } from "lucide-react";
import ExamService from "@/services/exam.service";

export const StudentExams = () => {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSection, setSelectedSection] = useState("all");
  const [selectedDateFilter, setSelectedDateFilter] = useState("all");

  useEffect(() => {
    const loadExams = async () => {
      try {
        setLoading(true);
        const res = await ExamService.studentList();
        const examMap = new Map<string, any>();
        (res.data || []).forEach((row: any) => {
          const existing = examMap.get(String(row.id));
          if (!existing) {
            examMap.set(String(row.id), row);
          } else {
            if (row.attempt_id) {
              if (!existing.attempt_id || Number(row.attempt_id) > Number(existing.attempt_id)) {
                examMap.set(String(row.id), row);
              }
            }
          }
        });

        const uniqueExams = Array.from(examMap.values());
        const mappedExams = uniqueExams.map((e: any) => {
          const attempt = e.attempt_status ? {
            exam_id: String(e.id),
            status: e.attempt_status,
            total_score: e.total_score,
            id: e.attempt_id
          } : null;

          const mcqCount = Number(e.mcq_cnt || 0);
          const codingCount = Number(e.coding_cnt || 0);
          const calculatedCount = (mcqCount + codingCount) > 0 ? (mcqCount + codingCount) : Number(e.questions_count || 0);

          const mcqMarks = Number(e.mcq_marks || 0);
          const codingMarks = Number(e.coding_marks || 0);
          const calculatedMarks = (mcqMarks + codingMarks) > 0 ? (mcqMarks + codingMarks) : Number(e.total_marks || 0);

          let formattedType = "Mixed Evaluation";
          if (mcqCount > 0 && codingCount > 0) {
            formattedType = "Mixed Evaluation";
          } else if (mcqCount > 0 && codingCount === 0) {
            formattedType = "MCQ";
          } else if (codingCount > 0 && mcqCount === 0) {
            formattedType = "Coding Challenge";
          } else if (e.exam_type) {
            const rawType = String(e.exam_type).toLowerCase();
            formattedType = rawType === "mcq" ? "MCQ" : rawType === "coding" ? "Coding Challenge" : "Mixed Evaluation";
          }

          return {
            id: String(e.id),
            title: e.title,
            duration_min: Number(e.duration) || 60,
            total_marks: calculatedMarks,
            type: formattedType,
            questions_count: calculatedCount,
            description: e.description,
            pass_percentage: e.pass_percentage,
            start_date: e.start_date,
            end_date: e.end_date,
            created_at: e.created_at,
            attempt
          };
        });
        setExams(mappedExams);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadExams();
  }, []);

  const filteredExams = exams.filter((e) => {
    // Search Filter
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || (
      (e.title || "").toLowerCase().includes(q) ||
      (e.description || "").toLowerCase().includes(q) ||
      (e.type || "").toLowerCase().includes(q)
    );

    // Section / Type Filter
    const matchesSection = selectedSection === "all" || (e.type || "").toLowerCase().includes(selectedSection.toLowerCase());

    // Date Filter
    let matchesDate = true;
    if (selectedDateFilter === "active") {
      const now = new Date();
      const start = e.start_date ? new Date(e.start_date) : null;
      const end = e.end_date ? new Date(e.end_date) : null;
      if (start && start > now) matchesDate = false;
      if (end && end < now) matchesDate = false;
    } else if (selectedDateFilter === "upcoming") {
      const now = new Date();
      const start = e.start_date ? new Date(e.start_date) : null;
      if (!start || start <= now) matchesDate = false;
    } else if (selectedDateFilter === "past") {
      const now = new Date();
      const end = e.end_date ? new Date(e.end_date) : null;
      if (!end || end >= now) matchesDate = false;
    }

    return matchesSearch && matchesSection && matchesDate;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <ClipboardList className="w-6 h-6 text-primary" /> My Assigned Exams & Tests
        </h1>
        <div className="text-xs text-muted-foreground font-mono">
          Showing {filteredExams.length} of {exams.length} exams
        </div>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-card border border-border p-3.5 rounded-2xl shadow-xs">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
          <Input
            placeholder="Search exams by title or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs rounded-xl"
          />
        </div>

        {/* Section / Exam Type Filter */}
        <Select value={selectedSection} onValueChange={setSelectedSection}>
          <SelectTrigger className="h-9 text-xs rounded-xl">
            <div className="flex items-center gap-1.5 truncate">
              <Filter className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <span>Section: {selectedSection === "all" ? "All Sections / Types" : selectedSection}</span>
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sections / Types</SelectItem>
            <SelectItem value="mcq">MCQ Assessment</SelectItem>
            <SelectItem value="coding">Coding Challenge</SelectItem>
            <SelectItem value="mixed">Mixed Evaluation</SelectItem>
          </SelectContent>
        </Select>

        {/* Date Filter */}
        <Select value={selectedDateFilter} onValueChange={setSelectedDateFilter}>
          <SelectTrigger className="h-9 text-xs rounded-xl">
            <div className="flex items-center gap-1.5 truncate">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <span>Filter Date: {selectedDateFilter === "all" ? "All Dates" : selectedDateFilter}</span>
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Dates</SelectItem>
            <SelectItem value="active">Active & Open</SelectItem>
            <SelectItem value="upcoming">Upcoming</SelectItem>
            <SelectItem value="past">Completed / Expired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-16 text-muted-foreground">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-2" />
        </div>
      ) : filteredExams.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground text-sm">
          No exams found matching your search or selected filters.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filteredExams.map((e) => {
            const a = e.attempt;
            const isRetakeAvailable = a && a.status === "reassigned";
            const done = a && a.status !== "in_progress" && a.status !== "assigned" && a.status !== "reassigned";
            const inProgress = a && a.status === "in_progress";

            const isExamEnded = e.end_date ? new Date() >= new Date(e.end_date) : false;
            let statusText = "Not Started";
            let statusColor = "bg-muted text-muted-foreground";

            if (isRetakeAvailable) {
              statusText = "Retake Available";
              statusColor = "bg-amber-500/10 text-amber-600";
            } else if (done) {
              if (isExamEnded) {
                statusText = "Result Announced";
                statusColor = "bg-emerald-500/10 text-emerald-600 font-bold border border-emerald-500/20";
              } else {
                statusText = "Submitted (Auto-Announcing)";
                statusColor = "bg-blue-500/10 text-blue-600 font-semibold";
              }
            } else if (inProgress) {
              statusText = "In Progress";
              statusColor = "bg-blue-500/10 text-blue-600";
            }

            return (
              <div key={e.id} className="bg-card border border-border rounded-xl p-5 flex flex-col justify-between hover:border-primary/30 transition-all shadow-xs">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-foreground text-base leading-snug">{e.title}</h3>
                    <span className={`px-2.5 py-0.5 rounded text-xs shrink-0 capitalize ${statusColor}`}>
                      {statusText}
                    </span>
                  </div>
                  
                  <div className="text-xs text-muted-foreground mt-4 grid grid-cols-2 gap-y-2 gap-x-4">
                    <div className="flex items-center gap-1.5">⏱ <span>{e.duration_min} min</span></div>
                    <div className="flex items-center gap-1.5">❓ <span>{e.questions_count} questions</span></div>
                    <div className="flex items-center gap-1.5">📊 <span>{e.total_marks} marks</span></div>
                    <div className="flex items-center gap-1.5 capitalize">📝 <span>{e.type}</span></div>
                  </div>

                  {done && isExamEnded && (
                    <div className="mt-3 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs flex justify-between items-center font-semibold text-emerald-700">
                      <span>Total Score:</span>
                      <span>{a.total_score || 0} / {e.total_marks} Marks</span>
                    </div>
                  )}
                </div>

                <div className="mt-6">
                  <Link href={`/student/test/examdetails/${e.id}`} className="w-full block">
                    <Button size="sm" className="w-full bg-primary hover:bg-primary/95 font-semibold rounded-xl text-xs h-9">
                      {done ? (isExamEnded ? "View Announced Result & Score" : "View Submission Details") : "View Details & Take Exam"}
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentExams;
