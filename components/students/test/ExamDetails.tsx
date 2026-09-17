import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { ArrowLeft, Clock, ClipboardList, Award, HelpCircle } from "lucide-react";
import DOMPurify from "dompurify";

import ExamService from "@/services/exam.service";

const ExamDetails = () => {
  const params = useParams();
  const examId = (params?.id as string) || "ex_1";
  const router = useRouter();
  const [exam, setExam] = useState<any>(null);
  const [attempt, setAttempt] = useState<any>(null);
  const [fetching, setFetching] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (!examId) return;
    const loadDetails = async () => {
      try {
        setFetching(true);
        const res = await ExamService.studentList();
        const liveExam = (res.data || []).find((e: any) => String(e.id) === examId);
        
        if (!liveExam) {
          toast.error("Exam parameters matching this target reference identifier not found.");
          router.push("/student/test");
          return;
        }

        setExam({
          id: String(liveExam.id),
          title: liveExam.title,
          duration_min: liveExam.duration,
          total_marks: liveExam.total_marks || 100,
          type: liveExam.exam_type || "Mixed",
          questions_count: liveExam.questions_count || 10,
          description: liveExam.description,
          instructions: liveExam.instructions || "<p>Please ensure you have a stable internet connection. Fullscreen and proctoring controls will be active throughout the assessment.</p>",
          tab_switch_limit: liveExam.tab_switch_limit || 3,
          end_date: liveExam.end_date
        });

        const attemptObj = liveExam.attempt_status ? {
          exam_id: String(liveExam.id),
          status: liveExam.attempt_status,
          total_score: liveExam.total_score,
          id: liveExam.attempt_id,
          submitted_at: liveExam.submitted_at
        } : null;

        setAttempt(attemptObj);
      } catch (err: any) {
        console.error(err);
        toast.error("Failed to load exam details.");
      } finally {
        setFetching(false);
      }
    };
    loadDetails();
  }, [examId, router]);

  if (fetching || !exam) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const isCompleted = attempt && attempt.status !== "in_progress" && attempt.status !== "assigned" && attempt.status !== "reassigned";
  const isInProgress = attempt && attempt.status === "in_progress";
  const isRetakeAvailable = attempt && attempt.status === "reassigned";

  const handleStartExam = () => {
    setConfirmOpen(false);
    window.open(`/student/test/examrunner/${examId}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.push("/student/test")}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Exams
        </Button>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 md:p-8 space-y-6 shadow-sm">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">{exam.title}</h1>
          <div className="text-xs font-semibold text-muted-foreground mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
            <span className="flex items-center gap-1 bg-muted px-2 py-0.5 rounded"><Clock className="w-3.5 h-3.5 text-primary" /> {exam.duration_min} Minutes</span>
            <span className="flex items-center gap-1 bg-muted px-2 py-0.5 rounded"><HelpCircle className="w-3.5 h-3.5 text-primary" /> {exam.total_questions} Questions</span>
            <span className="flex items-center gap-1 bg-muted px-2 py-0.5 rounded"><Award className="w-3.5 h-3.5 text-primary" /> {exam.total_marks} Total Marks</span>
            <span className="capitalize flex items-center gap-1 bg-muted px-2 py-0.5 rounded"><ClipboardList className="w-3.5 h-3.5 text-primary" /> {exam.type}</span>
          </div>
        </div>

        {exam.description && (
          <div className="space-y-2 border-t border-border/60 pt-4">
            <h3 className="font-bold text-sm text-foreground">About this Exam</h3>
            <div 
              className="text-xs leading-relaxed text-muted-foreground max-w-none prose prose-sm dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(exam.description) }}
            />
          </div>
        )}

        {exam.instructions && (
          <div className="space-y-2 border-t border-border/60 pt-4">
            <h3 className="font-bold text-sm text-foreground">Instructions & Guidelines</h3>
            <div 
              className="text-xs leading-relaxed text-muted-foreground max-w-none prose prose-sm dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(exam.instructions) }}
            />
          </div>
        )}

        <div className="flex items-center justify-between border-t border-border/60 pt-6 gap-4">
          <Button variant="outline" onClick={() => router.push("/student/test")} className="rounded-xl font-bold text-xs">
            Back
          </Button>
          
          {isCompleted ? (
            (exam.end_date && new Date() >= new Date(exam.end_date)) ? (
              <Link href={`/student/test/reports/${attempt.id}`}>
                <Button className="bg-primary text-primary-foreground font-bold text-xs px-4 rounded-xl">
                  View Result
                </Button>
              </Link>
            ) : (
              <div className="flex flex-col items-end gap-1 bg-green-500/10 border border-green-500/20 p-3 rounded-xl">
                <span className="text-xs font-bold text-green-700">Exam Submitted Successfully</span>
                {attempt.submitted_at && (
                  <span className="text-[10px] text-muted-foreground font-medium">
                    Submission Time: {new Date(attempt.submitted_at).toLocaleString()}
                  </span>
                )}
                <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-200 uppercase">
                  Status: Submitted
                </span>
              </div>
            )
          ) : (
            <Button 
              onClick={() => setConfirmOpen(true)}
              className="bg-primary text-primary-foreground font-bold text-xs px-4 rounded-xl shadow-sm"
            >
              {isInProgress ? "Resume Active Attempt" : isRetakeAvailable ? "Start Assigned Retake" : "Begin Assessment"}
            </Button>
          )}
        </div>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold tracking-tight">Construct Testing Environment?</DialogTitle>
            <DialogDescription asChild className="pt-2 space-y-3">
              <div>
                <div className="text-xs font-semibold text-muted-foreground space-y-1 bg-muted/40 p-3 rounded-xl border">
                  <div>Time Bound Constraints: {exam.duration_min} Minutes</div>
                  <div>Inventory Evaluation Scope: {exam.total_questions} Questions total</div>
                </div>
                <div className="text-xs text-amber-600 bg-amber-500/10 p-3 rounded-xl border border-amber-500/20 font-medium leading-relaxed">
                  ⚠️ Navigation Restriction System active. Altering document browser windows focus boundary layers increments system alert counters automatically.
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:justify-end pt-2">
            <Button variant="ghost" onClick={() => setConfirmOpen(false)} className="rounded-xl text-xs font-semibold">
              Cancel
            </Button>
            <Button onClick={handleStartExam} className="bg-primary text-primary-foreground font-bold text-xs rounded-xl">
              Initialize Secure Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExamDetails;
