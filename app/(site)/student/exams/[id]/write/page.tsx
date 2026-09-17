"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Award, Clock, AlertTriangle, ShieldCheck, Play, ArrowRight, CheckCircle2, XCircle, ChevronRight, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MonacoCodeEditor from "@/components/hod/exams/components/MonacoCodeEditor";
import { toast } from "sonner";
import ExamService from "@/services/exam.service";

const SUPPORTED_LANGS = ["python", "javascript", "java", "c", "cpp", "php", "r"];

const DEFAULT_STARTER_CODES: Record<string, string> = {
  python: "# Write your Python code here\n",
  javascript: "// Write your JavaScript code here\n",
  java: "// Write your Java code here\npublic class Solution {\n}\n",
  c: "/* Write your C code here */\n#include <stdio.h>\n",
  cpp: "// Write your C++ code here\n#include <iostream>\n",
  php: "<?php\n// Write your PHP code here\n",
  r: "# Write your R code here\n"
};

export default function ExamPlayerPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params?.id);

  const [exam, setExam] = useState<any>(null);
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  // Proctor / Fullscreen states
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [tabSwitches, setTabSwitches] = useState(0);

  // Answers State
  const [mcqAnswers, setMcqAnswers] = useState<{ [key: string]: number }>({});
  const [codingAnswers, setCodingAnswers] = useState<{
    [key: string]: {
      code: string;
      language: string;
      codeByLang: Record<string, string>;
      isEditedByLang: Record<string, boolean>;
    };
  }>({});

  // Question selection states
  const [activeTab, setActiveTab] = useState("mcq");
  const [selectedMcqIdx, setSelectedMcqIdx] = useState(0);
  const [selectedCodingIdx, setSelectedCodingIdx] = useState(0);

  // Custom Input State per coding question
  const [customInputs, setCustomInputs] = useState<{ [key: string]: string }>({});

  // Compilation / Code run feedback
  const [runningCode, setRunningCode] = useState(false);
  const [runResults, setRunResults] = useState<{ [key: string]: any }>({});

  // Results screen
  const [showResults, setShowResults] = useState(false);
  const [scoreDetails, setScoreDetails] = useState<any>(null);

  useEffect(() => {
    if (!id) return;

    const startSession = async () => {
      try {
        setLoading(true);
        const res = await ExamService.studentStart(id);
        setAttemptId(res.data.attempt_id);
        setExam(res.data.exam);
        
        // Initialize timer (convert duration mins to seconds)
        setTimeLeft(Number(res.data.exam.duration || 60) * 60);

        // Prepopulate starter code for coding questions across 7 supported languages
        const starters: any = {};
        res.data.exam.codings.forEach((c: any) => {
          const allowedLangs: string[] = Array.isArray(c.languages) ? c.languages : (typeof c.languages === "string" ? JSON.parse(c.languages) : ["python"]);
          const initialLang = allowedLangs[0] || "python";

          let parsedStarterMap: Record<string, string> = {};
          if (typeof c.starter_code === "string") {
            try {
              const jsonParsed = JSON.parse(c.starter_code);
              if (typeof jsonParsed === "object" && jsonParsed !== null) {
                parsedStarterMap = jsonParsed;
              } else {
                parsedStarterMap[initialLang] = c.starter_code;
              }
            } catch {
              parsedStarterMap[initialLang] = c.starter_code;
            }
          }

          const codeByLang: Record<string, string> = {};
          const isEditedByLang: Record<string, boolean> = {};

          SUPPORTED_LANGS.forEach((lang) => {
            codeByLang[lang] = parsedStarterMap[lang] || parsedStarterMap[initialLang] || DEFAULT_STARTER_CODES[lang] || "";
            isEditedByLang[lang] = false;
          });

          starters[String(c.id)] = {
            language: initialLang,
            code: codeByLang[initialLang],
            codeByLang,
            isEditedByLang
          };
        });
        setCodingAnswers(starters);
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to initialize exam session.");
        router.push("/student/exams");
      } finally {
        setLoading(false);
      }
    };

    startSession();
  }, [id, router]);

  // Fullscreen check listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Proctor: Tab switch check
  useEffect(() => {
    if (!exam || !exam.fullscreen_required || showResults) return;

    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
        setTabSwitches((prev) => {
          const nextVal = prev + 1;
          toast.warning(`Tab switch detected! Alert (${nextVal}/${exam.tab_switch_limit})`);
          if (nextVal >= exam.tab_switch_limit) {
            toast.error("Tab switch limit reached. Automatically submitting exam session...");
            autoSubmitAssessment(nextVal);
          }
          return nextVal;
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [exam, showResults]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft === null || showResults) return;
    if (timeLeft <= 0) {
      toast.error("Exam duration elapsed. Auto-submitting...");
      autoSubmitAssessment();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, showResults]);

  // Request fullscreen trigger
  const enterFullscreen = () => {
    document.documentElement.requestFullscreen()
      .then(() => setIsFullscreen(true))
      .catch(() => toast.error("Please allow Fullscreen mode to access the exam workspace."));
  };

  const handleMcqSelect = (mcqId: number, optionIdx: number) => {
    setMcqAnswers((prev) => ({
      ...prev,
      [String(mcqId)]: optionIdx
    }));
  };

  const handleCodingChange = (codingId: number, newCode: string) => {
    setCodingAnswers((prev) => {
      const key = String(codingId);
      const qState = prev[key] || {
        language: "python",
        code: "",
        codeByLang: {},
        isEditedByLang: {}
      };
      const currentLang = qState.language || "python";
      const updatedCodeByLang = {
        ...(qState.codeByLang || {}),
        [currentLang]: newCode
      };
      const updatedIsEdited = {
        ...(qState.isEditedByLang || {}),
        [currentLang]: true
      };

      return {
        ...prev,
        [key]: {
          ...qState,
          code: newCode,
          codeByLang: updatedCodeByLang,
          isEditedByLang: updatedIsEdited
        }
      };
    });
  };

  const handleCodingLangChange = (codingId: number, newLang: string) => {
    setCodingAnswers((prev) => {
      const key = String(codingId);
      const qState = prev[key];
      if (!qState) return prev;
      const currentLang = qState.language;
      const currentCode = qState.code;
      const updatedCodeByLang = {
        ...(qState.codeByLang || {}),
        [currentLang]: currentCode
      };
      const targetCode = updatedCodeByLang[newLang] !== undefined ? updatedCodeByLang[newLang] : DEFAULT_STARTER_CODES[newLang] || "";

      return {
        ...prev,
        [key]: {
          ...qState,
          language: newLang,
          code: targetCode,
          codeByLang: {
            ...updatedCodeByLang,
            [newLang]: targetCode
          }
        }
      };
    });
  };

  // Run Test Cases
  const handleRunCode = async (codingId: number) => {
    const ans = codingAnswers[String(codingId)];
    if (!ans || !ans.code || !ans.code.trim()) {
        toast.error("Please write code before running execution.");
        return;
    }

    try {
      setRunningCode(true);
      const customInput = customInputs[String(codingId)] || "";
      const rawRes = await ExamService.studentRunCode(id, {
        coding_question_id: codingId,
        code: ans.code,
        language: ans.language,
        custom_input: customInput,
        use_test_cases: true
      });

      const resData = rawRes.data || rawRes;
      const isFailed = !!(
        resData.error ||
        resData.status === "server_error" ||
        resData.success === false ||
        (resData.exitCode !== undefined && resData.exitCode !== 0)
      );

      setRunResults((prev) => ({
        ...prev,
        [String(codingId)]: resData
      }));

      if (isFailed) {
        toast.error(resData.error || resData.message || "Execution failed.");
      } else {
        toast.success("Execution completed successfully!");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Compilation / execution process failed.");
    } finally {
      setRunningCode(false);
    }
  };

  // Submit Exam
  const submitAssessment = async (confirmSubmit: boolean = true) => {
    if (confirmSubmit && !confirm("Are you sure you want to finish and submit your exam?")) return;
    if (!attemptId) return;

    try {
      setSubmitting(true);
      const payload = {
        attempt_id: attemptId,
        answers: {
          mcqs: mcqAnswers,
          codings: codingAnswers,
          tab_switches: tabSwitches
        }
      };

      const res = await ExamService.studentSubmit(id, payload);
      setScoreDetails(res.data.scores);
      setShowResults(true);
      toast.success("Exam submitted successfully!");
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    } catch {
      toast.error("Failed to submit exam session.");
    } finally {
      setSubmitting(false);
    }
  };

  const autoSubmitAssessment = async (finalTabSwitches?: number) => {
    if (!attemptId) return;
    try {
      setSubmitting(true);
      const payload = {
        attempt_id: attemptId,
        answers: {
          mcqs: mcqAnswers,
          codings: codingAnswers,
          tab_switches: finalTabSwitches !== undefined ? finalTabSwitches : tabSwitches
        }
      };
      const res = await ExamService.studentSubmit(id, payload);
      setScoreDetails(res.data.scores);
      setShowResults(true);
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    } catch {
      toast.error("Auto submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="p-16 text-center text-muted-foreground flex flex-col items-center justify-center gap-2 h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="text-xs">Preparing your secure exam session...</span>
      </div>
    );
  }

  // Result view
  if (showResults) {
    const totalPossibleMarks = Number(scoreDetails?.total_possible || exam?.mcqs.reduce((s: number, m: any) => s + Number(m.marks), 0) + exam?.codings.reduce((s: number, c: any) => s + Number(c.marks), 0));
    return (
      <div className="max-w-xl mx-auto py-16 px-4 animate-in fade-in duration-300">
        <div className="bg-card border border-border rounded-3xl p-8 text-center shadow-lg space-y-6">
          <div className="inline-flex items-center justify-center p-4 bg-emerald-500/10 rounded-full text-emerald-500">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Exam Completed Successfully</h1>
            <p className="text-xs text-muted-foreground mt-1">Your solutions have been stored and auto-evaluated.</p>
          </div>

          <div className="bg-muted/30 p-6 rounded-2xl border border-border space-y-4">
            <div className="grid grid-cols-3 gap-2 divide-x divide-border">
              <div>
                <div className="text-[10px] text-muted-foreground uppercase font-semibold">Total Score</div>
                <div className="text-2xl font-black text-primary mt-1">{scoreDetails?.total_score || 0}</div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground uppercase font-semibold">MCQ Score</div>
                <div className="text-2xl font-bold text-foreground mt-1">{scoreDetails?.mcq_score || 0}</div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground uppercase font-semibold">Coding Score</div>
                <div className="text-2xl font-bold text-foreground mt-1">{scoreDetails?.coding_score || 0}</div>
              </div>
            </div>
            {tabSwitches > 0 && (
              <div className="flex items-center justify-center gap-1.5 text-xs text-amber-600 font-semibold bg-amber-500/10 border border-amber-500/20 py-1.5 px-3 rounded-lg">
                <AlertTriangle className="w-4 h-4" />
                <span>{tabSwitches} Proctor warning(s) logged</span>
              </div>
            )}
          </div>

          <Button onClick={() => router.push("/student/exams")} className="w-full rounded-xl py-2.5 bg-primary text-white font-semibold">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Force Fullscreen Proctor Modal
  if (exam?.fullscreen_required && !isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center p-6 space-y-6">
        <div className="max-w-md text-center space-y-4 bg-card border border-border p-8 rounded-3xl shadow-lg">
          <div className="inline-flex items-center justify-center p-4 bg-amber-500/10 rounded-full text-amber-500">
            <AlertTriangle className="w-12 h-12" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Secure Exam Proctor Mode</h1>
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
              This exam requires Fullscreen mode. Any attempt to leave fullscreen or switch browser tabs will be flagged as an integrity breach.
            </p>
          </div>

          <div className="text-left text-xs bg-muted/40 p-4 border border-border rounded-xl space-y-1 text-muted-foreground">
            <div className="flex gap-2 items-center">
              <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
              <span>Fullscreen mode is mandatory</span>
            </div>
            <div className="flex gap-2 items-center">
              <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
              <span>Tab changes will trigger warnings and auto-submit</span>
            </div>
            <div className="flex gap-2 items-center">
              <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
              <span>Copying or pasting text is disabled</span>
            </div>
          </div>

          <Button onClick={enterFullscreen} className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl h-11 font-semibold flex items-center justify-center gap-1.5">
            <Play className="w-4 h-4 fill-current" />
            <span>Enter Fullscreen & Start</span>
          </Button>
        </div>
      </div>
    );
  }

  const activeCodingQ = exam?.codings[selectedCodingIdx];
  const codingResult = activeCodingQ ? runResults[String(activeCodingQ.id)] : null;

  return (
    <div className="h-screen flex flex-col bg-background text-foreground select-none" onContextMenu={(e) => e.preventDefault()}>
      {/* Top Proctor Bar */}
      <div className="h-14 border-b border-border bg-card px-6 flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center gap-4">
          <h2 className="font-bold text-foreground flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            <span>{exam?.title}</span>
          </h2>
          <span className="text-xs text-muted-foreground">| Proctoring Active</span>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-1.5 rounded-full text-primary">
            <Clock className="w-4 h-4 animate-pulse" />
            <span className="text-sm font-black tracking-wider">{timeLeft !== null ? formatTime(timeLeft) : "--:--"}</span>
          </div>

          <Button
            onClick={() => submitAssessment(true)}
            disabled={submitting}
            className="bg-destructive hover:bg-destructive/90 text-white font-semibold text-xs rounded-xl px-4 py-1.5 h-9 flex items-center gap-1.5 shadow-sm"
          >
            {submitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Submitting...</span>
              </>
            ) : (
              <span>Submit Assessment</span>
            )}
          </Button>
        </div>
      </div>

      {/* Main Workspace Workspace */}
      <div className="flex-1 overflow-hidden flex">
        {/* Left Side: Question Navigator */}
        <div className="w-80 border-r border-border bg-card/50 overflow-y-auto flex flex-col justify-between shrink-0">
          <div className="p-4 space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-2 bg-muted p-1 rounded-xl">
                <TabsTrigger value="mcq" className="rounded-lg text-xs">MCQs ({exam?.mcqs.length})</TabsTrigger>
                <TabsTrigger value="coding" className="rounded-lg text-xs">Coding ({exam?.codings.length})</TabsTrigger>
              </TabsList>
            </Tabs>

            {activeTab === "mcq" ? (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground font-semibold uppercase">MCQ Questions</Label>
                <div className="grid grid-cols-4 gap-2">
                  {exam?.mcqs.map((m: any, idx: number) => {
                    const answered = mcqAnswers[String(m.id)] !== undefined;
                    const selected = idx === selectedMcqIdx;
                    return (
                      <Button
                        key={m.id}
                        variant={selected ? "default" : answered ? "secondary" : "outline"}
                        onClick={() => setSelectedMcqIdx(idx)}
                        className={`h-9 w-9 p-0 rounded-lg text-xs font-bold transition-all ${
                          answered && !selected ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600" : ""
                        }`}
                      >
                        {idx + 1}
                      </Button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground font-semibold uppercase px-1">Problems List</Label>
                {exam?.codings.map((c: any, idx: number) => {
                  const answered = codingAnswers[String(c.id)]?.code?.trim().length > 0;
                  const selected = idx === selectedCodingIdx;
                  return (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCodingIdx(idx)}
                      className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex justify-between items-center ${
                        selected
                          ? "bg-primary text-white border-primary"
                          : "bg-card border-border hover:bg-muted/30"
                      }`}
                    >
                      <div className="font-semibold truncate pr-2">
                        {idx + 1}. {c.title}
                      </div>
                      {answered && (
                        <span className={`h-2 w-2 rounded-full ${selected ? "bg-white" : "bg-emerald-500"}`} />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="p-4 border-t border-border bg-card space-y-1.5 text-[10px] text-muted-foreground">
            <div className="flex justify-between">
              <span>Proctor Integrity:</span>
              <span className={`font-semibold ${tabSwitches > 0 ? "text-amber-600" : "text-emerald-500"}`}>
                {Math.max(0, 100 - tabSwitches * 10)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span>Tab changes:</span>
              <span>{tabSwitches} / {exam?.tab_switch_limit}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Details / Code Editor Workspace */}
        <div className="flex-1 overflow-hidden flex flex-col bg-background">
          {activeTab === "mcq" && exam?.mcqs.length > 0 ? (
            <div className="p-8 max-w-3xl space-y-6 overflow-y-auto">
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground border-b border-border pb-3">
                  <span>Question {selectedMcqIdx + 1} of {exam.mcqs.length}</span>
                  <span className="font-semibold text-primary">{exam.mcqs[selectedMcqIdx].marks} Mark(s)</span>
                </div>

                <div className="text-base font-bold text-foreground leading-relaxed">
                  {exam.mcqs[selectedMcqIdx].question}
                </div>

                <div className="space-y-3 pt-3">
                  {exam.mcqs[selectedMcqIdx].options.map((opt: string, optIdx: number) => {
                    const selected = mcqAnswers[String(exam.mcqs[selectedMcqIdx].id)] === optIdx;
                    return (
                      <label
                        key={optIdx}
                        onClick={() => handleMcqSelect(exam.mcqs[selectedMcqIdx].id, optIdx)}
                        className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer select-none transition-all ${
                          selected
                            ? "bg-primary/10 border-primary shadow-sm text-primary font-bold"
                            : "bg-card border-border hover:bg-muted/10"
                        }`}
                      >
                        <input
                          type="radio"
                          name={`mcq_${exam.mcqs[selectedMcqIdx].id}`}
                          checked={selected}
                          onChange={() => {}}
                          className="h-4 w-4 border-gray-300 text-primary focus:ring-primary cursor-pointer"
                        />
                        <span className="text-sm">{opt}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  disabled={selectedMcqIdx === 0}
                  onClick={() => setSelectedMcqIdx(prev => prev - 1)}
                  className="rounded-xl text-xs h-10 px-4"
                >
                  Previous
                </Button>
                {selectedMcqIdx < exam.mcqs.length - 1 ? (
                  <Button
                    onClick={() => setSelectedMcqIdx(prev => prev + 1)}
                    className="rounded-xl text-xs h-10 px-4 bg-primary text-white"
                  >
                    Next Question
                  </Button>
                ) : (
                  <Button
                    onClick={() => setActiveTab("coding")}
                    className="rounded-xl text-xs h-10 px-4 bg-primary text-white flex items-center gap-1"
                  >
                    <span>Proceed to Coding</span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ) : activeTab === "coding" && activeCodingQ ? (
            <div className="flex-1 flex overflow-hidden">
              {/* Problem Description (Left Split) */}
              <div className="w-[45%] border-r border-border overflow-y-auto p-6 space-y-5 bg-card/20">
                <div className="flex items-center justify-between text-xs text-muted-foreground border-b border-border pb-3">
                  <span className="font-bold text-foreground text-sm">{activeCodingQ.title}</span>
                  <span className="font-semibold text-primary">{activeCodingQ.marks} Mark(s)</span>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Problem Statement</h4>
                    <p className="text-sm text-foreground mt-1 leading-relaxed whitespace-pre-line">{activeCodingQ.statement}</p>
                  </div>

                  {activeCodingQ.constraints && (
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Constraints</h4>
                      <pre className="text-xs bg-muted/60 p-3 rounded-lg border border-border/80 mt-1 font-mono text-foreground leading-relaxed">{activeCodingQ.constraints}</pre>
                    </div>
                  )}

                  {activeCodingQ.input_format && (
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Input Format</h4>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{activeCodingQ.input_format}</p>
                    </div>
                  )}

                  {activeCodingQ.output_format && (
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Output Format</h4>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{activeCodingQ.output_format}</p>
                    </div>
                  )}

                  {activeCodingQ.sample_input && (
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sample Input</h4>
                      <pre className="text-xs bg-muted/60 p-3 rounded-lg border border-border/80 mt-1 font-mono text-foreground">{activeCodingQ.sample_input}</pre>
                    </div>
                  )}

                  {activeCodingQ.sample_output && (
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sample Output</h4>
                      <pre className="text-xs bg-muted/60 p-3 rounded-lg border border-border/80 mt-1 font-mono text-foreground">{activeCodingQ.sample_output}</pre>
                    </div>
                  )}
                </div>
              </div>

              {/* Code Editor & Test Cases (Right Split) */}
              <div className="flex-1 overflow-hidden flex flex-col bg-card">
                {/* Compiler Toolbar */}
                <div className="h-12 border-b border-border bg-muted/30 px-4 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-muted-foreground">Select Language:</span>
                    <select
                      value={codingAnswers[String(activeCodingQ.id)]?.language || "python"}
                      onChange={(e) => handleCodingLangChange(activeCodingQ.id, e.target.value)}
                      className="h-8 rounded-lg border border-border bg-background px-3 text-xs font-semibold cursor-pointer"
                    >
                      {activeCodingQ.languages.map((l: string) => (
                        <option key={l} value={l}>
                          {l.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>

                  <Button
                    onClick={() => handleRunCode(activeCodingQ.id)}
                    disabled={runningCode}
                    className="bg-primary hover:bg-primary/95 text-white font-semibold text-xs rounded-xl h-8 px-4 flex items-center gap-1 shadow-sm"
                  >
                    {runningCode ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Compiling...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3 fill-current" />
                        <span>Run Code</span>
                      </>
                    )}
                  </Button>
                </div>

                {/* Editor Container */}
                <div className="border border-border/80 rounded-2xl overflow-hidden shadow-inner bg-card h-[450px] min-h-[350px] w-full relative">
                  <MonacoCodeEditor
                    language={codingAnswers[String(activeCodingQ.id)]?.language || "python"}
                    value={codingAnswers[String(activeCodingQ.id)]?.code || ""}
                    onChange={(code) => handleCodingChange(activeCodingQ.id, code)}
                    height="100%"
                  />
                </div>

                {/* Visible Test Cases output panel */}
                <div className="h-48 border-t border-border bg-card overflow-y-auto flex flex-col shrink-0">
                  <div className="h-9 border-b border-border bg-muted/20 px-4 flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Test Cases Outputs</span>
                  </div>

                  <div className="flex-1 p-4 space-y-3">
                    {codingResult ? (
                      (() => {
                        const resultsList = codingResult.results || codingResult.details || [];
                        if (resultsList.length > 0) {
                          return resultsList.map((tc: any, index: number) => {
                            const isPassed = tc.status === "Passed" || tc.passed === true;
                            const statusText = tc.status || (isPassed ? "Passed" : "Failed");
                            const isHidden = !!tc.is_hidden;
                            const inputVal = isHidden ? "[Hidden]" : (tc.input !== undefined ? tc.input : "");
                            const expectedVal = isHidden ? "[Hidden]" : (tc.expected_output !== undefined ? tc.expected_output : tc.expected || "");
                            const actualVal = isHidden ? "[Hidden]" : (tc.actual_output !== undefined ? tc.actual_output : tc.actual || "");

                            return (
                              <div key={index} className="flex flex-col gap-1.5 p-3 rounded-lg bg-muted/20 border border-border/80 text-xs">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold">Test Case {index + 1} {isHidden ? "(Hidden)" : ""}</span>
                                  <span className={`inline-flex items-center gap-1 font-semibold ${isPassed ? "text-emerald-500" : "text-destructive"}`}>
                                    {isPassed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                                    <span>{statusText}</span>
                                  </span>
                                </div>
                                <div className="grid grid-cols-[80px_1fr] gap-x-2 mt-1">
                                  <span className="text-muted-foreground font-semibold">Input:</span>
                                  <span className="font-mono bg-background px-1.5 py-0.5 rounded border border-border/60 text-[10px] w-fit max-w-full overflow-x-auto whitespace-pre">{inputVal || "(empty)"}</span>
                                </div>
                                <div className="grid grid-cols-[80px_1fr] gap-x-2 mt-1">
                                  <span className="text-muted-foreground font-semibold">Expected:</span>
                                  <span className="font-mono bg-background px-1.5 py-0.5 rounded border border-border/60 text-[10px] w-fit max-w-full overflow-x-auto whitespace-pre">{expectedVal || "(empty)"}</span>
                                </div>
                                <div className="grid grid-cols-[80px_1fr] gap-x-2 mt-1">
                                  <span className="text-muted-foreground font-semibold">Actual:</span>
                                  <span className={`font-mono bg-background px-1.5 py-0.5 rounded border border-border/60 text-[10px] w-fit max-w-full overflow-x-auto whitespace-pre ${!isPassed && !codingResult.error ? "text-destructive font-bold" : ""}`}>{actualVal || "(empty)"}</span>
                                </div>
                              </div>
                            );
                          });
                        }
                        if (codingResult.stdout || codingResult.stderr || codingResult.error || codingResult.summary?.compilationError) {
                          return (
                            <div className="text-xs font-mono whitespace-pre-wrap bg-muted/20 p-4 rounded-xl border border-border h-full overflow-y-auto space-y-2">
                              {codingResult.stdout && <div><span className="font-bold text-muted-foreground">stdout:</span>{'\n'}{codingResult.stdout}</div>}
                              {codingResult.stderr && <div className="text-destructive"><span className="font-bold">stderr:</span>{'\n'}{codingResult.stderr}</div>}
                              {(codingResult.error || codingResult.summary?.compilationError) && (
                                <div className="text-destructive"><span className="font-bold">error:</span>{'\n'}{codingResult.error || codingResult.summary?.compilationError}</div>
                              )}
                              {codingResult.executionTime !== undefined && <div className="text-muted-foreground text-[11px] pt-1">Execution Time: {codingResult.executionTime} ms</div>}
                            </div>
                          );
                        }
                        return <div className="text-xs text-muted-foreground italic text-center pt-8">No outputs parsed.</div>;
                      })()
                    ) : (
                      <div className="text-xs text-muted-foreground italic text-center pt-8">Run your code to evaluate against test cases.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-16 text-center text-muted-foreground text-xs italic">
              No questions configured in this assessment tab.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
