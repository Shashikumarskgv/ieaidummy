"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  Users,
  Search,
  MoreVertical,
  Eye,
  Edit2,
  Trash2,
  Download,
  Upload,
  CheckCircle2,
  X,
  Plus,
  FileText,
  History,
  AlertTriangle,
  ChevronDown,
  UserCheck,
  RefreshCw,
  FileCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Papa from "papaparse";
import { Student } from "@/services/student.service";
import StudentService from "@/services/student.service";
import AuthService from "@/services/auth.service";
import { fetchColleges } from "@/services/college.service";

interface ImportErrorDetail {
  row: number;
  column: string;
  error: string;
}

interface ImportHistory {
  id: string;
  fileName: string;
  importedBy: string;
  importDate: string;
  successCount: number;
  failedCount: number;
  skippedCount: number;
  collegeCode: string;
  errors: ImportErrorDetail[];
}

export default function StudentDashboard() {
  const router = useRouter();
  const currentUser = AuthService.getUser();
  const collegeCode = currentUser?.college_code || "";
  const collegeName = currentUser?.college_name || "";
  const approvedDomains = currentUser?.approved_domains || [];

  // Tab State
  const [activeTab, setActiveTab] = useState<"all" | "import" | "history">("all");

  // Database States
  const [students, setStudents] = useState<Student[]>([]);
  const [importHistory, setImportHistory] = useState<ImportHistory[]>([]);
  const [colleges, setColleges] = useState<any[]>([]);

  const selectedCollege = useMemo(() => {
    return colleges.find(c => String(c.id) === String(collegeCode) || c.code === collegeCode) || colleges[0] || null;
  }, [colleges, collegeCode]);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");
  const [selectedSection, setSelectedSection] = useState("All");
  const [selectedGradYear, setSelectedGradYear] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");

  // Selection States
  const [checkedIds, setCheckedIds] = useState<string[]>([]);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  // View Student Drawer State
  const [viewStudent, setViewStudent] = useState<Student | null>(null);

  // Bulk Import States
  const [, setUploadedFile] = useState<File | null>(null);
  const [duplicateStrategy, setDuplicateStrategy] = useState<"skip" | "update">("skip");
  const [importStage, setImportStage] = useState<"upload" | "preview" | "processing" | "result">("upload");
  const [importProgress, setImportProgress] = useState(0);
  const [previewData, setPreviewData] = useState<{
    fileName: string;
    totalRows: number;
    validCount: number;
    errorCount: number;
    duplicateCount: number;
    records: any[];
    errors: ImportErrorDetail[];
    importId?: string;
  } | null>(null);

  // Helper local storage operations for flow state persistence
  const getStoredImportHistory = (): ImportHistory[] => {
    if (typeof window !== "undefined") {
      const hist = localStorage.getItem(`import_history_${collegeCode}`);
      return hist ? JSON.parse(hist) : [];
    }
    return [];
  };

  const saveImportHistory = (hist: ImportHistory[]) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(`import_history_${collegeCode}`, JSON.stringify(hist));
    }
  };

  useEffect(() => {
    fetchColleges().then(cols => {
      setColleges(cols);
    }).catch(err => console.error(err));

    if (!collegeCode) return;

    StudentService.fetchStudents(collegeCode)
      .then((data) => {
        setStudents(data);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load students.");
      });

    StudentService.getImportHistory(collegeCode)
      .then((history) => {
        setImportHistory(history);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [collegeCode]);

  // Derived Filter Options
  const uniqueDepartments = useMemo(() => {
    const depts = new Set<string>();
    students.forEach(s => {
      depts.add(s.department);
    });
    return Array.from(depts);
  }, [students]);

  const uniqueSections = useMemo(() => {
    const secs = new Set<string>();
    students.forEach(s => {
      secs.add(s.section);
    });
    return Array.from(secs).sort();
  }, [students]);

  const uniqueGradYears = useMemo(() => {
    const years = new Set<number>();
    students.forEach(s => {
      years.add(s.graduationYear);
    });
    return Array.from(years).sort((a, b) => a - b);
  }, [students]);

  // Filtered Students List
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      // Search Query (Roll Number, Name, Email, Phone)
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
        const matchesRoll = s.rollNumber.toLowerCase().includes(q);
        const matchesName = fullName.includes(q);
        const matchesEmail = s.personalEmail.toLowerCase().includes(q) || (s.officialEmail && s.officialEmail.toLowerCase().includes(q));
        const matchesPhone = s.contactNumber.includes(q);
        if (!matchesRoll && !matchesName && !matchesEmail && !matchesPhone) return false;
      }

      // Dropdown filters
      if (selectedDept !== "All" && s.department !== selectedDept) return false;
      if (selectedSection !== "All" && s.section !== selectedSection) return false;
      if (selectedGradYear !== "All" && s.graduationYear.toString() !== selectedGradYear) return false;
      if (selectedStatus !== "All" && s.status !== selectedStatus) return false;

      return true;
    });
  }, [students, searchQuery, selectedDept, selectedSection, selectedGradYear, selectedStatus]);

  // Analytics Metrics
  const metrics = useMemo(() => {
    const errorsCount = importHistory.reduce((sum, h) => sum + h.failedCount, 0);
    const currentYear = new Date().getFullYear();
    const finalGradYear = currentYear + 1;
    const preFinalGradYear = currentYear + 2;

    return {
      total: students.length,
      preFinal: students.filter(s => s.graduationYear === preFinalGradYear).length,
      final: students.filter(s => s.graduationYear === finalGradYear).length,
      active: students.filter(s => s.status === "Active").length,
      errors: errorsCount
    };
  }, [students, importHistory]);

  // Checkbox Handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setCheckedIds(filteredStudents.map(s => s.rollNumber));
    } else {
      setCheckedIds([]);
    }
  };

  const handleSelectRow = (roll: string, checked: boolean) => {
    if (checked) {
      setCheckedIds([...checkedIds, roll]);
    } else {
      setCheckedIds(checkedIds.filter(x => x !== roll));
    }
  };

  // Bulk Handlers
  const handleBulkDeactivate = async () => {
    if (checkedIds.length === 0) return;
    try {
      for (const roll of checkedIds) {
        await StudentService.toggleStudentStatus(collegeCode, roll, "Inactive");
      }
      const updated = students.map(s => {
        if (checkedIds.includes(s.rollNumber)) {
          return { ...s, status: "Inactive" as const };
        }
        return s;
      });
      setStudents(updated);
      toast.success(`Deactivated ${checkedIds.length} student profiles`);
      setCheckedIds([]);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to deactivate students.");
    }
  };

  const handleBulkDelete = async () => {
    if (checkedIds.length === 0) return;
    try {
      for (const roll of checkedIds) {
        await StudentService.deleteStudent(collegeCode, roll);
      }
      const updated = students.filter(s => !checkedIds.includes(s.rollNumber));
      setStudents(updated);
      toast.success(`Deleted ${checkedIds.length} student records`);
      setCheckedIds([]);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete students.");
    }
  };

  const handleBulkExport = () => {
    if (checkedIds.length === 0) return;
    const exportStudents = students.filter(s => checkedIds.includes(s.rollNumber));
    const headers = "Roll Number,First Name,Last Name,Personal Email,Official Email,Contact Number,Department,Section,Graduation Year,CGPA,Status\n";
    const rows = exportStudents
      .map(
        s =>
          `"${s.rollNumber}","${s.firstName}","${s.lastName}","${s.personalEmail}","${s.officialEmail || ""}","${s.contactNumber}","${s.department}","${s.section}",${s.graduationYear},${s.cgpa || ""},"${s.status}"`
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${collegeCode}_Students_Selected_Export.csv`;
    link.click();
    toast.success(`Exported ${checkedIds.length} students to CSV!`);
    setCheckedIds([]);
  };

  // Row operations
  const handleToggleStatus = async (student: Student) => {
    const newStatus: Student["status"] = student.status === "Active" ? "Inactive" : "Active";
    try {
      const updatedStudent = await StudentService.toggleStudentStatus(collegeCode, student.rollNumber, newStatus);
      const updated = students.map(s => (s.rollNumber === student.rollNumber ? updatedStudent : s));
      setStudents(updated);
      toast.success(`Student status updated to ${newStatus}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to toggle status.");
    }
  };

  // CSV Template downloads
  const handleDownloadTemplate = (type: "csv" | "excel") => {
    const headers = "Roll_Number,First_Name,Last_Name,Personal_Email,Official_Email,Contact_Number,Degree,Department,Section,Graduation_Year,CGPA_or_Percentage\n";
    const sampleRow = `20711A0504,John,Doe,john.doe@gmail.com,john.doe@${approvedDomains[0] || "college.edu"},9876543212,BTECH,Computer Science & Engineering,A,2027,8.85\n`;

    const blob = new Blob([headers + sampleRow], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = type === "csv" ? "Student_Onboarding_Template.csv" : "Student_Onboarding_Template.xlsx";
    link.click();
    toast.success(`Downloaded official ${type.toUpperCase()} student import template`);
  };

  // File Upload parsing
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFile(file);

      toast.loading("Analyzing spreadsheet headers and rows...", { id: "upload-parsing" });

      if (file.name.endsWith(".csv")) {
        const reader = new FileReader();
        reader.onload = async (event) => {
          const text = event.target?.result as string;
          Papa.parse(text, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
              toast.dismiss("upload-parsing");
              const parsedRows = results.data as any[];
              
              const getVal = (row: any, keys: string[]) => {
                for (const k of keys) {
                  if (row[k] !== undefined) return String(row[k]).trim();
                }
                return "";
              };

              const mappedStudents: any[] = [];
              const fileErrors: ImportErrorDetail[] = [];
              let validCount = 0;
              let errorCount = 0;
              let duplicateCount = 0;

              const seenRolls = new Set<string>();
              const seenPersonalEmails = new Set<string>();

              for (let i = 0; i < parsedRows.length; i++) {
                const row = parsedRows[i];
                const rowNum = i + 1;
                const errors: string[] = [];

                 const rollNumber = getVal(row, ["Roll_Number", "Roll Number", "rollNumber", "roll_number"]);
                 const firstName = getVal(row, ["First_Name", "First Name", "firstName", "first_name"]);
                 const lastName = getVal(row, ["Last_Name", "Last Name", "lastName", "last_name"]);
                 const personalEmail = getVal(row, ["Personal_Email", "Personal Email", "personalEmail", "personal_email"]);
                 const officialEmail = getVal(row, ["Official_Email", "Official Email", "officialEmail", "official_email"]);
                 const contactNumber = getVal(row, ["Contact_Number", "Contact Number", "contactNumber", "contact_number"]);
                 const degree = getVal(row, ["Degree", "Degree / Program", "Degree_or_Program", "joined_course", "joinedCourse"]);
                 const department = getVal(row, ["Department", "department"]);
                 const section = getVal(row, ["Section", "section"]);
                 const graduationYearStr = getVal(row, ["Graduation_Year", "Graduation Year", "graduationYear", "graduation_year"]);
                 const cgpaStr = getVal(row, ["CGPA_or_Percentage", "CGPA", "cgpa"]);
 
                 if (!rollNumber) errors.push("Roll Number is required.");
                 if (!firstName) errors.push("First Name is required.");
                 if (!lastName) errors.push("Last Name is required.");
                 if (!personalEmail) errors.push("Personal Email is required.");
                 if (!contactNumber) errors.push("Contact Number is required.");
                 if (!section) errors.push("Section is required.");
                 if (!graduationYearStr) errors.push("Graduation Year is required.");

                 if (!degree) {
                   errors.push("Degree is required.");
                 } else if (selectedCollege && selectedCollege.academicProfile) {
                   let degreeExists = false;
                   let departmentsForDegree: string[] = [];
                   
                   Object.values(selectedCollege.academicProfile).forEach((levelMap: any) => {
                     if (levelMap && typeof levelMap === "object") {
                       Object.values(levelMap).forEach((degreeMap: any) => {
                         if (degreeMap && typeof degreeMap === "object") {
                           if (degreeMap[degree]) {
                             degreeExists = true;
                             if (Array.isArray(degreeMap[degree])) {
                               departmentsForDegree.push(...degreeMap[degree]);
                             }
                           }
                         }
                       });
                     }
                   });

                   if (!degreeExists) {
                     errors.push(`Degree '${degree}' is not configured for this college.`);
                   } else if (!department) {
                     errors.push("Department is required.");
                   } else {
                     const hasDept = departmentsForDegree.some(d => d.trim().toUpperCase() === department.trim().toUpperCase());
                     if (!hasDept) {
                       errors.push(`Department '${department}' is not configured under Degree '${degree}' for this college.`);
                     }
                   }
                 } else {
                   if (!department) errors.push("Department is required.");
                 }

                if (personalEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personalEmail)) {
                  errors.push("Invalid Personal Email format");
                }
                if (officialEmail) {
                  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(officialEmail)) {
                    errors.push("Invalid Official Email format");
                  } else {
                    const domain = officialEmail.split("@")[1]?.toLowerCase();
                    if (approvedDomains.length > 0 && !approvedDomains.map((d: string) => d.toLowerCase()).includes(domain)) {
                      errors.push(`Email does not belong to approved domains (${approvedDomains.join(", ")})`);
                    }
                  }
                }
                if (contactNumber && !/^\d{10}$/.test(contactNumber)) {
                  errors.push("Contact number must be exactly 10 digits");
                }
                if (graduationYearStr && (!/^\d{4}$/.test(graduationYearStr) || parseInt(graduationYearStr) < 1900 || parseInt(graduationYearStr) > 2100)) {
                  errors.push("Graduation Year must be a valid 4-digit year");
                }
                if (cgpaStr && (isNaN(parseFloat(cgpaStr)) || parseFloat(cgpaStr) < 0 || parseFloat(cgpaStr) > 10)) {
                  errors.push("CGPA must be a number between 0 and 10");
                }

                if (rollNumber) {
                  const upperRoll = rollNumber.toUpperCase();
                  if (seenRolls.has(upperRoll)) {
                    errors.push("Duplicate Roll Number in file");
                  } else {
                    seenRolls.add(upperRoll);
                  }
                }
                if (personalEmail) {
                  const lowerPEmail = personalEmail.toLowerCase();
                  if (seenPersonalEmails.has(lowerPEmail)) {
                    errors.push("Duplicate Personal Email in file");
                  } else {
                    seenPersonalEmails.add(lowerPEmail);
                  }
                }

                if (errors.length > 0) {
                  errorCount++;
                  errors.forEach(err => {
                    fileErrors.push({
                      row: rowNum,
                      column: "Validation",
                      error: err
                    });
                  });
                } else {
                  validCount++;
                   mappedStudents.push({
                    rollNumber: rollNumber.toUpperCase(),
                    firstName,
                    lastName,
                    personalEmail,
                    officialEmail: officialEmail || undefined,
                    contactNumber,
                    joinedCourse: degree,
                    department,
                    section: section.toUpperCase(),
                    graduationYear: parseInt(graduationYearStr),
                    cgpa: cgpaStr ? parseFloat(cgpaStr) : undefined,
                    status: "Active"
                  });
                }
              }

              for (const stud of mappedStudents) {
                const dup = students.find((s: any) => s.rollNumber === stud.rollNumber);
                if (dup) {
                  duplicateCount++;
                }
              }

              setPreviewData({
                fileName: file.name,
                totalRows: parsedRows.length,
                validCount: validCount - duplicateCount,
                errorCount,
                duplicateCount,
                records: mappedStudents,
                errors: fileErrors
              });

              setImportStage("preview");
              toast.success("Spreadsheet parsed successfully");
            },
            error: (err: any) => {
              toast.dismiss("upload-parsing");
              toast.error("Failed to parse CSV file: " + err.message);
            }
          });
        };
        reader.readAsText(file);
      } else {
        toast.dismiss("upload-parsing");
        toast.error("Direct Excel .xlsx parsing is not supported. Please convert your file to CSV format to import.");
      }
    }
  };

  const handleDownloadErrorFile = async (importId: string) => {
    try {
      toast.loading("Generating error report...", { id: "error-download" });
      const response = await StudentService.getImportFailedRows(collegeCode, importId);
      
      const blob = new Blob([response.data], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Import_Errors_${importId}.csv`;
      link.click();
      
      toast.dismiss("error-download");
      toast.success("Error report downloaded");
    } catch (err) {
      toast.dismiss("error-download");
      toast.error("Failed to download error report");
    }
  };

  const handleProceedImport = async () => {
    if (!previewData) return;

    setImportStage("processing");
    setImportProgress(0);

    const currentUser = AuthService.getUser();
    const collegeCodeVal = currentUser?.college_code || collegeCode;
    const importedByVal = currentUser?.username || currentUser?.email || "Super Admin";

    try {
      setImportProgress(25);
      const result = await StudentService.bulkImportStudents(
        collegeCodeVal,
        previewData.records,
        duplicateStrategy,
        previewData.fileName,
        importedByVal
      );
      setImportProgress(75);

      const newHist: ImportHistory = {
        id: result.importId,
        fileName: previewData.fileName,
        importedBy: importedByVal,
        importDate: new Date().toLocaleString("en-US", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true
        }),
        successCount: result.successCount,
        failedCount: result.failedCount,
        skippedCount: result.skippedCount,
        collegeCode: collegeCodeVal,
        errors: result.errors
      };

      setImportHistory(prev => [newHist, ...prev]);

      const updatedList = await StudentService.fetchStudents(collegeCodeVal);
      setStudents(updatedList);

      setPreviewData((prev: any) => ({
        ...prev,
        importId: result.importId,
        validCount: result.successCount,
        skippedCount: result.skippedCount,
        errorCount: result.failedCount,
        errors: result.errors
      }));

      setImportProgress(100);
      setImportStage("result");

      if (result.failedCount > 0) {
        toast.error("Import completed with errors. Some records failed to insert.");
        handleDownloadErrorFile(result.importId);
      } else {
        toast.success(`${result.successCount} Students Imported Successfully!`);
      }
    } catch (err: any) {
      setImportStage("preview");
      toast.error(err?.response?.data?.message || "Bulk import failed.");
    }
  };

  const handleDownloadErrorReport = (errors: ImportErrorDetail[]) => {
    const headers = "Row,Column,Error\n";
    const rows = errors.map(e => `${e.row},"${e.column}","${e.error}"`).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Import_Errors_${Date.now()}.csv`;
    link.click();
    toast.success("Error report downloaded");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 relative">

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
            <span>Colleges</span>
            <ChevronDown className="w-3 h-3 rotate-270" />
            <span>{collegeName} ({collegeCode})</span>
            <ChevronDown className="w-3 h-3 rotate-270" />
            <span className="text-foreground">Students</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight mt-2">Manage Students</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Add, import and manage students for this college.</p>
        </div>

        {/* Actions bar */}
        <div className="flex items-center gap-2">
          <div className="px-4 py-2 rounded-xl border bg-card text-xs font-semibold">
            {collegeName} ({collegeCode})
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDownloadTemplate("csv")}
            className="rounded-xl flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" /> CSV Template
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDownloadTemplate("excel")}
            className="rounded-xl flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" /> Excel Template
          </Button>

          <Button
            size="sm"
            onClick={() => router.push("/super-admin/student/create")}
            className="rounded-xl flex items-center gap-1.5 bg-primary text-primary-foreground hover:bg-primary/95"
          >
            <Plus className="w-3.5 h-3.5" /> Add Student
          </Button>
        </div>
      </div>

      {/* Dynamic Tabs */}
      <div className="flex border-b border-border">
        {[
          { id: "all", label: "All Students", icon: Users },
          { id: "import", label: "Bulk Import", icon: Upload },
          { id: "history", label: "Import History", icon: History }
        ].map(t => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => {
                setActiveTab(t.id as any);
                setUploadedFile(null);
                setImportStage("upload");
              }}
              className={`flex items-center gap-2 px-6 py-3 border-b-2 text-xs font-bold transition-all ${isActive
                ? "border-primary text-primary font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: ALL STUDENTS */}
      {activeTab === "all" && (
        <div className="space-y-6 animate-in fade-in duration-300">

          {/* Analytics Overview Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: "Total Students", count: metrics.total, color: "text-blue-500", bg: "bg-blue-500/10" },
              { label: "Pre Final Year Students", count: metrics.preFinal, color: "text-amber-500", bg: "bg-amber-500/10" },
              { label: "Final Year Students", count: metrics.final, color: "text-emerald-500", bg: "bg-emerald-500/10" },
              { label: "Active Students", count: metrics.active, color: "text-indigo-500", bg: "bg-indigo-500/10" },
              { label: "Import Errors Logged", count: metrics.errors, color: "text-rose-500", bg: "bg-rose-500/10" }
            ].map((c) => (
              <div key={c.label} className="bg-card border border-border p-4 rounded-2xl shadow-sm space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">{c.label}</span>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-extrabold tracking-tight font-mono">{c.count}</span>
                  <div className={`w-6 h-6 rounded-lg ${c.bg} flex items-center justify-center`}>
                    <GraduationCap className={`w-3.5 h-3.5 ${c.color}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Search & Filters */}
          <div className="bg-card border border-border p-4 rounded-2xl shadow-sm space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by Roll Number, Name, Email, Contact..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 rounded-xl text-xs h-9"
                />
              </div>

              {/* Filters dropdowns */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Dept */}
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="bg-background border border-input rounded-xl p-1.5 text-xs text-foreground max-w-[150px] truncate"
                >
                  <option value="All">All Departments</option>
                  {uniqueDepartments.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>

                {/* Section */}
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="bg-background border border-input rounded-xl p-1.5 text-xs text-foreground"
                >
                  <option value="All">All Sections</option>
                  {uniqueSections.map(sec => (
                    <option key={sec} value={sec}>Section {sec}</option>
                  ))}
                </select>

                {/* Grad Year */}
                <select
                  value={selectedGradYear}
                  onChange={(e) => setSelectedGradYear(e.target.value)}
                  className="bg-background border border-input rounded-xl p-1.5 text-xs text-foreground"
                >
                  <option value="All">All Batches</option>
                  {uniqueGradYears.map(y => (
                    <option key={y} value={y}>{y} Batch</option>
                  ))}
                </select>

                {/* Status */}
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="bg-background border border-input rounded-xl p-1.5 text-xs text-foreground"
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bulk Action Panel */}
          {checkedIds.length > 0 && (
            <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl flex items-center justify-between animate-in slide-in-from-top-4 duration-300">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold font-mono">
                  {checkedIds.length}
                </div>
                <span className="text-xs font-semibold text-foreground">Selected Student Records</span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleBulkExport}
                  className="rounded-lg text-xs font-bold flex items-center gap-1 border-primary/30 text-primary hover:bg-primary/5"
                >
                  <Download className="w-3.5 h-3.5" /> Export CSV
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleBulkDeactivate}
                  className="rounded-lg text-xs font-bold flex items-center gap-1 border-destructive/20 text-destructive hover:bg-destructive/5"
                >
                  <X className="w-3.5 h-3.5" /> Deactivate Selected
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleBulkDelete}
                  className="rounded-lg text-xs font-bold flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete Selected
                </Button>
              </div>
            </div>
          )}

          {/* Students Table */}
          <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                    <th className="p-4 w-12 text-center">
                      <input
                        type="checkbox"
                        checked={filteredStudents.length > 0 && checkedIds.length === filteredStudents.length}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="accent-primary w-4 h-4 cursor-pointer"
                      />
                    </th>
                    <th className="p-4">Roll Number</th>
                    <th className="p-4">Student Name</th>
                    <th className="p-4">Department</th>
                    <th className="p-4 text-center">Sec</th>
                    <th className="p-4 text-center">Grad Year</th>
                    <th className="p-4 text-center">CGPA</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-xs font-medium">
                  {filteredStudents.map((stud) => {
                    const isChecked = checkedIds.includes(stud.rollNumber);
                    const isDropdownOpen = openDropdownId === stud.rollNumber;
                    return (
                      <tr
                        key={stud.rollNumber}
                        className={`hover:bg-muted/30 transition-all ${isChecked ? "bg-primary/5" : ""}`}
                      >
                        <td className="p-4 text-center">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => handleSelectRow(stud.rollNumber, e.target.checked)}
                            className="accent-primary w-4 h-4 cursor-pointer"
                          />
                        </td>
                        <td className="p-4 font-mono font-bold text-primary">{stud.rollNumber}</td>
                        <td className="p-4 font-bold text-foreground">
                          {stud.firstName} {stud.lastName}
                        </td>
                        <td className="p-4 max-w-[160px] truncate" title={stud.department}>
                          {stud.department}
                        </td>
                        <td className="p-4 text-center font-bold text-muted-foreground">{stud.section}</td>
                        <td className="p-4 text-center font-mono font-bold">{stud.graduationYear}</td>
                        <td className="p-4 text-center font-mono font-extrabold text-foreground">{stud.cgpa?.toFixed(2) || "N/A"}</td>
                        <td className="p-4">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-extrabold ${stud.status === "Active" ? "bg-emerald-500/10 text-emerald-600" : "bg-slate-500/10 text-slate-600"
                            }`}>
                            {stud.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                className="p-1 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted focus:outline-none"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40 p-1.5 space-y-0.5 rounded-xl shadow-xl bg-card border border-border z-50">
                              <DropdownMenuItem
                                onClick={() => setViewStudent(stud)}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold hover:bg-muted text-foreground transition-all cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" /> View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => router.push(`/super-admin/student/edit/${stud.rollNumber}`)}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold hover:bg-muted text-foreground transition-all cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5" /> Edit Profile
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleToggleStatus(stud)}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold hover:bg-muted text-foreground transition-all cursor-pointer"
                              >
                                <UserCheck className="w-3.5 h-3.5" /> Toggle Status
                              </DropdownMenuItem>
                              <div className="border-t border-border my-1" />
                              <DropdownMenuItem
                                onClick={() => router.push(`/super-admin/student/delete/${stud.rollNumber}`)}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold hover:bg-destructive/10 text-destructive transition-all cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredStudents.length === 0 && (
                    <tr>
                      <td colSpan={10} className="p-8 text-center space-y-4">
                        <span className="text-4xl block">👨‍🎓</span>
                        <h3 className="font-bold text-foreground text-sm">No Students Found</h3>
                        <p className="text-xs text-muted-foreground max-w-xs mx-auto">No records match your criteria. Add new students or perform a bulk onboarding import.</p>
                        <Button
                          size="sm"
                          onClick={() => setActiveTab("import")}
                          className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-bold"
                        >
                          Import Students
                        </Button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: BULK IMPORT WORKFLOW */}
      {activeTab === "import" && (
        <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">

          {/* UPLOAD SCREEN */}
          {importStage === "upload" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* Left 2 Cols: Drag & Drop upload zone and strategy */}
              <div className="md:col-span-2 space-y-6">
                <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-5">
                  <h3 className="font-bold text-sm text-foreground flex items-center gap-2 border-b border-border pb-3">
                    <Upload className="w-4 h-4 text-primary" /> Onboard Student Spreadsheet
                  </h3>

                  {/* Upload Drop Zone */}
                  <div className="border-2 border-dashed border-border rounded-xl p-8 bg-muted/10 hover:bg-muted/20 transition-all flex flex-col items-center justify-center text-center space-y-4 relative">
                    <input
                      type="file"
                      accept=".csv, .xlsx"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <FileCheck className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-foreground block">
                        Drag & Drop student file here, or choose file
                      </span>
                      <span className="text-[10px] text-muted-foreground block mt-1">
                        Supported file formats: CSV, XLSX. Maximum size: 10MB
                      </span>
                    </div>
                  </div>

                  {/* Duplicate Strategy options */}
                  <div className="space-y-3 pt-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Duplicate Records Handling</label>
                    <div className="flex gap-4">
                      {[
                        { id: "skip", label: "Skip duplicate rows", desc: "Keep original entries and ignore imports" },
                        { id: "update", label: "Update existing records", desc: "Overwrite existing record details" }
                      ].map(str => (
                        <button
                          type="button"
                          key={str.id}
                          onClick={() => setDuplicateStrategy(str.id as any)}
                          className={`flex-1 p-3.5 rounded-xl border text-left transition-all ${duplicateStrategy === str.id
                            ? "bg-primary/5 border-primary text-primary shadow-sm"
                            : "border-border text-foreground hover:bg-muted"
                            }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              checked={duplicateStrategy === str.id}
                              onChange={() => setDuplicateStrategy(str.id as any)}
                              className="accent-primary w-4 h-4 pointer-events-none"
                            />
                            <span className="text-xs font-bold">{str.label}</span>
                          </div>
                          <span className="text-[10px] text-muted-foreground block mt-1 pl-6">{str.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right 1 Col: Guidelines checklist */}
              <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-4 h-fit">
                <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground border-b border-border pb-2">Import Guidelines</h3>
                <ul className="space-y-3 text-[11px] text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Download and use our official CSV or Excel template.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Do not rename, delete or reorder any column headers.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Roll_Number, First_Name, Last_Name, and Section are strictly mandatory.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Official email addresses must match approved domain: <strong>{approvedDomains[0] || "college.edu"}</strong>.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Verify that the assigned Departments exist in the academic taxonomy list.</span>
                  </li>
                </ul>
              </div>

            </div>
          )}

          {/* PREVIEW AND VALIDATION SCREEN */}
          {importStage === "preview" && previewData && (
            <div className="space-y-6">

              {/* File details overview */}
              <div className="bg-card border border-border p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Selected File</span>
                  <h3 className="font-extrabold text-foreground text-sm mt-0.5">{previewData.fileName}</h3>
                  <span className="text-[10px] text-muted-foreground block mt-0.5">{previewData.totalRows} Total Records Found</span>
                </div>

                {/* Overview counts */}
                <div className="flex gap-3">
                  <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center">
                    <span className="text-[10px] text-emerald-600 uppercase font-bold block">Valid Rows</span>
                    <span className="text-sm font-bold font-mono text-emerald-700">{previewData.validCount}</span>
                  </div>
                  <div className="px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-center">
                    <span className="text-[10px] text-amber-600 uppercase font-bold block">Duplicates</span>
                    <span className="text-sm font-bold font-mono text-amber-700">{previewData.duplicateCount}</span>
                  </div>
                  <div className="px-4 py-2 bg-rose-500/10 border border-rose-500/20 rounded-xl text-center">
                    <span className="text-[10px] text-rose-600 uppercase font-bold block">Errors</span>
                    <span className="text-sm font-bold font-mono text-rose-700">{previewData.errorCount}</span>
                  </div>
                </div>
              </div>

              {/* Validation Warnings / Error log */}
              {previewData.errorCount > 0 && (
                <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-rose-500" />
                      <h3 className="font-bold text-sm">Validation Pipeline Errors ({previewData.errorCount})</h3>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownloadErrorReport(previewData.errors)}
                      className="rounded-xl flex items-center gap-1.5 border-rose-200 text-rose-600 hover:bg-rose-50/50"
                    >
                      <Download className="w-3.5 h-3.5" /> Download Error Report
                    </Button>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    The validation pipeline flagged the following rows. You can proceed with importing only the valid rows ({previewData.validCount}), or download the full error report to correct your file.
                  </p>

                  <div className="border border-border rounded-xl overflow-hidden divide-y divide-border text-xs max-h-[250px] overflow-y-auto pr-1">
                    {previewData.errors.map((err, idx) => (
                      <div key={idx} className="p-3 flex items-start gap-4 hover:bg-muted/10 transition-all">
                        <span className="font-bold text-[10px] bg-muted px-2 py-0.5 rounded text-muted-foreground font-mono">Row {err.row}</span>
                        <div>
                          <strong className="text-foreground block">{err.column}</strong>
                          <span className="text-rose-500 block mt-0.5 text-[11px] font-medium">{err.error}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setUploadedFile(null);
                    setPreviewData(null);
                    setImportStage("upload");
                  }}
                  className="rounded-xl text-xs font-bold"
                >
                  Cancel & Reupload
                </Button>
                <Button
                  onClick={handleProceedImport}
                  className="rounded-xl text-xs font-bold bg-primary hover:bg-primary/95 text-primary-foreground shadow"
                >
                  Proceed to Import Valid Rows
                </Button>
              </div>

            </div>
          )}

          {/* PROCESSING / LOADER SCREEN */}
          {importStage === "processing" && (
            <div className="bg-card border border-border p-12 rounded-2xl shadow-sm flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
              <div className="space-y-1.5">
                <h3 className="font-bold text-sm text-foreground">Importing Students Batch...</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">Processing database insertions, indexing, and validating unique indexes. Please wait...</p>
              </div>

              {/* Progress Bar */}
              <div className="w-full max-w-md space-y-2">
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${importProgress}%` }}
                  />
                </div>
                <span className="text-[10px] font-bold text-muted-foreground font-mono">{importProgress}% Completed</span>
              </div>
            </div>
          )}

          {/* RESULT SUMMARY CARD SCREEN */}
          {importStage === "result" && previewData && (
            <div className="space-y-6">

              <div className="bg-card border border-border p-8 rounded-2xl shadow-sm text-center flex flex-col items-center justify-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-emerald-500" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-base text-foreground">Import Completed Successfully</h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">The validation and batch insertion pipeline has completed for {previewData.fileName}.</p>
                </div>

                {/* Import stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-lg pt-4">
                  {[
                    { label: "Total Rows", val: previewData.totalRows, color: "text-foreground" },
                    { label: "Imported Successfully", val: previewData.validCount, color: "text-emerald-500" },
                    { label: "Skipped (Duplicates)", val: previewData.duplicateCount, color: "text-amber-500" },
                    { label: "Failed (Errors)", val: previewData.errorCount, color: "text-rose-500" }
                  ].map((s) => (
                    <div key={s.label} className="bg-muted/30 border border-border p-3.5 rounded-xl">
                      <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">{s.label}</span>
                      <strong className={`text-xl font-extrabold font-mono block mt-1 ${s.color}`}>{s.val}</strong>
                    </div>
                  ))}
                </div>

                {/* Error downloads action */}
                {previewData.errorCount > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => previewData.importId && handleDownloadErrorFile(previewData.importId)}
                    className="rounded-xl flex items-center gap-1.5 border-rose-200 text-rose-600 hover:bg-rose-50/50 mt-2"
                  >
                    <Download className="w-3.5 h-3.5" /> Download Error File ({previewData.errorCount} Rows)
                  </Button>
                )}
              </div>

              {/* Bottom return action */}
              <div className="flex justify-center">
                <Button
                  onClick={() => {
                    setUploadedFile(null);
                    setPreviewData(null);
                    setImportStage("upload");
                    setActiveTab("all");
                  }}
                  className="rounded-xl text-xs font-bold px-6 bg-primary text-primary-foreground shadow"
                >
                  Return to Student Directory
                </Button>
              </div>

            </div>
          )}

        </div>
      )}

      {/* TAB 3: IMPORT HISTORY */}
      {activeTab === "history" && (
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden animate-in fade-in duration-300">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                  <th className="p-4">File Name</th>
                  <th className="p-4">Imported By</th>
                  <th className="p-4">Import Date</th>
                  <th className="p-4 text-center">Success Rows</th>
                  <th className="p-4 text-center">Skipped Rows</th>
                  <th className="p-4 text-center">Failed Rows</th>
                  <th className="p-4 text-center">Success Rate</th>
                  {/* <th className="p-4 text-right pr-6">Actions</th> */}
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-xs font-medium">
                {importHistory.map((hist) => {
                  const total = hist.successCount + hist.failedCount + hist.skippedCount;
                  const rate = total > 0 ? ((hist.successCount / total) * 100).toFixed(1) : "0.0";
                  return (
                    <tr key={hist.id} className="hover:bg-muted/30 transition-all">
                      <td className="p-4 font-bold text-foreground flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary shrink-0" />
                        <span>{hist.fileName}</span>
                      </td>
                      <td className="p-4">{hist.importedBy}</td>
                      <td className="p-4 font-mono text-muted-foreground">{hist.importDate}</td>
                      <td className="p-4 text-center font-bold text-emerald-600">{hist.successCount}</td>
                      <td className="p-4 text-center font-semibold text-amber-600">{hist.skippedCount}</td>
                      <td className="p-4 text-center font-bold text-rose-500">{hist.failedCount}</td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${parseFloat(rate) >= 90 ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"
                          }`}>
                          {rate}%
                        </span>
                      </td>
                      {/* <td className="p-4 text-right pr-6 space-x-1.5">
                        {hist.failedCount > 0 ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownloadErrorFile(hist.id)}
                            className="rounded-lg h-7 px-2 text-[10px] font-bold border-rose-200 text-rose-600 hover:bg-rose-50/50"
                          >
                            Download Errors
                          </Button>
                        ) : (
                          <span className="text-[10px] text-muted-foreground italic mr-2">No errors</span>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setActiveTab("import");
                            setUploadedFile(null);
                            setImportStage("upload");
                            toast.info(`Ready to re-import database file for ${hist.fileName}`);
                          }}
                          className="rounded-lg h-7 px-2 text-[10px] font-bold text-primary hover:bg-primary/5"
                        >
                          <RefreshCw className="w-3 h-3 inline mr-1" /> Re-import
                        </Button>
                      </td> */}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* STUDENT DETAILS SLIDE-OUT DRAWER */}
      {viewStudent && (
        <>
          <div
            onClick={() => setViewStudent(null)}
            className="fixed inset-0 bg-black/45 z-45 backdrop-blur-sm animate-in fade-in duration-300"
          />
          <div className="fixed inset-y-0 right-0 w-full max-w-md bg-card border-l border-border shadow-2xl z-50 flex flex-col justify-between animate-in slide-in-from-right duration-300">
            <div className="p-6 overflow-y-auto space-y-6 flex-1">

              {/* Header */}
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-extrabold text-sm">
                    {viewStudent.firstName[0]}{viewStudent.lastName[0]}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-foreground">{viewStudent.firstName} {viewStudent.lastName}</h3>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{viewStudent.rollNumber}</span>
                  </div>
                </div>
                <button
                  onClick={() => setViewStudent(null)}
                  className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status Badge */}
              <div className="flex items-center justify-between bg-muted/30 p-3 rounded-xl border border-border/50 text-xs">
                <span className="text-muted-foreground font-medium">Status</span>
                <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold ${viewStudent.status === "Active" ? "bg-emerald-500/10 text-emerald-600" : "bg-slate-500/10 text-slate-600"
                  }`}>
                  {viewStudent.status}
                </span>
              </div>

              {/* Personal Information */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-1">Personal Information</h4>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-muted-foreground block">Roll Number</span>
                    <strong className="text-foreground block mt-0.5">{viewStudent.rollNumber}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Full Name</span>
                    <strong className="text-foreground block mt-0.5">{viewStudent.firstName} {viewStudent.lastName}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Personal Email</span>
                    <strong className="text-foreground font-mono block mt-0.5">{viewStudent.personalEmail}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Official Email</span>
                    <strong className="text-foreground font-mono block mt-0.5">{viewStudent.officialEmail || "N/A"}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Contact Number</span>
                    <strong className="text-foreground font-mono block mt-0.5">{viewStudent.contactNumber}</strong>
                  </div>
                </div>
              </div>

              {/* Academic Details */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-1">Academic Information</h4>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="col-span-2">
                    <span className="text-muted-foreground block">Department</span>
                    <strong className="text-foreground block mt-0.5">{viewStudent.department}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Section</span>
                    <strong className="text-foreground block mt-0.5">Sec {viewStudent.section}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Graduation Year</span>
                    <strong className="text-foreground block mt-0.5">{viewStudent.graduationYear} Batch</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">CGPA Score</span>
                    <strong className="text-foreground font-mono font-extrabold block mt-0.5">{viewStudent.cgpa?.toFixed(2) || "N/A"}</strong>
                  </div>
                </div>
              </div>

              {/* Placement Details */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-1">Placement Information</h4>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-muted-foreground block">Resume Uploaded</span>
                    <strong className="text-foreground block mt-0.5">🟢 Yes</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Placement Eligibility</span>
                    <strong className="text-foreground block mt-0.5">
                      {viewStudent.cgpa && viewStudent.cgpa >= 6.0 ? "✔ Eligible" : "❌ Ineligible (Low CGPA)"}
                    </strong>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground block">Assigned Skill Profile</span>
                    <strong className="text-foreground block mt-0.5">Python, Java, Next.js, PostgreSQL</strong>
                  </div>
                </div>
              </div>

              {/* Activity Details */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-1">Audit Details</h4>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-muted-foreground block">Created Date</span>
                    <strong className="text-foreground block mt-0.5">{viewStudent.createdDate}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Imported By</span>
                    <strong className="text-foreground block mt-0.5">Super Admin (Spreadsheet)</strong>
                  </div>
                </div>
              </div>

            </div>

            {/* Footer actions */}
            <div className="p-4 bg-muted/20 border-t border-border flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setViewStudent(null)}
                className="flex-1 py-5 rounded-xl text-xs font-bold"
              >
                Close Drawer
              </Button>
              <Button
                type="button"
                onClick={() => {
                  router.push(`/super-admin/student/edit/${viewStudent.rollNumber}`);
                  setViewStudent(null);
                }}
                className="flex-1 py-5 bg-primary hover:bg-primary/95 text-primary-foreground rounded-xl text-xs font-bold"
              >
                Edit Student Profile
              </Button>
            </div>
          </div>
        </>
      )}

    </div>
  );
}