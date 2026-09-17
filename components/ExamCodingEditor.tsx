"use client";

import React, { useState } from "react";
import CodeEditor from "@/components/CodeEditor";
import DatabaseExplorer from "@/components/DatabaseExplorer";
import ExecutionPanel, {
  ExecutionStatus,
  ExecutionResult,
} from "@/components/ExecutionPanel";

export interface MCQQuestionItem {
  id: number;
  questionOrder: number;
  marks: number;
  title: string;
  questionText: string;
  options: {
    key: "A" | "B" | "C" | "D";
    text: string;
  }[];
  correctOption: "A" | "B" | "C" | "D";
}

export interface ExamQuestionItem {
  id: number;
  questionOrder: number;
  marks: number;
  language: string;
  questionType: string;
  title: string;
  description: string | null;
  problemStatement: string | null;
  constraints: string | null;
  inputFormat: string | null;
  outputFormat: string | null;
  exampleInput: string | null;
  exampleOutput: string | null;
  starterCode: string | null;
  setupSql?: string | null;
}

export interface AnswerRecord {
  answerId?: number;
  language: string;
  answerCode: string;
  status: string;
  score: number;
  maxScore: number;
  passedTests: number;
  totalTests: number;
}

export interface SubmitAnswerData {
  success: boolean;
  attemptId: number;
  questionId: number;
  score: number;
  maxScore: number;
  passedTests: number;
  totalTests: number;
  status: string;
  tests: Array<{
    testNumber: number;
    passed: boolean;
    status: string;
    executionTimeMs?: number;
  }>;
  error?: string;
}

interface ExamCodingEditorProps {
  examName: string;
  attemptId: number;
  questions: ExamQuestionItem[];
  answers: Record<number, AnswerRecord>;
  remainingSeconds: number | null;
  isExamLocked: boolean;
  onRunCode: (
    language: string,
    code: string,
    customInput: string,
    questionId: number,
    overrideSessionId?: string
  ) => Promise<{ status: ExecutionStatus; result: ExecutionResult | null }>;
  onSubmitAnswer: (
    questionId: number,
    code: string
  ) => Promise<SubmitAnswerData | null>;
  onFinishExam: (
    mcqAnswers?: Record<number, "A" | "B" | "C" | "D">,
    codeByQuestion?: Record<number, string>,
    isSecurityViolation?: boolean
  ) => void;
  isSubmittingExam?: boolean;
  onOpenGenerator?: () => void;
  mcqQuestions?: MCQQuestionItem[];
}

export default function ExamCodingEditor({
  examName,
  attemptId,
  questions,
  answers,
  remainingSeconds,
  isExamLocked,
  onRunCode,
  onSubmitAnswer,
  onFinishExam,
  isSubmittingExam = false,
  onOpenGenerator,
  mcqQuestions = [],
}: ExamCodingEditorProps) {
  // ----------------------------------------------------
  // 2-STAGE SEQUENTIAL EXAM PROGRESSION STATE
  // ----------------------------------------------------
  const [activeSection, setActiveSection] = useState<"MCQ" | "CODING">(mcqQuestions.length > 0 ? "MCQ" : "CODING");
  const [activeMcqIdx, setActiveMcqIdx] = useState<number>(0);
  const [mcqAnswers, setMcqAnswers] = useState<Record<number, "A" | "B" | "C" | "D">>({});
  const [isMcqSubmitted, setIsMcqSubmitted] = useState<boolean>(mcqQuestions.length === 0);
  const [mcqScoreResult, setMcqScoreResult] = useState<{
    score: number;
    total: number;
    maxScore: number;
  } | null>(null);

  const [activeQuestionIdx, setActiveQuestionIdx] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<"Problem" | "Test" | "Submit">("Problem");

  // Code state per question ID
  const [codeByQuestion, setCodeByQuestion] = useState<Record<number, string>>(() => {
    const initial: Record<number, string> = {};
    questions.forEach((q) => {
      const saved = answers[q.id];
      initial[q.id] = saved?.answerCode ?? q.starterCode ?? "";
    });
    return initial;
  });

  const [customInput, setCustomInput] = useState<string>("");
  const [executionStatus, setExecutionStatus] = useState<ExecutionStatus>("idle");
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState<boolean>(false);
  const [submitResults, setSubmitResults] = useState<Record<number, SubmitAnswerData>>({});
  const [sqlRefreshTrigger, setSqlRefreshTrigger] = useState<number>(0);

  // ----------------------------------------------------
  // CLIENT-SIDE EXAM SECURITY & LOCKDOWN LAYER
  // ----------------------------------------------------
  const [tabAlterations, setTabAlterations] = useState<number>(0);
  const [securityToast, setSecurityToast] = useState<string | null>(null);
  const [isSecurityLocked, setIsSecurityLocked] = useState<boolean>(false);

  const [showMcqSubmitConfirmModal, setShowMcqSubmitConfirmModal] = useState<boolean>(false);
  const [showFinishExamConfirmModal, setShowFinishExamConfirmModal] = useState<boolean>(false);

  const [hasExamStarted, setHasExamStarted] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(remainingSeconds ?? 3600);

  React.useEffect(() => {
    if (remainingSeconds !== null && remainingSeconds > 0) {
      setTimeLeft(remainingSeconds);
    }
  }, [remainingSeconds]);

  // Live Timer Ticking Effect once Exam starts
  React.useEffect(() => {
    if (!hasExamStarted || isExamLocked || isSecurityLocked || timeLeft === null) return;
    if (timeLeft <= 0) {
      onFinishExam(mcqAnswers, codeByQuestion, false);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          onFinishExam(mcqAnswers, codeByQuestion, false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [hasExamStarted, isExamLocked, isSecurityLocked, timeLeft, onFinishExam, mcqAnswers, codeByQuestion]);

  React.useEffect(() => {
    if (!hasExamStarted || isExamLocked || isSecurityLocked) return;

    let lastAlterationTime = 0;

    const handleViolation = (reason: string) => {
      const now = Date.now();
      if (now - lastAlterationTime < 1000) return;
      lastAlterationTime = now;

      setTabAlterations((prev) => {
        const next = prev + 1;
        if (next >= 3) {
          setIsSecurityLocked(true);
          setSecurityToast(
            `SECURITY LOCK: Maximum tab alterations (3 / 3) exceeded (${reason}). Exam session is locked.`
          );
          setTimeout(() => {
            onFinishExam(mcqAnswers, codeByQuestion, true);
          }, 1500);
        } else {
          setSecurityToast(
            `SECURITY WARNING: Tab alteration detected (${next} / 3). Navigating away from the exam panel is strictly prohibited!`
          );
          setTimeout(() => setSecurityToast(null), 5000);
        }
        return next;
      });
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleViolation("Visibility lost");
      }
    };

    const handleBlur = () => {
      handleViolation("Window focus lost");
    };

    const handleClipboard = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      setSecurityToast("CLIPBOARD RESTRICTED: Copying, cutting, or pasting is disabled during the exam.");
      setTimeout(() => setSecurityToast(null), 3000);
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      setSecurityToast("CONTEXT MENU DISABLED: Right-click inspection is prohibited.");
      setTimeout(() => setSecurityToast(null), 3000);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();

      if (
        (isCtrlOrCmd && ["c", "v", "x", "u", "s", "p", "f"].includes(key)) ||
        e.key === "F12" ||
        (isCtrlOrCmd && e.shiftKey && ["i", "j", "c"].includes(key))
      ) {
        e.preventDefault();
        e.stopPropagation();
        setSecurityToast(`SHORTCUT RESTRICTED: '${e.key}' shortcut is disabled during the exam.`);
        setTimeout(() => setSecurityToast(null), 3000);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("copy", handleClipboard, true);
    document.addEventListener("cut", handleClipboard, true);
    document.addEventListener("paste", handleClipboard, true);
    document.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("keydown", handleKeyDown, true);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("copy", handleClipboard, true);
      document.removeEventListener("cut", handleClipboard, true);
      document.removeEventListener("paste", handleClipboard, true);
      document.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [hasExamStarted, isExamLocked, isSecurityLocked, onFinishExam]);

  const handleMcqSubmit = () => {
    if (isMcqSubmitted) return;
    setShowMcqSubmitConfirmModal(true);
  };

  const executeMcqSubmit = () => {
    if (isMcqSubmitted) return;
    let score = 0;
    let maxScore = 0;
    mcqQuestions.forEach((q) => {
      maxScore += q.marks;
      if (mcqAnswers[q.id] === q.correctOption) {
        score += q.marks;
      }
    });

    setIsMcqSubmitted(true);
    setMcqScoreResult({ score, total: mcqQuestions.length, maxScore });
    setActiveSection("CODING");
  };

  const currentMcq = mcqQuestions[activeMcqIdx] || mcqQuestions[0];
  const currentQuestion = questions[activeQuestionIdx] || questions[0];
  const currentCode =
    codeByQuestion[currentQuestion?.id] ?? currentQuestion?.starterCode ?? "";
  const isSql = currentQuestion?.language?.toLowerCase() === "sql";

  const handleCodeChange = (newCode: string | undefined) => {
    if (!currentQuestion) return;
    setCodeByQuestion((prev) => ({
      ...prev,
      [currentQuestion.id]: newCode || "",
    }));
  };

  const handleExecuteRun = async () => {
    if (!currentQuestion) return;
    setExecutionStatus("running");
    setExecutionResult(null);

    const sqlSessionId = isSql
      ? `sql_session_${attemptId}_${currentQuestion.id}`
      : undefined;

    let payloadCode = currentCode;
    if (
      isSql &&
      currentQuestion.setupSql &&
      !currentCode.toLowerCase().includes("create table")
    ) {
      payloadCode = `${currentQuestion.setupSql}\n${currentCode}`;
    }

    const res = await onRunCode(
      currentQuestion.language,
      payloadCode,
      customInput,
      currentQuestion.id,
      sqlSessionId
    );

    setExecutionStatus(res.status);
    setExecutionResult(res.result);
    if (isSql) {
      setSqlRefreshTrigger((prev) => prev + 1);
    }
  };

  const handleExecuteSubmit = async () => {
    if (!currentQuestion || isExamLocked) return;
    setIsSubmittingAnswer(true);
    const res = await onSubmitAnswer(currentQuestion.id, currentCode);
    setIsSubmittingAnswer(false);
    if (res) {
      setSubmitResults((prev) => ({ ...prev, [currentQuestion.id]: res }));
      if (isSql) {
        setSqlRefreshTrigger((prev) => prev + 1);
      }
    }
  };

  const formatTimer = (sec: number | null) => {
    if (sec === null) return "--:--";
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (!currentQuestion && mcqQuestions.length === 0) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        No questions available for this exam.
      </div>
    );
  }

  const latestSubmitRes = currentQuestion ? submitResults[currentQuestion.id] : null;

  return (
    <div
      style={{
        backgroundColor: "#f8fafc",
        minHeight: "100vh",
        color: "#1e293b",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* TOP EXAM HEADER */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0.6rem 1.5rem",
          backgroundColor: "#ffffff",
          borderBottom: "1px solid #e2e8f0",
          boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "1.1rem",
              fontWeight: 800,
              margin: 0,
              color: "#0f172a",
              letterSpacing: "-0.01em",
            }}
          >
            {examName}
          </h1>
          <div
            style={{
              fontSize: "0.75rem",
              fontWeight: 700,
              color: tabAlterations > 0 ? "#dc2626" : "#059669",
              marginTop: "2px",
              letterSpacing: "0.02em",
            }}
          >
            TAB ALTERATIONS:{" "}
            <span
              style={{
                color: tabAlterations >= 3 ? "#dc2626" : tabAlterations > 0 ? "#d97706" : "#059669",
                fontWeight: 800,
              }}
            >
              {tabAlterations} / 3
            </span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              padding: "0.4rem 0.85rem",
              borderRadius: "6px",
              border: "1px solid #cbd5e1",
              backgroundColor: "#f8fafc",
              fontSize: "0.9rem",
              fontWeight: 700,
              color: (timeLeft ?? 100) < 300 ? "#dc2626" : "#1e293b",
              fontFamily: "monospace",
            }}
          >
            <span>{formatTimer(timeLeft)}</span>
          </div>

          <button
            onClick={() => setShowFinishExamConfirmModal(true)}
            disabled={isSubmittingExam}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.45rem",
              backgroundColor: "#e11d48",
              color: "#ffffff",
              border: "none",
              borderRadius: "6px",
              padding: "0.5rem 1.1rem",
              fontWeight: 700,
              fontSize: "0.85rem",
              cursor: isSubmittingExam ? "not-allowed" : "pointer",
              boxShadow: "0 1px 2px rgba(225, 29, 72, 0.2)",
            }}
          >
            <span>{isSubmittingExam ? "Submitting..." : "Finish Exam"}</span>
          </button>
        </div>
      </header>

      {/* 2-STAGE SEQUENTIAL SECTION PROGRESSION BAR */}
      <div
        style={{
          padding: "0.5rem 1.5rem",
          backgroundColor: "#ffffff",
          borderBottom: "1px solid #e2e8f0",
          display: "flex",
          alignItems: "center",
          gap: "1rem",
        }}
      >
        {mcqQuestions.length > 0 && (
          <button
            onClick={() => setActiveSection("MCQ")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.45rem 0.9rem",
              borderRadius: "6px",
              border: activeSection === "MCQ" ? "1.5px solid #2563eb" : "1px solid #cbd5e1",
              backgroundColor: activeSection === "MCQ" ? "#eff6ff" : "#f8fafc",
              color: activeSection === "MCQ" ? "#1d4ed8" : "#475569",
              fontSize: "0.85rem",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            <span>Section 1: MCQ Assessment ({mcqQuestions.length})</span>
            <span
              style={{
                padding: "0.15rem 0.45rem",
                borderRadius: "4px",
                fontSize: "0.7rem",
                fontWeight: 800,
                backgroundColor: isMcqSubmitted ? "#dcfce7" : "#fef3c7",
                color: isMcqSubmitted ? "#15803d" : "#b45309",
              }}
            >
              {isMcqSubmitted
                ? `SUBMITTED (${mcqScoreResult?.score || 0}/${mcqScoreResult?.maxScore || 0} Marks)`
                : "IN PROGRESS"}
            </span>
          </button>
        )}

        {mcqQuestions.length > 0 && questions.length > 0 && (
          <span style={{ color: "#94a3b8", fontWeight: 700 }}>──▶</span>
        )}

        {questions.length > 0 && (
          <button
            onClick={() => {
              if (mcqQuestions.length > 0 && !isMcqSubmitted) {
                setSecurityToast(
                  "SECTION LOCKED: You must finalize and submit the MCQ Assessment (Section 1) first before unlocking the Practical Coding Matrix!"
                );
                setTimeout(() => setSecurityToast(null), 4000);
                return;
              }
              setActiveSection("CODING");
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.45rem 0.9rem",
              borderRadius: "6px",
              border:
                activeSection === "CODING"
                  ? "1.5px solid #2563eb"
                  : isMcqSubmitted
                  ? "1px solid #cbd5e1"
                  : "1px dashed #fca5a5",
              backgroundColor:
                activeSection === "CODING"
                  ? "#eff6ff"
                  : isMcqSubmitted
                  ? "#f8fafc"
                  : "#fff1f2",
              color:
                activeSection === "CODING"
                  ? "#1d4ed8"
                  : isMcqSubmitted
                  ? "#475569"
                  : "#9f1239",
              fontSize: "0.85rem",
              fontWeight: 700,
              cursor: isMcqSubmitted ? "pointer" : "not-allowed",
              opacity: isMcqSubmitted ? 1 : 0.9,
            }}
          >
            <span>Section 2: Practical Coding ({questions.length})</span>
            <span
              style={{
                padding: "0.15rem 0.45rem",
                borderRadius: "4px",
                fontSize: "0.7rem",
                fontWeight: 800,
                backgroundColor: isMcqSubmitted ? "#dbeafe" : "#ffe4e6",
                color: isMcqSubmitted ? "#1e40af" : "#e11d48",
              }}
            >
              {isMcqSubmitted ? "UNLOCKED" : "LOCKED - Submit MCQ First"}
            </span>
          </button>
        )}
      </div>

      {/* SECTION VIEW CONTAINER */}
      {activeSection === "MCQ" && currentMcq ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "260px 1fr",
            gap: "1rem",
            padding: "1rem 1.5rem",
            maxWidth: "1400px",
            margin: "0 auto",
            boxSizing: "border-box",
            minHeight: "calc(100vh - 140px)",
          }}
        >
          <aside
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              padding: "1.25rem 1rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 800,
                  color: "#475569",
                  margin: 0,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                MCQ QUESTIONS ({mcqQuestions.length})
              </h3>
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: "#2563eb",
                  backgroundColor: "#eff6ff",
                  padding: "0.15rem 0.45rem",
                  borderRadius: "4px",
                }}
              >
                {Object.keys(mcqAnswers).length} / {mcqQuestions.length} Answered
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", overflowY: "auto" }}>
              {mcqQuestions.map((q, idx) => {
                const isActive = idx === activeMcqIdx;
                const isAnswered = mcqAnswers[q.id] !== undefined;
                return (
                  <button
                    key={q.id}
                    onClick={() => setActiveMcqIdx(idx)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0.65rem 0.85rem",
                      borderRadius: "6px",
                      border: isActive
                        ? "1.5px solid #2563eb"
                        : "1px solid #e2e8f0",
                      backgroundColor: isActive
                        ? "#eff6ff"
                        : isAnswered
                        ? "#f0fdf4"
                        : "#ffffff",
                      color: isActive
                        ? "#1d4ed8"
                        : isAnswered
                        ? "#15803d"
                        : "#334155",
                      fontWeight: isActive ? 700 : 500,
                      fontSize: "0.85rem",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <span>
                      Q{idx + 1}. {q.title.slice(0, 22)}...
                    </span>
                    <span style={{ fontSize: "0.75rem", fontWeight: 800 }}>
                      {isAnswered ? "✓" : "•"}
                    </span>
                  </button>
                );
              })}
            </div>

            <div style={{ marginTop: "auto", paddingTop: "1rem", borderTop: "1px solid #f1f5f9" }}>
              <button
                onClick={handleMcqSubmit}
                disabled={isMcqSubmitted}
                style={{
                  width: "100%",
                  backgroundColor: isMcqSubmitted ? "#16a34a" : "#2563eb",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "0.8rem",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  cursor: isMcqSubmitted ? "default" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.45rem",
                  boxShadow: isMcqSubmitted ? "none" : "0 4px 12px rgba(37, 99, 235, 0.25)",
                }}
              >
                {isMcqSubmitted && <span>✓</span>}
                <span>
                  {isMcqSubmitted ? "MCQ Submitted (Unlocked Coding)" : "Submit MCQ Section"}
                </span>
              </button>
            </div>
          </aside>

          <main
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              padding: "2rem",
              display: "flex",
              flexDirection: "column",
              gap: "1.5rem",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid #f1f5f9",
                paddingBottom: "1rem",
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 800,
                    color: "#2563eb",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Question {activeMcqIdx + 1} of {mcqQuestions.length}
                </span>
                <h2
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: 800,
                    color: "#0f172a",
                    margin: "0.25rem 0 0 0",
                  }}
                >
                  {currentMcq.title}
                </h2>
              </div>

              <span
                style={{
                  padding: "0.35rem 0.75rem",
                  borderRadius: "6px",
                  backgroundColor: "#f1f5f9",
                  color: "#475569",
                  fontSize: "0.825rem",
                  fontWeight: 700,
                }}
              >
                {currentMcq.marks.toFixed(1)} Marks
              </span>
            </div>

            <div
              style={{
                fontSize: "1.05rem",
                color: "#1e293b",
                lineHeight: 1.6,
                fontWeight: 500,
                backgroundColor: "#f8fafc",
                padding: "1.25rem",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
              }}
            >
              {currentMcq.questionText}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {currentMcq.options.map((opt) => {
                const isSelected = mcqAnswers[currentMcq.id] === opt.key;
                return (
                  <button
                    key={opt.key}
                    disabled={isMcqSubmitted}
                    onClick={() =>
                      setMcqAnswers((prev) => ({
                        ...prev,
                        [currentMcq.id]: opt.key,
                      }))
                    }
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.85rem",
                      padding: "0.9rem 1.1rem",
                      borderRadius: "8px",
                      border: isSelected
                        ? "2px solid #2563eb"
                        : "1px solid #cbd5e1",
                      backgroundColor: isSelected ? "#eff6ff" : "#ffffff",
                      color: isSelected ? "#1e40af" : "#1e293b",
                      fontSize: "0.95rem",
                      fontWeight: isSelected ? 700 : 500,
                      cursor: isMcqSubmitted ? "not-allowed" : "pointer",
                      textAlign: "left",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <div
                      style={{
                        width: "22px",
                        height: "22px",
                        borderRadius: "50%",
                        border: isSelected
                          ? "6px solid #2563eb"
                          : "2px solid #cbd5e1",
                        backgroundColor: "#ffffff",
                        boxSizing: "border-box",
                        flexShrink: 0,
                      }}
                    />
                    <div>
                      <strong>({opt.key})</strong> {opt.text}
                    </div>
                  </button>
                );
              })}
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: "auto",
                paddingTop: "1.5rem",
                borderTop: "1px solid #f1f5f9",
              }}
            >
              <button
                onClick={() => setActiveMcqIdx((prev) => Math.max(0, prev - 1))}
                disabled={activeMcqIdx === 0}
                style={{
                  padding: "0.55rem 1.1rem",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  backgroundColor: "#ffffff",
                  color: "#334155",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  cursor: activeMcqIdx === 0 ? "not-allowed" : "pointer",
                  opacity: activeMcqIdx === 0 ? 0.5 : 1,
                }}
              >
                ← Previous
              </button>

              <button
                onClick={() =>
                  setActiveMcqIdx((prev) =>
                    Math.min(mcqQuestions.length - 1, prev + 1)
                  )
                }
                disabled={activeMcqIdx === mcqQuestions.length - 1}
                style={{
                  padding: "0.55rem 1.1rem",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  backgroundColor: "#ffffff",
                  color: "#334155",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  cursor:
                    activeMcqIdx === mcqQuestions.length - 1
                      ? "not-allowed"
                      : "pointer",
                  opacity: activeMcqIdx === mcqQuestions.length - 1 ? 0.5 : 1,
                }}
              >
                Next →
              </button>
            </div>
          </main>
        </div>
      ) : currentQuestion ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "240px 1fr 380px",
            gap: "1rem",
            padding: "1rem",
            maxWidth: "1800px",
            margin: "0 auto",
          }}
        >
          <aside
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              padding: "1rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
              height: "fit-content",
              boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
            }}
          >
            <div
              style={{
                fontSize: "0.75rem",
                fontWeight: 800,
                color: "#64748b",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                paddingBottom: "0.2rem",
              }}
            >
              PROBLEMS
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {questions.map((q, idx) => {
                const isSelected = idx === activeQuestionIdx;
                const ans = answers[q.id];
                const isSubmitted = ans && ans.status === "EVALUATED";
                const isLocked = isExamLocked && !isSubmitted;

                return (
                  <button
                    key={q.id}
                    onClick={() => setActiveQuestionIdx(idx)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.6rem",
                      padding: "0.55rem 0.85rem",
                      borderRadius: "9999px",
                      border: isSelected ? "1.5px solid #f87171" : "1px solid #e2e8f0",
                      backgroundColor: isSelected ? "#fff1f2" : "#ffffff",
                      color: isSelected ? "#be123c" : isLocked ? "#94a3b8" : "#334155",
                      fontWeight: isSelected ? 700 : 500,
                      fontSize: "0.85rem",
                      cursor: "pointer",
                      textAlign: "left",
                      width: "100%",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "22px",
                        height: "22px",
                        borderRadius: "50%",
                        backgroundColor: isSelected
                          ? "#be123c"
                          : isSubmitted
                          ? "#dcfce7"
                          : "#f1f5f9",
                        color: isSelected
                          ? "#ffffff"
                          : isSubmitted
                          ? "#15803d"
                          : "#64748b",
                        fontSize: "0.75rem",
                        fontWeight: 800,
                        flexShrink: 0,
                      }}
                    >
                      {q.questionOrder || idx + 1}
                    </span>
                    <span
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        flex: 1,
                      }}
                    >
                      {q.title} {isLocked ? "(Locked)" : ""}
                    </span>
                  </button>
                );
              })}
            </div>
          </aside>

          <main style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: "#ffffff",
                padding: "0.5rem 1rem",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <select
                  value={currentQuestion.language.toLowerCase()}
                  disabled
                  style={{
                    padding: "0.4rem 0.8rem",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    backgroundColor: "#f8fafc",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    color: "#0f172a",
                    textTransform: "uppercase",
                  }}
                >
                  <option value={currentQuestion.language.toLowerCase()}>
                    {currentQuestion.language.toUpperCase()}
                  </option>
                </select>
              </div>

              <div style={{ display: "flex", gap: "0.6rem" }}>
                <button
                  onClick={handleExecuteRun}
                  disabled={executionStatus === "running"}
                  style={{
                    padding: "0.45rem 1.1rem",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    backgroundColor: "#ffffff",
                    color: "#334155",
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    cursor: executionStatus === "running" ? "wait" : "pointer",
                  }}
                >
                  {executionStatus === "running" ? "Running..." : "Run Code"}
                </button>

                {(answers[currentQuestion.id] !== undefined ||
                  submitResults[currentQuestion.id] !== undefined) ? (
                  <div
                    style={{
                      padding: "0.45rem 1rem",
                      borderRadius: "6px",
                      backgroundColor: "#dcfce7",
                      color: "#15803d",
                      fontWeight: 700,
                      fontSize: "0.85rem",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.3rem",
                    }}
                  >
                    ✓ Submitted
                  </div>
                ) : (
                  <button
                    onClick={handleExecuteSubmit}
                    disabled={isSubmittingAnswer || isExamLocked}
                    style={{
                      padding: "0.45rem 1.1rem",
                      borderRadius: "6px",
                      border: "none",
                      backgroundColor: "#e11d48",
                      color: "#ffffff",
                      fontWeight: 700,
                      fontSize: "0.85rem",
                      cursor:
                        isSubmittingAnswer || isExamLocked
                          ? "not-allowed"
                          : "pointer",
                      boxShadow: "0 1px 2px rgba(225, 29, 72, 0.2)",
                    }}
                  >
                    {isSubmittingAnswer ? "Evaluating..." : "Submit Solution"}
                  </button>
                )}
              </div>
            </div>

            <div
              style={{
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                overflow: "hidden",
                minHeight: "420px",
                backgroundColor: "#1e1e1e",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              }}
            >
              <CodeEditor
                language={currentQuestion.language.toLowerCase()}
                value={currentCode}
                onChange={handleCodeChange}
              />
            </div>

            {latestSubmitRes && (
              <div
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "8px",
                  border: `1px solid ${
                    latestSubmitRes.passedTests === latestSubmitRes.totalTests
                      ? "#bbf7d0"
                      : "#fecaca"
                  }`,
                  padding: "1rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "0.5rem",
                  }}
                >
                  <h4 style={{ margin: 0, color: "#0f172a", fontSize: "0.95rem" }}>
                    Submission Evaluation Result
                  </h4>
                  <span
                    style={{
                      fontSize: "0.9rem",
                      fontWeight: 700,
                      color:
                        latestSubmitRes.passedTests === latestSubmitRes.totalTests
                          ? "#16a34a"
                          : "#dc2626",
                    }}
                  >
                    Score: {latestSubmitRes.score.toFixed(2)} /{" "}
                    {latestSubmitRes.maxScore.toFixed(2)}
                  </span>
                </div>
                <div style={{ fontSize: "0.85rem", color: "#475569" }}>
                  Passed: {latestSubmitRes.passedTests} of {latestSubmitRes.totalTests} Hidden Test Cases
                </div>
              </div>
            )}

            {isSql && (
              <div
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  padding: "1rem",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
                }}
              >
                <DatabaseExplorer
                  sessionId={`sql_session_${attemptId}_${currentQuestion.id}`}
                  refreshTrigger={sqlRefreshTrigger}
                />
              </div>
            )}

            <ExecutionPanel
              customInput={customInput}
              onCustomInputChange={setCustomInput}
              onRunCode={handleExecuteRun}
              onClearOutput={() => setExecutionResult(null)}
              status={executionStatus}
              result={executionResult}
            />
          </main>

          <aside
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              padding: "1.25rem",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              maxHeight: "calc(100vh - 120px)",
              overflowY: "auto",
              boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: "1.5rem",
                borderBottom: "1px solid #e2e8f0",
                paddingBottom: "0.5rem",
              }}
            >
              <button
                onClick={() => setActiveTab("Problem")}
                style={{
                  border: "none",
                  background: "none",
                  fontWeight: activeTab === "Problem" ? 700 : 500,
                  fontSize: "0.85rem",
                  color: activeTab === "Problem" ? "#be123c" : "#64748b",
                  borderBottom: activeTab === "Problem" ? "2px solid #be123c" : "none",
                  paddingBottom: "0.4rem",
                  cursor: "pointer",
                }}
              >
                Problem
              </button>
              <button
                onClick={() => setActiveTab("Test")}
                style={{
                  border: "none",
                  background: "none",
                  fontWeight: activeTab === "Test" ? 700 : 500,
                  fontSize: "0.85rem",
                  color: activeTab === "Test" ? "#be123c" : "#64748b",
                  borderBottom: activeTab === "Test" ? "2px solid #be123c" : "none",
                  paddingBottom: "0.4rem",
                  cursor: "pointer",
                }}
              >
                Test
              </button>
              <button
                onClick={() => setActiveTab("Submit")}
                style={{
                  border: "none",
                  background: "none",
                  fontWeight: activeTab === "Submit" ? 700 : 500,
                  fontSize: "0.85rem",
                  color: activeTab === "Submit" ? "#be123c" : "#64748b",
                  borderBottom: activeTab === "Submit" ? "2px solid #be123c" : "none",
                  paddingBottom: "0.4rem",
                  cursor: "pointer",
                }}
              >
                Submit
              </button>
            </div>

            {activeTab === "Problem" && (
              <>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "0.5rem",
                  }}
                >
                  <h2
                    style={{
                      fontSize: "1.15rem",
                      fontWeight: 800,
                      color: "#0f172a",
                      margin: 0,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {currentQuestion.title}
                  </h2>

                  <div
                    style={{
                      display: "flex",
                      gap: "0.4rem",
                      flexShrink: 0,
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        padding: "0.2rem 0.6rem",
                        borderRadius: "9999px",
                        backgroundColor: "#ffe4e6",
                        color: "#be123c",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                      }}
                    >
                      Medium
                    </span>
                    <span
                      style={{
                        padding: "0.2rem 0.6rem",
                        borderRadius: "9999px",
                        backgroundColor: "#f1f5f9",
                        color: "#334155",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                      }}
                    >
                      Max Score: {currentQuestion.marks?.toFixed(2) || "10.00"}
                    </span>
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      fontWeight: 800,
                      color: "#64748b",
                      marginBottom: "0.4rem",
                      textTransform: "uppercase",
                    }}
                  >
                    Description
                  </div>
                  <div
                    style={{
                      fontSize: "0.875rem",
                      color: "#334155",
                      lineHeight: 1.6,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {currentQuestion.problemStatement ||
                      currentQuestion.description ||
                      "No problem description available."}
                  </div>
                </div>

                {currentQuestion.constraints && (
                  <div>
                    <div
                      style={{
                        fontSize: "0.8rem",
                        fontWeight: 800,
                        color: "#64748b",
                        marginBottom: "0.4rem",
                        textTransform: "uppercase",
                      }}
                    >
                      Constraints
                    </div>
                    <div
                      style={{
                        backgroundColor: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        padding: "0.75rem",
                        fontFamily: "monospace",
                        fontSize: "0.8rem",
                        color: "#475569",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {currentQuestion.constraints}
                    </div>
                  </div>
                )}

                {currentQuestion.inputFormat && (
                  <div>
                    <div
                      style={{
                        fontSize: "0.8rem",
                        fontWeight: 800,
                        color: "#64748b",
                        marginBottom: "0.4rem",
                        textTransform: "uppercase",
                      }}
                    >
                      Input Format
                    </div>
                    <div style={{ fontSize: "0.85rem", color: "#334155" }}>
                      {currentQuestion.inputFormat}
                    </div>
                  </div>
                )}

                {currentQuestion.outputFormat && (
                  <div>
                    <div
                      style={{
                        fontSize: "0.8rem",
                        fontWeight: 800,
                        color: "#64748b",
                        marginBottom: "0.4rem",
                        textTransform: "uppercase",
                      }}
                    >
                      Output Format
                    </div>
                    <div style={{ fontSize: "0.85rem", color: "#334155" }}>
                      {currentQuestion.outputFormat}
                    </div>
                  </div>
                )}

                {currentQuestion.exampleInput && (
                  <div>
                    <div
                      style={{
                        fontSize: "0.8rem",
                        fontWeight: 800,
                        color: "#64748b",
                        marginBottom: "0.4rem",
                        textTransform: "uppercase",
                      }}
                    >
                      Example Input
                    </div>
                    <pre
                      style={{
                        backgroundColor: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        borderRadius: "6px",
                        padding: "0.6rem",
                        fontSize: "0.8rem",
                        color: "#0f172a",
                        margin: 0,
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {currentQuestion.exampleInput}
                    </pre>
                  </div>
                )}

                {currentQuestion.exampleOutput && (
                  <div>
                    <div
                      style={{
                        fontSize: "0.8rem",
                        fontWeight: 800,
                        color: "#64748b",
                        marginBottom: "0.4rem",
                        textTransform: "uppercase",
                      }}
                    >
                      Example Output
                    </div>
                    <pre
                      style={{
                        backgroundColor: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        borderRadius: "6px",
                        padding: "0.6rem",
                        fontSize: "0.8rem",
                        color: "#0f172a",
                        margin: 0,
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {currentQuestion.exampleOutput}
                    </pre>
                  </div>
                )}
              </>
            )}

            {activeTab === "Test" && (
              <div style={{ fontSize: "0.85rem", color: "#64748b" }}>
                Hidden test cases are evaluated securely on submission.
              </div>
            )}

            {activeTab === "Submit" && (
              <div style={{ fontSize: "0.85rem", color: "#64748b" }}>
                Click <strong>Submit Solution</strong> to run official test cases and calculate score.
              </div>
            )}
          </aside>
        </div>
      ) : null}

      {securityToast && (
        <div
          style={{
            position: "fixed",
            top: "1.25rem",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 99999,
            backgroundColor: tabAlterations >= 3 ? "#991b1b" : "#7c2d12",
            color: "#ffffff",
            padding: "0.85rem 1.5rem",
            borderRadius: "10px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
            fontSize: "0.9rem",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            border: "1px solid #f87171",
          }}
        >
          <span>{securityToast}</span>
          <button
            onClick={() => setSecurityToast(null)}
            style={{
              background: "none",
              border: "none",
              color: "#ffffff",
              cursor: "pointer",
              fontWeight: 800,
            }}
          >
            ✕
          </button>
        </div>
      )}

      {!hasExamStarted && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 999999,
            backgroundColor: "rgba(15, 23, 42, 0.94)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1.5rem",
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "18px",
              border: "1px solid #cbd5e1",
              padding: "2.5rem 2rem",
              maxWidth: "520px",
              width: "100%",
              textAlign: "center",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.35)",
            }}
          >
            <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.5rem 0" }}>
              {examName || "Proctored Coding Assessment"}
            </h2>
            <p style={{ color: "#64748b", fontSize: "0.875rem", margin: "0 0 1.5rem 0" }}>
              Please review the exam protocols before commencing your session.
            </p>

            <div
              style={{
                backgroundColor: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                padding: "1rem 1.25rem",
                textAlign: "left",
                fontSize: "0.85rem",
                color: "#334155",
                lineHeight: 1.6,
                marginBottom: "1.75rem",
              }}
            >
              <div>• <strong>Exam Duration:</strong> {formatTimer(timeLeft)}</div>
              <div>• <strong>Questions:</strong> {questions.length} Practical Coding Challenge(s) + {mcqQuestions.length} MCQ(s)</div>
              <div>• <strong>Security Rules:</strong> Full screen enforcement, copy-paste disabled, tab switching monitored.</div>
            </div>

            <button
              onClick={() => {
                if (document.documentElement.requestFullscreen) {
                  document.documentElement.requestFullscreen().catch(() => {});
                }
                setHasExamStarted(true);
              }}
              style={{
                width: "100%",
                padding: "0.85rem",
                borderRadius: "10px",
                border: "none",
                backgroundColor: "#2563eb",
                color: "#ffffff",
                fontWeight: 800,
                fontSize: "1rem",
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(37, 99, 235, 0.35)",
              }}
            >
              Begin Exam
            </button>
          </div>
        </div>
      )}

      {(isExamLocked || isSecurityLocked) && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 999999,
            backgroundColor: "rgba(15, 23, 42, 0.94)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1.5rem",
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              border: isSecurityLocked ? "1px solid #fecdd3" : "1px solid #cbd5e1",
              padding: "2.5rem 2rem",
              maxWidth: "480px",
              width: "100%",
              textAlign: "center",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.3)",
            }}
          >
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: isSecurityLocked ? "#991b1b" : "#0f172a", margin: "0 0 0.5rem 0" }}>
              {isSecurityLocked ? "Exam Session Locked" : "Exam Finalized"}
            </h2>
            <p style={{ color: "#475569", fontSize: "0.95rem", lineHeight: 1.5, marginBottom: "1.5rem" }}>
              {isSecurityLocked
                ? "Maximum allowed tab alterations (3 / 3) have been exceeded. Navigating away from the exam workspace breaks exam integrity rules. Your exam session has been locked and automatically submitted."
                : "Your exam is now locked and ready for evaluation."}
            </p>
            <div
              style={{
                padding: "0.75rem 1rem",
                backgroundColor: isSecurityLocked ? "#fff1f2" : "#f0fdf4",
                borderRadius: "8px",
                color: isSecurityLocked ? "#9f1239" : "#15803d",
                fontSize: "0.85rem",
                fontWeight: 700,
              }}
            >
              {isSecurityLocked
                ? "Status: Exam Finalized under Security Protocol"
                : "Status: Submitted & Ready for Evaluation"}
            </div>
          </div>
        </div>
      )}

      {showMcqSubmitConfirmModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            backgroundColor: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1.5rem",
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              border: "1px solid #cbd5e1",
              padding: "2rem",
              maxWidth: "500px",
              width: "100%",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            }}
          >
            <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0f172a", margin: "0 0 1rem 0" }}>
              Finalize & Submit Section 1 (MCQ Assessment)?
            </h3>
            <div
              style={{
                backgroundColor: "#f8fafc",
                border: "1px solid #e2e8f0",
                padding: "1rem",
                borderRadius: "8px",
                fontSize: "0.875rem",
                color: "#334155",
                marginBottom: "1.5rem",
                lineHeight: 1.6,
              }}
            >
              <div>• <strong>Answered:</strong> {Object.keys(mcqAnswers).length} of {mcqQuestions.length} questions</div>
              <div>• <strong>Unanswered:</strong> {mcqQuestions.length - Object.keys(mcqAnswers).length} questions</div>
              <div style={{ marginTop: "0.6rem", color: "#64748b", fontSize: "0.8rem" }}>
                Once submitted, your score will be calculated and Section 2 (Practical Coding Matrix) will unlock immediately.
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
              <button
                onClick={() => setShowMcqSubmitConfirmModal(false)}
                style={{
                  padding: "0.55rem 1.1rem",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  backgroundColor: "#ffffff",
                  color: "#475569",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowMcqSubmitConfirmModal(false);
                  executeMcqSubmit();
                }}
                style={{
                  padding: "0.55rem 1.25rem",
                  borderRadius: "6px",
                  border: "none",
                  backgroundColor: "#2563eb",
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(37, 99, 235, 0.25)",
                }}
              >
                Confirm & Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {showFinishExamConfirmModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            backgroundColor: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1.5rem",
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              border: "1px solid #cbd5e1",
              padding: "2rem",
              maxWidth: "460px",
              width: "100%",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            }}
          >
            <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.75rem 0" }}>
              Finish & Submit Entire Exam?
            </h3>
            <p style={{ color: "#475569", fontSize: "0.9rem", lineHeight: 1.5, marginBottom: "1.5rem" }}>
              Are you sure you want to finalize your exam session? Your answers will be submitted for official evaluation.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
              <button
                onClick={() => setShowFinishExamConfirmModal(false)}
                style={{
                  padding: "0.55rem 1.1rem",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  backgroundColor: "#ffffff",
                  color: "#475569",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowFinishExamConfirmModal(false);
                  onFinishExam(mcqAnswers, codeByQuestion, isSecurityLocked);
                }}
                style={{
                  padding: "0.55rem 1.25rem",
                  borderRadius: "6px",
                  border: "none",
                  backgroundColor: "#e11d48",
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(225, 29, 72, 0.25)",
                }}
              >
                Finalize Exam
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
