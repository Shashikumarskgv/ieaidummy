import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ClipboardList } from "lucide-react";
import api from "@/lib/api";
import ExamService from "@/services/exam.service";
export const StudentExams = () => {
  const [exams, setExams] = useState<any[]>([]);
  const [attempts, setAttempts] = useState<any[]>([]);

  useEffect(() => {
    const loadExams = async () => {
      try {
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
          
          return {
            id: String(e.id),
            title: e.title,
            duration_min: e.duration,
            total_marks: e.total_marks || 100,
            type: e.exam_type || "Mixed",
            questions_count: e.questions_count || 10,
            description: e.description,
            pass_percentage: e.pass_percentage,
            attempt
          };
        });
        setExams(mappedExams);
      } catch (error) {
        console.error(error);
      }
    };
    loadExams();
  }, []);

  const pickLatestAttempt = (examAttempts: any[]) => {
    const statusRank: Record<string, number> = {
      in_progress: 4,
      assigned: 3,
      reassigned: 2,
      completed: 1,
      submitted: 1,
      auto_submitted: 1,
      terminated: 1,
      expired: 0,
      aborted: 0,
    };

    return [...examAttempts].sort((left, right) => {
      const statusDiff = (statusRank[right.status] || 0) - (statusRank[left.status] || 0);
      if (statusDiff !== 0) return statusDiff;
      return new Date(right.created_at || 0).getTime() - new Date(left.created_at || 0).getTime();
    })[0] || null;
  };

  useEffect(() => {
    const savedAttempts = JSON.parse(localStorage.getItem("dq_exam_attempts") || "[]");
    setAttempts(savedAttempts);
  }, []);

  const attemptByExam = Object.fromEntries(
    exams.map((exam) => [
      exam.id,
      exam.attempt || pickLatestAttempt(attempts.filter((attempt) => attempt.exam_id === exam.id)),
    ])
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
        <ClipboardList className="w-5 h-5 text-primary" /> My Exams
      </h1>
      {exams.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground text-sm">
          No exams assigned yet.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {exams.map((e) => {
            const a = attemptByExam[e.id];
            const isRetakeAvailable = a && a.status === "reassigned";
            const done = a && a.status !== "in_progress" && a.status !== "assigned" && a.status !== "reassigned";
            const inProgress = a && a.status === "in_progress";

            let statusText = "Not Started";
            let statusColor = "bg-muted text-muted-foreground";
            if (isRetakeAvailable) {
              statusText = "Retake Available";
              statusColor = "bg-amber-500/10 text-amber-600";
            }
            if (done) {
              statusText = "Completed";
              statusColor = "bg-green-500/10 text-green-600";
            } else if (inProgress) {
              statusText = "In Progress";
              statusColor = "bg-blue-500/10 text-blue-600";
            }

            return (
              <div key={e.id} className="bg-card border border-border rounded-xl p-5 flex flex-col justify-between hover:border-primary/30 transition-all shadow-sm">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-foreground text-base leading-snug">{e.title}</h3>
                    <span className={`px-2.5 py-0.5 rounded text-xs font-semibold shrink-0 capitalize ${statusColor}`}>
                      {statusText}
                    </span>
                  </div>
                  
                  <div className="text-xs text-muted-foreground mt-4 grid grid-cols-2 gap-y-2 gap-x-4">
                    <div className="flex items-center gap-1.5">⏱ <span>{e.duration_min} min</span></div>
                    <div className="flex items-center gap-1.5">❓ <span>{e.questions_count} questions</span></div>
                    <div className="flex items-center gap-1.5">📊 <span>{e.total_marks} marks</span></div>
                    <div className="flex items-center gap-1.5 capitalize">📝 <span>{e.type}</span></div>
                  </div>
                </div>

                <div className="mt-6">
                  <Link href={`/student/StudentExams/examdetails/${e.id}`} className="w-full block">
                    <Button size="sm" className="w-full bg-primary hover:bg-primary/95 font-semibold rounded-xl text-xs h-9">
                      View Details
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
