"use client";

import React, { useState } from "react";

export interface MCQQuestionItem {
  questionText?: string;
  question?: string;
  title?: string;
  options?: string[] | { text: string }[];
  correctOption?: string;
  correct_index?: number;
  marks?: number;
  negative_marks?: number;
  difficulty?: string;
  topic?: string;
  explanation?: string;
}

interface QuestionGeneratorLandingProps {
  allowedExamType?: "MCQ" | "CODING" | "MIXED";
  initialLanguages?: string[];
  onGenerateSuccess: (
    questionSetId: number,
    mcqQuestions?: MCQQuestionItem[],
    targetType?: string,
    examTimeMinutes?: number,
    generatedCodings?: any[]
  ) => void;
  onUseFallbackDemo: (examTimeMinutes?: number) => void;
  isGenerating: boolean;
  setIsGenerating: (v: boolean) => void;
}

const SUPPORTED_LANGUAGES = [
  { id: "python", name: "Python" },
  { id: "javascript", name: "JavaScript" },
  { id: "java", name: "Java" },
  { id: "c", name: "C" },
  { id: "cpp", name: "C++" },
  { id: "php", name: "PHP" },
  { id: "r", name: "R" },
  { id: "sql", name: "SQL" },
];

export default function QuestionGeneratorLanding({
  allowedExamType = "MIXED",
  initialLanguages,
  onGenerateSuccess,
  onUseFallbackDemo,
  isGenerating,
  setIsGenerating,
}: QuestionGeneratorLandingProps) {
  // 1. Question Type
  const initialType: "MCQ" | "CODING" | "MIXED" =
    allowedExamType === "MCQ" ? "MCQ" : allowedExamType === "CODING" ? "CODING" : "MIXED";
  const [questionType, setQuestionType] = useState<"MCQ" | "CODING" | "MIXED">(initialType);

  // 2. Topic / Description
  const [topic, setTopic] = useState<string>("Binary Search Tree, Quick Sort, Closures, SQL Joins");

  // 3. Preferred Languages (For Coding / Mixed)
  const defaultLangs = React.useMemo(() => {
    if (Array.isArray(initialLanguages) && initialLanguages.length > 0) {
      const valid = initialLanguages
        .map((l) => l.trim().toLowerCase())
        .filter((l) => SUPPORTED_LANGUAGES.some((sl) => sl.id === l));
      if (valid.length >= 2) return valid;
      if (valid.length === 1) {
        const fallback = valid[0] === "sql" ? "python" : "sql";
        return [valid[0], fallback];
      }
    }
    return ["python", "sql"];
  }, [initialLanguages]);

  const [selectedLangs, setSelectedLangs] = useState<string[]>(defaultLangs);

  // 4. Difficulty
  const [difficulty, setDifficulty] = useState<"EASY" | "MEDIUM" | "HARD">("MEDIUM");

  // 5. Question Count (Preset vs Custom Count)
  const [countMode, setCountMode] = useState<"PRESET" | "CUSTOM">("PRESET");
  const [presetCount, setPresetCount] = useState<number>(5);
  const [customCount, setCustomCount] = useState<number>(5);

  // 6. Exam Duration (Minutes: 10, 20, 30, 40, 50, 60 up to 480 mins / 8 hours)
  const [durationMode, setDurationMode] = useState<"PRESET" | "CUSTOM">("PRESET");
  const [presetDuration, setPresetDuration] = useState<number>(60);
  const [customDuration, setCustomDuration] = useState<number>(60);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statusStep, setStatusStep] = useState<string>("");

  const toggleLanguage = (langId: string) => {
    if (selectedLangs.includes(langId)) {
      if (selectedLangs.length <= 2 && questionType !== "MCQ") return;
      setSelectedLangs(selectedLangs.filter((l) => l !== langId));
    } else {
      setSelectedLangs([...selectedLangs, langId]);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      setErrorMsg("Please enter a topic or description.");
      return;
    }
    if (questionType !== "MCQ" && selectedLangs.length < 2) {
      setErrorMsg("At least 2 programming languages must be selected for coding challenges.");
      return;
    }

    const effectiveCount =
      countMode === "PRESET"
        ? presetCount
        : Math.max(1, Math.min(50, Number(customCount) || 5));

    const effectiveDuration =
      durationMode === "PRESET"
        ? presetDuration
        : Math.max(5, Math.min(480, Number(customDuration) || 60));

    setErrorMsg(null);
    setIsGenerating(true);
    setStatusStep("Connecting to Gemini AI Engine...");

    const mappedMode =
      selectedLangs.length > 1
        ? "SAME_ACROSS_LANGUAGES"
        : "INDIVIDUAL_PER_LANGUAGE";

    const mappedQType =
      questionType === "MCQ"
        ? "STDIN"
        : questionType === "CODING"
        ? "FUNCTION"
        : "MIXED";

    try {
      setStatusStep("Generating question set with Gemini AI...");
      const tokenKey = process.env.NEXT_PUBLIC_TOKEN_KEY || "dq_lms_access_token";
      const token = typeof window !== "undefined"
        ? (sessionStorage.getItem(tokenKey) || localStorage.getItem(tokenKey) || localStorage.getItem("hr_token"))
        : null;

      const res = await fetch("/api/admin/ai/questions/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          topic: topic.trim(),
          languages: selectedLangs.length > 0 ? selectedLangs : ["python", "sql"],
          questionCount: effectiveCount,
          difficulty,
          generationMode: mappedMode,
          questionType: mappedQType,
          testCaseCount: 5,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success || !data.result) {
        throw new Error(data.error || "Failed to generate questions.");
      }

      setStatusStep("Saving question set to Tenant Database...");
      const setId = data.result.questionSetId || 1;

      setStatusStep("Publishing question set & updating exam form...");
      onGenerateSuccess(
        setId,
        data.result.mcqQuestions,
        questionType,
        effectiveDuration,
        data.result.questions
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Generation error occurred.";
      setErrorMsg(msg);
      setIsGenerating(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#64748b",
        backgroundImage: "linear-gradient(to bottom right, #475569, #334155)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "540px",
          backgroundColor: "#ffffff",
          borderRadius: "20px",
          padding: "2rem",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.4)",
          position: "relative",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "1.5rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <h2
              style={{
                fontSize: "1.25rem",
                fontWeight: 800,
                color: "#0f172a",
                margin: 0,
                letterSpacing: "-0.01em",
              }}
            >
              AI Question Generator
            </h2>
          </div>

          <button
            type="button"
            onClick={() => onUseFallbackDemo()}
            disabled={isGenerating}
            style={{
              background: "none",
              border: "none",
              color: "#94a3b8",
              fontSize: "1.2rem",
              fontWeight: 700,
              cursor: "pointer",
              padding: "0.25rem",
              lineHeight: 1,
            }}
            title="Close / Cancel"
          >
            ✕
          </button>
        </div>

        {errorMsg && (
          <div
            style={{
              backgroundColor: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#dc2626",
              padding: "0.75rem 1rem",
              borderRadius: "10px",
              fontSize: "0.85rem",
              marginBottom: "1.25rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>{errorMsg}</span>
            <button
              onClick={() => setErrorMsg(null)}
              style={{
                background: "none",
                border: "none",
                color: "#dc2626",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              ✕
            </button>
          </div>
        )}

        <form onSubmit={handleGenerate}>
          {/* 1. QUESTION TYPE */}
          <div style={{ marginBottom: "1.25rem" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.85rem",
                fontWeight: 700,
                color: "#334155",
                marginBottom: "0.5rem",
              }}
            >
              Question Type
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
              {(allowedExamType === "MCQ" || allowedExamType === "MIXED") && (
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    fontSize: "0.9rem",
                    fontWeight: questionType === "MCQ" ? 700 : 500,
                    color: questionType === "MCQ" ? "#4f46e5" : "#475569",
                    cursor: isGenerating ? "not-allowed" : "pointer",
                  }}
                >
                  <input
                    type="radio"
                    name="questionType"
                    value="MCQ"
                    checked={questionType === "MCQ"}
                    onChange={() => setQuestionType("MCQ")}
                    disabled={isGenerating}
                    style={{ accentColor: "#4f46e5" }}
                  />
                  MCQ Question
                </label>
              )}

              {(allowedExamType === "CODING" || allowedExamType === "MIXED") && (
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    fontSize: "0.9rem",
                    fontWeight: questionType === "CODING" ? 700 : 500,
                    color: questionType === "CODING" ? "#4f46e5" : "#475569",
                    cursor: isGenerating ? "not-allowed" : "pointer",
                  }}
                >
                  <input
                    type="radio"
                    name="questionType"
                    value="CODING"
                    checked={questionType === "CODING"}
                    onChange={() => setQuestionType("CODING")}
                    disabled={isGenerating}
                    style={{ accentColor: "#4f46e5" }}
                  />
                  Coding Challenge
                </label>
              )}

              {allowedExamType === "MIXED" && (
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    fontSize: "0.9rem",
                    fontWeight: questionType === "MIXED" ? 700 : 500,
                    color: questionType === "MIXED" ? "#4f46e5" : "#475569",
                    cursor: isGenerating ? "not-allowed" : "pointer",
                  }}
                >
                  <input
                    type="radio"
                    name="questionType"
                    value="MIXED"
                    checked={questionType === "MIXED"}
                    onChange={() => setQuestionType("MIXED")}
                    disabled={isGenerating}
                    style={{ accentColor: "#4f46e5" }}
                  />
                  Mixed Questions
                </label>
              )}
            </div>
          </div>

          {/* 2. TOPIC / DESCRIPTION */}
          <div style={{ marginBottom: "1.25rem" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.85rem",
                fontWeight: 700,
                color: "#334155",
                marginBottom: "0.4rem",
              }}
            >
              Topic / Description <span style={{ color: "#f43f5e" }}>*</span>
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Binary Search Tree, Quick Sort, Closures..."
              disabled={isGenerating}
              style={{
                width: "100%",
                backgroundColor: "#ffffff",
                border: "1px solid #cbd5e1",
                borderRadius: "10px",
                color: "#0f172a",
                padding: "0.7rem 0.9rem",
                fontSize: "0.9rem",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* 3. PREFERRED LANGUAGES (FOR CODING & MIXED) */}
          {questionType !== "MCQ" && (
            <div style={{ marginBottom: "1.25rem" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  color: "#334155",
                  marginBottom: "0.4rem",
                }}
              >
                Select Preferred Languages for Coding Challenges <span style={{ color: "#f43f5e" }}>*</span>
              </label>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))",
                  gap: "0.5rem",
                }}
              >
                {SUPPORTED_LANGUAGES.map((lang) => {
                  const isSelected = selectedLangs.includes(lang.id);
                  return (
                    <button
                      key={lang.id}
                      type="button"
                      disabled={isGenerating}
                      onClick={() => toggleLanguage(lang.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.4rem",
                        padding: "0.45rem 0.65rem",
                        borderRadius: "8px",
                        border: `1.5px solid ${isSelected ? "#4f46e5" : "#e2e8f0"}`,
                        backgroundColor: isSelected ? "#eef2ff" : "#ffffff",
                        color: isSelected ? "#4338ca" : "#475569",
                        fontSize: "0.85rem",
                        fontWeight: isSelected ? 700 : 500,
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <span>{lang.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4. DIFFICULTY */}
          <div style={{ marginBottom: "1.25rem" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.85rem",
                fontWeight: 700,
                color: "#334155",
                marginBottom: "0.4rem",
              }}
            >
              Difficulty
            </label>
            <select
              value={difficulty}
              onChange={(e) =>
                setDifficulty(e.target.value as "EASY" | "MEDIUM" | "HARD")
              }
              disabled={isGenerating}
              style={{
                width: "100%",
                backgroundColor: "#ffffff",
                border: "1px solid #cbd5e1",
                borderRadius: "10px",
                color: "#0f172a",
                padding: "0.7rem 0.9rem",
                fontSize: "0.9rem",
                outline: "none",
                boxSizing: "border-box",
              }}
            >
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </div>

          {/* 5. NUMBER OF QUESTIONS TO GENERATE (PRESET VS CUSTOM COUNT) */}
          <div style={{ marginBottom: "1.75rem" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "0.4rem",
              }}
            >
              <label
                style={{
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  color: "#334155",
                }}
              >
                Number of Questions to Generate
              </label>

              <div
                style={{
                  display: "flex",
                  backgroundColor: "#f1f5f9",
                  borderRadius: "6px",
                  padding: "2px",
                }}
              >
                <button
                  type="button"
                  onClick={() => setCountMode("PRESET")}
                  disabled={isGenerating}
                  style={{
                    border: "none",
                    borderRadius: "5px",
                    padding: "0.2rem 0.6rem",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    backgroundColor: countMode === "PRESET" ? "#ffffff" : "transparent",
                    color: countMode === "PRESET" ? "#0f172a" : "#64748b",
                    boxShadow: countMode === "PRESET" ? "0 1px 2px rgba(0,0,0,0.05)" : "none",
                    cursor: "pointer",
                  }}
                >
                  Preset
                </button>
                <button
                  type="button"
                  onClick={() => setCountMode("CUSTOM")}
                  disabled={isGenerating}
                  style={{
                    border: "none",
                    borderRadius: "5px",
                    padding: "0.2rem 0.6rem",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    backgroundColor: countMode === "CUSTOM" ? "#ffffff" : "transparent",
                    color: countMode === "CUSTOM" ? "#0f172a" : "#64748b",
                    boxShadow: countMode === "CUSTOM" ? "0 1px 2px rgba(0,0,0,0.05)" : "none",
                    cursor: "pointer",
                  }}
                >
                  Custom Count
                </button>
              </div>
            </div>

            {countMode === "PRESET" ? (
              <select
                value={presetCount}
                onChange={(e) => setPresetCount(Number(e.target.value))}
                disabled={isGenerating}
                style={{
                  width: "100%",
                  backgroundColor: "#ffffff",
                  border: "1px solid #cbd5e1",
                  borderRadius: "10px",
                  color: "#0f172a",
                  padding: "0.7rem 0.9rem",
                  fontSize: "0.9rem",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              >
                <option value={5}>5 Questions</option>
                <option value={10}>10 Questions</option>
                <option value={15}>15 Questions</option>
                <option value={20}>20 Questions</option>
              </select>
            ) : (
              <input
                type="number"
                min={1}
                max={50}
                value={customCount}
                onChange={(e) => setCustomCount(Number(e.target.value))}
                placeholder="Enter custom question count (1 - 50)"
                disabled={isGenerating}
                style={{
                  width: "100%",
                  backgroundColor: "#ffffff",
                  border: "1px solid #cbd5e1",
                  borderRadius: "10px",
                  color: "#0f172a",
                  padding: "0.7rem 0.9rem",
                  fontSize: "0.9rem",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            )}
          </div>

          {/* 6. EXAM TIME / DURATION */}
          <div style={{ marginBottom: "1.25rem" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "0.4rem",
              }}
            >
              <label
                style={{
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  color: "#334155",
                }}
              >
                Exam Duration
              </label>

              <div
                style={{
                  display: "flex",
                  backgroundColor: "#f1f5f9",
                  borderRadius: "6px",
                  padding: "2px",
                }}
              >
                <button
                  type="button"
                  onClick={() => setDurationMode("PRESET")}
                  disabled={isGenerating}
                  style={{
                    border: "none",
                    borderRadius: "5px",
                    padding: "0.2rem 0.6rem",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    backgroundColor: durationMode === "PRESET" ? "#ffffff" : "transparent",
                    color: durationMode === "PRESET" ? "#0f172a" : "#64748b",
                    boxShadow: durationMode === "PRESET" ? "0 1px 2px rgba(0,0,0,0.05)" : "none",
                    cursor: "pointer",
                  }}
                >
                  Preset
                </button>
                <button
                  type="button"
                  onClick={() => setDurationMode("CUSTOM")}
                  disabled={isGenerating}
                  style={{
                    border: "none",
                    borderRadius: "5px",
                    padding: "0.2rem 0.6rem",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    backgroundColor: durationMode === "CUSTOM" ? "#ffffff" : "transparent",
                    color: durationMode === "CUSTOM" ? "#0f172a" : "#64748b",
                    boxShadow: durationMode === "CUSTOM" ? "0 1px 2px rgba(0,0,0,0.05)" : "none",
                    cursor: "pointer",
                  }}
                >
                  Custom Mins
                </button>
              </div>
            </div>

            {durationMode === "PRESET" ? (
              <select
                value={presetDuration}
                onChange={(e) => setPresetDuration(Number(e.target.value))}
                disabled={isGenerating}
                style={{
                  width: "100%",
                  backgroundColor: "#ffffff",
                  border: "1px solid #cbd5e1",
                  borderRadius: "10px",
                  color: "#0f172a",
                  padding: "0.7rem 0.9rem",
                  fontSize: "0.9rem",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              >
                <option value={10}>10 Minutes</option>
                <option value={20}>20 Minutes</option>
                <option value={30}>30 Minutes</option>
                <option value={40}>40 Minutes</option>
                <option value={50}>50 Minutes</option>
                <option value={60}>60 Minutes (1 Hour)</option>
                <option value={90}>90 Minutes (1.5 Hours)</option>
                <option value={120}>120 Minutes (2 Hours)</option>
                <option value={180}>180 Minutes (3 Hours)</option>
                <option value={240}>240 Minutes (4 Hours)</option>
                <option value={300}>300 Minutes (5 Hours)</option>
                <option value={360}>360 Minutes (6 Hours)</option>
                <option value={420}>420 Minutes (7 Hours)</option>
                <option value={480}>480 Minutes (8 Hours)</option>
              </select>
            ) : (
              <input
                type="number"
                min={5}
                max={480}
                value={customDuration}
                onChange={(e) => setCustomDuration(Number(e.target.value))}
                placeholder="Enter custom duration in minutes (5 - 480)"
                disabled={isGenerating}
                style={{
                  width: "100%",
                  backgroundColor: "#ffffff",
                  border: "1px solid #cbd5e1",
                  borderRadius: "10px",
                  color: "#0f172a",
                  padding: "0.7rem 0.9rem",
                  fontSize: "0.9rem",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            )}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: "0.75rem",
              paddingTop: "1rem",
              borderTop: "1px solid #f1f5f9",
            }}
          >
            <button
              type="button"
              onClick={() => {
                const effectiveDuration =
                  durationMode === "PRESET"
                    ? presetDuration
                    : Math.max(5, Math.min(480, Number(customDuration) || 60));
                onUseFallbackDemo(effectiveDuration);
              }}
              disabled={isGenerating}
              style={{
                backgroundColor: "#f1f5f9",
                color: "#475569",
                border: "none",
                borderRadius: "10px",
                padding: "0.65rem 1.25rem",
                fontSize: "0.9rem",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isGenerating}
              style={{
                backgroundColor: isGenerating ? "#818cf8" : "#4f46e5",
                color: "#ffffff",
                border: "none",
                borderRadius: "10px",
                padding: "0.65rem 1.4rem",
                fontSize: "0.9rem",
                fontWeight: 700,
                cursor: isGenerating ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                boxShadow: isGenerating ? "none" : "0 4px 14px rgba(79, 70, 229, 0.35)",
              }}
            >
              {isGenerating ? (
                <span>{statusStep || "Generating..."}</span>
              ) : (
                <span>Generate</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
