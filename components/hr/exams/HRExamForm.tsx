"use client";

import { useEffect, useState, useMemo } from "react";
import DOMPurify from "dompurify";
import { ArrowLeft, Plus, Trash2, Save, Search, Sparkles, Loader2, Users, UserCheck, Code, HelpCircle } from "lucide-react";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import MonacoCodeEditor from "@/components/hod/exams/components/MonacoCodeEditor";
import { toast } from "sonner";
import QuestionGeneratorLanding from "@/components/QuestionGeneratorLanding";
import JobsService from "@/services/jobs.service";

interface Job {
    id: number;
    role: string;
    company?: string;
}

interface Props {
    jobs: Job[];
    onSave: (data: any) => void;
    onCancel: () => void;
}

interface MCQ {
    id?: string;
    question: string;
    options: string[];
    correct_index: number;
    marks: number;
    negative_marks: number;
    difficulty: string;
    topic: string;
    explanation: string;
    sort_order: number;
}

interface TC {
    id?: string;
    input: string;
    expected_output: string;
    weight: number;
    is_hidden: boolean;
    sort_order: number;
}

interface Coding {
    id?: string;
    title: string;
    statement: string;
    constraints: string;
    input_format: string;
    output_format: string;
    sample_input: string;
    sample_output: string;
    marks: number;
    time_limit_ms: number;
    memory_limit_kb: number;
    languages: string[];
    starter_code?: string;
    sort_order: number;
    test_cases: TC[];
}

const blankMCQ: MCQ = {
    question: "",
    options: ["", "", "", ""],
    correct_index: 0,
    marks: 1,
    negative_marks: 0,
    difficulty: "medium",
    topic: "",
    explanation: "",
    sort_order: 0,
};

const blankCoding: Coding = {
    title: "",
    statement: "",
    constraints: "",
    input_format: "",
    output_format: "",
    sample_input: "",
    sample_output: "",
    marks: 10,
    time_limit_ms: 2000,
    memory_limit_kb: 128000,
    languages: ["python", "javascript", "cpp", "java", "c"],
    starter_code: "function solution(input) {\n  // Write solution here\n}",
    sort_order: 0,
    test_cases: [],
};

const getCurrentDateTimeLocal = () => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const hh = String(now.getHours()).padStart(2, "0");
    const min = String(now.getMinutes()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
};

const addMinutesToDateTimeLocal = (dateTimeStr: string, minutes: number) => {
    if (!dateTimeStr) return "";
    const cleanStr = dateTimeStr.replace(" ", "T");
    const parts = cleanStr.split(/[-T:]/);
    if (parts.length >= 5) {
        const [y, m, d, h, mi] = parts.map(Number);
        const dateObj = new Date(y, m - 1, d, h, mi + (minutes && minutes >= 60 ? minutes : 60));
        const yyyy = dateObj.getFullYear();
        const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
        const dd = String(dateObj.getDate()).padStart(2, "0");
        const hh = String(dateObj.getHours()).padStart(2, "0");
        const min = String(dateObj.getMinutes()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
    }
    const d = new Date(dateTimeStr);
    if (isNaN(d.getTime())) return "";
    d.setMinutes(d.getMinutes() + (minutes && minutes >= 60 ? minutes : 60));
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
};

export default function HRExamForm({ jobs, onSave, onCancel }: Props) {
    const [activeTab, setActiveTab] = useState("details");
    const [showAIModal, setShowAIModal] = useState(false);
    const [generatingAI, setGeneratingAI] = useState(false);

    // Core Exam Form State
    const [form, setForm] = useState({
        exam_type_id: 3, // Default to Mixed Evaluation
        exam_setting_id: 1,
        job_id: "",
        title: "",
        description: "",
        instructions: "Strict proctoring enabled. Do not switch tabs or open external windows.",
        duration: 60,
        pass_percentage: 40,
        start_date: "",
        end_date: "",
        status: "Published",
        negative_marking: false,
        shuffle: false,
        fullscreen_required: true,
        disable_copy_paste: true,
        tab_switch_limit: 3,
    });

    const [examTypes] = useState([
        { id: 1, name: "MCQ Assessment" },
        { id: 2, name: "Coding Challenge" },
        { id: 3, name: "Mixed Evaluation" }
    ]);

    const [examSettings] = useState([
        {
            id: 1,
            name: "Standard Proctored (Fullscreen, Anti-Cheat, No Neg. Marks, Tab Limit: 3)",
            negative_marks: 0,
            shuffle_questions: 1,
            fullscreen_required: 1,
            disable_copy_paste: 1,
            tab_switch_limit: 3
        },
        {
            id: 2,
            name: "Strict Proctored (Negative Marking, Fullscreen, Anti-Cheat, Tab Limit: 2)",
            negative_marks: 1,
            shuffle_questions: 0,
            fullscreen_required: 1,
            disable_copy_paste: 1,
            tab_switch_limit: 2
        }
    ]);

    const [selectedSetting, setSelectedSetting] = useState<any>(examSettings[0]);

    useEffect(() => {
        if (!form.start_date) {
            const nowStr = getCurrentDateTimeLocal();
            const endStr = addMinutesToDateTimeLocal(nowStr, 60);
            setForm(prev => ({
                ...prev,
                duration: 60,
                start_date: nowStr,
                end_date: endStr
            }));
        }
    }, []);

    useEffect(() => {
        if (!form.exam_setting_id) {
            setSelectedSetting(null);
            return;
        }
        const setting = examSettings.find(
            (item: any) => Number(item.id) === Number(form.exam_setting_id)
        );
        if (setting) {
            setSelectedSetting(setting);
            setForm(prev => ({
                ...prev,
                negative_marking: Boolean(setting.negative_marks),
                shuffle: Boolean(setting.shuffle_questions),
                fullscreen_required: Boolean(setting.fullscreen_required),
                disable_copy_paste: Boolean(setting.disable_copy_paste),
                tab_switch_limit: Number(setting.tab_switch_limit || 0),
            }));
        }
    }, [form.exam_setting_id, examSettings]);

    // Questions State
    const [mcqs, setMcqs] = useState<MCQ[]>([
        {
            question: "What is the time complexity of searching an element in a balanced Binary Search Tree?",
            options: ["O(1)", "O(log N)", "O(N)", "O(N log N)"],
            correct_index: 1,
            marks: 2,
            negative_marks: 0,
            difficulty: "medium",
            topic: "Data Structures",
            explanation: "Balanced BST halves the search space at each level, resulting in O(log N).",
            sort_order: 0,
        }
    ]);

    const [codings, setCodings] = useState<Coding[]>([]);

    // Student Assignment State
    const [targetMode, setTargetMode] = useState<"ALL" | "SPECIFIC">("ALL");
    const [candidates, setCandidates] = useState<any[]>([]);
    const [loadingCandidates, setLoadingCandidates] = useState(false);
    const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);
    const [studentSearch, setStudentSearch] = useState("");

    // Load Job Candidates when job selection changes
    useEffect(() => {
        if (form.job_id) {
            loadCandidates(Number(form.job_id));
        } else {
            setCandidates([]);
            setSelectedStudentIds([]);
        }
    }, [form.job_id]);

    const loadCandidates = async (jobId: number) => {
        try {
            setLoadingCandidates(true);
            const res = await JobsService.getHRCandidates(jobId);
            setCandidates(res.data.data || []);
        } catch {
            setCandidates([]);
        } finally {
            setLoadingCandidates(false);
        }
    };

    // Auto calculate duration based on coding questions count
    useEffect(() => {
        const baseDuration = 60;
        const codingDuration = codings.length * 20;
        const calculatedTotalDuration = baseDuration + codingDuration;

        setForm((prev) => {
            if (prev.duration !== calculatedTotalDuration) {
                const updatedEndDate = prev.start_date
                    ? addMinutesToDateTimeLocal(prev.start_date, calculatedTotalDuration)
                    : prev.end_date;
                return {
                    ...prev,
                    duration: calculatedTotalDuration,
                    end_date: updatedEndDate,
                };
            }
            return prev;
        });
    }, [codings.length]);

    const updateField = (field: string, value: any) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleExamTypeChange = (typeId: number) => {
        updateField("exam_type_id", typeId);
        if (typeId === 1 && activeTab === "coding") {
            setActiveTab("mcq");
        } else if (typeId === 2 && activeTab === "mcq") {
            setActiveTab("coding");
        }
    };

    const handleStartDateChange = (val: string) => {
        const minStart = getCurrentDateTimeLocal();
        let selectedStart = val;
        if (selectedStart < minStart) {
            selectedStart = minStart;
            toast.warning("Start Date cannot be in the past. Set to current time.");
        }
        const currentDuration = form.duration && form.duration >= 60 ? form.duration : 60;
        const calcEndDate = addMinutesToDateTimeLocal(selectedStart, currentDuration);
        setForm(prev => ({
            ...prev,
            start_date: selectedStart,
            duration: currentDuration,
            end_date: calcEndDate
        }));
    };

    const handleDurationChange = (val: number) => {
        const newDuration = val >= 60 ? val : 60;
        setForm(prev => {
            const updatedEndDate = prev.start_date ? addMinutesToDateTimeLocal(prev.start_date, newDuration) : prev.end_date;
            return {
                ...prev,
                duration: newDuration,
                end_date: updatedEndDate
            };
        });
    };

    const handleEndDateChange = (val: string) => {
        const minEnd = form.start_date || getCurrentDateTimeLocal();
        let selectedEnd = val;
        if (selectedEnd < minEnd) {
            selectedEnd = minEnd;
            toast.warning("End Date cannot be before Start Date.");
        }
        setForm(prev => ({
            ...prev,
            end_date: selectedEnd
        }));
    };

    const handleAiGenerateSuccess = (
        setId: number,
        generatedMcqs?: any[],
        targetType?: string,
        examTimeMinutes?: number,
        generatedCodings?: any[]
    ) => {
        let mcqAddedCount = 0;
        let codingAddedCount = 0;
        let hasNewMcqs = false;
        let hasNewCodings = false;

        if (generatedMcqs && generatedMcqs.length > 0) {
            hasNewMcqs = true;
            const newMcqs: MCQ[] = generatedMcqs.map((m: any) => ({
                question: m.questionText || m.question || m.title || "MCQ Question",
                options: m.options ? m.options.map((o: any) => typeof o === "string" ? o : (o.text || String(o))) : ["Option A", "Option B", "Option C", "Option D"],
                correct_index: typeof m.correct_index === "number" ? m.correct_index : (m.correctOption === "B" ? 1 : m.correctOption === "C" ? 2 : m.correctOption === "D" ? 3 : 0),
                marks: m.marks || 1,
                negative_marks: m.negative_marks || 0,
                difficulty: (m.difficulty || "medium").toLowerCase(),
                topic: m.topic || "",
                explanation: m.explanation || "",
                sort_order: mcqs.length + mcqAddedCount++,
            }));
            setMcqs(prev => [...prev, ...newMcqs]);
        }

        if (generatedCodings && generatedCodings.length > 0) {
            hasNewCodings = true;
            const newCodings: Coding[] = generatedCodings.map((rawItem: any) => {
                const q = rawItem.question || rawItem;
                const tcList = rawItem.testCases || rawItem.test_cases || q.testCases || [];
                const langVal = q.language ? q.language.toLowerCase() : "python";
                const langArr = Array.isArray(q.languages) ? q.languages.map((l: string) => l.toLowerCase()) : [langVal];

                return {
                    title: q.title || "Coding Challenge",
                    statement: q.problemStatement || q.description || q.statement || q.title || "",
                    constraints: q.constraints || "",
                    input_format: q.inputFormat || q.input_format || "",
                    output_format: q.outputFormat || q.output_format || "",
                    sample_input: q.exampleInput || q.sample_input || "",
                    sample_output: q.exampleOutput || q.sample_output || "",
                    marks: q.marks || 10,
                    time_limit_ms: q.timeLimitMs || q.time_limit_ms || 2000,
                    memory_limit_kb: q.memoryLimitKb || q.memory_limit_kb || 128000,
                    languages: langArr.length > 0 ? langArr : ["python", "javascript", "cpp", "java", "c"],
                    starter_code: q.starterCode || q.starter_code || "function solution(input) {\n  // Write solution here\n}",
                    sort_order: codings.length + codingAddedCount++,
                    test_cases: tcList.map((tc: any, tIdx: number) => ({
                        input: tc.inputData || tc.input || "",
                        expected_output: tc.expectedOutput || tc.expected_output || "",
                        weight: tc.weight || 1,
                        is_hidden: Boolean(tc.isHidden ?? tc.is_hidden ?? (tIdx > 0)),
                        sort_order: tIdx,
                    })),
                };
            });
            setCodings(prev => [...prev, ...newCodings]);
        }

        const totalCodingCount = codings.length + codingAddedCount;
        const calculatedDuration = 60 + (totalCodingCount * 20);
        handleDurationChange(calculatedDuration);

        if (hasNewMcqs) {
            setActiveTab("mcq");
        } else if (hasNewCodings) {
            setActiveTab("coding");
        }

        setShowAIModal(false);
        setGeneratingAI(false);
        toast.success(`Generated questions via Gemini AI! Added to assessment.`);
    };

    const totalMarks =
        mcqs.reduce((sum, item) => sum + Number(item.marks || 0), 0) +
        codings.reduce((sum, item) => sum + Number(item.marks || 0), 0);

    const filteredCandidates = candidates.filter((c) => {
        if (!studentSearch.trim()) return true;
        const q = studentSearch.toLowerCase();
        const name = (c.student?.full_name || "").toLowerCase();
        const roll = (c.student?.roll_number || "").toLowerCase();
        const dept = (c.student?.department || "").toLowerCase();
        const status = (c.application_status || "").toLowerCase();
        return name.includes(q) || roll.includes(q) || dept.includes(q) || status.includes(q);
    });

    const handleSubmit = () => {
        if (!form.title.trim()) {
            toast.error("Assessment Title is required.");
            return;
        }

        if (mcqs.length === 0 && codings.length === 0) {
            toast.error("Please add at least one question (MCQ or Coding Challenge).");
            return;
        }

        if (targetMode === "SPECIFIC" && selectedStudentIds.length === 0) {
            toast.error("Please select at least one student to assign the assessment to.");
            return;
        }

        // Build combined questions array for backend compatibility
        const questionsList: any[] = [];

        mcqs.forEach(m => {
            questionsList.push({
                question_type: "mcq",
                question: m.question,
                options: m.options,
                correct_index: m.correct_index,
                marks: m.marks || 1,
                explanation: m.explanation || null
            });
        });

        codings.forEach(c => {
            questionsList.push({
                question_type: "coding",
                question: c.statement || c.title,
                title: c.title,
                starter_code: c.starter_code || "",
                languages: c.languages,
                marks: c.marks || 10,
                explanation: c.constraints || null,
                test_cases: c.test_cases
            });
        });

        const payload = {
            title: form.title,
            description: DOMPurify.sanitize(form.description || ""),
            instructions: DOMPurify.sanitize(form.instructions || ""),
            duration: form.duration,
            pass_percentage: form.pass_percentage,
            job_id: form.job_id ? Number(form.job_id) : null,
            assigned_student_ids: targetMode === "SPECIFIC" ? selectedStudentIds : null,
            questions: questionsList
        };

        onSave(payload);
    };

    return (
        <div className="space-y-6">
            {/* Header bar */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" onClick={onCancel} className="h-9 w-9 p-0 rounded-full border border-border">
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Create HR Assessment</h1>
                        <p className="text-sm text-muted-foreground">
                            Total marks: {totalMarks} · Questions: {mcqs.length + codings.length}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        type="button"
                        onClick={() => setShowAIModal(true)}
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm h-10 text-xs"
                    >
                        <Sparkles className="w-4 h-4 text-purple-200" />
                        AI Generator
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSubmit}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-4 py-2 rounded-xl flex items-center gap-2 h-10 text-xs shadow-sm"
                    >
                        <Save className="w-4 h-4" />
                        Publish Assessment
                    </Button>
                </div>
            </div>

            {/* Tabs content */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="bg-muted p-1 rounded-xl">
                    <TabsTrigger value="details" className="rounded-lg">Basic Details</TabsTrigger>
                    <TabsTrigger value="mcq" className="rounded-lg">MCQ Questions ({mcqs.length})</TabsTrigger>
                    <TabsTrigger value="coding" className="rounded-lg">Coding Challenges ({codings.length})</TabsTrigger>
                    <TabsTrigger value="assign" className="rounded-lg">
                        Assign Candidates ({targetMode === "ALL" ? "All Applicants" : `${selectedStudentIds.length} Selected`})
                    </TabsTrigger>
                </TabsList>

                {/* Details Tab */}
                <TabsContent value="details" className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-sm">
                    <div>
                        <Label className="text-sm font-semibold">Assessment Title *</Label>
                        <Input
                            value={form.title}
                            onChange={(e) => updateField("title", e.target.value)}
                            placeholder="e.g. Technical Round 1 - Fullstack & DSA Test"
                            className="mt-1"
                        />
                    </div>

                    <div>
                        <Label className="text-sm font-semibold">Associated Job Posting</Label>
                        <select
                            value={form.job_id}
                            onChange={(e) => updateField("job_id", e.target.value)}
                            className="w-full mt-1.5 h-10 px-3 rounded-lg border border-input bg-background text-sm cursor-pointer"
                        >
                            <option value="">All Company Applicants (General Assessment)</option>
                            {jobs.map((j) => (
                                <option key={j.id} value={j.id}>{j.role}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <Label className="text-sm font-semibold">Description</Label>
                        <div className="mt-1.5 rounded-lg overflow-hidden border border-input bg-background shadow-sm">
                            <Textarea
                                value={form.description}
                                onChange={(e) => updateField("description", e.target.value)}
                                placeholder="Write assessment description..."
                                className="border-none focus-visible:ring-0 min-h-[100px] text-xs resize-none"
                            />
                        </div>
                    </div>

                    <div>
                        <Label className="text-sm font-semibold">Instructions (shown before candidate starts)</Label>
                        <div className="mt-1.5 rounded-lg overflow-hidden border border-input bg-background shadow-sm">
                            <Textarea
                                value={form.instructions}
                                onChange={(e) => updateField("instructions", e.target.value)}
                                placeholder="Write instructions for candidate..."
                                className="border-none focus-visible:ring-0 min-h-[120px] text-xs resize-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label className="text-sm font-semibold">Assessment Type</Label>
                            <select
                                value={form.exam_type_id}
                                onChange={(e) => handleExamTypeChange(Number(e.target.value))}
                                className="w-full mt-1.5 h-10 px-3 rounded-lg border border-input bg-background text-sm cursor-pointer"
                            >
                                {examTypes.map((type: any) => (
                                    <option key={type.id} value={type.id}>
                                        {type.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <Label className="text-sm font-semibold">Proctoring Preset</Label>
                            <select
                                value={form.exam_setting_id}
                                onChange={(e) => updateField("exam_setting_id", Number(e.target.value))}
                                className="w-full mt-1.5 h-10 px-3 rounded-lg border border-input bg-background text-sm cursor-pointer"
                            >
                                {examSettings.map((setting: any) => (
                                    <option key={setting.id} value={setting.id}>
                                        {setting.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <Label className="text-sm font-semibold">Duration (Minutes)</Label>
                            <Input
                                type="number"
                                min={10}
                                value={form.duration}
                                onChange={(e) => handleDurationChange(+e.target.value)}
                                className="mt-1.5"
                            />
                        </div>

                        <div>
                            <Label className="text-sm font-semibold">Start Date & Time</Label>
                            <Input
                                type="datetime-local"
                                min={getCurrentDateTimeLocal()}
                                value={form.start_date}
                                onChange={(e) => handleStartDateChange(e.target.value)}
                                className="mt-1.5"
                            />
                        </div>

                        <div>
                            <Label className="text-sm font-semibold">End Date & Time</Label>
                            <Input
                                type="datetime-local"
                                min={form.start_date || getCurrentDateTimeLocal()}
                                value={form.end_date}
                                onChange={(e) => handleEndDateChange(e.target.value)}
                                className="mt-1.5"
                            />
                        </div>

                        <div>
                            <Label className="text-sm font-semibold">Passing Percentage (%)</Label>
                            <Input
                                type="number"
                                min={1}
                                max={100}
                                value={form.pass_percentage}
                                onChange={(e) => updateField("pass_percentage", +e.target.value)}
                                className="mt-1.5"
                            />
                        </div>
                    </div>

                    {/* Applied Settings Summary Display */}
                    {selectedSetting && (
                        <div className="p-4 bg-muted/30 border border-border rounded-xl space-y-2 text-xs mt-2">
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-foreground flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                    Applied Proctoring & Security Rules
                                </span>
                                <span className="text-[11px] text-muted-foreground font-medium">Setting #{selectedSetting.id}</span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 pt-1 text-xs">
                                <div className="flex items-center gap-2 p-2 rounded-lg bg-background border border-border/60">
                                    <span className={`w-2 h-2 rounded-full ${form.negative_marking ? "bg-amber-500" : "bg-slate-300"}`} />
                                    <div>
                                        <div className="text-[10px] text-muted-foreground font-medium">Negative Marking</div>
                                        <div className="font-semibold text-foreground">{form.negative_marking ? "Enabled" : "Disabled"}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 p-2 rounded-lg bg-background border border-border/60">
                                    <span className={`w-2 h-2 rounded-full ${form.shuffle ? "bg-blue-500" : "bg-slate-300"}`} />
                                    <div>
                                        <div className="text-[10px] text-muted-foreground font-medium">Shuffle Questions</div>
                                        <div className="font-semibold text-foreground">{form.shuffle ? "Enabled" : "Fixed Order"}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 p-2 rounded-lg bg-background border border-border/60">
                                    <span className={`w-2 h-2 rounded-full ${form.fullscreen_required ? "bg-emerald-500" : "bg-slate-300"}`} />
                                    <div>
                                        <div className="text-[10px] text-muted-foreground font-medium">Fullscreen Mode</div>
                                        <div className="font-semibold text-foreground">{form.fullscreen_required ? "Mandatory" : "Optional"}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 p-2 rounded-lg bg-background border border-border/60">
                                    <span className={`w-2 h-2 rounded-full ${form.disable_copy_paste ? "bg-purple-500" : "bg-slate-300"}`} />
                                    <div>
                                        <div className="text-[10px] text-muted-foreground font-medium">Copy / Paste</div>
                                        <div className="font-semibold text-foreground">{form.disable_copy_paste ? "Disabled" : "Allowed"}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 p-2 rounded-lg bg-background border border-border/60">
                                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                                    <div>
                                        <div className="text-[10px] text-muted-foreground font-medium">Tab Switch Limit</div>
                                        <div className="font-semibold text-foreground">{form.tab_switch_limit} Allowed</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </TabsContent>

                {/* MCQ Tab */}
                <TabsContent value="mcq" className="space-y-4">
                    <div className="flex items-center justify-between bg-card p-4 rounded-xl border border-border">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold">Multiple Choice Questions ({mcqs.length})</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {(mcqs.length > 0 || codings.length > 0) && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                        if (confirm(`Are you sure you want to delete all ${mcqs.length} MCQ questions?`)) {
                                            setMcqs([]);
                                            toast.success("All MCQ questions removed.");
                                        }
                                    }}
                                    className="h-8 rounded-lg text-xs font-semibold text-destructive border-destructive/30 hover:bg-destructive/10 flex items-center gap-1"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    Delete All MCQs
                                </Button>
                            )}
                            <Button
                                size="sm"
                                onClick={() => setMcqs([...mcqs, { ...blankMCQ, sort_order: mcqs.length }])}
                                className="h-8 rounded-lg text-xs font-semibold flex items-center gap-1"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                Add MCQ
                            </Button>
                        </div>
                    </div>

                    {mcqs.map((m, idx) => (
                        <div key={idx} className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-sm">
                            <div className="flex items-center justify-between border-b border-border pb-2">
                                <span className="text-sm font-bold text-foreground">Q{idx + 1} (MCQ)</span>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setMcqs(mcqs.filter((_, i) => i !== idx))}
                                    className="h-8 w-8 p-0 rounded-full hover:bg-muted text-destructive"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>

                            <Textarea
                                placeholder="Write the question statement here..."
                                rows={3}
                                value={m.question}
                                onChange={(e) => {
                                    const n = [...mcqs];
                                    n[idx].question = e.target.value;
                                    setMcqs(n);
                                }}
                            />

                            <div className="space-y-2">
                                <Label className="text-xs font-semibold">Options (Select Correct Choice)</Label>
                                {m.options.map((optionText, oIdx) => (
                                    <div key={oIdx} className="flex items-center gap-3">
                                        <input
                                            type="radio"
                                            name={`correct-${idx}`}
                                            checked={m.correct_index === oIdx}
                                            onChange={() => {
                                                const n = [...mcqs];
                                                n[idx].correct_index = oIdx;
                                                setMcqs(n);
                                            }}
                                            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 cursor-pointer"
                                        />
                                        <Input
                                            placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                                            value={optionText}
                                            onChange={(e) => {
                                                const n = [...mcqs];
                                                n[idx].options[oIdx] = e.target.value;
                                                setMcqs(n);
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-4 gap-3 pt-2">
                                <div>
                                    <Label className="text-xs font-semibold">Marks</Label>
                                    <Input
                                        type="number"
                                        value={m.marks}
                                        onChange={(e) => {
                                            const n = [...mcqs];
                                            n[idx].marks = +e.target.value;
                                            setMcqs(n);
                                        }}
                                        className="h-9 mt-1"
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs font-semibold">Neg marks</Label>
                                    <Input
                                        type="number"
                                        value={m.negative_marks}
                                        onChange={(e) => {
                                            const n = [...mcqs];
                                            n[idx].negative_marks = +e.target.value;
                                            setMcqs(n);
                                        }}
                                        className="h-9 mt-1"
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs font-semibold">Topic</Label>
                                    <Input
                                        value={m.topic}
                                        onChange={(e) => {
                                            const n = [...mcqs];
                                            n[idx].topic = e.target.value;
                                            setMcqs(n);
                                        }}
                                        className="h-9 mt-1"
                                        placeholder="e.g. Algorithms"
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs font-semibold">Difficulty</Label>
                                    <select
                                        className="w-full mt-1 h-9 px-3 rounded-lg border border-input bg-background text-sm cursor-pointer"
                                        value={m.difficulty}
                                        onChange={(e) => {
                                            const n = [...mcqs];
                                            n[idx].difficulty = e.target.value;
                                            setMcqs(n);
                                        }}
                                    >
                                        <option value="easy">Easy</option>
                                        <option value="medium">Medium</option>
                                        <option value="hard">Hard</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <Label className="text-xs font-semibold">Explanation</Label>
                                <Textarea
                                    placeholder="Write explanation here..."
                                    rows={2}
                                    value={m.explanation}
                                    onChange={(e) => {
                                        const n = [...mcqs];
                                        n[idx].explanation = e.target.value;
                                        setMcqs(n);
                                    }}
                                    className="mt-1"
                                />
                            </div>
                        </div>
                    ))}

                    <Button
                        variant="outline"
                        onClick={() => setMcqs([...mcqs, { ...blankMCQ, options: ["", "", "", ""] }])}
                        className="w-full border-dashed py-6 rounded-xl hover:bg-muted text-muted-foreground flex items-center justify-center gap-2 text-xs font-semibold"
                    >
                        <Plus className="w-4 h-4" /> Add MCQ Question
                    </Button>
                </TabsContent>

                {/* Coding Tab */}
                <TabsContent value="coding" className="space-y-4">
                    <div className="flex items-center justify-between bg-card p-4 rounded-xl border border-border">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold">Coding Challenges ({codings.length})</span>
                        </div>
                        <Button
                            size="sm"
                            onClick={() => setCodings([...codings, { ...blankCoding, sort_order: codings.length }])}
                            className="h-8 rounded-lg text-xs font-semibold flex items-center gap-1"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            Add Coding Challenge
                        </Button>
                    </div>

                    {codings.map((c, idx) => (
                        <div key={idx} className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-sm">
                            <div className="flex items-center justify-between border-b border-border pb-2">
                                <span className="text-sm font-bold text-foreground">Problem {idx + 1} (Coding Challenge)</span>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setCodings(codings.filter((_, i) => i !== idx))}
                                    className="h-8 w-8 p-0 rounded-full hover:bg-muted text-destructive"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>

                            <Input
                                placeholder="Problem Title"
                                value={c.title}
                                onChange={(e) => {
                                    const n = [...codings];
                                    n[idx].title = e.target.value;
                                    setCodings(n);
                                }}
                            />

                            <Textarea
                                placeholder="Problem Statement"
                                rows={4}
                                value={c.statement}
                                onChange={(e) => {
                                    const n = [...codings];
                                    n[idx].statement = e.target.value;
                                    setCodings(n);
                                }}
                            />

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label className="text-xs font-semibold">Input format</Label>
                                    <Textarea
                                        placeholder="Input format details..."
                                        rows={2}
                                        value={c.input_format}
                                        onChange={(e) => {
                                            const n = [...codings];
                                            n[idx].input_format = e.target.value;
                                            setCodings(n);
                                        }}
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs font-semibold">Output format</Label>
                                    <Textarea
                                        placeholder="Output format details..."
                                        rows={2}
                                        value={c.output_format}
                                        onChange={(e) => {
                                            const n = [...codings];
                                            n[idx].output_format = e.target.value;
                                            setCodings(n);
                                        }}
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs font-semibold">Sample input</Label>
                                    <Textarea
                                        placeholder="Sample input..."
                                        rows={2}
                                        value={c.sample_input}
                                        onChange={(e) => {
                                            const n = [...codings];
                                            n[idx].sample_input = e.target.value;
                                            setCodings(n);
                                        }}
                                        className="mt-1 font-mono text-xs"
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs font-semibold">Sample output</Label>
                                    <Textarea
                                        placeholder="Sample output..."
                                        rows={2}
                                        value={c.sample_output}
                                        onChange={(e) => {
                                            const n = [...codings];
                                            n[idx].sample_output = e.target.value;
                                            setCodings(n);
                                        }}
                                        className="mt-1 font-mono text-xs"
                                    />
                                </div>
                            </div>

                            <Textarea
                                placeholder="Constraints (e.g. 1 <= N <= 10^5)"
                                rows={2}
                                value={c.constraints}
                                onChange={(e) => {
                                    const n = [...codings];
                                    n[idx].constraints = e.target.value;
                                    setCodings(n);
                                }}
                            />

                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <Label className="text-xs font-semibold">Marks</Label>
                                    <Input
                                        type="number"
                                        value={c.marks}
                                        onChange={(e) => {
                                            const n = [...codings];
                                            n[idx].marks = +e.target.value;
                                            setCodings(n);
                                        }}
                                        className="h-9 mt-1"
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs font-semibold">Time limit (ms)</Label>
                                    <Input
                                        type="number"
                                        value={c.time_limit_ms}
                                        onChange={(e) => {
                                            const n = [...codings];
                                            n[idx].time_limit_ms = +e.target.value;
                                            setCodings(n);
                                        }}
                                        className="h-9 mt-1"
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs font-semibold">Allowed Languages (comma separated)</Label>
                                    <Input
                                        value={c.languages.join(",")}
                                        onChange={(e) => {
                                            const n = [...codings];
                                            n[idx].languages = e.target.value
                                                .split(",")
                                                .map((s) => s.trim())
                                                .filter(Boolean);
                                            setCodings(n);
                                        }}
                                        className="h-9 mt-1"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">Starter Code (Monaco Editor)</Label>
                                <MonacoCodeEditor
                                    language={c.languages[0] || "javascript"}
                                    value={c.starter_code || ""}
                                    onChange={(code) => {
                                        const n = [...codings];
                                        n[idx].starter_code = code;
                                        setCodings(n);
                                    }}
                                    onLanguageChange={(lang) => {
                                        const n = [...codings];
                                        n[idx].languages = [lang, ...n[idx].languages.filter((l) => l !== lang)];
                                        setCodings(n);
                                    }}
                                    height="280px"
                                />
                            </div>

                            {/* Test cases inside coding question */}
                            <div className="border-t border-border pt-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-foreground">Test Cases</span>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                            const n = [...codings];
                                            n[idx].test_cases.push({
                                                input: "",
                                                expected_output: "",
                                                weight: 1,
                                                is_hidden: false,
                                                sort_order: n[idx].test_cases.length,
                                            });
                                            setCodings(n);
                                        }}
                                        className="h-8 py-0 px-3 flex items-center gap-1 rounded-lg text-xs"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        Add Test Case
                                    </Button>
                                </div>

                                {c.test_cases.map((t, ti) => (
                                    <div key={ti} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_80px_auto] gap-3 items-center bg-muted/40 p-3 rounded-lg border border-border/60">
                                        <Textarea
                                            placeholder="Input Data"
                                            rows={2}
                                            value={t.input}
                                            onChange={(e) => {
                                                const n = [...codings];
                                                n[idx].test_cases[ti].input = e.target.value;
                                                setCodings(n);
                                            }}
                                            className="font-mono text-xs bg-background"
                                        />
                                        <Textarea
                                            placeholder="Expected Output"
                                            rows={2}
                                            value={t.expected_output}
                                            onChange={(e) => {
                                                const n = [...codings];
                                                n[idx].test_cases[ti].expected_output = e.target.value;
                                                setCodings(n);
                                            }}
                                            className="font-mono text-xs bg-background"
                                        />
                                        <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={t.is_hidden}
                                                onChange={(e) => {
                                                    const n = [...codings];
                                                    n[idx].test_cases[ti].is_hidden = e.target.checked;
                                                    setCodings(n);
                                                }}
                                                className="rounded"
                                            />
                                            Hidden
                                        </label>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => {
                                                const n = [...codings];
                                                n[idx].test_cases = n[idx].test_cases.filter((_, i) => i !== ti);
                                                setCodings(n);
                                            }}
                                            className="h-8 w-8 p-0 text-destructive"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    <Button
                        variant="outline"
                        onClick={() => setCodings([...codings, { ...blankCoding, sort_order: codings.length }])}
                        className="w-full border-dashed py-6 rounded-xl hover:bg-muted text-muted-foreground flex items-center justify-center gap-2 text-xs font-semibold"
                    >
                        <Plus className="w-4 h-4" /> Add Coding Challenge
                    </Button>
                </TabsContent>

                {/* Assign Tab */}
                <TabsContent value="assign" className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-sm">
                    <div className="border-b border-border pb-3">
                        <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                            <Users className="w-4 h-4 text-primary" />
                            <span>Target Candidate Assignment</span>
                        </h2>
                        <p className="text-xs text-muted-foreground mt-0.5">Choose whether to publish this assessment to all company job applicants or target specific student(s).</p>
                    </div>

                    <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-foreground">
                            <input
                                type="radio"
                                name="targetMode"
                                checked={targetMode === "ALL"}
                                onChange={() => setTargetMode("ALL")}
                                className="cursor-pointer text-primary focus:ring-primary"
                            />
                            <span>All Applicants / Shortlisted Candidates (Default)</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-foreground">
                            <input
                                type="radio"
                                name="targetMode"
                                checked={targetMode === "SPECIFIC"}
                                onChange={() => setTargetMode("SPECIFIC")}
                                className="cursor-pointer text-primary focus:ring-primary"
                            />
                            <span>Specific Student(s) Only ({selectedStudentIds.length} Selected)</span>
                        </label>
                    </div>

                    {targetMode === "SPECIFIC" && (
                        <div className="space-y-3 pt-2">
                            {!form.job_id ? (
                                <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 rounded-xl text-xs font-medium">
                                    Please select an <strong>Associated Job Posting</strong> under Basic Details to view and assign specific applicants.
                                </div>
                            ) : loadingCandidates ? (
                                <div className="flex items-center gap-2 text-xs text-muted-foreground p-3">
                                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                    <span>Loading applicants list...</span>
                                </div>
                            ) : candidates.length === 0 ? (
                                <div className="p-3 bg-muted/40 rounded-xl text-xs text-muted-foreground">
                                    No applicants found for this job posting yet.
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between gap-2">
                                        <Input
                                            placeholder="Search applicant by name, roll number, or department..."
                                            value={studentSearch}
                                            onChange={(e) => setStudentSearch(e.target.value)}
                                            className="h-8 rounded-xl text-xs max-w-sm"
                                        />
                                        <div className="flex items-center gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    const shortlisted = filteredCandidates.filter(c => c.application_status === 'shortlisted').map(c => c.student_id);
                                                    setSelectedStudentIds(shortlisted.length > 0 ? shortlisted : filteredCandidates.map(c => c.student_id));
                                                }}
                                                className="h-7 text-xs rounded-lg gap-1"
                                            >
                                                <UserCheck className="w-3 h-3 text-emerald-600" />
                                                <span>Select Shortlisted ({filteredCandidates.filter(c => c.application_status === 'shortlisted').length})</span>
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setSelectedStudentIds([])}
                                                className="h-7 text-xs rounded-lg text-muted-foreground"
                                            >
                                                Clear Selection
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="max-h-72 overflow-y-auto border border-border rounded-xl p-2 space-y-1 bg-muted/10">
                                        {filteredCandidates.map((c) => {
                                            const isSelected = selectedStudentIds.includes(c.student_id);
                                            return (
                                                <label
                                                    key={c.student_id}
                                                    className={`flex items-center justify-between p-2.5 rounded-lg border transition-all cursor-pointer ${
                                                        isSelected ? "bg-primary/10 border-primary/30" : "bg-card border-border hover:border-primary/20"
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-2.5">
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    setSelectedStudentIds(prev => [...prev, c.student_id]);
                                                                } else {
                                                                    setSelectedStudentIds(prev => prev.filter(id => id !== c.student_id));
                                                                }
                                                            }}
                                                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                                                        />
                                                        <div>
                                                            <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                                                <span>{c.student?.full_name || "Applicant"}</span>
                                                                <span className="text-[10px] font-mono text-muted-foreground">({c.student?.roll_number})</span>
                                                            </div>
                                                            <div className="text-[11px] text-muted-foreground">
                                                                {c.student?.department || "N/A"} · {c.student?.email}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2 text-[11px]">
                                                        <span className={`px-2 py-0.5 rounded-full font-semibold uppercase text-[10px] ${
                                                            c.application_status === 'shortlisted' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-muted text-muted-foreground'
                                                        }`}>
                                                            {c.application_status}
                                                        </span>
                                                        <span className="font-medium text-foreground bg-primary/10 px-2 py-0.5 rounded-md">
                                                            IEAI: {c.ieai_analytics?.overall_score || 0}%
                                                        </span>
                                                    </div>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* AI Question Generator Modal */}
            {showAIModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-background/80 backdrop-blur-sm">
                    <QuestionGeneratorLanding
                        allowedExamType="MIXED"
                        onGenerateSuccess={handleAiGenerateSuccess}
                        onUseFallbackDemo={() => setShowAIModal(false)}
                        isGenerating={generatingAI}
                        setIsGenerating={setGeneratingAI}
                    />
                </div>
            )}
        </div>
    );
}
