"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  BookOpen,
  GraduationCap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import StudentService, { Student } from "@/services/student.service";
import AuthService from "@/services/auth.service";
import { fetchColleges, fetchAcademicCatalog } from "@/services/college.service";
import { College } from "@/lib/mockColleges";

export default function CreateStudentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentUser = AuthService.getUser();

  const collegeId =
    currentUser?.college_code ||
    searchParams.get("collegeId") ||
    "";

  // State configurations
  const [colleges, setColleges] = useState<College[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  // Form Fields
  const [rollNumber, setRollNumber] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [personalEmail, setPersonalEmail] = useState("");
  const [officialEmail, setOfficialEmail] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [degree, setDegree] = useState("");
  const [department, setDepartment] = useState("");
  const [section, setSection] = useState("");

  const [gradYear, setGradYear] = useState("");
  const [cgpaScore, setCgpaScore] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [catalog, setCatalog] = useState<any[]>([]);

  // Load Configurations
  useEffect(() => {
    fetchColleges().then(cols => {
      setColleges(cols);
    }).catch(err => console.error(err));

    fetchAcademicCatalog().then(cat => {
      setCatalog(cat);
    }).catch(err => console.error(err));

    const collegeCode = currentUser?.college_code || collegeId;
    StudentService.fetchStudents(collegeCode).then(list => {
      setStudents(list);
    }).catch(err => console.error(err));
  }, []);

  const selectedCollege = useMemo(() => {
    return colleges.find(c => String(c.id) === String(collegeId) || c.code === collegeId) || colleges[0] || null;
  }, [colleges, collegeId]);

  const degreesOptions = useMemo(() => {
    if (!selectedCollege || !selectedCollege.academicProfile || catalog.length === 0) return [];
    const deptsMap = new Map<string, string[]>();
    
    Object.values(selectedCollege.academicProfile).forEach((levelMap: any) => {
      if (levelMap && typeof levelMap === "object") {
        Object.values(levelMap).forEach((degreeMap: any) => {
          if (degreeMap && typeof degreeMap === "object") {
            Object.entries(degreeMap).forEach(([degreeId, list]) => {
              if (Array.isArray(list)) {
                if (!deptsMap.has(degreeId)) {
                  deptsMap.set(degreeId, []);
                }
                const currentList = deptsMap.get(degreeId)!;
                list.forEach(dept => {
                  if (!currentList.includes(dept)) currentList.push(dept);
                });
              }
            });
          }
        });
      }
    });

    const list: { id: string; name: string; departments: string[] }[] = [];
    deptsMap.forEach((departments, degreeId) => {
      let degreeName = degreeId;
      catalog.forEach(instType => {
        if (instType.levels) {
          instType.levels.forEach((level: any) => {
            if (level.degrees) {
              const match = level.degrees.find((d: any) => d.id === degreeId);
              if (match) {
                degreeName = match.name;
              }
            }
          });
        }
      });
      list.push({ id: degreeId, name: degreeName, departments });
    });
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }, [selectedCollege, catalog]);

  // Real-time validations
  const isRollDuplicate = useMemo(() => {
    return students.some(s => s.rollNumber.toLowerCase().trim() === rollNumber.toLowerCase().trim());
  }, [students, rollNumber]);

  const isRollOk = rollNumber ? !isRollDuplicate : false;

  const approvedDomains = useMemo(() => {
    if (Array.isArray(currentUser?.approved_domains) && currentUser.approved_domains.length > 0) {
      return currentUser.approved_domains;
    }
    return selectedCollege?.domains || [];
  }, [currentUser, selectedCollege]);

  const isEmailDomainOk = useMemo(() => {
    if (!officialEmail) return false;
    const parts = officialEmail.split("@");
    if (parts.length < 2) return false;
    const domain = parts[1].toLowerCase().trim();
    return approvedDomains.some((d: string) => domain === d.toLowerCase().trim());
  }, [officialEmail, approvedDomains]);

  const handleCreateStudent = async () => {
    const tempErrors: Record<string, string> = {};

    if (!rollNumber.trim()) {
      tempErrors.rollNumber = "Roll Number is required";
    } else if (isRollDuplicate) {
      tempErrors.rollNumber = "Roll Number already exists";
    }

    if (!firstName.trim()) {
      tempErrors.firstName = "First Name is required";
    }

    if (!lastName.trim()) {
      tempErrors.lastName = "Last Name is required";
    }

    if (!personalEmail.trim()) {
      tempErrors.personalEmail = "Personal Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personalEmail)) {
      tempErrors.personalEmail = "Invalid email format";
    }

    if (!officialEmail.trim()) {
      tempErrors.officialEmail = "Official Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(officialEmail)) {
      tempErrors.officialEmail = "Invalid email format";
    } else if (!isEmailDomainOk) {
      tempErrors.officialEmail = `Official email must match approved domains: ${approvedDomains.join(" / ")}`;
    }

    if (!contactNumber.trim()) {
      tempErrors.contactNumber = "Contact Number is required";
    } else if (!/^\+?[0-9\s\-]{8,15}$/.test(contactNumber.trim())) {
      tempErrors.contactNumber = "Please enter a valid phone number";
    }

    if (!degree) {
      tempErrors.degree = "Degree / Program is required";
    }

    if (!department.trim()) {
      tempErrors.department = "Department is required";
    }

    if (!section.trim()) {
      tempErrors.section = "Section is required";
    }

    if (!gradYear.trim()) {
      tempErrors.gradYear = "Graduation Year is required";
    } else if (isNaN(Number(gradYear)) || Number(gradYear) < 1900 || Number(gradYear) > 2100) {
      tempErrors.gradYear = "Please enter a valid year";
    }

    if (!cgpaScore.trim()) {
      tempErrors.cgpaScore = "CGPA is required";
    } else {
      const cgpaVal = Number(cgpaScore);
      if (isNaN(cgpaVal) || cgpaVal < 0 || cgpaVal > 10) {
        tempErrors.cgpaScore = "CGPA must be a number between 0 and 10";
      }
    }

    setErrors(tempErrors);

    if (Object.keys(tempErrors).length > 0) {
      toast.error("Please fill in all required fields correctly.");
      return;
    }

    const studentData = {
      rollNumber: rollNumber.trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      personalEmail: personalEmail.trim(),
      officialEmail: officialEmail.trim() || undefined,
      contactNumber: contactNumber.trim(),
      joinedCourse: degree,
      department: department.trim(),
      section: section.trim(),
      status: isActive ? "Active" : "Inactive",
      graduationYear: Number(gradYear),
      cgpa: cgpaScore.trim() ? Number(cgpaScore) : undefined
    };

    const collegeCode = currentUser?.college_code || collegeId;

    try {
      await StudentService.createStudent(collegeCode, studentData);
      localStorage.removeItem("dq_student_draft");
      toast.success("Invitation email sent successfully.");
      router.push(`/super-admin/student?collegeId=${collegeCode}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to onboard student.");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-24 max-w-4xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Onboard Student Profile</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Register an individual student profile for {currentUser?.college_name || currentUser?.college_code}.</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(`/super-admin/student?collegeId=${collegeId}`)}
          className="rounded-xl flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
      </div>

      <div className="space-y-6">

        {/* Section 1: Personal Info */}
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-5">
          <h3 className="font-bold text-sm text-foreground border-b border-border pb-3 flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-primary" /> Personal Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Roll Number */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="rollNo">Roll Number *</Label>
                {rollNumber && (
                  <span className="text-[10px] font-bold">
                    {isRollOk ? (
                      <span className="text-emerald-500 flex items-center gap-0.5"><CheckCircle2 className="w-3 h-3" /> Available</span>
                    ) : (
                      <span className="text-destructive flex items-center gap-0.5"><XCircle className="w-3 h-3" /> Already Exists</span>
                    )}
                  </span>
                )}
              </div>
              <Input
                id="rollNo"
                placeholder="e.g. 20711A0501"
                value={rollNumber}
                onChange={(e) => {
                  setRollNumber(e.target.value);
                  if (errors.rollNumber) setErrors(prev => ({ ...prev, rollNumber: "" }));
                }}
                className="rounded-xl text-xs font-mono"
              />
            </div>

            {/* Empty space/alignment */}
            <div className="hidden md:block" />

            {/* First Name */}
            <div className="space-y-1.5">
              <Label htmlFor="firstName" className={errors.firstName ? "text-destructive" : ""}>First Name *</Label>
              <Input
                id="firstName"
                placeholder="Enter first name"
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value);
                  if (errors.firstName) setErrors(prev => ({ ...prev, firstName: "" }));
                }}
                className={`rounded-xl text-xs ${errors.firstName ? "border-destructive focus-visible:ring-destructive/20" : ""}`}
              />
              {errors.firstName && <p className="text-xs text-destructive mt-1">{errors.firstName}</p>}
            </div>

            {/* Last Name */}
            <div className="space-y-1.5">
              <Label htmlFor="lastName" className={errors.lastName ? "text-destructive" : ""}>Last Name *</Label>
              <Input
                id="lastName"
                placeholder="Enter last name"
                value={lastName}
                onChange={(e) => {
                  setLastName(e.target.value);
                  if (errors.lastName) setErrors(prev => ({ ...prev, lastName: "" }));
                }}
                className={`rounded-xl text-xs ${errors.lastName ? "border-destructive focus-visible:ring-destructive/20" : ""}`}
              />
              {errors.lastName && <p className="text-xs text-destructive mt-1">{errors.lastName}</p>}
            </div>

            {/* Personal Email */}
            <div className="space-y-1.5">
              <Label htmlFor="personalEmail">Personal Email Address *</Label>
              <Input
                id="personalEmail"
                type="email"
                placeholder="e.g. student@gmail.com"
                value={personalEmail}
                onChange={(e) => setPersonalEmail(e.target.value)}
                className="rounded-xl text-xs font-mono"
              />
            </div>

            {/* Official Email */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="officialEmail">Official Institution Email</Label>
                {officialEmail && (
                  <span className="text-[10px] font-bold">
                    {isEmailDomainOk ? (
                      <span className="text-emerald-500 flex items-center gap-0.5"><CheckCircle2 className="w-3 h-3" /> Domain Approved</span>
                    ) : (
                      <span className="text-destructive flex items-center gap-0.5"><XCircle className="w-3 h-3" /> Must use {approvedDomains.join(" / ")}</span>
                    )}
                  </span>
                )}
              </div>
              <Input
                id="officialEmail"
                type="email"
                placeholder={`e.g. rollnumber@${approvedDomains[0] || "college.edu"}`}
                value={officialEmail}
                onChange={(e) => setOfficialEmail(e.target.value)}
                className="rounded-xl text-xs font-mono"
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5">
              <Label htmlFor="contactNo">Contact Number *</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-muted-foreground font-semibold border-r border-border pr-2">+91</span>
                <Input
                  id="contactNo"
                  placeholder="9876543210"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  className="pl-12 rounded-xl text-xs font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Academic Info */}
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-5">
          <h3 className="font-bold text-sm text-foreground border-b border-border pb-3 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" /> Academic Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Degree / Program */}
            <div className="space-y-1.5">
              <Label htmlFor="degree" className={errors.degree ? "text-destructive" : ""}>Degree / Program *</Label>
              <select
                id="degree"
                value={degree}
                onChange={(e) => {
                  setDegree(e.target.value);
                  setDepartment("");
                  if (errors.degree) setErrors(prev => ({ ...prev, degree: "" }));
                }}
                className={`w-full mt-1.5 h-10 px-3 rounded-xl border border-input bg-background text-xs cursor-pointer focus:ring-1 focus:ring-primary ${
                  errors.degree ? "border-destructive focus-visible:ring-destructive/20" : ""
                }`}
              >
                <option value="">Select Degree / Program</option>
                {degreesOptions.map(deg => (
                  <option key={deg.id} value={deg.id}>{deg.name}</option>
                ))}
              </select>
              {errors.degree && <p className="text-xs text-destructive mt-1">{errors.degree}</p>}
            </div>

            {/* Department */}
            <div className="space-y-1.5">
              <Label htmlFor="dept" className={errors.department ? "text-destructive" : ""}>Department / Branch *</Label>
              <select
                id="dept"
                value={department}
                onChange={(e) => {
                  setDepartment(e.target.value);
                  if (errors.department) setErrors(prev => ({ ...prev, department: "" }));
                }}
                className={`w-full mt-1.5 h-10 px-3 rounded-xl border border-input bg-background text-xs cursor-pointer focus:ring-1 focus:ring-primary ${
                  errors.department ? "border-destructive focus-visible:ring-destructive/20" : ""
                }`}
                disabled={!degree}
              >
                <option value="">Select Department / Branch</option>
                {(degreesOptions.find(d => d.id === degree)?.departments || []).map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              {errors.department && <p className="text-xs text-destructive mt-1">{errors.department}</p>}
            </div>

            {/* Section */}
            <div className="space-y-1.5">
              <Label htmlFor="section">Section *</Label>
              <Input
                id="section"
                placeholder="e.g. A, B or C"
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className={`rounded-xl text-xs ${errors.rollNumber ? "border-destructive focus-visible:ring-destructive/20" : ""}`}
              />
              {errors.rollNumber && <p className="text-xs text-destructive mt-1">{errors.rollNumber}</p>}
            </div>



            {/* Graduation Year */}
            <div className="space-y-1.5">
              <Label htmlFor="gradYear">Graduation Year *</Label>
              <Input
                id="gradYear"
                type="number"
                placeholder="e.g. 2027"
                value={gradYear}
                onChange={(e) => setGradYear(e.target.value)}
                className="rounded-xl text-xs font-mono"
              />
            </div>

            {/* CGPA */}
            <div className="space-y-1.5">
              <Label htmlFor="cgpa">CGPA Score</Label>
              <Input
                id="cgpa"
                type="number"
                step="0.01"
                min="0"
                max="10"
                placeholder="e.g. 8.75"
                value={cgpaScore}
                onChange={(e) => setCgpaScore(e.target.value)}
                className="rounded-xl text-xs font-mono"
              />
            </div>
          </div>

          {/* Active status */}
          <div className="pt-4 border-t border-border flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-foreground block">Active Portal Status</span>
              <span className="text-[10px] text-muted-foreground mt-0.5">Toggle to activate or deactivate student credentials immediately</span>
            </div>
            <button
              onClick={() => setIsActive(!isActive)}
              className={`w-12 h-6 rounded-full p-1 transition-all ${isActive ? "bg-emerald-500 flex justify-end" : "bg-muted flex justify-start"
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
          <div className="flex gap-2">
            <Button
              variant="outline"
              type="button"
              onClick={() => router.push(`/super-admin/student?collegeId=${collegeId}`)}
              className="rounded-xl px-6 text-xs font-bold"
            >
              Cancel
            </Button>
          </div>

          <Button
            type="button"
            onClick={handleCreateStudent}
            className="rounded-xl px-6 text-xs font-bold bg-primary hover:bg-primary/95 text-primary-foreground shadow"
          >
            Create Student
          </Button>
        </div>
      </div>

    </div>
  );
}
