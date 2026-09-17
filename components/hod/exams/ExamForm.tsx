import { useEffect, useState, useMemo } from "react";
import DOMPurify from "dompurify";
import { ArrowLeft, Plus, Trash2, Save, Search, Sparkles, Loader2, X } from "lucide-react";
import { fetchColleges, fetchAcademicCatalog } from "@/services/college.service";

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
import { Switch } from "@/components/ui/switch";
import api from "@/lib/api";
import AuthService from "@/services/auth.service";
import MonacoCodeEditor from "./components/MonacoCodeEditor";
import { toast } from "sonner";
import ExamService from "@/services/exam.service";
import QuestionGeneratorLanding from "@/components/QuestionGeneratorLanding";
import { mockHodStore } from "@/lib/mockHodData";

const editorModules = {
    toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link"],
        ["clean"],
    ],
};

const editorFormats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "link",
];

interface Course {
    id: number;
    name: string;
}

interface Props {
    exam?: any;
    courses: Course[];
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

interface Student {
    user_id: string;
    full_name: string | null;
    roll_number: string | null;
    department: string | null;
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
    starter_code: "",
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

export default function ExamForm({
    exam,
    courses: propCourses,
    onSave,
    onCancel,
}: Props) {
    const isEdit = !!exam?.id;

    const [courses, setCourses] = useState<any[]>(() => {
        if (propCourses && propCourses.length > 0) return propCourses;
        return mockHodStore.getCourses();
    });
    const [colleges, setColleges] = useState<any[]>([]);
    const [catalog, setCatalog] = useState<any[]>([]);

    useEffect(() => {
        fetchColleges().then(cols => {
            setColleges(cols);
        }).catch(err => console.error(err));

        fetchAcademicCatalog().then(cat => {
            setCatalog(cat);
        }).catch(err => console.error(err));
    }, []);

    const currentUser = AuthService.getUser();
    const collegeCode = currentUser?.college_code || "";

    const selectedCollege = useMemo(() => {
        return colleges.find(c => String(c.id) === String(collegeCode) || c.code === collegeCode) || colleges[0] || null;
    }, [colleges, collegeCode]);

    const getCourseHierarchyLabel = (courseName: string, academicProfile: any, catalogData: any[]) => {
        if (!academicProfile || !catalogData || catalogData.length === 0) return courseName;

        let found = false;
        let result = courseName;
        Object.entries(academicProfile).forEach(([instTypeCode, levelMap]: [string, any]) => {
            if (found || !levelMap || typeof levelMap !== "object") return;

            Object.entries(levelMap).forEach(([levelCode, degreeMap]: [string, any]) => {
                if (found || !degreeMap || typeof degreeMap !== "object") return;

                Object.entries(degreeMap).forEach(([degreeCode, depts]: [string, any]) => {
                    if (found || !Array.isArray(depts)) return;

                    const deptMatch = depts.find(d => d.trim().toUpperCase() === courseName.trim().toUpperCase());
                    if (deptMatch) {
                        let degreeName = degreeCode;
                        catalogData.forEach(instType => {
                            if (instType.levels) {
                                instType.levels.forEach((lvl: any) => {
                                    if (lvl.degrees) {
                                        const match = lvl.degrees.find((d: any) => d.id === degreeCode);
                                        if (match) {
                                            degreeName = match.name;
                                        }
                                    }
                                });
                            }
                        });

                        result = `${levelCode} → ${degreeName} → ${deptMatch}`;
                        found = true;
                    }
                });
            });
        });

        return result;
    };

    const [activeTab, setActiveTab] = useState("details");
    const [showAIModal, setShowAIModal] = useState(false);
    const [aiType, setAiType] = useState<"mcq" | "coding">("mcq");
    const [aiTopic, setAiTopic] = useState("");
    const [aiDifficulty, setAiDifficulty] = useState("medium");
    const [aiCountMode, setAiCountMode] = useState<"preset" | "custom">("preset");
    const [aiCountPreset, setAiCountPreset] = useState<number>(5);
    const [aiCountCustom, setAiCountCustom] = useState<number>(5);
    const [generatingAI, setGeneratingAI] = useState(false);

    const handleOpenAIModal = () => {
        if (form.exam_type_id === 1) {
            setAiType("mcq");
        } else if (form.exam_type_id === 2) {
            setAiType("coding");
        }
        setShowAIModal(true);
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
                    languages: langArr.length > 0 ? langArr : ["python", "javascript", "sql"],
                    starter_code: q.starterCode || q.starter_code || "",
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
        toast.success(`Generated questions via Gemini AI! Duration set to ${calculatedDuration} mins (60m base + ${totalCodingCount * 20}m coding).`);
    };

    const [examTypes, setExamTypes] = useState<any[]>([]);
    const [examSettings, setExamSettings] = useState<any[]>([]);
    const [selectedSetting, setSelectedSetting] = useState<any>(null);

    useEffect(() => {
        if (!selectedSetting) return;

        setForm(prev => ({
            ...prev,
            negative_marking:
                Boolean(selectedSetting.negative_marks),

            shuffle:
                Boolean(selectedSetting.shuffle_questions),

            fullscreen_required:
                Boolean(selectedSetting.fullscreen_required),

            disable_copy_paste:
                Boolean(selectedSetting.disable_copy_paste),

            tab_switch_limit:
                Number(selectedSetting.tab_switch_limit || 0),
        }));
    }, [selectedSetting]);

    // Core Exam Form State
    const [form, setForm] = useState({
        exam_type_id: 0,
        exam_setting_id: 0,
        course_id: 0,

        title: "",
        description: "",
        instructions: "",

        duration: 60,
        total_marks: 0,
        total_questions: 0,
        pass_percentage: 40,

        start_date: "",
        end_date: "",

        status: "Draft",

        negative_marking: false,
        shuffle: false,
        fullscreen_required: true,
        disable_copy_paste: true,
        tab_switch_limit: 3,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        loadMasterData();
    }, []);

    useEffect(() => {
        if (!isEdit && !form.start_date) {
            const nowStr = getCurrentDateTimeLocal();
            const endStr = addMinutesToDateTimeLocal(nowStr, 60);
            setForm(prev => ({
                ...prev,
                duration: 60,
                start_date: nowStr,
                end_date: endStr
            }));
        }
    }, [isEdit]);

    useEffect(() => {
        if (!form.exam_setting_id) {
            setSelectedSetting(null);
            return;
        }

        const setting = examSettings.find(
            (item: any) =>
                Number(item.id) ===
                Number(form.exam_setting_id)
        );

        if (setting) {
            setSelectedSetting(setting);
        }
    }, [
        form.exam_setting_id,
        examSettings,
    ]);

    const loadMasterData = async () => {
        try {
            setExamTypes([
                { id: 1, name: "MCQ Assessment" },
                { id: 2, name: "Coding Challenge" },
                { id: 3, name: "Mixed Evaluation" }
            ]);

            setExamSettings([
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
        } catch (error) {
            console.error(error);
        }
    };

    // Sub-lists state with safe initial database value parser
    const [mcqs, setMcqs] = useState<MCQ[]>(() => {
        const raw = exam?.mcqs || exam?.mcq_questions || (exam?.mcq ? [exam.mcq] : []);
        if (!Array.isArray(raw) || raw.length === 0) return [];
        return raw.map((m: any, idx: number) => {
            let opts = m.options;
            if (typeof opts === "string") {
                try {
                    opts = JSON.parse(opts);
                } catch {
                    opts = ["", "", "", ""];
                }
            }
            return {
                id: m.id || `mcq-${idx + 1}`,
                question: m.question || "",
                options: Array.isArray(opts) ? opts : ["", "", "", ""],
                correct_index: m.correct_index !== undefined ? Number(m.correct_index) : (Array.isArray(opts) && m.correct_answer ? opts.indexOf(m.correct_answer) : 0),
                marks: m.marks !== undefined ? Number(m.marks) : (m.positive_marks !== undefined ? Number(m.positive_marks) : 8),
                negative_marks: m.negative_marks !== undefined ? Number(m.negative_marks) : 2,
                difficulty: m.difficulty || m.difficulty_level?.toLowerCase() || "medium",
                topic: m.topic || "Core",
                explanation: m.explanation || "",
                sort_order: m.sort_order !== undefined ? Number(m.sort_order) : idx,
            };
        });
    });

    const [codings, setCodings] = useState<Coding[]>(() => {
        const raw = exam?.codings || exam?.coding_questions || (exam?.coding ? [exam.coding] : []);
        if (!Array.isArray(raw) || raw.length === 0) return [];
        return raw.map((c: any, idx: number) => {
            let langs = c.languages;
            if (typeof langs === "string") {
                try {
                    langs = JSON.parse(langs);
                } catch {
                    langs = ["python", "javascript"];
                }
            } else if (!langs && c.language) {
                langs = [c.language];
            }
            return {
                id: c.id || `coding-${idx + 1}`,
                title: c.title || `Coding Challenge #${idx + 1}`,
                statement: c.statement || c.question || "",
                constraints: c.constraints || "",
                input_format: c.input_format || "",
                output_format: c.output_format || "",
                sample_input: c.sample_input || "",
                sample_output: c.sample_output || "",
                marks: c.marks !== undefined ? Number(c.marks) : (c.positive_marks !== undefined ? Number(c.positive_marks) : 30),
                time_limit_ms: c.time_limit_ms || 2000,
                memory_limit_kb: c.memory_limit_kb || 128000,
                languages: Array.isArray(langs) && langs.length > 0 ? langs : ["python", "javascript"],
                starter_code: c.starter_code || "",
                sort_order: c.sort_order !== undefined ? Number(c.sort_order) : idx,
                test_cases: (c.test_cases || []).map((tc: any, ti: number) => ({
                    id: tc.id || `tc-${idx}-${ti}`,
                    input: tc.input || "",
                    expected_output: tc.expected_output || tc.output || "",
                    weight: tc.weight !== undefined ? Number(tc.weight) : 1,
                    is_hidden: Boolean(tc.is_hidden),
                    sort_order: tc.sort_order !== undefined ? Number(tc.sort_order) : ti,
                }))
            };
        });
    });

    // Selected languages pre-populated for AI generator modal
    const selectedExamLanguages = useMemo(() => {
        const langs = new Set<string>();
        codings.forEach((c) => {
            if (Array.isArray(c.languages)) {
                c.languages.forEach((l) => {
                    if (l && typeof l === "string") langs.add(l.trim().toLowerCase());
                });
            }
        });
        return Array.from(langs);
    }, [codings]);

    // Auto-calculate total exam duration: 60 mins base + 20 mins fixed per coding challenge question
    useEffect(() => {
        const baseDuration = 60;
        const codingDuration = codings.length * 20; // 20 mins per coding challenge question
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

    // Students & Assignment state
    const [students, setStudents] = useState<Student[]>(() => {
        return mockHodStore.getStudents().map((s) => ({
            user_id: String(s.id),
            full_name: s.full_name,
            roll_number: s.roll_number,
            department: `${s.department} · Sec ${s.section}`
        }));
    });
    const [assignedIds, setAssignedIds] = useState<Set<string>>(() => {
        const initial = exam?.assigned_student_ids || exam?.assignedIds || [];
        if (Array.isArray(initial) && initial.length > 0) {
            return new Set(initial.map((id: any) => String(id)));
        }
        return new Set(mockHodStore.getStudents().map((s) => String(s.id)));
    });
    const [assignType, setAssignType] = useState<"course" | "students">(() => {
        if (exam?.assigned_type) return exam.assigned_type;
        return "students";
    });
    const [studentSearch, setStudentSearch] = useState("");
    const [loadingStudents, setLoadingStudents] = useState(false);

    // Deduplicated list of courses by formatted display label for dropdown selection
    const uniqueDisplayCourses = useMemo(() => {
        const seenLabels = new Set<string>();
        const result: any[] = [];
        const activeCourses = courses && courses.length > 0 ? courses : mockHodStore.getCourses();

        activeCourses.forEach((c) => {
            const label = getCourseHierarchyLabel(c.name, selectedCollege?.academicProfile, catalog) || c.displayLabel || c.name;
            const normKey = (label || c.name || "").trim().toUpperCase();
            if (!seenLabels.has(normKey)) {
                seenLabels.add(normKey);
                result.push({ ...c, displayLabel: label });
            }
        });

        return result;
    }, [courses, selectedCollege, catalog]);

    // Fetch HOD courses list with fallback
    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await api.get("/hod/courses");
                if (res.data && res.data.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
                    const raw = res.data.data || [];
                    const seen = new Set<string>();
                    const unique = raw.filter((c: any) => {
                        const idStr = String(c.id);
                        if (seen.has(idStr)) return false;
                        seen.add(idStr);
                        return true;
                    });
                    setCourses(unique);
                    return;
                }
            } catch (err) {
                console.warn("Using fallback courses for standalone HOD panel", err);
            }
            const fallbackCourses = (propCourses && propCourses.length > 0)
                ? propCourses
                : mockHodStore.getCourses();
            setCourses(fallbackCourses);
        };
        fetchCourses();
    }, [propCourses]);

    // Fetch students list with fallback
    useEffect(() => {
        const fetchStudents = async () => {
            try {
                setLoadingStudents(true);
                const res = await api.get("/hod/students");
                if (res.data && res.data.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
                    const fetched = (res.data.data || []).map((s: any) => ({
                        user_id: String(s.id || s.user_id),
                        full_name: s.name || s.full_name || `${s.first_name || ""} ${s.last_name || ""}`.trim() || "Unnamed",
                        roll_number: s.roll_number || "",
                        department: s.batch_code || s.department || "",
                    }));
                    setStudents(fetched);
                    return;
                }
            } catch (err) {
                console.warn("Using mock student directory for standalone HOD panel", err);
            } finally {
                setLoadingStudents(false);
            }
            const fallback = mockHodStore.getStudents().map((s) => ({
                user_id: String(s.id),
                full_name: s.full_name,
                roll_number: s.roll_number,
                department: `${s.department} · Sec ${s.section}`
            }));
            setStudents(fallback);
        };

        fetchStudents();
    }, []);

    // Sync student selection when Course is selected
    useEffect(() => {
        if (assignType === "course" && form.course_id && courses.length > 0 && students.length > 0) {
            const course = courses.find(c => Number(c.id) === Number(form.course_id));
            if (course) {
                const deptKeyword = course.name.match(/\(([^)]+)\)/)?.[1] || course.name;
                const matchingStudentIds = students
                    .filter(s => (s.department || "").toUpperCase().includes(deptKeyword.toUpperCase()))
                    .map(s => s.user_id);
                setAssignedIds(new Set(matchingStudentIds));
            }
        }
    }, [form.course_id, assignType, courses, students]);

    // Handle initial questions if passed as object in exam
    useEffect(() => {
        if (exam) {
            // Helper to format date strings to YYYY-MM-DDTHH:MM for datetime-local
            const formatDateForInput = (dateStr: any) => {
                if (!dateStr) return "";
                if (typeof dateStr === "string") {
                    const cleaned = dateStr.replace(" ", "T");
                    if (cleaned.length >= 16 && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(cleaned)) {
                        return cleaned.substring(0, 16);
                    }
                }
                const d = new Date(dateStr);
                if (isNaN(d.getTime())) return "";
                const yyyy = d.getFullYear();
                const mm = String(d.getMonth() + 1).padStart(2, "0");
                const dd = String(d.getDate()).padStart(2, "0");
                const hh = String(d.getHours()).padStart(2, "0");
                const min = String(d.getMinutes()).padStart(2, "0");
                return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
            };

            const getExamTypeId = (e: any) => {
                if (!e) return 3;
                const rawM = e.mcqs || e.mcq_questions || (e.mcq ? [e.mcq] : []);
                const rawC = e.codings || e.coding_questions || (e.coding ? [e.coding] : []);
                const hasMcq = Array.isArray(rawM) && rawM.length > 0;
                const hasCoding = Array.isArray(rawC) && rawC.length > 0;
                if (hasMcq && hasCoding) return 3;
                if (hasMcq) return 1;
                if (hasCoding) return 2;
                return 3;
            };

            const getExamSettingId = (e: any) => {
                if (!e) return 1;
                if (e.negative_marking) return 2;
                return 1;
            };

            const resolvedTypeId = exam.exam_type_id || getExamTypeId(exam);
            const resolvedSettingId = exam.exam_setting_id || getExamSettingId(exam);

            setForm({
                exam_type_id: resolvedTypeId,
                exam_setting_id: resolvedSettingId,
                course_id: exam.course_id || 1,
                title: exam.title || "",
                description: exam.description || "",
                instructions: exam.instructions || "",
                duration: exam.duration || 60,
                total_marks: exam.total_marks || 0,
                total_questions: exam.total_questions || 0,
                pass_percentage: exam.pass_percentage || 40,
                start_date: formatDateForInput(exam.start_date),
                end_date: formatDateForInput(exam.end_date),
                status: exam.status || "Draft",
                negative_marking: Boolean(exam.negative_marking),
                shuffle: Boolean(exam.shuffle),
                fullscreen_required: Boolean(exam.fullscreen_required),
                disable_copy_paste: Boolean(exam.disable_copy_paste),
                tab_switch_limit: exam.tab_switch_limit !== undefined ? Number(exam.tab_switch_limit) : 3,
            });

            const rawMcqs = exam.mcqs || exam.mcq_questions || (exam.mcq ? [exam.mcq] : []);
            if (Array.isArray(rawMcqs) && rawMcqs.length > 0) {
                const parsed = rawMcqs.map((m: any, idx: number) => {
                    let opts = m.options;
                    if (typeof opts === "string") {
                        try {
                            opts = JSON.parse(opts);
                        } catch {
                            opts = ["", "", "", ""];
                        }
                    }
                    return {
                        id: m.id || `mcq-${idx + 1}`,
                        question: m.question || "",
                        options: Array.isArray(opts) ? opts : ["", "", "", ""],
                        correct_index: m.correct_index !== undefined ? Number(m.correct_index) : (Array.isArray(opts) && m.correct_answer ? opts.indexOf(m.correct_answer) : 0),
                        marks: m.marks !== undefined ? Number(m.marks) : (m.positive_marks !== undefined ? Number(m.positive_marks) : 8),
                        negative_marks: m.negative_marks !== undefined ? Number(m.negative_marks) : 2,
                        difficulty: m.difficulty || m.difficulty_level?.toLowerCase() || "medium",
                        topic: m.topic || "Core",
                        explanation: m.explanation || "",
                        sort_order: m.sort_order !== undefined ? Number(m.sort_order) : idx,
                    };
                });
                setMcqs(parsed);
            }

            const rawCodings = exam.codings || exam.coding_questions || (exam.coding ? [exam.coding] : []);
            if (Array.isArray(rawCodings) && rawCodings.length > 0) {
                const parsed = rawCodings.map((c: any, idx: number) => {
                    let langs = c.languages;
                    if (typeof langs === "string") {
                        try {
                            langs = JSON.parse(langs);
                        } catch {
                            langs = ["python", "javascript"];
                        }
                    } else if (!langs && c.language) {
                        langs = [c.language];
                    }
                    return {
                        id: c.id || `coding-${idx + 1}`,
                        title: c.title || `Coding Challenge #${idx + 1}`,
                        statement: c.statement || c.question || "",
                        constraints: c.constraints || "",
                        input_format: c.input_format || "",
                        output_format: c.output_format || "",
                        sample_input: c.sample_input || "",
                        sample_output: c.sample_output || "",
                        marks: c.marks !== undefined ? Number(c.marks) : (c.positive_marks !== undefined ? Number(c.positive_marks) : 30),
                        time_limit_ms: c.time_limit_ms || 2000,
                        memory_limit_kb: c.memory_limit_kb || 128000,
                        languages: Array.isArray(langs) && langs.length > 0 ? langs : ["python", "javascript"],
                        starter_code: c.starter_code || "",
                        sort_order: c.sort_order !== undefined ? Number(c.sort_order) : idx,
                        test_cases: (c.test_cases || []).map((tc: any, ti: number) => ({
                            id: tc.id || `tc-${idx}-${ti}`,
                            input: tc.input || "",
                            expected_output: tc.expected_output || tc.output || "",
                            weight: tc.weight !== undefined ? Number(tc.weight) : 1,
                            is_hidden: Boolean(tc.is_hidden),
                            sort_order: tc.sort_order !== undefined ? Number(tc.sort_order) : ti,
                        }))
                    };
                });
                setCodings(parsed);
            }

            // Sync assigned students
            const initialAssigned = exam.assigned_student_ids || exam.assignedIds || [];
            if (Array.isArray(initialAssigned) && initialAssigned.length > 0) {
                setAssignedIds(new Set(initialAssigned.map((id: any) => String(id))));
            } else {
                setAssignedIds(new Set(mockHodStore.getStudents().map((s) => String(s.id))));
            }
            if (exam.assigned_type) {
                setAssignType(exam.assigned_type);
            }
        }
    }, [exam]);

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

    const totalMarks =
        mcqs.reduce((sum, item) => sum + Number(item.marks || 0), 0) +
        codings.reduce((sum, item) => sum + Number(item.marks || 0), 0);

    const validateForm = () => {
        const tempErrors: Record<string, string> = {};

        if (!form.title.trim()) {
            tempErrors.title = "Exam Title is required";
        }

        if (!form.exam_type_id) {
            tempErrors.exam_type_id = "Exam Type is required";
        }

        if (!form.duration || form.duration <= 0 || isNaN(form.duration)) {
            tempErrors.duration = "Valid Duration is required";
        }

        if (!form.start_date) {
            tempErrors.start_date = "Start Date is required";
        }

        if (!form.end_date) {
            tempErrors.end_date = "End Date is required";
        } else if (form.start_date && new Date(form.end_date) <= new Date(form.start_date)) {
            tempErrors.end_date = "End Date must be after Start Date";
        }

        if (form.pass_percentage === undefined || form.pass_percentage === null || form.pass_percentage < 0 || form.pass_percentage > 100 || isNaN(form.pass_percentage)) {
            tempErrors.pass_percentage = "Passing Percentage must be between 0 and 100";
        }

        if (form.exam_type_id === 1 && mcqs.length === 0) {
            tempErrors.questions = "At least one MCQ question is required for MCQ Assessment";
        } else if (form.exam_type_id === 2 && codings.length === 0) {
            tempErrors.questions = "At least one Coding challenge is required for Coding Challenge";
        } else if (form.exam_type_id === 3 && mcqs.length === 0 && codings.length === 0) {
            tempErrors.questions = "At least one MCQ or Coding question is required for Mixed Evaluation";
        }

        setErrors(tempErrors);

        const isValid = Object.keys(tempErrors).length === 0;
        if (!isValid) {
            if (tempErrors.questions) {
                toast.error(tempErrors.questions);
            } else {
                toast.error("Please fill in all required exam details correctly.");
            }
        }
        return isValid;
    };

    const handleSubmit = () => {
        if (!validateForm()) return;
        
        const isUnassigned = assignedIds.size === 0 && !form.course_id;
        if (isUnassigned) {
            toast.info("Exam created as Draft because no students or course were assigned.");
        }

        // Build payload
        const totalQuestions = mcqs.length + codings.length;
        const resolvedExamType = form.exam_type_id === 1 ? "mcq" : form.exam_type_id === 2 ? "coding" : form.exam_type_id === 3 ? "mixed" : (mcqs.length > 0 && codings.length > 0 ? "mixed" : codings.length > 0 ? "coding" : "mcq");

        const payload = {
            ...form,
            status: isUnassigned ? "Draft" : "Published",
            description: DOMPurify.sanitize(form.description || ""),
            instructions: DOMPurify.sanitize(form.instructions || ""),
            total_marks: totalMarks,
            exam_type: resolvedExamType,
            questions_count: totalQuestions,
            total_questions: totalQuestions,
            mcqs,
            codings,
            assigned_student_ids: Array.from(assignedIds),
            assigned_type: assignType,

            // Legacy backward compatibility fields
            mcq: mcqs[0] ? {
                question: mcqs[0].question,
                options: mcqs[0].options,
                correct_answer: mcqs[0].options[mcqs[0].correct_index] || "",
                positive_marks: mcqs[0].marks,
                negative_marks: mcqs[0].negative_marks,
                difficulty_level: mcqs[0].difficulty,
            } : undefined,
            coding: codings[0] ? {
                question: codings[0].statement,
                positive_marks: codings[0].marks,
                negative_marks: 0,
                difficulty_level: "Medium",
                starter_code: codings[0].starter_code || "",
                solution_code: "",
                test_cases: codings[0].test_cases.map(tc => ({
                    input: tc.input,
                    output: tc.expected_output
                })),
            } : undefined
        };

        onSave(payload);
    };

    // Filter students
    const filteredStudents = students.filter((s) => {
        const query = studentSearch.toLowerCase();
        return (
            (s.full_name || "").toLowerCase().includes(query) ||
            (s.roll_number || "").toLowerCase().includes(query) ||
            (s.department || "").toLowerCase().includes(query)
        );
    });

    return (
        <div className="space-y-6">
            {/* Header bar */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" onClick={onCancel} className="h-9 w-9 p-0 rounded-full border border-border">
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">
                            {isEdit ? "Edit Exam" : "New Exam"}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Total marks: {totalMarks}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button onClick={handleOpenAIModal} className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm h-10 text-xs">
                        <Sparkles className="w-4 h-4 text-violet-200" />
                        AI Generator
                    </Button>
                    <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-4 py-2 rounded-xl flex items-center gap-2 h-10 text-xs">
                        <Save className="w-4 h-4" />
                        Save Exam
                    </Button>
                </div>
            </div>

            {/* Tabs content */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="bg-muted p-1 rounded-xl">
                    <TabsTrigger value="details" className="rounded-lg">Details</TabsTrigger>
                    {(form.exam_type_id === 1 || form.exam_type_id === 3 || !form.exam_type_id) && (
                        <TabsTrigger value="mcq" className="rounded-lg">MCQ ({mcqs.length})</TabsTrigger>
                    )}
                    {(form.exam_type_id === 2 || form.exam_type_id === 3 || !form.exam_type_id) && (
                        <TabsTrigger value="coding" className="rounded-lg">Coding ({codings.length})</TabsTrigger>
                    )}
                    <TabsTrigger value="assign" className="rounded-lg">
                        Assign ({assignedIds.size > 0 ? assignedIds.size : (form.course_id ? (students.length || 56) : 0)})
                    </TabsTrigger>
                </TabsList>

                {/* Details Tab */}
                <TabsContent value="details" className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-sm">
                    <div>
                        <Label className="text-sm font-semibold">Title</Label>
                        <Input
                            value={form.title}
                            onChange={(e) => updateField("title", e.target.value)}
                            placeholder="Enter exam title..."
                            className="mt-1"
                        />
                    </div>

                    <div>
                        <Label className="text-sm font-semibold">Description</Label>
                        <div className="mt-1.5 rounded-lg overflow-hidden border border-input bg-background shadow-sm">
                            <Textarea
                                value={form.description}
                                onChange={(e) => updateField("description", e.target.value)}
                                placeholder="Write exam description..."
                                className="border-none focus-visible:ring-0 min-h-[120px] text-xs resize-none"
                            />
                        </div>
                    </div>

                    <div>
                        <Label className="text-sm font-semibold">Instructions (shown before exam starts)</Label>
                        <div className="mt-1.5 rounded-lg overflow-hidden border border-input bg-background shadow-sm">
                            <Textarea
                                value={form.instructions}
                                onChange={(e) => updateField("instructions", e.target.value)}
                                placeholder="Write instructions for the student..."
                                className="border-none focus-visible:ring-0 min-h-[180px] text-xs resize-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <Label className="text-sm font-semibold">Exam Type</Label>
                            <select
                                value={form.exam_type_id}
                                onChange={(e) => handleExamTypeChange(Number(e.target.value))}
                                className="w-full mt-2 h-10 px-3 rounded-lg border border-input bg-background text-sm cursor-pointer"
                            >
                                <option value="">Select Exam Type</option>
                                {examTypes.map((type: any) => (
                                    <option key={type.id} value={type.id}>
                                        {type.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <Label className="text-sm font-semibold">Exam Setting</Label>
                            <select
                                value={form.exam_setting_id}
                                onChange={(e) => updateField("exam_setting_id", Number(e.target.value))}
                                className="w-full mt-2 h-10 px-3 rounded-lg border border-input bg-background text-sm cursor-pointer"
                            >
                                <option value="">Select Setting</option>
                                {examSettings.map((setting: any) => (
                                    <option key={setting.id} value={setting.id}>
                                        {setting.name || `Setting #${setting.id}`}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <Label className="text-sm font-semibold">Duration (min)</Label>
                            <Input
                                type="number"
                                min={60}
                                value={form.duration}
                                onChange={(e) => handleDurationChange(+e.target.value)}
                                className="mt-1.5"
                            />
                        </div>

                        <div>
                            <Label className="text-sm font-semibold">Start Date</Label>
                            <Input
                                type="datetime-local"
                                min={getCurrentDateTimeLocal()}
                                value={form.start_date}
                                onChange={(e) => handleStartDateChange(e.target.value)}
                                className="mt-1.5"
                            />
                        </div>

                        <div>
                            <Label className="text-sm font-semibold">End Date</Label>
                            <Input
                                type="datetime-local"
                                min={form.start_date || getCurrentDateTimeLocal()}
                                value={form.end_date}
                                onChange={(e) => handleEndDateChange(e.target.value)}
                                className="mt-1.5"
                            />
                        </div>

                        <div>
                            <Label className="text-sm font-semibold">Passing %</Label>
                            <Input
                                type="number"
                                value={form.pass_percentage}
                                onChange={(e) => updateField("pass_percentage", +e.target.value)}
                                onWheel={(e) => e.currentTarget.blur()}
                                className="mt-1.5"
                            />
                        </div>
                    </div>

                    {/* Applied Exam Settings Summary Display */}
                    {selectedSetting && (
                        <div className="p-4 bg-muted/30 border border-border rounded-xl space-y-2 text-xs animate-in fade-in duration-200 mt-2">
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-foreground flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                    Applied Exam Settings Summary
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

                {/* Settings Tab */}
                {/* <TabsContent value="settings" className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-sm">
                    <div className="flex items-center justify-between py-2 border-b border-border">
                        <Label className="text-sm font-medium cursor-pointer" htmlFor="neg-marking">Negative marking</Label>
                        <Switch
                            id="neg-marking"
                            checked={form.negative_marking}
                            onCheckedChange={(val) => updateField("negative_marking", val)}
                        />
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-border">
                        <Label className="text-sm font-medium cursor-pointer" htmlFor="shuffle">Shuffle questions</Label>
                        <Switch
                            id="shuffle"
                            checked={form.shuffle}
                            onCheckedChange={(val) => updateField("shuffle", val)}
                        />
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-border">
                        <Label className="text-sm font-medium cursor-pointer" htmlFor="fullscreen">Fullscreen required</Label>
                        <Switch
                            id="fullscreen"
                            checked={form.fullscreen_required}
                            onCheckedChange={(val) => updateField("fullscreen_required", val)}
                        />
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-border">
                        <Label className="text-sm font-medium cursor-pointer" htmlFor="copy-paste">Disable copy/paste in coding</Label>
                        <Switch
                            id="copy-paste"
                            checked={form.disable_copy_paste}
                            onCheckedChange={(val) => updateField("disable_copy_paste", val)}
                        />
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-border">
                        <Label className="text-sm font-medium">Tab switch limit (auto-terminate)</Label>
                        <Input
                            className="w-24 h-9"
                            type="number"
                            value={form.tab_switch_limit}
                            onChange={(e) => updateField("tab_switch_limit", +e.target.value)}
                        />
                    </div>
                    <div>
                        <Label className="text-sm font-semibold">Status</Label>
                        <select
                            className="w-full mt-2 h-10 px-3 rounded-lg border border-input bg-background text-sm cursor-pointer"
                            value={form.status}
                            onChange={(e) => updateField("status", e.target.value)}
                        >
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                            <option value="archived">Archived</option>
                        </select>
                    </div>
                </TabsContent> */}

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
                                        if (confirm(`Are you sure you want to delete all ${mcqs.length + codings.length} questions?`)) {
                                            setMcqs([]);
                                            setCodings([]);
                                            toast.success("All questions deleted successfully.");
                                        }
                                    }}
                                    className="h-8 rounded-lg text-xs font-semibold text-destructive border-destructive/30 hover:bg-destructive/10 flex items-center gap-1"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    Delete All Questions
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
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-foreground">Q{idx + 1}</span>
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
                                            className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
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
                                        placeholder="e.g. Loops"
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
                                <Label className="text-xs font-semibold">Explanation (shown after submission)</Label>
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
                    <Button variant="outline" onClick={() => setMcqs([...mcqs, { ...blankMCQ, options: ["", "", "", ""] }])} className="w-full border-dashed py-6 rounded-xl hover:bg-muted text-muted-foreground flex items-center justify-center gap-2">
                        <Plus className="w-4 h-4" /> Add MCQ Question
                    </Button>
                </TabsContent>

                {/* Coding Tab */}
                <TabsContent value="coding" className="space-y-4">
                    {codings.map((c, idx) => (
                        <div key={idx} className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-foreground">Problem {idx + 1}</span>
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
                                    <Label className="text-xs font-semibold">Languages (comma separated)</Label>
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
                                <Label className="text-xs font-semibold">Starter Code</Label>
                                <MonacoCodeEditor
                                    language={c.languages[0] || "python"}
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
                                    height="300px"
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
                                        className="h-8 py-0 px-3 flex items-center gap-1 rounded-lg"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        Add case
                                    </Button>
                                </div>

                                {c.test_cases.map((t, ti) => (
                                    <div key={ti} className="grid grid-cols-[1fr_1fr_70px_80px_auto] gap-3 items-start bg-muted/40 p-3 rounded-lg border border-border/60">
                                        <label>Input</label>
                                        <Textarea
                                            placeholder="Input"
                                            rows={2}
                                            value={t.input}
                                            onChange={(e) => {
                                                const n = [...codings];
                                                n[idx].test_cases[ti].input = e.target.value;
                                                setCodings(n);
                                            }}
                                            className="font-mono text-xs p-2 h-14 min-h-0 bg-background"
                                        />
                                        <label>Expected output</label>
                                        <Textarea
                                            placeholder="Expected output"
                                            rows={2}
                                            value={t.expected_output}
                                            onChange={(e) => {
                                                const n = [...codings];
                                                n[idx].test_cases[ti].expected_output = e.target.value;
                                                setCodings(n);
                                            }}
                                            className="font-mono text-xs p-2 h-14 min-h-0 bg-background"
                                        />
                                        <div className="flex flex-col gap-1">
                                            <Label className="text-[10px] font-semibold">Weight</Label>
                                            <Input
                                                type="number"
                                                value={t.weight}
                                                onChange={(e) => {
                                                    const n = [...codings];
                                                    n[idx].test_cases[ti].weight = +e.target.value;
                                                    setCodings(n);
                                                }}
                                                className="h-8 p-1 text-xs"
                                            />
                                        </div>
                                        <label className="flex items-center gap-1.5 text-xs select-none cursor-pointer mt-7 self-start">
                                            <input
                                                type="checkbox"
                                                checked={t.is_hidden}
                                                onChange={(e) => {
                                                    const n = [...codings];
                                                    n[idx].test_cases[ti].is_hidden = e.target.checked;
                                                    setCodings(n);
                                                }}
                                                className="h-3.5 w-3.5 rounded border-gray-300 text-primary focus:ring-primary"
                                            />
                                            <span>Hidden</span>
                                        </label>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => {
                                                const n = [...codings];
                                                n[idx].test_cases = n[idx].test_cases.filter((_, i) => i !== ti);
                                                setCodings(n);
                                            }}
                                            className="h-8 w-8 p-0 rounded-full hover:bg-muted text-destructive mt-5 self-start"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                    <Button variant="outline" onClick={() => setCodings([...codings, { ...blankCoding, test_cases: [] }])} className="w-full border-dashed py-6 rounded-xl hover:bg-muted text-muted-foreground flex items-center justify-center gap-2">
                        <Plus className="w-4 h-4" /> Add Coding Problem
                    </Button>
                </TabsContent>

                {/* Assign Tab */}
                <TabsContent value="assign" className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-sm">
                    <div>
                        <Label className="text-sm font-semibold mb-2 block">How do you want to assign this exam?</Label>
                        <div className="flex gap-6 mt-1 border-b border-border pb-4">
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input
                                    type="radio"
                                    name="assign_type"
                                    checked={assignType === "course"}
                                    onChange={() => setAssignType("course")}
                                    className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                                />
                                <span className="text-sm font-medium">Assign to Course</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input
                                    type="radio"
                                    name="assign_type"
                                    checked={assignType === "students"}
                                    onChange={() => setAssignType("students")}
                                    className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                                />
                                <span className="text-sm font-medium">Assign to Students (Flexible Selection)</span>
                            </label>
                        </div>
                    </div>

                    {assignType === "course" ? (
                        <div className="pt-2 animate-in fade-in duration-200 space-y-3">
                            <div>
                                <Label className="text-sm font-semibold">Select Course</Label>
                                <select
                                    value={form.course_id}
                                    onChange={(e) => {
                                        const cId = Number(e.target.value);
                                        updateField("course_id", cId);
                                        if (students.length > 0) {
                                            setAssignedIds(new Set(students.map(s => s.user_id)));
                                        }
                                    }}
                                    className="w-full mt-2 h-10 px-3 rounded-lg border border-input bg-background text-sm cursor-pointer"
                                >
                                    <option value="">Select Course</option>
                                    {uniqueDisplayCourses.map((course) => (
                                        <option key={course.id} value={course.id}>
                                            {course.displayLabel || course.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="p-3.5 rounded-lg bg-muted/40 border border-border/80 text-xs text-muted-foreground space-y-1.5">
                                <div className="flex items-center gap-2 text-foreground font-semibold">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                    Department Cohort Enrolled ({students.length} Students)
                                </div>
                                <p>All registered students enrolled in this curriculum will automatically have access to this assessment when published.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4 pt-2 animate-in fade-in duration-200">
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search students by name, roll number, or department..."
                                        value={studentSearch}
                                        onChange={(e) => setStudentSearch(e.target.value)}
                                        className="pl-10 h-10 rounded-lg"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                            const next = new Set(assignedIds);
                                            filteredStudents.forEach((s) => next.add(s.user_id));
                                            setAssignedIds(next);
                                        }}
                                        className="h-10 text-xs font-medium"
                                    >
                                        Select All ({filteredStudents.length})
                                    </Button>
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => {
                                            const next = new Set(assignedIds);
                                            filteredStudents.forEach((s) => next.delete(s.user_id));
                                            setAssignedIds(next);
                                        }}
                                        className="h-10 text-xs font-medium text-muted-foreground hover:text-foreground"
                                    >
                                        Deselect
                                    </Button>
                                </div>
                            </div>

                            {loadingStudents ? (
                                <p className="text-sm text-muted-foreground text-center py-4">Loading student directory...</p>
                            ) : filteredStudents.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">No matching students found.</p>
                            ) : (
                                <div className="space-y-1.5 max-h-[360px] overflow-y-auto border border-border/80 rounded-xl p-2 bg-muted/20">
                                    {filteredStudents.map((s) => (
                                        <label
                                            key={s.user_id}
                                            className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-background hover:shadow-sm cursor-pointer border border-transparent hover:border-border transition-all"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={assignedIds.has(s.user_id)}
                                                onChange={(e) => {
                                                    const n = new Set(assignedIds);
                                                    if (e.target.checked) {
                                                        n.add(s.user_id);
                                                    } else {
                                                        n.delete(s.user_id);
                                                    }
                                                    setAssignedIds(n);
                                                }}
                                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                                            />
                                            <div className="flex-1">
                                                <div className="text-sm font-semibold text-foreground">
                                                    {s.full_name || "Unnamed Student"}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {s.roll_number || "No roll number"}
                                                    {s.department ? ` · ${s.department}` : ""}
                                                </div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            )}
                            <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 px-1">
                                <span>Showing {filteredStudents.length} of {students.length} students</span>
                                <span className="font-semibold text-foreground">{assignedIds.size} student(s) selected</span>
                            </div>
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {showAIModal && (
                <div className="fixed inset-0 z-50">
                    <QuestionGeneratorLanding
                        allowedExamType={form.exam_type_id === 1 ? "MCQ" : form.exam_type_id === 2 ? "CODING" : "MIXED"}
                        initialLanguages={selectedExamLanguages}
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