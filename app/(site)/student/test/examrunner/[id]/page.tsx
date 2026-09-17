"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import ExamCodingEditor, {
  ExamQuestionItem,
  MCQQuestionItem,
  AnswerRecord,
  SubmitAnswerData,
} from "@/components/ExamCodingEditor";
import { ExecutionStatus, ExecutionResult } from "@/components/ExecutionPanel";
import ExamService from "@/services/exam.service";
import { toast } from "sonner";

interface ExamDetail {
  attemptId: number;
  examId: number;
  examName: string;
  description: string | null;
  status: string;
  durationMinutes: number | null;
  remainingSeconds: number | null;
  score: number;
  maxScore: number;
  questions: ExamQuestionItem[];
  mcqQuestions: MCQQuestionItem[];
  answers: Record<number, AnswerRecord>;
}

export default function StudentExamRunnerPage() {
  const params = useParams<{ id: string }>();
  const examId = params?.id ? parseInt(params.id, 10) : NaN;

  const [examData, setExamData] = useState<ExamDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [remainingSec, setRemainingSec] = useState<number | null>(null);
  const [isSubmittingExam, setIsSubmittingExam] = useState<boolean>(false);
  const [isSecurityTerminated, setIsSecurityTerminated] = useState<boolean>(false);

  // 1. Load active exam attempt from MySQL DB
  useEffect(() => {
    async function loadExam() {
      try {
        setLoading(true);
        const res = await ExamService.studentStart(examId);
        if (!res.data) {
          setError("Failed to load exam session.");
          return;
        }

        const liveAttempt = res.data;
        const liveExam = liveAttempt.exam || {};

        // Transform backend MCQs into MCQQuestionItem format
        const rawMcqs = liveExam.mcqs || [];
        const mcqQuestions: MCQQuestionItem[] = rawMcqs.map((m: any, idx: number) => ({
          id: m.id || idx + 1,
          questionOrder: idx + 1,
          marks: Number(m.marks) || 1,
          title: m.questionText || m.question || m.title || `MCQ ${idx + 1}`,
          questionText: m.questionText || m.question || m.statement || "",
          options: (m.options || ["A", "B", "C", "D"]).map((opt: any, oIdx: number) => {
            const keyStr = oIdx === 0 ? "A" : oIdx === 1 ? "B" : oIdx === 2 ? "C" : "D";
            const textStr = typeof opt === "string" ? opt : (opt.text || String(opt));
            return { key: keyStr, text: textStr };
          }),
          correctOption: m.correctOption || "A",
        }));

        // Transform backend Codings into ExamQuestionItem format
        const rawCodings = liveExam.codings || [];
        const questions: ExamQuestionItem[] = rawCodings.map((c: any, idx: number) => ({
          id: c.id || idx + 1,
          questionOrder: idx + 1,
          marks: Number(c.marks) || 10,
          language: (c.languages && c.languages[0]) ? c.languages[0] : "python",
          questionType: "FUNCTION",
          title: c.title || `Coding Challenge ${idx + 1}`,
          description: c.statement || c.description || "",
          problemStatement: c.statement || c.description || "",
          constraints: c.constraints || "",
          inputFormat: c.input_format || "",
          outputFormat: c.output_format || "",
          exampleInput: c.sample_input || "",
          exampleOutput: c.sample_output || "",
          starterCode: c.starter_code || "",
        }));

        const totalMaxScore =
          mcqQuestions.reduce((s, m) => s + m.marks, 0) +
          questions.reduce((s, q) => s + q.marks, 0);

        setExamData({
          attemptId: Number(liveAttempt.attempt_id || liveAttempt.id || 1),
          examId,
          examName: liveExam.title || "Exam Session",
          description: liveExam.description || null,
          status: liveAttempt.status || "IN_PROGRESS",
          durationMinutes: Number(liveExam.duration) || 60,
          remainingSeconds: (Number(liveExam.duration) || 60) * 60,
          score: Number(liveAttempt.total_score) || 0,
          maxScore: totalMaxScore,
          questions,
          mcqQuestions,
          answers: {},
        });
        setRemainingSec((Number(liveExam.duration) || 60) * 60);
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || "Network error loading exam");
      } finally {
        setLoading(false);
      }
    }

    if (!isNaN(examId)) {
      loadExam();
    }
  }, [examId]);

  if (loading) {
    return (
      <div
        style={{
          backgroundColor: "#f8fafc",
          minHeight: "100vh",
          color: "#0f172a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <h2>Loading Exam Workspace...</h2>
      </div>
    );
  }

  if (error || !examData) {
    return (
      <div
        style={{
          backgroundColor: "#f8fafc",
          minHeight: "100vh",
          color: "#0f172a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "1rem",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <h2 style={{ color: "#e11d48" }}>Exam Session Unavailable</h2>
        <p style={{ color: "#64748b" }}>{error || "Exam session could not be loaded."}</p>
      </div>
    );
  }

  const isExamLocked =
    examData.status !== "IN_PROGRESS" ||
    (remainingSec !== null && remainingSec <= 0);

  // Run Code Callback — Connected directly to Express API execution engine
  const handleRunCode = async (
    language: string,
    code: string,
    customInput: string,
    questionId: number
  ): Promise<{ status: ExecutionStatus; result: ExecutionResult | null }> => {
    try {
      const res = await ExamService.studentRunCode(examId, {
        coding_question_id: questionId,
        code,
        language: language.toLowerCase(),
        custom_input: customInput,
        use_test_cases: false,
      });

      const raw = res.data || res;
      const runResult = raw.result || raw;
      if (runResult.status === "error" || runResult.error || runResult.success === false) {
        return {
          status: "error",
          result: {
            stdout: "",
            stderr: typeof runResult.stderr === "string" ? runResult.stderr : (runResult.error || runResult.message || "Execution failed"),
            executionTime: 0,
            status: "error",
          },
        };
      }

      const outText = runResult.stdout || runResult.actual_output || "";
      return {
        status: "success",
        result: {
          stdout: outText || "Code executed successfully.",
          stderr: runResult.stderr || "",
          executionTime: runResult.executionTime || runResult.executionTimeMs || 0,
          status: "success",
        },
      };
    } catch (err: any) {
      return {
        status: "error",
        result: {
          stdout: "",
          stderr: err.response?.data?.message || err.message || "Execution failed.",
          executionTime: 0,
          status: "error",
        },
      };
    }
  };

  // Submit Coding Answer Callback — Connected directly to Express API evaluation engine
  const handleSubmitAnswer = async (
    questionId: number,
    code: string
  ): Promise<SubmitAnswerData | null> => {
    if (isExamLocked) return null;
    const q = examData.questions.find((item) => item.id === questionId);
    if (!q) return null;

    try {
      const res = await ExamService.studentRunCode(examId, {
        coding_question_id: questionId,
        code,
        language: q.language.toLowerCase(),
        use_test_cases: true,
      });

      const raw = res.data || res;
      const evalData = raw.summary || raw;
      const passedTests = Number(evalData.passed || evalData.passed_count || evalData.passedTests || 0);
      const totalTests = Number(evalData.total || evalData.total_count || evalData.totalTests || 1);
      const scorePercentage = Number(evalData.score || 0);
      const score = (scorePercentage / 100) * q.marks;

      const resultsList = raw.results || raw.details || [];

      const resultPayload: SubmitAnswerData = {
        success: true,
        attemptId: examData.attemptId,
        questionId,
        score,
        maxScore: q.marks,
        passedTests,
        totalTests,
        status: evalData.finalStatus || "EVALUATED",
        tests: resultsList.map((t: any, idx: number) => ({
          testNumber: idx + 1,
          passed: t.status === "Passed" || Boolean(t.passed),
          status: t.status || (t.passed ? "PASSED" : "FAILED"),
        })),
      };

      setExamData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          answers: {
            ...prev.answers,
            [q.id]: {
              answerId: q.id,
              language: q.language,
              answerCode: code,
              status: "EVALUATED",
              score,
              maxScore: q.marks,
              passedTests,
              totalTests,
            },
          },
        };
      });

      toast.success(`Solution evaluated: ${passedTests}/${totalTests} test cases passed.`);
      return resultPayload;
    } catch (err: any) {
      toast.error(`Submission error: ${err.response?.data?.message || err.message}`);
      return null;
    }
  };

  // Finish Entire Exam Callback — Connected directly to Express API DB submission endpoint
  const handleFinishExam = async (
    mcqAnswersDict?: Record<number, "A" | "B" | "C" | "D">,
    codeByQuestionDict?: Record<number, string>,
    isSecurityViolation?: boolean
  ) => {
    if (isExamLocked) return;
    setIsSubmittingExam(true);
    try {
      const mcqMap: Record<string, number> = {};
      const optToIndex: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 };
      if (mcqAnswersDict) {
        Object.entries(mcqAnswersDict).forEach(([qId, optKey]) => {
          if (optKey && optToIndex[optKey] !== undefined) {
            mcqMap[qId] = optToIndex[optKey];
          }
        });
      }

      const codingMap: Record<string, { code: string; language: string }> = {};
      examData.questions.forEach((q) => {
        const userCode =
          (codeByQuestionDict && codeByQuestionDict[q.id] !== undefined)
            ? codeByQuestionDict[q.id]
            : (examData.answers[q.id]?.answerCode || q.starterCode || "");
        codingMap[String(q.id)] = {
          code: userCode,
          language: q.language,
        };
      });

      const payload = {
        attempt_id: examData.attemptId,
        answers: {
          mcqs: mcqMap,
          codings: codingMap,
          tab_switches: isSecurityViolation ? 3 : 0,
        },
      };

      await ExamService.studentSubmit(examId, payload);
      setExamData((prev) => (prev ? { ...prev, status: "SUBMITTED" } : prev));
      if (isSecurityViolation) {
        setIsSecurityTerminated(true);
        toast.warning("Session terminated due to security violation. Exam auto-submitted.");
      } else {
        toast.success("Exam submitted successfully!");
      }
    } catch (err: any) {
      toast.error(`Exam submission error: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsSubmittingExam(false);
    }
  };

  if (isExamLocked || examData.status === "SUBMITTED" || isSecurityTerminated) {
    return (
      <div
        style={{
          maxWidth: "700px",
          margin: "4rem auto",
          padding: "3rem 2rem",
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          border: "1px solid #e2e8f0",
          textAlign: "center",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            backgroundColor: isSecurityTerminated ? "#fef2f2" : "#f0fdf4",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1.5rem auto",
            fontSize: "2rem",
            color: isSecurityTerminated ? "#ef4444" : "#16a34a",
          }}
        >
          {isSecurityTerminated ? "⚠️" : "✓"}
        </div>
        <h2 style={{ color: "#0f172a", fontSize: "1.75rem", fontWeight: 800, marginBottom: "0.75rem" }}>
          {isSecurityTerminated
            ? "Session Terminated & Exam Auto-Submitted"
            : "Exam Submitted Successfully"}
        </h2>
        <p style={{ color: "#64748b", fontSize: "1rem", lineHeight: 1.6, maxWidth: "540px", margin: "0 auto 2rem auto" }}>
          {isSecurityTerminated
            ? "Your exam session was automatically submitted due to proctoring security rules (tab switches or focus loss). All your progress up to termination has been saved."
            : "Thank you for completing the examination. Your answers have been recorded in the database."}
        </p>

        <div
          style={{
            padding: "1rem",
            backgroundColor: "#f8fafc",
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
            fontSize: "0.875rem",
            color: "#475569",
          }}
        >
          🔒 You may safely close this tab now.
        </div>
      </div>
    );
  }

  return (
    <ExamCodingEditor
      examName={examData.examName}
      attemptId={examData.attemptId}
      questions={examData.questions}
      mcqQuestions={examData.mcqQuestions}
      answers={examData.answers}
      remainingSeconds={remainingSec}
      isExamLocked={isExamLocked}
      onRunCode={handleRunCode}
      onSubmitAnswer={handleSubmitAnswer}
      onFinishExam={handleFinishExam}
      isSubmittingExam={isSubmittingExam}
    />
  );
}
