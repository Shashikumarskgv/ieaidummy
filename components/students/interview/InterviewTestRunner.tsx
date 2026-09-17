import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Check, X, Loader2, Clock, Sparkles, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import InterviewService from "@/services/interview.service";

const InterviewTestRunner = () => {
  const { resultId } = useParams<{ resultId: string }>();
  const [row, setRow] = useState<any>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [remaining, setRemaining] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!resultId) return;

    const loadTest = async () => {
      try {
        setLoading(true);
        const data = await InterviewService.getTestResultById(resultId);
        if (data) {
          if (data.status === "completed") {
            window.location.href = `/student/reports/prep/${resultId}`;
            return;
          }

          setRow(data);
          const ans = data.answers || [];
          const mcqs = data.mcqs || [];
          setAnswers(ans.length ? ans.map((v: any) => Number(v)) : Array(mcqs.length).fill(-1));
          
          if (data.status === "in_progress") {
            const started = new Date(data.started_at).getTime();
            const duration = (data.duration_minutes || mcqs.length) * 60 * 1000;
            const left = Math.max(0, Math.floor((started + duration - Date.now()) / 1000));
            setRemaining(left);
          }
        } else {
          toast.error("Practice test session not found in database.");
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load test session.");
      } finally {
        setLoading(false);
      }
    };

    loadTest();
  }, [resultId]);

  useEffect(() => {
    if (!row || row.status !== "in_progress") return;
    if (remaining <= 0) { submit(true); return; }
    const t = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000);
    return () => clearInterval(t);
  }, [row, remaining]);

  const submit = async (auto = false) => {
    if (!row || row.status === "completed") return;
    setSubmitting(true);

    try {
      const updated = await InterviewService.submitTestSession(row.id, answers);
      if (updated) {
        setRow(updated);
        toast.success("Practice test submitted and evaluated successfully!");
        window.location.href = `/student/reports/prep/${row.id}`;
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to submit test session.");
    } finally {
      setSubmitting(false);
      if (auto) toast.info("Time up — auto submitted");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-2">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="text-xs text-muted-foreground font-semibold">Loading practice assessment session...</span>
      </div>
    );
  }

  if (!row) {
    return (
      <div className="min-h-[40vh] flex flex-col items-center justify-center text-center space-y-4 max-w-md mx-auto">
        <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold text-foreground text-sm">Session Not Found</h3>
          <p className="text-xs text-muted-foreground mt-1">We couldn't retrieve the assessment details from the database.</p>
        </div>
        <Link to="/dashboard/interview-prep" className="inline-flex items-center text-xs font-bold text-primary hover:underline">
          Go Back
        </Link>
      </div>
    );
  }

  const mcqs = row.mcqs || [];
  const completed = row.status === "completed";
  const mins = Math.floor(remaining / 60).toString().padStart(2, "0");
  const secs = (remaining % 60).toString().padStart(2, "0");

  return (
    <>
      <div className="max-w-3xl mx-auto space-y-4 animate-in fade-in duration-300">
        <Link to="/dashboard/interview-prep" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="w-4 h-4 mr-1" /> Back</Link>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground capitalize">{row.section} MCQ Test</h1>
            <p className="text-sm text-muted-foreground">{mcqs.length} questions · {row.duration_minutes || mcqs.length} min</p>
          </div>
          {!completed && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary font-mono font-semibold">
              <Clock className="w-4 h-4" /> {mins}:{secs}
            </div>
          )}
        </div>

        {completed && (
          <Card className="border-primary/40 bg-primary/5">
            <CardContent className="p-5">
              <h2 className="text-xl font-bold text-foreground">Score: {row.score}/{row.total} ({Math.round(Number(row.percentage))}%)</h2>
              <p className="text-sm text-muted-foreground">Correct: {row.correct} · Wrong: {row.wrong}</p>
            </CardContent>
          </Card>
        )}

        {mcqs.map((m: any, i: number) => {
          const userAns = answers[i];
          const isCorrect = userAns === m.correctIndex;
          return (
            <Card key={i}>
              <CardContent className="p-4 space-y-3">
                <p className="font-medium text-foreground">Q{i + 1}. {m.question}</p>
                <div className="space-y-2">
                  {(m.options || []).map((opt: string, oi: number) => {
                    const isUser = userAns === oi;
                    const isRight = m.correctIndex === oi;
                    const showState = completed && (isUser || isRight);
                    return (
                      <button
                        key={oi}
                        disabled={completed}
                        type="button"
                        onClick={() => { const a = [...answers]; a[i] = oi; setAnswers(a); }}
                        className={`w-full text-left p-2.5 rounded-lg border text-sm transition-colors flex items-center justify-between ${
                          showState
                            ? isRight ? "border-green-500 bg-green-500/10 text-green-700" : isUser ? "border-red-500 bg-red-500/10 text-destructive" : "border-border"
                            : isUser ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                        }`}
                      >
                        <span>{opt}</span>
                        {showState && isRight && <Check className="w-4 h-4 text-green-500" />}
                        {showState && isUser && !isRight && <X className="w-4 h-4 text-red-500" />}
                      </button>
                    );
                  })}
                </div>
                {completed && m.explanation && (
                  <div className="text-xs p-2 rounded bg-muted text-muted-foreground">
                    <span className={`font-semibold ${isCorrect ? "text-green-500" : "text-red-500"}`}>{isCorrect ? "Correct" : "Incorrect"}:</span> {m.explanation}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {!completed && (
          <Button onClick={() => submit(false)} disabled={submitting} size="lg" className="w-full">
            {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : <><Sparkles className="w-4 h-4" /> Submit Test</>}
          </Button>
        )}
      </div>
    </>
  );
};

export default InterviewTestRunner;
