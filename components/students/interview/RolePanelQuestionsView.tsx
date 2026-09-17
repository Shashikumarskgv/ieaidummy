import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, CheckCheck, Loader2, FlaskConical } from "lucide-react";
import { toast } from "sonner";
import InterviewService from "@/services/interview.service";

export default function RolePanelQuestionsView() {
  const { panelNumber } = useParams<{ panelNumber: string }>();
  const navigate = useNavigate();
  const [roleName, setRoleName] = useState<string>("");
  const [questions, setQuestions] = useState<any[]>([]);
  const [progress, setProgress] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  
  // Selected questions state for testing
  const [selected, setSelected] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (!panelNumber) return;
    setLoading(true);

    const loadData = async () => {
      const pNum = Number(panelNumber);
      const panels = await InterviewService.getPanels();
      const currentPanel = (panels || []).find((p: any) => Number(p.panelNumber) === pNum);
      if (currentPanel && currentPanel.selectedRole) {
        setRoleName(currentPanel.selectedRole);
      }

      let qs = await InterviewService.getSectionQuestions("role", pNum);
      if (!qs || qs.length === 0) {
        qs = Array.from({ length: 50 }, (_, i) => ({
          question: `Question ${i + 1}: What are the core technical principles, architectural tradeoffs, and performance considerations for ${currentPanel?.selectedRole || "Software Engineering"}?`,
          difficulty: i % 3 === 0 ? "Easy" : i % 3 === 1 ? "Medium" : "Hard",
          topic: "Technical Architecture & System Design",
          shortAnswer: "Focus on clean modular code, proper error handling, unit test coverage, and scalable database schema design.",
          longAnswer: "Engineers must balance short-term delivery velocity with long-term code maintainability. Ensure robust validation, exception logging, and efficient query optimization."
        }));
      }
      setQuestions(qs);

      const progSaved = localStorage.getItem(`dq_role_panel_progress_${panelNumber}`);
      if (progSaved) {
        try { setProgress(JSON.parse(progSaved)); } catch (e) { setProgress({}); }
      }
      setLoading(false);
    };

    loadData();
  }, [panelNumber, navigate]);

  const toggleComplete = (i: number, checked: boolean) => {
    const key = `q_${i}`;
    const newProg = { ...progress, [key]: checked };
    setProgress(newProg);
    localStorage.setItem(`dq_role_panel_progress_${panelNumber}`, JSON.stringify(newProg));
    InterviewService.toggleProgress("role", Number(panelNumber), i + 1, checked);
  };

  const markAll = () => {
    const newProg: Record<string, boolean> = {};
    questions.forEach((_, i) => {
      newProg[`q_${i}`] = true;
    });
    setProgress(newProg);
    localStorage.setItem(`dq_role_panel_progress_${panelNumber}`, JSON.stringify(newProg));
    toast.success("All questions marked complete.");
  };

  const selectedCount = useMemo(() => Object.values(selected).filter(Boolean).length, [selected]);

  const goToTest = () => {
    const indices = Object.entries(selected).filter(([, v]) => v).map(([k]) => Number(k));
    const qParam = indices.length > 0 ? `&indices=${indices.join(",")}` : "";
    navigate(`/test/setup/role?panel=${panelNumber}${qParam}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const doneCount = Object.values(progress).filter(Boolean).length;

  const isAllSelected = selectedCount === questions.length && questions.length > 0;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelected({});
      toast.info("Deselected all questions.");
    } else {
      const newSel: Record<number, boolean> = {};
      questions.forEach((_, i) => {
        newSel[i] = true;
      });
      setSelected(newSel);
      toast.success(`Selected all ${questions.length} questions for testing.`);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-5 animate-in fade-in duration-300">
      <Link
        to="/dashboard/interview-prep/section/role"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Panel List
      </Link>

      <div className="flex items-start justify-between flex-wrap gap-3">
        <div className="space-y-1">
          <span className="text-[10px] font-extrabold tracking-wider bg-primary/10 text-primary px-2.5 py-0.5 rounded-full uppercase">
            Panel {panelNumber}
          </span>
          <h1 className="text-2xl font-black text-foreground pt-1">{roleName} Questions</h1>
          <p className="text-sm text-muted-foreground">
            {questions.length} questions · {doneCount}/{questions.length} completed
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button 
            variant={isAllSelected ? "secondary" : "outline"} 
            size="sm" 
            className="rounded-xl font-bold text-xs" 
            onClick={toggleSelectAll}
          >
            <CheckCheck className="w-4 h-4 mr-1 text-primary" />
            {isAllSelected ? "Deselect All Questions" : "✔ Select All Questions"}
          </Button>
          <Button onClick={goToTest} size="sm" className="rounded-xl font-bold text-xs shadow-sm">
            <FlaskConical className="w-4 h-4 mr-1" /> Test {selectedCount > 0 ? `(${selectedCount} selected)` : ""}
          </Button>
          <Button variant="outline" size="sm" className="rounded-xl font-bold text-xs" onClick={markAll}>
            <CheckCheck className="w-4 h-4 mr-1" /> Mark All Complete
          </Button>
        </div>
      </div>

      <Card className="border-border/60 shadow-sm">
        <CardContent className="p-4">
          <Accordion type="multiple" className="w-full">
            {questions.map((q: any, i: number) => {
              const key = `q_${i}`;
              const done = !!progress[key];
              return (
                <AccordionItem key={i} value={`q-${i}`}>
                  <div className="flex items-center gap-2 pr-2">
                    <Checkbox
                      checked={!!selected[i]}
                      onCheckedChange={(v) => setSelected((s) => ({ ...s, [i]: !!v }))}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <AccordionTrigger className="flex-1 text-left hover:no-underline py-3.5">
                      <div className="flex items-start gap-3 pr-4 w-full">
                        <span className={`font-semibold shrink-0 ${done ? "text-green-500" : "text-primary"}`}>
                          Q{i + 1}.
                        </span>
                        <span className={`font-medium ${done ? "line-through text-muted-foreground" : "text-foreground"}`}>
                          {q.question}
                        </span>
                      </div>
                    </AccordionTrigger>
                  </div>
                  <AccordionContent className="pb-4 animate-in slide-in-from-top-2 duration-300">
                    <div className="space-y-3.5 pl-8">
                      <div className="flex gap-2 flex-wrap text-[10px] font-bold">
                        <span
                          className={`px-2 py-0.5 rounded ${
                            q.difficulty === "Easy"
                              ? "bg-green-100 text-green-700"
                              : q.difficulty === "Medium"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {q.difficulty}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-muted text-muted-foreground uppercase">
                          {q.topic}
                        </span>
                      </div>

                      {q.shortAnswer && (
                        <div>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                            Answer Outline
                          </p>
                          <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                            {q.shortAnswer}
                          </p>
                        </div>
                      )}

                      {/* Read More Detailed Answer and Examples */}
                      <DetailedAnswer question={q.question} topic={q.topic} shortAnswer={q.shortAnswer} />

                      <label className="inline-flex items-center gap-2 text-xs font-bold cursor-pointer select-none">
                        <Checkbox checked={done} onCheckedChange={(v) => toggleComplete(i, !!v)} />
                        <span className={done ? "text-green-500" : "text-foreground"}>
                          {done ? "Completed" : "Mark as Complete"}
                        </span>
                      </label>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}

const getDetailedExplanation = (question: string, topic: string, shortAnswer: string) => {
  const lower = question.toLowerCase();
  let explanation = "";
  let example = "";

  if (lower.includes("rest") || lower.includes("api") || lower.includes("idempotency")) {
    explanation = "REST (Representational State Transfer) is an architectural style for network design. An operation is idempotent if making the same request multiple times produces the same result on the server state. For example, GET is safe and idempotent since it only retrieves data, whereas POST is not idempotent because repeating it creates multiple resource records.";
    example = "E-Commerce Payment API: When submitting a payment transaction, calling POST /payments might create duplicate charges if repeated due to network retries. Using an idempotency key header (e.g., Idempotency-Key: key_1234) allows the server to recognize subsequent identical requests and return the cached initial transaction result without duplicate charging.";
  } else if (lower.includes("normalization") || lower.includes("database") || lower.includes("b-tree")) {
    explanation = "Database normalization optimizes relational schema design to eliminate data redundancy and prevent anomalies. 1NF removes repeating groups; 2NF removes partial dependencies on composite keys; 3NF removes transitive dependencies (non-key columns depending on other non-key columns). B-Tree indices provide O(log N) search times by maintaining sorted keys in hierarchical nodes.";
    example = "Retail Order System: Storing Customer Name and Billing Address directly in every row of an Orders table causes duplicate data and update anomalies if the customer address changes. Splitting this into a Customers table and an Orders table referenced by CustomerID achieves 3NF, reducing storage footprint and safeguarding database consistency.";
  } else if (lower.includes("injection") || lower.includes("parameterized") || lower.includes("security")) {
    explanation = "SQL Injection (SQLi) occurs when untrusted input is directly concatenated into SQL query strings, allowing attackers to manipulate queries. Parameterized queries resolve this by pre-compiling the SQL statement template on the database server and passing parameters as isolated values that cannot be parsed as executable commands.";
    example = "User Login Verification: Concatenating input like `SELECT * FROM users WHERE email = '` + input + `'` allows an attacker to input `' OR '1'='1` to bypass security verification. Pre-compiling `SELECT * FROM users WHERE email = ?` treats the input purely as a literal string value, rendering the injection harmless.";
  } else if (lower.includes("event loop") || lower.includes("node") || lower.includes("non-blocking")) {
    explanation = "Node.js runs on a single-threaded event loop utilizing Libuv for asynchronous non-blocking I/O operations. Offloading heavy tasks (like file I/O or crypto operations) to Libuv's Thread Pool prevents blocking the execution of the main JS execution loop.";
    example = "Web Server File Upload: Instead of pausing server execution to read a large file off a disk (blocking other requests), Node initiates a read stream and returns execution control back to the event loop. The loop continues servicing incoming traffic and handles the file upload completion callback asynchronously.";
  } else {
    explanation = shortAnswer || "Detailed architectural overview of the concepts, best practices, execution cycles, runtime environments, and core security guidelines associated with this question.";
    example = "Production implementation scenario illustrating standard integration patterns, optimization approaches, and debugging strategies in enterprise-scale systems.";
  }

  return { explanation, example };
};

const DetailedAnswer = ({ question, topic, shortAnswer }: { question: string; topic: string; shortAnswer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { explanation, example } = getDetailedExplanation(question, topic, shortAnswer);

  return (
    <div className="mt-3 border-t border-border/40 pt-3">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="text-xs font-bold text-primary hover:text-primary/80 hover:underline flex items-center gap-1 transition-colors"
        >
          <span>📖</span> Read More (Detailed Answer & Examples)
        </button>
      ) : (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="bg-primary/5 border border-primary/10 rounded-xl p-3.5 space-y-2">
            <h4 className="text-xs font-extrabold text-primary uppercase tracking-wider flex items-center gap-1.5">
              <span>💡</span> Detailed Explanation
            </h4>
            <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-350 font-medium">
              {explanation}
            </p>
          </div>

          <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-3.5 space-y-2">
            <h4 className="text-xs font-extrabold text-emerald-600 dark:text-emerald-500 uppercase tracking-wider flex items-center gap-1.5">
              <span>🚀</span> Real-World Example
            </h4>
            <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-350 font-medium">
              {example}
            </p>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="text-xs font-bold text-muted-foreground hover:text-foreground hover:underline flex items-center gap-1 transition-colors"
          >
            Collapse
          </button>
        </div>
      )}
    </div>
  );
};
