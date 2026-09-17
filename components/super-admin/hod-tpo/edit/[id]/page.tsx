"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  X,
  Check,
  CheckCircle2,
  XCircle,
  Search,
  ChevronRight,
  BookOpen,
  GraduationCap,
  Users,
  Briefcase,
  User,
  Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Staff,
  getStoredColleges,
  addActivity,
  College
} from "@/lib/mockColleges";
import StaffService from "@/services/staff.service";
import AuthService from "@/services/auth.service";
import { fetchColleges } from "@/services/college.service";

// Academic Taxonomy for staff assignment tree
const ACADEMIC_TAXONOMY = [
  {
    id: "Engineering",
    name: "Engineering & Technology",
    levels: [
      {
        id: "UG",
        name: "Undergraduate (UG)",
        degrees: [
          {
            id: "B.Tech / B.E.",
            name: "B.Tech / B.E.",
            departments: [
              "Computer Science & Engineering (CSE)",
              "CSE – Artificial Intelligence & Machine Learning (AI/ML)",
              "CSE – Data Science",
              "CSE – Cyber Security",
              "Electronics & Communication Engineering (ECE)",
              "Mechanical Engineering",
              "Civil Engineering",
              "Electrical & Electronics Engineering (EEE)",
              "Information Technology (IT)",
              "Biotechnology"
            ]
          }
        ]
      },
      {
        id: "PG",
        name: "Postgraduate (PG)",
        degrees: [
          {
            id: "M.Tech / M.E.",
            name: "M.Tech / M.E.",
            departments: [
              "Computer Science & Engineering",
              "Data Science & Analytics",
              "VLSI & Embedded Systems",
              "Power Electronics",
              "Thermal Engineering",
              "Structural Engineering"
            ]
          }
        ]
      },
      {
        id: "Integrated",
        name: "Integrated Degree",
        degrees: [
          {
            id: "Integrated B.Tech + M.Tech",
            name: "Integrated B.Tech + M.Tech",
            departments: [
              "Computer Science & Engineering",
              "Software Engineering",
              "Electronics & Communication"
            ]
          }
        ]
      },
      {
        id: "Diploma",
        name: "Diploma",
        degrees: [
          {
            id: "Polytechnic Diploma",
            name: "Polytechnic Diploma",
            departments: [
              "Mechanical Engineering",
              "Civil Engineering",
              "Electrical Engineering",
              "Computer Engineering",
              "Electronics & Communication Engineering"
            ]
          }
        ]
      }
    ]
  },
  {
    id: "Management",
    name: "Management / Business School",
    levels: [
      {
        id: "PG",
        name: "Postgraduate (PG)",
        degrees: [
          {
            id: "MBA / PGDM",
            name: "MBA / PGDM",
            departments: [
              "Finance",
              "Marketing Management",
              "Human Resource Management (HR)",
              "Operations & Supply Chain Management",
              "Business Analytics",
              "International Business",
              "Information Technology (IT) Management"
            ]
          },
          {
            id: "Executive MBA",
            name: "Executive MBA",
            departments: [
              "General Management",
              "Strategic Leadership",
              "Operations & Supply Chain"
            ]
          }
        ]
      },
      {
        id: "UG",
        name: "Undergraduate (UG)",
        degrees: [
          {
            id: "BBA / BMS / BBM",
            name: "BBA / BMS / BBM",
            departments: [
              "General Management",
              "Finance & Banking",
              "Marketing & Digital Media",
              "Human Resource Management",
              "Family Business & Entrepreneurship"
            ]
          }
        ]
      },
      {
        id: "Integrated",
        name: "Integrated Degree",
        degrees: [
          {
            id: "Integrated BBA + MBA",
            name: "Integrated BBA + MBA",
            departments: [
              "Integrated Management Studies (General Stream)"
            ]
          }
        ]
      }
    ]
  },
  {
    id: "ArtsScienceCommerce",
    name: "Arts, Science & Commerce",
    levels: [
      {
        id: "ComputerApplications",
        name: "Computer Applications",
        degrees: [
          {
            id: "MCA",
            name: "MCA",
            departments: [
              "Software Development",
              "Cloud Computing & DevOps",
              "Data Analytics",
              "Mobile Application Development"
            ]
          },
          {
            id: "BCA",
            name: "BCA",
            departments: [
              "General Computer Applications",
              "Data Science / AI Micro-credentials",
              "Web Technologies"
            ]
          },
          {
            id: "B.Sc (CS / IT)",
            name: "B.Sc (CS / IT)",
            departments: [
              "Computer Science (Hons)",
              "Information Technology",
              "Software Systems"
            ]
          },
          {
            id: "M.Sc (CS / IT)",
            name: "M.Sc (CS / IT)",
            departments: [
              "Advanced Computer Science",
              "Data Science & Artificial Intelligence",
              "Information Security"
            ]
          }
        ]
      },
      {
        id: "CommerceFinance",
        name: "Commerce & Finance",
        degrees: [
          {
            id: "B.Com / B.Com (Hons)",
            name: "B.Com / B.Com (Hons)",
            departments: [
              "General Commerce",
              "Accounting & Finance",
              "Banking & Insurance",
              "Computer Applications in Commerce",
              "Taxation"
            ]
          },
          {
            id: "M.Com",
            name: "M.Com",
            departments: [
              "Advanced Accountancy",
              "Business Management",
              "Financial Analysis & Banking"
            ]
          }
        ]
      },
      {
        id: "PureSciences",
        name: "Pure Sciences",
        degrees: [
          {
            id: "B.Sc / B.Sc (Hons)",
            name: "B.Sc / B.Sc (Hons)",
            departments: [
              "Mathematics",
              "Physics",
              "Chemistry",
              "Botany",
              "Zoology",
              "Biotechnology",
              "Statistics"
            ]
          },
          {
            id: "M.Sc",
            name: "M.Sc",
            departments: [
              "Mathematics",
              "Organic Chemistry",
              "Analytical Chemistry",
              "Physics",
              "Microbiology",
              "Biotechnology"
            ]
          }
        ]
      },
      {
        id: "ArtsHumanities",
        name: "Arts & Humanities",
        degrees: [
          {
            id: "BA / BA (Hons)",
            name: "BA / BA (Hons)",
            departments: [
              "English Literature",
              "Economics",
              "Political Science",
              "History",
              "Psychology",
              "Sociology"
            ]
          },
          {
            id: "MA",
            name: "MA",
            departments: [
              "English",
              "Economics",
              "Public Policy & Administration",
              "Clinical Psychology"
            ]
          }
        ]
      }
    ]
  }
];

interface EditStaffPageProps {
  staffId: string;
}

export default function EditStaffPage({ staffId }: EditStaffPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const collegeId = searchParams.get("collegeId") || "SVCE1234";

  // Load Configurations
  const [colleges, setColleges] = useState<College[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [staffRecord, setStaffRecord] = useState<Staff | null>(null);

  // Form Fields State
  const [empId, setEmpId] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"HOD" | "TPO">("HOD");

  // HOD specific state
  const [selectedDept, setSelectedDept] = useState("");
  const [deptSearchQuery, setDeptSearchQuery] = useState("");

  // TPO specific states
  const [accessScope, setAccessScope] = useState<"Entire College" | "Selected Departments">("Entire College");
  const [selectedTpoDepts, setSelectedTpoDepts] = useState<string[]>([]);
  const [tpoSearchQuery, setTpoSearchQuery] = useState("");

  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchColleges().then(cols => {
      setColleges(cols);
    }).catch(err => console.error(err));

    const currentUser = AuthService.getUser();
    const collegeCode = currentUser?.college_code || collegeId;

    StaffService.fetchStaff(collegeCode).then(stList => {
      setStaffList(stList);
      const record = stList.find((s: Staff) => s.id === staffId);
      if (record) {
        setStaffRecord(record);
        setEmpId(record.id);
        setFullName(record.name);
        setEmail(record.email);
        setPhone(record.phone);
        setRole(record.role);
        setSelectedDept(record.department || "");
        setAccessScope(record.accessScope || "Entire College");
        setSelectedTpoDepts(record.selectedDepartments || []);
        setIsActive(record.status === "Active");
      } else {
        toast.error("Staff member not found");
        router.push(`/super-admin/hod-tpo?collegeId=${collegeCode}`);
      }
    }).catch(err => {
      console.error("Failed to load staff record:", err);
      toast.error("Failed to load staff from server.");
    });
  }, [staffId, collegeId]);

  const selectedCollege = useMemo(() => {
    if (!staffRecord) return null;
    return colleges.find(c => String(c.id) === String(staffRecord.collegeId) || c.code === staffRecord.collegeId) || colleges[0] || null;
  }, [colleges, staffRecord]);

  // Duplicate checks excluding current editing record
  const isEmpIdDuplicate = useMemo(() => {
    return staffList.some(s => s.id !== staffId && s.id.toLowerCase().trim() === empId.toLowerCase().trim());
  }, [staffList, empId, staffId]);

  const isEmpIdOk = empId ? !isEmpIdDuplicate : false;

  const currentUser = AuthService.getUser();
  const collegeDomains = useMemo(() => {
    if (currentUser?.approved_domains && Array.isArray(currentUser.approved_domains)) {
      return currentUser.approved_domains;
    }
    return selectedCollege?.domains || [];
  }, [currentUser, selectedCollege]);
  const isEmailDomainOk = useMemo(() => {
    if (!email) return false;
    const parts = email.split("@");
    if (parts.length < 2) return false;
    const domain = parts[1].toLowerCase().trim();
    return collegeDomains.some((d: string) => domain === d.toLowerCase().trim());
  }, [email, collegeDomains]);

  // Filter HOD departments list based on search query
  const filteredTaxonomyDepts = useMemo(() => {
    const query = deptSearchQuery.toLowerCase().trim();
    const matches: { typeName: string; levelName: string; degName: string; deptName: string }[] = [];

    const profile = selectedCollege?.academicProfile || {};
    Object.entries(profile).forEach(([typeName, levelMap]: [string, any]) => {
      if (levelMap && typeof levelMap === "object") {
        Object.entries(levelMap).forEach(([levelName, degreeMap]: [string, any]) => {
          if (degreeMap && typeof degreeMap === "object") {
            Object.entries(degreeMap).forEach(([degName, depts]: [string, any]) => {
              if (Array.isArray(depts)) {
                depts.forEach((dept: string) => {
                  if (!query || dept.toLowerCase().includes(query)) {
                    matches.push({
                      typeName,
                      levelName,
                      degName,
                      deptName: dept
                    });
                  }
                });
              }
            });
          }
        });
      }
    });

    return matches;
  }, [selectedCollege, deptSearchQuery]);

  // Filter TPO selected departments checkbox list
  const tpoFilteredDepts = useMemo(() => {
    const query = tpoSearchQuery.toLowerCase().trim();
    const matches: string[] = [];
    const profile = selectedCollege?.academicProfile || {};
    Object.values(profile).forEach((levelMap: any) => {
      if (levelMap && typeof levelMap === "object") {
        Object.values(levelMap).forEach((degreeMap: any) => {
          if (degreeMap && typeof degreeMap === "object") {
            Object.values(degreeMap).forEach((depts: any) => {
              if (Array.isArray(depts)) {
                depts.forEach((dept: string) => {
                  if (!query || dept.toLowerCase().includes(query)) {
                    if (!matches.includes(dept)) {
                      matches.push(dept);
                    }
                  }
                });
              }
            });
          }
        });
      }
    });
    return matches;
  }, [selectedCollege, tpoSearchQuery]);

  const handleTpoDeptToggle = (dept: string) => {
    if (selectedTpoDepts.includes(dept)) {
      setSelectedTpoDepts(selectedTpoDepts.filter(d => d !== dept));
    if (errors.selectedTpoDepts) setErrors(prev => ({ ...prev, selectedTpoDepts: "" }));
    } else {
      setSelectedTpoDepts([...selectedTpoDepts, dept]);
    if (errors.selectedTpoDepts) setErrors(prev => ({ ...prev, selectedTpoDepts: "" }));
    }
  };

  const handleSaveChanges = async () => {
    if (!staffRecord) return;
    const tempErrors: Record<string, string> = {};

    if (!empId.trim()) {
      tempErrors.empId = "Employee ID is required";
    } else if (isEmpIdDuplicate) {
      tempErrors.empId = "Employee ID already exists";
    }

    if (!fullName.trim()) {
      tempErrors.fullName = "Full Name is required";
    }

    if (!email.trim()) {
      tempErrors.email = "Email Address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      tempErrors.email = "Invalid email address format";
    } else if (!isEmailDomainOk) {
      tempErrors.email = `Email must use approved domains: ${collegeDomains.join(" or ")}`;
    }

    if (!phone.trim()) {
      tempErrors.phone = "Phone Contact is required";
    } else if (!/^\+?[0-9\s\-]{8,15}$/.test(phone.trim())) {
      tempErrors.phone = "Please enter a valid phone number (8-15 digits)";
    }

    if (role === "HOD" && !selectedDept) {
      tempErrors.selectedDept = "HOD Department Allocation is required";
    }

    if (role === "TPO" && accessScope === "Selected Departments" && selectedTpoDepts.length === 0) {
      tempErrors.selectedTpoDepts = "Please select at least one department";
    }

    setErrors(tempErrors);

    if (Object.keys(tempErrors).length > 0) {
      toast.error("Please fill in all required fields correctly.");
      return;
    }

    const staffData = {
      name: fullName.trim(),
      phone: phone.trim(),
      role: role,
      status: isActive ? "Active" : "Inactive",
      department: role === "HOD" ? selectedDept : undefined,
      accessScope: role === "TPO" ? accessScope : undefined,
      selectedDepartments: role === "TPO" && accessScope === "Selected Departments" ? selectedTpoDepts : undefined
    };

    const currentUser = AuthService.getUser();
    const collegeCode = currentUser?.college_code || selectedCollege?.id || staffRecord.collegeId;

    try {
      await StaffService.updateStaff(collegeCode, staffId, staffData);
      toast.success("Staff profile saved successfully!");
      router.push(`/super-admin/hod-tpo?collegeId=${collegeCode}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update staff member.");
    }
  };

  if (!staffRecord) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-24 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Staff Member Profile</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Modify profile details and allocations for {fullName}.</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(`/super-admin/hod-tpo?collegeId=${selectedCollege?.id || staffRecord.collegeId}`)}
          className="rounded-xl flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" /> Cancel
        </Button>
      </div>

      <div className="space-y-6">
        
        {/* Section 1: Staff Information */}
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-5">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <User className="w-4 h-4 text-primary" />
            <h3 className="font-bold text-sm">Section 1 - Staff Information</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Employee ID */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="empId">Employee ID *</Label>
                {empId && (
                  <span className="text-[10px] font-bold">
                    {isEmpIdOk ? (
                      <span className="text-emerald-500 flex items-center gap-0.5"><CheckCircle2 className="w-3 h-3" /> Available</span>
                    ) : (
                      <span className="text-destructive flex items-center gap-0.5"><XCircle className="w-3 h-3" /> Already In Use</span>
                    )}
                  </span>
                )}
              </div>
              <Input
                id="empId"
                placeholder={`e.g. ${selectedCollege?.code || "SVCE"}-TPO-01`}
                value={empId}
                onChange={(e) => setEmpId(e.target.value)}
                className={`rounded-xl text-xs ${errors.empId ? "border-destructive focus-visible:ring-destructive/20" : ""}`}
              />
              {errors.empId && <p className="text-xs text-destructive mt-1">{errors.empId}</p>}
            </div>

            {/* Full Name */}
            <div className="space-y-1.5">
              <Label htmlFor="fullName" className={errors.fullName ? "text-destructive" : ""}>Full Name *</Label>
              <Input
                id="fullName"
                placeholder="Enter full name"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (errors.fullName) setErrors(prev => ({ ...prev, fullName: "" }));
                }}
                className={`rounded-xl text-xs ${errors.fullName ? "border-destructive focus-visible:ring-destructive/20" : ""}`}
              />
              {errors.fullName && <p className="text-xs text-destructive mt-1">{errors.fullName}</p>}
            </div>

            {/* Official Email */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="email" className={errors.email ? "text-destructive" : ""}>Official Email Address *</Label>
                {email && !errors.email && (
                  <span className="text-[10px] font-bold">
                    {isEmailDomainOk ? (
                      <span className="text-emerald-500 flex items-center gap-0.5"><CheckCircle2 className="w-3 h-3" /> Domain Verified</span>
                    ) : (
                      <span className="text-destructive flex items-center gap-0.5"><XCircle className="w-3 h-3" /> Must use {collegeDomains.join(" / ")}</span>
                    )}
                  </span>
                )}
              </div>
              <Input
                id="email"
                type="email"
                placeholder={`e.g. staff@${collegeDomains[0] || "college.edu"}`}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors(prev => ({ ...prev, email: "" }));
                }}
                className={`rounded-xl text-xs ${errors.email ? "border-destructive focus-visible:ring-destructive/20" : ""}`}
              />
              {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <Label htmlFor="phone" className={errors.phone ? "text-destructive" : ""}>Phone Contact *</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-muted-foreground font-semibold border-r border-border pr-2">+91</span>
                <Input
                  id="phone"
                  placeholder="9876543210"
                  value={phone}
                  onKeyDown={(e) => {
                    const allowedKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab", "Enter"];
                    if (allowedKeys.includes(e.key) || e.ctrlKey || e.metaKey) {
                      return;
                    }
                    if (!/^[0-9]$/.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  onChange={(e) => {
                    const cleanValue = e.target.value.replace(/[^0-9]/g, "");
                    setPhone(cleanValue);
                    if (errors.phone) setErrors(prev => ({ ...prev, phone: "" }));
                  }}
                  className={`pl-12 rounded-xl text-xs ${errors.phone ? "border-destructive focus-visible:ring-destructive/20" : ""}`}
                />
              </div>
              {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
            </div>
          </div>
        </div>

        {/* Section 2: Role Allocation */}
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-5">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Briefcase className="w-4 h-4 text-primary" />
            <h3 className="font-bold text-sm">Section 2 - Role Allocation</h3>
          </div>

          {/* Role designation selector */}
          <div className="space-y-3">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Select Role Designation</Label>
            <div className="flex gap-4">
              {[
                { id: "HOD", label: "HOD (Head of Department)", desc: "Manages departments & curricula" },
                { id: "TPO", label: "TPO (Training & Placement Officer)", desc: "Manages student placement scope" }
              ].map(r => (
                <button
                  type="button"
                  key={r.id}
                  onClick={() => setRole(r.id as any)}
                  className={`flex-1 p-4 rounded-xl border text-left transition-all ${
                    role === r.id
                      ? "bg-primary/5 border-primary text-primary font-bold shadow-sm"
                      : "border-border text-foreground hover:bg-muted"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={role === r.id}
                      onChange={() => setRole(r.id as any)}
                      className="accent-primary w-4 h-4 pointer-events-none"
                    />
                    <span className="text-xs font-bold">{r.label}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-normal block mt-1.5 pl-6">{r.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Selector Panel */}
          {role === "TPO" ? (
            <div className="pt-4 border-t border-border space-y-4 animate-in fade-in duration-300">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">TPO Access Scope</Label>
              
              <div className="flex gap-4">
                {[
                  { id: "Entire College", label: "Entire College Scope" },
                  { id: "Selected Departments", label: "Restrict to Selected Departments" }
                ].map(scope => (
                  <button
                    type="button"
                    key={scope.id}
                    onClick={() => setAccessScope(scope.id as any)}
                    className={`flex-1 p-3 rounded-xl border text-center text-xs font-bold transition-all ${
                      accessScope === scope.id
                        ? "bg-primary/5 border-primary text-primary"
                        : "border-border text-foreground hover:bg-muted"
                    }`}
                  >
                    {scope.label}
                  </button>
                ))}
              </div>

              {accessScope === "Selected Departments" && (
                <div className={`bg-background border p-4 rounded-xl space-y-4 animate-in slide-in-from-top-2 duration-300 ${errors.selectedTpoDepts ? "border-destructive ring-1 ring-destructive/20" : "border-border"}`}>
                  {errors.selectedTpoDepts && <p className="text-xs text-destructive font-semibold">{errors.selectedTpoDepts}</p>}
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <span className="text-xs font-bold text-muted-foreground uppercase">Assign Departments ({selectedTpoDepts.length} selected)</span>
                    
                    <div className="relative w-48">
                      <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-muted-foreground" />
                      <Input
                        placeholder="Search departments..."
                        value={tpoSearchQuery}
                        onChange={(e) => setTpoSearchQuery(e.target.value)}
                        className="pl-8 h-7 text-[10px] rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[200px] overflow-y-auto pr-1">
                    {tpoFilteredDepts.map(dept => {
                      const isChecked = selectedTpoDepts.includes(dept);
                      return (
                        <label
                          key={dept}
                          className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                            isChecked
                              ? "bg-primary/5 border-primary/20 text-primary font-semibold"
                              : "border-transparent text-foreground hover:bg-muted/40"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleTpoDeptToggle(dept)}
                            className="accent-primary w-3.5 h-3.5"
                          />
                          <span className="truncate">{dept}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            // HOD Department Allocation
            <div className="pt-4 border-t border-border space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <Label className={`text-xs uppercase tracking-wider font-bold ${errors.selectedDept ? "text-destructive" : "text-muted-foreground"}`}>HOD Department Allocation *</Label>
                
                <div className="relative w-64">
                  <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search allocation department..."
                    value={deptSearchQuery}
                    onChange={(e) => setDeptSearchQuery(e.target.value)}
                    className="pl-8 h-7 text-[11px] rounded-lg"
                  />
                </div>
              </div>

              {errors.selectedDept && <p className="text-xs text-destructive font-semibold my-1">{errors.selectedDept}</p>}
              <div className={`border rounded-xl bg-background divide-y divide-border max-h-[300px] overflow-y-auto pr-1 ${errors.selectedDept ? "border-destructive" : "border-border"}`}>
                {filteredTaxonomyDepts.map((item, idx) => {
                  const isChecked = selectedDept === item.deptName;
                  return (
                    <button
                      type="button"
                      key={`${item.deptName}-${idx}`}
                      onClick={() => { setSelectedDept(item.deptName); if (errors.selectedDept) setErrors(prev => ({ ...prev, selectedDept: "" })); }}
                      className={`w-full flex items-center justify-between p-3 text-left transition-all ${
                        isChecked
                          ? "bg-primary/5 text-primary font-bold"
                          : "text-foreground hover:bg-muted/30"
                      }`}
                    >
                      <div>
                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">
                          {item.typeName} • {item.levelName} – {item.degName}
                        </span>
                        <span className="text-xs mt-1 block font-semibold">{item.deptName}</span>
                      </div>
                      <input
                        type="radio"
                        checked={isChecked}
                        readOnly
                        className="accent-primary w-4 h-4 pointer-events-none"
                      />
                    </button>
                  );
                })}
                {filteredTaxonomyDepts.length === 0 && (
                  <span className="text-xs text-muted-foreground italic p-4 block text-center">No academic departments match your search</span>
                )}
              </div>
            </div>
          )}

          {/* Active Status toggle */}
          <div className="pt-4 border-t border-border flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-foreground block">Active Status</span>
              <span className="text-[10px] text-muted-foreground mt-0.5">Toggle to activate or deactivate staff status immediately</span>
            </div>
            <button
              onClick={() => setIsActive(!isActive)}
              className={`w-12 h-6 rounded-full p-1 transition-all ${
                isActive ? "bg-emerald-500 flex justify-end" : "bg-muted flex justify-start"
              }`}
            >
              <div className="w-4 h-4 bg-background rounded-full shadow" />
            </button>
          </div>
        </div>

      </div>

      {/* Sticky Bottom Actions Footer */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-card/90 backdrop-blur-md border-t border-border p-4 shadow-lg lg:pl-64 transition-all duration-300">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Button
            variant="outline"
            type="button"
            onClick={() => router.push(`/super-admin/hod-tpo?collegeId=${selectedCollege?.id || staffRecord.collegeId}`)}
            className="rounded-xl px-6 text-xs font-bold"
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={handleSaveChanges}
            className="rounded-xl px-6 text-xs font-bold bg-primary hover:bg-primary/95 text-primary-foreground shadow"
          >
            Save Changes
          </Button>
        </div>
      </div>

    </div>
  );
}
