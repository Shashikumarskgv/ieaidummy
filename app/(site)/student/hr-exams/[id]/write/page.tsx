"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Award, Clock, AlertTriangle, ShieldCheck, Play, ArrowRight, CheckCircle2, XCircle, ChevronRight, Loader2, Sparkles, Building2, Check, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MonacoCodeEditor from "@/components/hod/exams/components/MonacoCodeEditor";
import { toast } from "sonner";
import JobsService from "@/services/jobs.service";
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

export default function HRExamPlayerPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params?.id);

  const [exam, setExam] = useState<any>(null);
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  // Question lists
  const [mcqs, setMcqs] = useState<any[]>([]);
  const [codings, setCodings] = useState<any[]>([]);

  // Answers State
  const [mcqAnswers, setMcqAnswers] = useState<{ [key: string]: number }>({});
  const [codingAnswers, setCodingAnswers] = useState<{
    [key: string]: {
      code: string;
      language: string;
      codeByLang: Record<string, string>;
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
        const res = await JobsService.startHRAssessment(id);
        const sessionData = res.data.data;

        setAttemptId(sessionData.attempt_id);
        setExam(sessionData.exam);
        setMcqs(sessionData.exam.mcqs || []);
        setCodings(sessionData.exam.codings || []);

        if ((sessionData.exam.mcqs || []).length === 0 && (sessionData.exam.codings || []).length > 0) {
          setActiveTab("coding");
        }

        // Initialize timer (convert duration mins to seconds)
        setTimeLeft(Number(sessionData.exam.duration || 60) * 60);

        // Prepopulate starter code for coding questions
        const starters: any = {};
        (sessionData.exam.codings || []).forEach((c: any) => {
          const allowedLangs: string[] = Array.isArray(c.languages) ? c.languages : ["python", "javascript"];
          const initialLang = allowedLangs[0] || "python";

          const codeByLang: Record<string, string> = {};
          SUPPORTED_LANGS.forEach((lang) => {
            codeByLang[lang] = c.starter_code || DEFAULT_STARTER_CODES[lang] || "";
          });

          starters[String(c.id)] = {
            language: initialLang,
            code: codeByLang[initialLang],
            codeByLang
          };
        });
        setCodingAnswers(starters);
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to initialize HR assessment session.");
        router.push("/student/exams");
      } finally {
        setLoading(false);
      }
    };

    startSession();
  }, [id, router]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft === null || showResults) return;

    if (timeLeft <= 0) {
      toast.warning("Time limit expired! Submitting your HR assessment automatically...");
      handleSubmitAssessment();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, showResults]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleRunCode = async (codingQuestion: any) => {
    const qIdStr = String(codingQuestion.id);
    const currentCodeState = codingAnswers[qIdStr];
    const codeToRun = currentCodeState?.code || codingQuestion.starter_code || "";
    const langToRun = currentCodeState?.language || "python";

    try {
      setRunningCode(true);
      const res = await ExamService.studentRunCode(id, {
        coding_question_id: codingQuestion.id,
        code: codeToRun,
        language: langToRun,
        custom_input: customInputs[qIdStr] || "",
        use_test_cases: false
      });

      setRunResults(prev => ({
        ...prev,
        [qIdStr]: res.data
      }));
      toast.success("Code compiled & executed successfully.");
    } catch (err: any) {
      setRunResults(prev => ({
        ...prev,
        [qIdStr]: {
          error: err.response?.data?.message || err.message || "Compilation Error"
        }
      }));
      toast.error("Compilation error during execution.");
    } finally {
      setRunningCode(false);
    }
  };

  const handleSubmitAssessment = async () => {
    if (!attemptId || !id) return;

    try {
      setSubmitting(true);
      const res = await JobsService.submitHRAssessment(id, {
        attempt_id: attemptId,
        mcq_answers: mcqAnswers,
        coding_answers: codingAnswers
      });

      setScoreDetails(res.data.data);
      setShowResults(true);
      toast.success("HR Assessment submitted successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to submit HR assessment.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-12 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground font-medium">Initializing secure HR Assessment environment...</p>
      </div>
    );
  }

  if (showResults && scoreDetails) {
    const isPass = scoreDetails.percentage >= (exam?.pass_percentage || 40);

    return (
      <div className="min-h-screen bg-background p-6 max-w-3xl mx-auto flex flex-col items-center justify-center space-y-6 animate-in fade-in duration-300">
        <div className="bg-card border border-border rounded-3xl p-8 shadow-xl text-center space-y-6 w-full">
          <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center bg-primary/10 text-primary">
            {isPass ? <CheckCircle2 className="w-10 h-10 text-emerald-500" /> : <Award className="w-10 h-10 text-amber-500" />}
          </div>

          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-muted-foreground">{exam?.company_name} · HR Assessment</span>
            <h1 className="text-2xl font-bold tracking-tight text-foreground mt-1">{exam?.title}</h1>
            <p className="text-xs text-muted-foreground mt-1">Assessment completed and recorded in your candidate profile.</p>
          </div>

          <div className="grid grid-cols-3 gap-4 bg-muted/30 border border-border rounded-2xl p-4">
            <div>
              <div className="text-[11px] text-muted-foreground uppercase font-bold">Total Score</div>
              <div className="text-xl font-bold text-foreground mt-0.5">{scoreDetails.total_score} / {scoreDetails.max_score}</div>
            </div>
            <div>
              <div className="text-[11px] text-muted-foreground uppercase font-bold">Passing Mark</div>
              <div className="text-xl font-bold text-foreground mt-0.5">{exam?.pass_percentage || 40}%</div>
            </div>
            <div>
              <div className="text-[11px] text-muted-foreground uppercase font-bold">Result</div>
              <div className={`text-xl font-bold mt-0.5 ${isPass ? "text-emerald-600" : "text-amber-600"}`}>
                {scoreDetails.percentage}% ({isPass ? "Passed" : "Under Review"})
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={() => router.push("/student/exams")} className="w-full rounded-xl h-11 bg-primary text-white font-bold text-xs gap-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to My Exams</span>
            </Button>
            <Button onClick={() => router.push("/student/reports")} variant="outline" className="w-full rounded-xl h-11 text-xs font-bold">
              <span>View Candidate Performance Reports</span>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const currentMcq = mcqs[selectedMcqIdx];
  const currentCoding = codings[selectedCodingIdx];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Header */}
      <header className="border-b border-border bg-card px-6 py-3.5 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-sm text-foreground">{exam?.title}</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary uppercase">
                {exam?.company_name}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">{exam?.job_title}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 font-mono text-xs font-bold">
            <Clock className="w-4 h-4 animate-pulse" />
            <span>{timeLeft !== null ? formatTime(timeLeft) : "--:--"}</span>
          </div>

          <Button
            onClick={handleSubmitAssessment}
            disabled={submitting}
            className="rounded-xl h-9 bg-primary text-white text-xs font-bold px-4 gap-1.5 shadow-sm"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit Assessment"}
          </Button>
        </div>
      </header>

      {/* Main Examination Workspace */}
      <div className="flex-1 p-6 max-w-6xl mx-auto w-full space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-4">
          <TabsList className="bg-muted/60 p-1 rounded-xl h-10 inline-flex">
            {mcqs.length > 0 && (
              <TabsTrigger value="mcq" className="rounded-lg text-xs font-semibold px-4 h-8">
                MCQ Section ({mcqs.length})
              </TabsTrigger>
            )}
            {codings.length > 0 && (
              <TabsTrigger value="coding" className="rounded-lg text-xs font-semibold px-4 h-8">
                Coding Challenges ({codings.length})
              </TabsTrigger>
            )}
          </TabsList>

          {/* MCQ Tab Content */}
          {mcqs.length > 0 && (
            <TabsContent value="mcq" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Question Navigator */}
                <div className="bg-card border border-border rounded-2xl p-4 shadow-sm h-fit space-y-3">
                  <span className="text-xs font-bold text-foreground">Question Navigator</span>
                  <div className="grid grid-cols-4 gap-2">
                    {mcqs.map((q, idx) => {
                      const isAnswered = mcqAnswers[q.id] !== undefined;
                      const isCurrent = selectedMcqIdx === idx;
                      return (
                        <button
                          key={q.id}
                          onClick={() => setSelectedMcqIdx(idx)}
                          className={`h-8 rounded-lg text-xs font-bold border transition-all ${
                            isCurrent
                              ? "bg-primary text-white border-primary"
                              : isAnswered
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                              : "bg-muted/40 border-border text-foreground hover:bg-muted"
                          }`}
                        >
                          {idx + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Active Question Display */}
                {currentMcq && (
                  <div className="md:col-span-3 bg-card border border-border rounded-2xl p-6 shadow-sm space-y-5">
                    <div className="flex items-center justify-between border-b border-border pb-3">
                      <span className="text-xs font-bold text-muted-foreground uppercase">
                        Question {selectedMcqIdx + 1} of {mcqs.length} · {currentMcq.marks} Marks
                      </span>
                    </div>

                    <h2 className="text-base font-semibold text-foreground whitespace-pre-wrap">{currentMcq.question}</h2>

                    <div className="space-y-2.5 pt-2">
                      {currentMcq.options?.map((opt: string, optIdx: number) => {
                        const isSelected = mcqAnswers[currentMcq.id] === optIdx;
                        return (
                          <label
                            key={optIdx}
                            onClick={() => setMcqAnswers(p => ({ ...p, [currentMcq.id]: optIdx }))}
                            className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                              isSelected
                                ? "bg-primary/10 border-primary text-foreground font-semibold"
                                : "bg-card border-border hover:border-primary/30 text-foreground"
                            }`}
                          >
                            <input
                              type="radio"
                              name={`mcq_${currentMcq.id}`}
                              checked={isSelected}
                              onChange={() => {}}
                              className="cursor-pointer text-primary focus:ring-primary"
                            />
                            <span className="text-xs">{opt}</span>
                          </label>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <Button
                        disabled={selectedMcqIdx === 0}
                        onClick={() => setSelectedMcqIdx(p => p - 1)}
                        variant="outline"
                        className="rounded-xl h-9 text-xs"
                      >
                        Previous
                      </Button>
                      <Button
                        disabled={selectedMcqIdx === mcqs.length - 1}
                        onClick={() => setSelectedMcqIdx(p => p + 1)}
                        variant="outline"
                        className="rounded-xl h-9 text-xs"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          )}

          {/* Coding Tab Content */}
          {codings.length > 0 && (
            <TabsContent value="coding" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Coding Navigator */}
                <div className="bg-card border border-border rounded-2xl p-4 shadow-sm h-fit space-y-3">
                  <span className="text-xs font-bold text-foreground">Coding Challenges</span>
                  <div className="space-y-2">
                    {codings.map((c, idx) => (
                      <button
                        key={c.id}
                        onClick={() => setSelectedCodingIdx(idx)}
                        className={`w-full text-left p-2.5 rounded-xl text-xs font-semibold border transition-all ${
                          selectedCodingIdx === idx
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                            : "bg-muted/40 border-border text-foreground hover:bg-muted"
                        }`}
                      >
                        P{idx + 1}. {c.title}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Active Coding Challenge Workspace */}
                {currentCoding && (
                  <div className="md:col-span-3 bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-border pb-3">
                      <div>
                        <h2 className="text-sm font-bold text-foreground">{currentCoding.title}</h2>
                        <span className="text-[11px] text-muted-foreground">{currentCoding.marks} Marks</span>
                      </div>

                      {/* Language Selection */}
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-semibold text-muted-foreground">Language:</label>
                        <select
                          value={codingAnswers[String(currentCoding.id)]?.language || "python"}
                          onChange={(e) => {
                            const newLang = e.target.value;
                            setCodingAnswers(prev => ({
                              ...prev,
                              [String(currentCoding.id)]: {
                                ...prev[String(currentCoding.id)],
                                language: newLang,
                                code: prev[String(currentCoding.id)]?.codeByLang?.[newLang] || currentCoding.starter_code || DEFAULT_STARTER_CODES[newLang] || ""
                              }
                            }));
                          }}
                          className="h-8 px-2 rounded-lg border border-input bg-background text-xs font-semibold"
                        >
                          {(currentCoding.languages || ["python", "javascript", "java"]).map((l: string) => (
                            <option key={l} value={l}>{l.toUpperCase()}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground">Problem Description</label>
                      <div className="p-3 bg-muted/20 border border-border rounded-xl text-xs text-foreground whitespace-pre-wrap">
                        {currentCoding.statement}
                      </div>
                    </div>

                    {/* Monaco Code Editor */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground">Write Code</label>
                      <div className="border border-border rounded-xl overflow-hidden min-h-[300px]">
                        <MonacoCodeEditor
                          value={codingAnswers[String(currentCoding.id)]?.code || currentCoding.starter_code || ""}
                          language={codingAnswers[String(currentCoding.id)]?.language || "python"}
                          onChange={(newVal) => {
                            const qKey = String(currentCoding.id);
                            const curLang = codingAnswers[qKey]?.language || "python";
                            setCodingAnswers(prev => ({
                              ...prev,
                              [qKey]: {
                                ...prev[qKey],
                                code: newVal,
                                codeByLang: {
                                  ...prev[qKey]?.codeByLang,
                                  [curLang]: newVal
                                }
                              }
                            }));
                          }}
                        />
                      </div>
                    </div>

                    {/* Execution Controls */}
                    <div className="flex items-center justify-between pt-2">
                      <Button
                        type="button"
                        onClick={() => handleRunCode(currentCoding)}
                        disabled={runningCode}
                        className="rounded-xl h-9 text-xs font-bold gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                      >
                        {runningCode ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                        <span>Compile & Run Code</span>
                      </Button>
                    </div>

                    {/* Run Results Feedback */}
                    {runResults[String(currentCoding.id)] && (
                      <div className="p-3 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono space-y-1">
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Execution Output:</span>
                        <pre className="whitespace-pre-wrap">{JSON.stringify(runResults[String(currentCoding.id)], null, 2)}</pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}