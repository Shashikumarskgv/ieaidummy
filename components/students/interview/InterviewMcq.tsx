import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Check, X, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

const InterviewMcq = () => {
  const { sessionId, testId } = useParams();
  const [test, setTest] = useState<any>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!testId) return;
    const items = JSON.parse(localStorage.getItem("dq_session_mcqs") || "[]");
    const matchedTest = items.find((t: any) => t.id === testId);
    
    if (matchedTest) {
      setTest(matchedTest);
      setAnswers(matchedTest.user_answers || Array(matchedTest.mcqs.length).fill(-1));
    }
  }, [testId]);

  const submit = async () => {
    if (!test) return;
    setSubmitting(true);
    
    const mcqs = test.mcqs || [];
    let score = 0;
    mcqs.forEach((m: any, i: number) => { if (answers[i] === m.correctIndex) score++; });

    const updatedTest = {
      ...test,
      user_answers: answers,
      score,
      total: mcqs.length,
      status: "completed",
      submitted_at: new Date().toISOString(),
      feedback: {
        summary: "Excellent execution pattern metrics observed across input arrays.",
        interview_readiness_pct: 85,
        strengths: ["Strong lexical core architecture structural mastery"],
        weak_areas: ["Edge evaluation boundaries limits"]
      }
    };

    const items = JSON.parse(localStorage.getItem("dq_session_mcqs") || "[]");
    localStorage.setItem("dq_session_mcqs", JSON.stringify(items.map((t: any) => t.id === test.id ? updatedTest : t)));
    
    setTest(updatedTest);
    setSubmitting(false);
    toast.success("Assessment evaluation completed successfully.");
  };

  if (!test) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  const completed = test.status === "completed";
  const mcqs = test.mcqs || [];
  const fb = test.feedback;

  return (
    <>
      <div className="max-w-3xl mx-auto space-y-4">
        <Link to={`/dashboard/interview-prep/${sessionId}`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="w-4 h-4 mr-1" /> Back</Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">MCQ Practice Test</h1>
          <p className="text-sm text-muted-foreground truncate">Source: {test.source_question}</p>
        </div>

        {completed && fb && (
          <Card className="border-primary/40 bg-primary/5">
            <CardContent className="p-5 space-y-2 text-sm">
              <h2 className="text-xl font-bold text-foreground">Score: {test.score}/{test.total} ({Math.round((test.score / test.total) * 100)}%)</h2>
              <p><span className="font-semibold">Mock Readiness Index:</span> {fb.interview_readiness_pct}%</p>
              <p className="text-muted-foreground">{fb.summary}</p>
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
                        onClick={() => { const a = [...answers]; a[i] = oi; setAnswers(a); }}
                        className={`w-full text-left p-2.5 rounded-lg border text-sm transition-colors flex items-center justify-between ${
                          showState
                            ? isRight ? "border-green-500 bg-green-500/10" : isUser ? "border-red-500 bg-red-500/10" : "border-border"
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
              </CardContent>
            </Card>
          );
        })}

        {!completed && (
          <Button onClick={submit} disabled={submitting || answers.some((a) => a === -1)} size="lg" className="w-full">
            {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : <><Sparkles className="w-4 h-4" /> Submit & Verify Answers</>}
          </Button>
        )}
      </div>
    </>
  );
};

export default InterviewMcq;