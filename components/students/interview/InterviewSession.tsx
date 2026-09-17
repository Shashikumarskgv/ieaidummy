import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, BookOpen, Code2, Loader2, FlaskConical, History } from "lucide-react";
import { toast } from "sonner";

const InterviewSession = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [testPicker, setTestPicker] = useState<{ qIdx: number; question: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState<{ mcq: any[]; coding: any[] }>({ mcq: [], coding: [] });

  useEffect(() => {
    if (!sessionId) return;

    // Load Mock Session Structure
    const mockSession = {
      id: sessionId,
      title: "Full Stack Engineering Assessment",
      difficulty: "Intermediate",
      target_role: "Software Developer",
      questions: [
        { question: "What is an architectural design paradigm?", type: "Theory", topic: "System Design", longAnswer: "It's an abstracted structure map determining modular interactions." },
        { question: "Implement a function returning unique array primitives.", type: "Practical", topic: "Algorithms", shortAnswer: "Utilize new Set() configurations." }
      ]
    };
    setSession(mockSession);

    // Filter historical data matching this local session context
    const localMcqs = JSON.parse(localStorage.getItem("dq_session_mcqs") || "[]").filter((m: any) => m.session_id === sessionId);
    const localCoding = JSON.parse(localStorage.getItem("dq_session_coding") || "[]").filter((c: any) => c.session_id === sessionId);
    setHistory({ mcq: localMcqs, coding: localCoding });
    setLoading(false);
  }, [sessionId]);

  const startMcq = () => {
    if (!testPicker || !session) return;
    setBusy(true);

    setTimeout(() => {
      const mockMcqRow = {
        id: `mcq_test_${Date.now()}`,
        session_id: session.id,
        source_question: testPicker.question,
        score: 0,
        total: 5,
        status: "in_progress",
        mcqs: Array(5).fill(null).map((_, i) => ({
          question: `Mock MCQ variant ${i + 1} derived from: ${testPicker.question}`,
          options: ["First Alpha choice", "Target Beta answer", "Gamma option block", "Delta runtime variant"],
          correctIndex: 1
        }))
      };

      const cached = JSON.parse(localStorage.getItem("dq_session_mcqs") || "[]");
      localStorage.setItem("dq_session_mcqs", JSON.stringify([mockMcqRow, ...cached]));
      setBusy(false);
      navigate(`/dashboard/interview-prep/${session.id}/mcq/${mockMcqRow.id}`);
    }, 1000);
  };

  const startCoding = () => {
    if (!testPicker || !session) return;
    setBusy(true);

    setTimeout(() => {
      const mockCodingRow = {
        id: `coding_test_${Date.now()}`,
        session_id: session.id,
        source_question: testPicker.question,
        status: "in_progress",
        problem: {
          title: "Local Implementation Problem",
          statement: `Construct a structural evaluation algorithm addressing: ${testPicker.question}`,
          starter_code: { javascript: "function solve(input) {\n  // Write solution code context here\n  return true;\n}" },
          test_cases: [{ input: "[1,2,2]", expected_output: "true", is_hidden: false }]
        }
      };

      const cached = JSON.parse(localStorage.getItem("dq_session_coding") || "[]");
      localStorage.setItem("dq_session_coding", JSON.stringify([mockCodingRow, ...cached]));
      setBusy(false);
      navigate(`/dashboard/interview-prep/${session.id}/coding/${mockCodingRow.id}`);
    }, 1000);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  if (!session) return <p className="text-muted-foreground">Session not found</p>;

  return (
    <>
      <div className="max-w-5xl mx-auto space-y-4">
        <Link to="/dashboard/interview-prep" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="w-4 h-4 mr-1" /> Back</Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{session.title}</h1>
          <p className="text-sm text-muted-foreground">{session.questions.length} questions · {session.difficulty} · {session.target_role}</p>
        </div>

        <Card>
          <CardContent className="p-4">
            <Accordion type="single" collapsible className="w-full">
              {session.questions.map((q: any, i: number) => (
                <AccordionItem key={i} value={`q-${i}`}>
                  <AccordionTrigger className="text-left hover:no-underline">
                    <div className="flex items-start gap-3 pr-4">
                      <span className="text-primary font-semibold shrink-0">Q{i + 1}.</span>
                      <span className="font-medium text-foreground">{q.question}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 pl-8">
                      <div className="flex gap-2 flex-wrap text-xs">
                        {q.type && <span className="px-2 py-0.5 rounded bg-primary/10 text-primary">{q.type}</span>}
                        {q.topic && <span className="px-2 py-0.5 rounded bg-muted text-muted-foreground">{q.topic}</span>}
                      </div>
                      {q.shortAnswer && <div><p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Answer Summary</p><p className="text-sm text-foreground">{q.shortAnswer}</p></div>}
                      <Button size="sm" onClick={() => setTestPicker({ qIdx: i, question: q.question })}>
                        <FlaskConical className="w-4 h-4" /> Test Yourself
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {(history.mcq.length > 0 || history.coding.length > 0) && (
          <Card>
            <CardContent className="p-4 space-y-2">
              <h3 className="font-semibold text-foreground flex items-center gap-2"><History className="w-4 h-4" /> Practice History</h3>
              {history.mcq.map((m) => (
                <Link key={m.id} to={`/dashboard/interview-prep/${session.id}/mcq/${m.id}`} className="flex justify-between items-center p-2 rounded hover:bg-muted text-sm">
                  <span className="truncate flex-1">MCQ · {m.source_question}</span>
                  <span className="text-muted-foreground text-xs ml-2">{m.status === "completed" ? `${m.score}/${m.total}` : "In progress"}</span>
                </Link>
              ))}
              {history.coding.map((c) => (
                <Link key={c.id} to={`/dashboard/interview-prep/${session.id}/coding/${c.id}`} className="flex justify-between items-center p-2 rounded hover:bg-muted text-sm">
                  <span className="truncate flex-1">Coding · {c.source_question}</span>
                  <span className="text-muted-foreground text-xs ml-2">{c.status}</span>
                </Link>
              ))}
            </CardContent>
          </Card>
        )}

        <Dialog open={!!testPicker} onOpenChange={(o) => !o && setTestPicker(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Choose Test Type</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button variant="outline" className="h-24 flex-col" disabled={busy} onClick={startMcq}>
                {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <BookOpen className="w-6 h-6" />}
                <span>MCQ Test</span>
              </Button>
              <Button variant="outline" className="h-24 flex-col" disabled={busy} onClick={startCoding}>
                {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <Code2 className="w-6 h-6" />}
                <span>Coding Test</span>
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default InterviewSession;
