import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import dynamic from "next/dynamic";

const Editor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full min-h-[350px] flex items-center justify-center bg-zinc-950 text-zinc-400 text-xs">
      Loading Monaco Code Editor...
    </div>
  )
});
import { Clock, Play, Send, Maximize2, CheckCircle2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import ExamService from "@/services/exam.service";

const LANG_DEFAULTS: Record<string, string> = {
  python: "def solve():\n    pass\n\nif __name__ == \"__main__\":\n    solve()\n",
  javascript: "// Write your solution\n\nfunction solve(s, p) {\n    return true;\n}\n",
  cpp: "#include <iostream>\nusing namespace std;\n\nbool solve(string s, string p) {\n    return true;\n}\n",
  c: "#include <stdio.h>\n\nint main(void) {\n    return 0;\n}\n",
  java: "public class Main {\n    public static void main(String[] args) {\n    }\n}\n",
  sql: "SELECT * FROM table_name;\n",
};



export const ExamRunner = () => {
  const params = useParams();
  const examId = params?.id as string;
  const router = useRouter();

  const [exam, setExam] = useState<any>(null);
  const [mcqs, setMcqs] = useState<any[]>([]);
  const [codings, setCodings] = useState<any[]>([]);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [codeByQ, setCodeByQ] = useState<Record<string, { lang: string; code: string; codePerLang?: Record<string, string> }>>({});
  const [activeTab, setActiveTab] = useState<"mcq" | "code">("mcq");
  const [activeIdx, setActiveIdx] = useState(0);
  const [output, setOutput] = useState<any>(null);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Dynamic Right panel states
  const [rightTab, setRightTab] = useState<"problem" | "test" | "submit">("problem");
  const [customInput, setCustomInput] = useState("");
  const [testOutput, setTestOutput] = useState("");
  const [submitResult, setSubmitResult] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [tabSwitches, setTabSwitches] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionReason, setSubmissionReason] = useState<"manual" | "timer" | "proctoring">("manual");
  const submittedRef = useRef(false);
  const lastSwitchTimeRef = useRef(0);

  useEffect(() => {
    if (!examId) return;

    const initializeAttempt = async () => {
      try {
        const res = await ExamService.studentStart(Number(examId));
        const liveAttempt = res.data;
        const liveExam = liveAttempt.exam;

        const computedTotalMarks = 
          (liveExam.mcqs || []).reduce((s: number, m: any) => s + (m.marks || 1), 0) + 
          (liveExam.codings || []).reduce((s: number, c: any) => s + (c.marks || 10), 0);

        setExam({
          id: String(liveExam.id),
          title: liveExam.title,
          duration_min: liveExam.duration,
          tab_switch_limit: liveExam.tab_switch_limit || 3,
          total_marks: computedTotalMarks,
          fullscreen_required: !!liveExam.fullscreen_required,
          disable_copy_paste: !!liveExam.disable_copy_paste
        });

        setMcqs(liveExam.mcqs || []);
        setCodings(liveExam.codings || []);
        setAttemptId(String(liveAttempt.attempt_id));

        // Bootstrap code editor starter contexts with per-language code preservation
        const savedCode = JSON.parse(localStorage.getItem(`dq_coding_drafts_${examId}`) || "{}");
        const cb: Record<string, any> = {};
        (liveExam.codings || []).forEach((cq: any) => {
          const lang = cq.languages?.[0] || "python";
          const saved = savedCode[cq.id];
          const initialCodePerLang = saved?.codePerLang || {
            [lang]: saved?.code || cq.starter_code || LANG_DEFAULTS[lang] || ""
          };
          const initialCode = initialCodePerLang[lang] || cq.starter_code || LANG_DEFAULTS[lang] || "";
          cb[cq.id] = {
            lang: saved?.lang || lang,
            code: initialCode,
            codePerLang: initialCodePerLang
          };
        });
        setCodeByQ(cb);

        setTabSwitches(0);
        setTimeLeft(liveExam.duration * 60);
        setActiveTab(liveExam.mcqs.length > 0 ? "mcq" : "code");
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to start exam session.");
        setTimeout(() => {
          if (typeof window !== "undefined") {
            window.close();
            // Fallback redirect if window.close() is blocked by browser security
            setTimeout(() => {
              router.push("/student/StudentExams");
            }, 1000);
          } else {
            router.push("/student/StudentExams");
          }
        }, 1500);
      }
    };

    initializeAttempt();
  }, [examId]);

  useEffect(() => {
    if (examId && Object.keys(codeByQ).length > 0) {
      localStorage.setItem(`dq_coding_drafts_${examId}`, JSON.stringify(codeByQ));
    }
  }, [examId, codeByQ]);

  const registerTabSwitch = () => {
    if (!attemptId || timeLeft <= 0 || submittedRef.current) return;
    const now = Date.now();
    if (now - lastSwitchTimeRef.current < 1500) return; // 1.5s debounce to prevent double-firing
    lastSwitchTimeRef.current = now;

    setTabSwitches((prev) => {
      const next = prev + 1;
      const integrity = Math.max(0, 100 - next * 20);

      const savedAttempts = JSON.parse(localStorage.getItem("dq_exam_attempts") || "[]");
      localStorage.setItem("dq_exam_attempts", JSON.stringify(savedAttempts.map((a: any) => 
        a.id === attemptId ? { ...a, tab_switches: next, integrity_score: integrity } : a
      )));

      if (exam && next >= (exam.tab_switch_limit || 3)) {
        toast.error("Proctoring Alert: tab shifts/focus blurs limit exceeded. Force auto-submitting.");
        submitExam("proctoring");
      } else {
        toast.warning(`Proctoring Warning: window focus lost / tab shift detected (${next}/${exam?.tab_switch_limit || 3})`);
      }
      return next;
    });
  };

  // Full Screen requirement sync
  useEffect(() => {
    const onFullscreenChange = () => {
      const active = document.fullscreenElement !== null;
      setIsFullscreen(active);
      
      // If student exits fullscreen, increment tab switch security alert
      if (!active && attemptId && timeLeft > 0 && !submittedRef.current) {
        registerTabSwitch();
      }
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, [attemptId, timeLeft, exam]);

  // Tab switch and window focus tracking
  useEffect(() => {
    if (!attemptId || !exam || timeLeft <= 0) return;
    
    const onVis = () => {
      if (document.hidden) {
        registerTabSwitch();
      }
    };

    const onBlur = () => {
      registerTabSwitch();
    };

    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("blur", onBlur);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("blur", onBlur);
    };
  }, [attemptId, exam, timeLeft]);

  // Proctoring Restrictions (Right click, copy/cut/paste, selection lock, reload block)
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      toast.warning("Right-click context menu is disabled for security during the exam.");
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Copy/Cut/Paste
      if ((e.ctrlKey || e.metaKey) && ["c", "C", "x", "X", "v", "V"].includes(e.key)) {
        e.preventDefault();
        toast.warning("Clipboard operations (Copy/Cut/Paste) are blocked.");
      }
      // F12 and Console shortcuts
      if (
        e.key === "F12" ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && ["I", "i", "J", "j", "C", "c"].includes(e.key)) ||
        ((e.ctrlKey || e.metaKey) && ["U", "u"].includes(e.key))
      ) {
        e.preventDefault();
        toast.warning("Developer tools and viewing page source are disabled.");
      }
    };

    document.body.style.userSelect = "none";
    document.body.style.webkitUserSelect = "none";

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.userSelect = "auto";
      document.body.style.webkitUserSelect = "auto";
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Reload/tab closure interception warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (timeLeft > 0 && !submittedRef.current) {
        e.preventDefault();
        e.returnValue = "Exiting or refreshing the page will terminate your active exam session. Proceed?";
        return e.returnValue;
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [timeLeft]);

  // Countdown timer loop
  useEffect(() => {
    if (!attemptId || timeLeft <= 0) return;
    const t = setInterval(() => {
      setTimeLeft((s) => {
        if (s <= 1) {
          clearInterval(t);
          if (!submittedRef.current) submitExam("timer");
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [attemptId, timeLeft]);

  const selectMcq = (qId: string, idx: number) => {
    const nextAnswers = { ...answers, [qId]: idx };
    setAnswers(nextAnswers);
    localStorage.setItem(`dq_mcq_answers_${attemptId}`, JSON.stringify(nextAnswers));
  };

  const enterFullscreen = () => {
    document.documentElement.requestFullscreen().then(() => {
      setIsFullscreen(true);
    }).catch(() => {
      toast.error("Failed to acquire fullscreen display layout.");
    });
  };

  const runCode = async (mode: "run" | "submit") => {
    if (!cq || !attemptId) return;
    const currentCode = codeByQ[cq.id]?.code || "";
    const selectedLang = codeByQ[cq.id]?.lang || "javascript";

    if (mode === "run") {
      setRightTab("test");
      setRunning(true);
      setTestOutput("");
      try {
        const sandboxRes = await ExamService.studentRunCode(Number(examId), {
          coding_question_id: cq.id,
          code: currentCode,
          language: selectedLang,
          custom_input: customInput,
          use_test_cases: true
        });
        const runResult = sandboxRes.data || sandboxRes;
        const isSuccess = runResult.success !== false && !runResult.error;
        const status = isSuccess ? "Success" : "Execution Error";
        
        setTestOutput([
          `Status: ${status}`,
          runResult.message || runResult.error ? `Message: ${runResult.message || runResult.error}` : "",
          runResult.stdout !== undefined ? `stdout:\n${runResult.stdout}` : "",
          runResult.stderr !== undefined ? `stderr:\n${runResult.stderr}` : "",
          runResult.executionTime !== undefined || runResult.execution_time_ms !== undefined ? `Execution Time: ${runResult.executionTime || runResult.execution_time_ms} ms` : ""
        ].filter(Boolean).join("\n\n"));

        setOutput(runResult);
        if (isSuccess) {
          toast.success("Solution compiled and executed.");
        } else {
          toast.error(runResult.message || runResult.error || "Execution failed.");
        }
      } catch (err: any) {
        toast.error(err.response?.data?.message || err.message || "Execution failed.");
      } finally {
        setRunning(false);
      }
    } else {
      setRightTab("submit");
      setSubmitting(true);
      setSubmitResult(null);
      try {
        const res = await ExamService.studentSubmitCode({
          coding_question_id: Number(cq.id),
          attempt_id: Number(attemptId),
          language: selectedLang,
          code: currentCode
        });
        
        const summary = res.summary || {};
        const resultsList = res.results || [];
        const isAllPassed = summary.passed === summary.total && summary.total > 0;
        const failedIdx = resultsList.findIndex((r: any) => r.status !== "Passed");
        const failedItem = failedIdx >= 0 ? resultsList[failedIdx] : null;

        let earnedScore = 0;
        if (summary.score !== undefined) {
          earnedScore = Math.round((summary.score / 100) * (cq.marks || 100));
        }

        setSubmitResult({
          passed: isAllPassed,
          passedCount: summary.passed,
          failedCount: summary.failed,
          totalCount: summary.total,
          failedCase: failedIdx >= 0 ? failedIdx + 1 : undefined,
          expected: failedItem && !failedItem.is_hidden ? failedItem.expected_output : (failedItem?.is_hidden ? "<Hidden Test Case>" : undefined),
          received: failedItem && !failedItem.is_hidden ? failedItem.actual_output : (failedItem?.is_hidden ? "<Hidden Test Case>" : undefined),
          executionTime: `${summary.executionTime || 0} ms`,
          memory: "Isolated Container",
          score: earnedScore,
          details: resultsList.map((r: any) => ({
            ...r,
            passed: r.status === "Passed"
          }))
        });

        if (summary.compilationError) {
          toast.error("Compilation Error: Please check code syntax.");
        } else if (isAllPassed) {
          toast.success(`Congratulations! All ${summary.passed}/${summary.total} test cases passed (${summary.score}%).`);
        } else {
          toast.error(`Evaluated: ${summary.passed}/${summary.total} test cases passed (${summary.score}%).`);
        }
      } catch (err: any) {
        toast.error(err.response?.data?.message || err.message || "Submission failed.");
      } finally {
        setSubmitting(false);
      }
    }
  };

  const submitExam = async (reason: "manual" | "timer" | "proctoring" = "manual") => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setSubmitting(true);
    setSubmissionReason(reason);

    try {
      const payload = {
        attempt_id: Number(attemptId),
        answers: {
          mcqs: answers,
          codings: Object.entries(codeByQ).reduce((acc: any, [qId, val]: any) => {
            acc[qId] = { code: val.code, language: val.lang };
            return acc;
          }, {}),
          tab_switches: tabSwitches
        }
      };

      const res = await ExamService.studentSubmit(Number(examId), payload);
      
      const savedAttempts = JSON.parse(localStorage.getItem("dq_exam_attempts") || "[]");
      const updated = {
        id: attemptId,
        exam_id: examId,
        status: "completed",
        submitted_at: new Date().toISOString(),
        total_score: res.data?.total_score || 0,
        mcq_score: res.data?.mcq_score || 0,
        coding_score: res.data?.coding_score || 0,
        tab_switches: tabSwitches,
        integrity_score: Math.max(0, 100 - tabSwitches * 20)
      };
      
      localStorage.setItem("dq_exam_attempts", JSON.stringify(
        savedAttempts.map((a: any) => String(a.id) === String(attemptId) ? { ...a, ...updated } : a)
      ));

      setIsSubmitted(true);
      toast.success(
        reason === "timer" 
          ? "Timer elapsed: auto submission saved." 
          : reason === "proctoring" 
            ? "Session terminated due to security violations." 
            : "Assessment completed successfully!"
      );
      
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to submit exam.");
      submittedRef.current = false;
    } finally {
      setSubmitting(false);
    }
  };

  if (!exam || !attemptId) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

  // Submitted / Terminated Secure Screen
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center select-none animate-in fade-in duration-300">
        <div className="max-w-md w-full bg-card border border-border p-8 rounded-2xl shadow-lg space-y-6">
          <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center bg-primary/10">
            {submissionReason === "proctoring" ? (
              <ShieldAlert className="w-8 h-8 text-destructive" />
            ) : (
              <CheckCircle2 className="w-8 h-8 text-primary" />
            )}
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              {submissionReason === "proctoring" ? "Exam Session Terminated" : "Exam Submitted Successfully"}
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {submissionReason === "proctoring" && "Your exam session was terminated automatically because the security tab switch or fullscreen exit limits were exceeded."}
              {submissionReason === "timer" && "The exam time limit has elapsed. Your answers have been saved and submitted automatically."}
              {submissionReason === "manual" && "Thank you for completing the assessment. Your answers have been successfully uploaded."}
            </p>
          </div>

          <div className="text-[11px] bg-muted/50 border p-3.5 rounded-xl text-muted-foreground text-left space-y-1.5 font-medium">
            <div><strong>Candidate:</strong> Shashikumar S G</div>
            <div><strong>Roll Number:</strong> DQ-2026-004</div>
            <div><strong>Status:</strong> {submissionReason === "proctoring" ? "Terminated by System" : "Completed"}</div>
            <div><strong>Timestamp:</strong> {new Date().toLocaleString()}</div>
          </div>

          <p className="text-[10px] text-muted-foreground italic pt-2">
            You may now safely close this browser tab.
          </p>
        </div>
      </div>
    );
  }

  // Render Full Screen Block Screen
  if (!isFullscreen) {
    return (
      <div className="fixed inset-0 bg-background/95 backdrop-blur-md z-50 flex flex-col items-center justify-center space-y-6 p-6 text-center animate-in fade-in duration-300">
        <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center">
          <Maximize2 className="w-8 h-8 text-primary" />
        </div>
        <div className="space-y-2 max-w-md">
          <h2 className="text-xl font-bold tracking-tight">Full Screen Mode Required</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            This exam is monitored and requires an isolated fullscreen display layout. Swapping focus tabs or exiting fullscreen mode increments proctoring warnings.
          </p>
        </div>
        <Button onClick={enterFullscreen} size="lg" className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold px-6 py-2.5 rounded-xl text-xs h-10 shadow-md">
          Enter Full Screen & Begin
        </Button>
      </div>
    );
  }

  const mins = Math.floor(timeLeft / 60);
  const secs = Math.floor(timeLeft % 60);
  const mq = mcqs[activeIdx];
  const cq = codings[activeIdx];

  return (
    <div className="min-h-screen bg-background flex flex-col antialiased font-sans select-none">
      <header className="border-b border-border bg-card px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="space-y-0.5">
          <h1 className="font-bold text-foreground text-sm tracking-tight">{exam.title}</h1>
          <div className="text-[10px] font-bold text-muted-foreground/80 tracking-wide uppercase">
            Tab alterations: <span className="text-destructive font-extrabold">{tabSwitches}</span> / {exam.tab_switch_limit}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-xl font-mono text-xs font-bold border ${timeLeft < 300 ? "bg-destructive/10 text-destructive border-destructive/20 animate-pulse" : "bg-muted/80 text-foreground"}`}>
            <Clock className="w-3.5 h-3.5" /> {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
          </div>
          <Button onClick={() => submitExam("manual")} disabled={submitting} variant="destructive" size="sm" className="rounded-xl text-xs font-bold">
            <Send className="w-3.5 h-3.5 mr-1.5" /> Finish Exam
          </Button>
        </div>
      </header>

      <div className="border-b border-border/40 px-6 flex gap-1 bg-card/50">
        {mcqs.length > 0 && (
          <button onClick={() => { setActiveTab("mcq"); setActiveIdx(0); }} className={`py-2.5 px-4 text-xs font-bold border-b-2 tracking-tight transition-all ${activeTab === "mcq" ? "border-primary text-primary bg-primary/5" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            MCQ Evaluation Module ({mcqs.length})
          </button>
        )}
        {codings.length > 0 && (
          <button onClick={() => { setActiveTab("code"); setActiveIdx(0); setOutput(null); }} className={`py-2.5 px-4 text-xs font-bold border-b-2 tracking-tight transition-all ${activeTab === "code" ? "border-primary text-primary bg-primary/5" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            Practical Coding Matrix ({codings.length})
          </button>
        )}
      </div>

      <div className="flex-1 flex overflow-hidden">
        {activeTab === "mcq" ? (
          <aside className="w-44 border-r border-border/60 p-4 bg-card/30 space-y-3 overflow-y-auto print-hide">
            <div className="text-[10px] tracking-widest font-bold text-muted-foreground uppercase">Index map</div>
            <div className="grid grid-cols-4 gap-1.5">
              {mcqs.map((_, i) => (
                <button 
                  key={i} 
                  onClick={() => { setActiveIdx(i); setOutput(null); }} 
                  className={`aspect-square rounded-lg text-xs font-bold transition-all border ${
                    i === activeIdx ? "bg-primary text-primary-foreground border-primary shadow-sm" :
                    answers[mcqs[i]?.id] !== undefined ? "bg-green-500/10 text-green-600 border-green-500/20" :
                    "bg-muted/60 text-muted-foreground border-transparent hover:border-border"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </aside>
        ) : (
          <aside className="w-52 border-r border-border/60 p-4 bg-card/30 space-y-4 overflow-y-auto flex flex-col print-hide">
            <div className="text-[10px] tracking-widest font-bold text-muted-foreground uppercase">Problems</div>
            <div className="space-y-2">
              {codings.map((c, i) => (
                <button
                  key={c.id}
                  onClick={() => { setActiveIdx(i); setOutput(null); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-xs font-bold transition-all border ${
                    i === activeIdx 
                      ? "bg-primary/10 text-primary border-primary/20 shadow-sm" 
                      : "bg-muted/40 text-muted-foreground border-transparent hover:border-border"
                  }`}
                >
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] shrink-0 font-extrabold">{i + 1}</span>
                  <span className="truncate">{c.title}</span>
                </button>
              ))}
              {codings.length === 1 && (
                <>
                  <div className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-xs font-bold text-muted-foreground/50 border border-transparent bg-muted/10 cursor-not-allowed opacity-60">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-muted text-muted-foreground text-[10px] shrink-0 font-extrabold">2</span>
                    <span className="truncate">Two Sum (Locked)</span>
                  </div>
                  <div className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-xs font-bold text-muted-foreground/50 border border-transparent bg-muted/10 cursor-not-allowed opacity-60">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-muted text-muted-foreground text-[10px] shrink-0 font-extrabold">3</span>
                    <span className="truncate">Merge Intervals (Locked)</span>
                  </div>
                </>
              )}
            </div>
          </aside>
        )}

        <main className="flex-1 overflow-y-auto p-6 bg-background/50">
          {activeTab === "mcq" && mq && (
            <div className="max-w-3xl space-y-5 animate-in fade-in duration-300">
              <div className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase bg-muted/60 px-2.5 py-1 rounded inline-block">
                Question {activeIdx + 1} of {mcqs.length} • allocation: {mq.marks} marks
              </div>
              <h2 className="text-base font-bold text-foreground leading-snug whitespace-pre-wrap">{mq.question}</h2>
              
              <div className="space-y-2 pt-2">
                {(mq.options as string[]).map((opt, i) => (
                  <label key={i} className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${answers[mq.id] === i ? "border-primary bg-primary/5 ring-1 ring-primary/10 shadow-sm" : "border-border/80 hover:border-primary/40 bg-card/40"}`}>
                    <input type="radio" name={`q-${mq.id}`} checked={answers[mq.id] === i} onChange={() => selectMcq(mq.id, i)} className="mt-0.5 text-primary focus:ring-primary" />
                    <span className="text-xs font-semibold text-foreground/90">{String.fromCharCode(65 + i)}. {opt}</span>
                  </label>
                ))}
              </div>
              
              <div className="flex justify-between items-center pt-4 border-t border-border/40">
                <Button variant="outline" size="sm" className="rounded-xl font-bold text-xs" disabled={activeIdx === 0} onClick={() => setActiveIdx(activeIdx - 1)}>Previous</Button>
                <Button variant="outline" size="sm" className="rounded-xl font-bold text-xs" disabled={activeIdx === mcqs.length - 1} onClick={() => setActiveIdx(activeIdx + 1)}>Next</Button>
              </div>
            </div>
          )}

          {activeTab === "code" && cq && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-full min-h-[460px] animate-in fade-in duration-300 items-stretch">
              
              {/* Code Editor Column (7/12) */}
              <div className="lg:col-span-7 flex flex-col gap-3 h-full">
                
                {/* Editor Header Toolbar */}
                <div className="flex items-center justify-between gap-2 bg-card border border-border/60 p-2.5 rounded-xl shadow-sm">
                  <select 
                    className="px-2.5 py-1.5 rounded-xl border border-input bg-background font-bold text-xs focus:ring-1 focus:ring-primary cursor-pointer" 
                    value={codeByQ[cq.id]?.lang} 
                    onChange={(e) => {
                      const newLang = e.target.value;
                      const qState = codeByQ[cq.id] || { lang: newLang, code: "", codePerLang: {} };
                      const currentLang = qState.lang || "python";
                      const currentCode = qState.code || "";
                      
                      const updatedCodePerLang = {
                        ...(qState.codePerLang || {}),
                        [currentLang]: currentCode
                      };

                      const preservedCodeForNewLang = updatedCodePerLang[newLang] !== undefined
                        ? updatedCodePerLang[newLang]
                        : (cq.starter_code || LANG_DEFAULTS[newLang] || "");

                      const updatedQState = {
                        ...qState,
                        lang: newLang,
                        code: preservedCodeForNewLang,
                        codePerLang: {
                          ...updatedCodePerLang,
                          [newLang]: preservedCodeForNewLang
                        }
                      };

                      const updatedCb = { ...codeByQ, [cq.id]: updatedQState };
                      setCodeByQ(updatedCb);
                      localStorage.setItem(`dq_coding_drafts_${examId}`, JSON.stringify(updatedCb));
                    }}
                  >
                    {(cq.languages as string[]).map((l) => (
                      <option key={l} value={l}>{l.toUpperCase()}</option>
                    ))}
                  </select>
                  
                  <div className="flex gap-2">
                    {/* Run Code - White Button */}
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="rounded-xl text-xs font-bold h-8 border-border bg-card text-foreground hover:bg-muted/80 px-4 transition-all" 
                      onClick={() => runCode("run")} 
                      disabled={running || submitting}
                    >
                      {running && rightTab === "test" ? "Running..." : "Run Code"}
                    </Button>
                    
                    {/* Submit Solution - Primary Red Button */}
                    <Button 
                      size="sm" 
                      className="bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black h-8 px-4 shadow-sm transition-all" 
                      onClick={() => runCode("submit")} 
                      disabled={running || submitting}
                    >
                      {submitting && rightTab === "submit" ? "Evaluating..." : "Submit Solution"}
                    </Button>
                  </div>
                </div>

                {/* Monaco Editor Canvas */}
                <div className="border border-border/80 rounded-2xl overflow-hidden shadow-inner bg-card h-[450px] min-h-[350px] w-full">
                  <Editor
                    width="100%"
                    height="100%"
                    language={codeByQ[cq.id]?.lang === "cpp" ? "cpp" : codeByQ[cq.id]?.lang}
                    value={codeByQ[cq.id]?.code || ""}
                    onChange={(v) => {
                      const newCode = v || "";
                      const qState = codeByQ[cq.id] || { lang: "python", code: "", codePerLang: {} };
                      const currentLang = qState.lang || "python";
                      const updatedCodePerLang = {
                        ...(qState.codePerLang || {}),
                        [currentLang]: newCode
                      };
                      const updatedQState = {
                        ...qState,
                        code: newCode,
                        codePerLang: updatedCodePerLang
                      };
                      const updatedCb = { ...codeByQ, [cq.id]: updatedQState };
                      setCodeByQ(updatedCb);
                      localStorage.setItem(`dq_coding_drafts_${examId}`, JSON.stringify(updatedCb));
                    }}
                    theme="vs-dark"
                    options={{ minimap: { enabled: false }, fontSize: 13, padding: { top: 12 } }}
                  />
                </div>
              </div>

              {/* LeetCode Right Panel Tabs (5/12) */}
              <div className="lg:col-span-5 flex flex-col border border-border/60 bg-card rounded-2xl overflow-hidden shadow-sm h-full min-h-[450px]">
                
                {/* Right Panel Tabs Selector */}
                <div className="flex border-b border-border/60 bg-muted/40 px-3">
                  {(["problem", "test", "submit"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setRightTab(tab)}
                      className={`py-2.5 px-4 text-xs font-bold border-b-2 tracking-tight transition-all capitalize ${
                        rightTab === tab 
                          ? "border-primary text-primary" 
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Dynamic Content Body */}
                <div className="flex-1 overflow-y-auto p-5">
                  
                  {/* 1. Problem Tab */}
                  {rightTab === "problem" && (
                    <div className="space-y-4 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between">
                        <h2 className="text-base font-black text-foreground">{cq.title}</h2>
                        <div className="flex gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            cq.difficulty === "Easy" ? "bg-green-100 text-green-700" :
                            cq.difficulty === "Medium" ? "bg-amber-100 text-amber-700" :
                            "bg-red-100 text-red-700"
                          }`}>
                            {cq.difficulty || "Medium"}
                          </span>
                          <span className="text-[10px] bg-muted font-bold text-muted-foreground px-2 py-0.5 rounded">
                            Max Score: {cq.marks}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-4 text-xs leading-relaxed text-foreground/90">
                        <div className="prose prose-sm dark:prose-invert">
                          <p className="font-bold text-slate-800 dark:text-slate-200">Description</p>
                          <div className="text-muted-foreground/80 whitespace-pre-wrap">{cq.description || cq.statement}</div>
                        </div>

                        {cq.inputFormat && (
                          <div className="space-y-1 bg-muted/20 border border-border/40 p-3 rounded-xl">
                            <p className="font-bold text-slate-800 dark:text-slate-200">Input Format</p>
                            <p className="text-muted-foreground/80 whitespace-pre-wrap">{cq.inputFormat}</p>
                          </div>
                        )}

                        {cq.outputFormat && (
                          <div className="space-y-1 bg-muted/20 border border-border/40 p-3 rounded-xl">
                            <p className="font-bold text-slate-800 dark:text-slate-200">Output Format</p>
                            <p className="text-muted-foreground/80 whitespace-pre-wrap">{cq.outputFormat}</p>
                          </div>
                        )}

                        {cq.constraints && (
                          <div className="space-y-1 bg-muted/20 border border-border/40 p-3 rounded-xl">
                            <p className="font-bold text-slate-800 dark:text-slate-200">Constraints</p>
                            <p className="text-muted-foreground/80 font-mono whitespace-pre-wrap">{cq.constraints}</p>
                          </div>
                        )}

                        {cq.examples && cq.examples.map((ex: any, idx: number) => (
                          <div key={idx} className="space-y-2 border border-border/60 p-3 rounded-xl bg-card">
                            <p className="font-bold text-slate-900 dark:text-slate-100">Example {idx + 1}</p>
                            <div className="font-mono bg-muted/60 p-2 rounded-lg text-[11px] space-y-1">
                              <div><strong>Input:</strong> {ex.input}</div>
                              <div><strong>Output:</strong> {ex.output}</div>
                            </div>
                            {ex.explanation && (
                              <p className="text-muted-foreground italic text-[11px]"><strong>Explanation:</strong> {ex.explanation}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 2. Test Tab */}
                  {rightTab === "test" && (
                    <div className="space-y-4 animate-in fade-in duration-200 h-full flex flex-col justify-between">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Custom Input</label>
                        <textarea
                          value={customInput}
                          onChange={(e) => setCustomInput(e.target.value)}
                          className="w-full bg-card border border-border rounded-xl p-3 text-xs font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary min-h-[120px]"
                          placeholder="Enter custom inputs..."
                        />
                      </div>

                      <div className="space-y-2 flex-1 min-h-[150px] flex flex-col">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Output</label>
                        <div className="w-full bg-muted/50 border border-border rounded-xl p-3.5 text-xs font-mono flex-1 overflow-y-auto whitespace-pre-wrap">
                          {running ? (
                            <span className="text-muted-foreground animate-pulse">Running code execution...</span>
                          ) : testOutput ? (
                            testOutput
                          ) : (
                            <span className="text-muted-foreground/60 italic">Click Run Code to execute and view output log details.</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 3. Submit Tab */}
                  {rightTab === "submit" && (
                    <div className="space-y-4 animate-in fade-in duration-200">
                      {submitting ? (
                        <div className="flex flex-col items-center justify-center p-8 text-center space-y-3">
                          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                          <span className="text-xs text-muted-foreground font-semibold">Running test suite validations...</span>
                        </div>
                      ) : submitResult ? (
                        <div className="space-y-4">
                          {submitResult.passed ? (
                            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-700 dark:text-green-400 space-y-1">
                              <h3 className="font-black text-sm">Congratulations!</h3>
                              <p className="text-xs font-medium">All test cases passed. You can move to the next problem.</p>
                            </div>
                          ) : (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-700 dark:text-red-400 space-y-1">
                              <h3 className="font-black text-sm">Wrong Answer</h3>
                              <p className="text-xs font-medium">Testcase {submitResult.failedCase} Failed</p>
                            </div>
                          )}

                          <div className="border border-border/60 rounded-xl overflow-hidden bg-card">
                            <div className="bg-muted/40 p-2.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/60">
                              Test Case Statuses
                            </div>
                            <div className="divide-y divide-border/60">
                              {submitResult.details && submitResult.details.length > 0 ? (
                                submitResult.details.map((detail: any, idx: number) => {
                                  const isPassed = detail.status === "Passed" || detail.passed === true;
                                  const statusText = detail.status || (isPassed ? "Passed" : "Failed");
                                  return (
                                    <div key={idx} className="flex justify-between items-center px-4 py-2.5 text-xs">
                                      <span className="font-bold text-muted-foreground">Test case {idx + 1} {detail.is_hidden ? "(Hidden)" : ""}</span>
                                      {isPassed ? (
                                        <span className="text-green-600 font-extrabold flex items-center gap-0.5">✓ {statusText}</span>
                                      ) : (
                                        <span className="text-red-600 font-extrabold flex items-center gap-0.5">✗ {statusText}</span>
                                      )}
                                    </div>
                                  );
                                })
                              ) : (
                                <div className="p-3 text-xs text-muted-foreground italic text-center">No test cases executed.</div>
                              )}
                            </div>
                          </div>

                          {!submitResult.passed && (
                            <div className="grid grid-cols-2 gap-3">
                              <div className="p-3 bg-muted/40 border rounded-xl text-xs space-y-1">
                                <div className="font-bold text-muted-foreground uppercase text-[9px]">Expected</div>
                                <div className="font-mono text-slate-800 font-bold">{submitResult.expected}</div>
                              </div>
                              <div className="p-3 bg-muted/40 border rounded-xl text-xs space-y-1">
                                <div className="font-bold text-muted-foreground uppercase text-[9px]">Received</div>
                                <div className="font-mono text-red-600 font-bold">{submitResult.received}</div>
                              </div>
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-3 text-xs bg-muted/20 border border-border/40 p-4 rounded-xl font-medium">
                            <div className="space-y-1">
                              <div className="text-muted-foreground text-[9px] uppercase font-bold">Execution Time</div>
                              <div className="text-foreground font-bold">{submitResult.executionTime}</div>
                            </div>
                            <div className="space-y-1">
                              <div className="text-muted-foreground text-[9px] uppercase font-bold">Memory Usage</div>
                              <div className="text-foreground font-bold">{submitResult.memory}</div>
                            </div>
                            <div className="space-y-1 mt-2">
                              <div className="text-muted-foreground text-[9px] uppercase font-bold">Active Language</div>
                              <div className="text-foreground font-bold">{(codeByQ[cq.id]?.lang || "python").toUpperCase()}</div>
                            </div>
                            <div className="space-y-1 mt-2">
                              <div className="text-muted-foreground text-[9px] uppercase font-bold">Earned Score</div>
                              <div className={`font-black ${submitResult.passed ? "text-green-600" : "text-amber-600"}`}>
                                {submitResult.score} / {cq.marks}
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-muted-foreground/60 italic text-xs h-32 flex items-center justify-center text-center">
                          Click Submit Solution to execute code against the complete test suite.
                        </div>
                      )}
                    </div>
                  )}

                </div>
              </div>

            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ExamRunner;