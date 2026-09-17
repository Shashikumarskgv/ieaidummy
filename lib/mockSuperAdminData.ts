// lib/mockSuperAdminData.ts
// Single source of truth for the Super Admin Portal with 56 students, 14 staff members,
// department HOD activations, and TPO placement verifications.

import { INITIAL_STUDENTS as HOD_STUDENTS } from "./mockHodData";

export interface SuperAdminStudent {
  rollNumber: string;
  firstName: string;
  lastName: string;
  personalEmail: string;
  officialEmail?: string;
  contactNumber: string;
  department: string;
  section: string;
  currentSemester: number;
  graduationYear: number;
  cgpa?: number;
  status: "Active" | "Inactive";
  joinedCourse?: string;
  collegeId: string;
  invitationStatus: "Accepted" | "Pending";
  createdDate: string;
  paymentVerified: "Verified" | "Pending";
  licenseActive: "Active" | "Pending";
  placementEligible: "Eligible" | "Needs Clearance";
  verificationDate: string;
}

export interface SuperAdminStaff {
  id: string; // Employee ID
  name: string;
  email: string;
  phone: string;
  role: "HOD" | "TPO";
  department?: string;
  accessScope?: "Entire College" | "Selected Departments";
  selectedDepartments?: string[];
  status: "Active" | "Inactive";
  invitationStatus: "Accepted" | "Pending" | "Sent" | "Expired";
  collegeId: string;
  createdDate: string;
  lastLogin?: string;
}

export interface DepartmentActivationItem {
  department: string;
  section: string;
  college_name: string;
  college_id: string;
  total_students: number;
  activated_students: number;
  pending_students: number;
  activation_percentage: number;
  hod_name: string;
  last_updated: string;
}

const STORAGE_KEYS = {
  STUDENTS: "dq_super_admin_students",
  STAFF: "dq_super_admin_staff",
  ACTIVATIONS: "dq_super_admin_activations",
  VERIFICATIONS: "dq_super_admin_verifications"
};

// Seed 56 students from HOD roster
export const INITIAL_SUPER_ADMIN_STUDENTS: SuperAdminStudent[] = HOD_STUDENTS.map((s, idx) => {
  const isInactive = idx === 11 || idx === 29 || idx === 43 || idx === 51;
  const isUnverifiedPayment = idx === 8 || idx === 22 || idx === 37 || idx === 49;
  const isLicensePending = isUnverifiedPayment || idx === 15;
  const isPlacementEligible = (s.cgpa || 7.0) >= 7.0 && !isInactive;

  // Distribute graduation years realistically
  const graduationYear = idx < 42 ? 2025 : 2026;
  const semester = graduationYear === 2025 ? 7 : 5;

  return {
    rollNumber: s.roll_number,
    firstName: s.first_name,
    lastName: s.last_name,
    personalEmail: s.personal_email,
    officialEmail: s.email,
    contactNumber: s.contact_number,
    department: s.department,
    section: s.section,
    currentSemester: semester,
    graduationYear,
    cgpa: s.cgpa,
    status: isInactive ? "Inactive" : "Active",
    joinedCourse: "B.Tech - Computer Science & Engineering",
    collegeId: "SVCE1234",
    invitationStatus: isInactive ? "Pending" : "Accepted",
    createdDate: "15 Aug 2024",
    paymentVerified: isUnverifiedPayment ? "Pending" : "Verified",
    licenseActive: isLicensePending ? "Pending" : "Active",
    placementEligible: isPlacementEligible ? "Eligible" : "Needs Clearance",
    verificationDate: new Date(Date.now() - (idx + 1) * 86400000 * 2).toISOString().split("T")[0]
  };
});

// Seed 14 realistic HOD and TPO Staff members
export const INITIAL_SUPER_ADMIN_STAFF: SuperAdminStaff[] = [
  {
    id: "SVCE-TPO-001",
    name: "Dr. R. Prakash",
    email: "tpo@svce.edu.in",
    phone: "+91 98765 43210",
    role: "TPO",
    accessScope: "Entire College",
    status: "Active",
    invitationStatus: "Accepted",
    collegeId: "SVCE1234",
    createdDate: "10 May 2025",
    lastLogin: "16 Sep 2026, 10:30 AM"
  },
  {
    id: "SVCE-HOD-CSE",
    name: "Dr. Rajesh Varma",
    email: "hod.cse@svce.edu.in",
    phone: "+91 98765 43211",
    role: "HOD",
    department: "Computer Science & Engineering",
    status: "Active",
    invitationStatus: "Accepted",
    collegeId: "SVCE1234",
    createdDate: "11 May 2025",
    lastLogin: "17 Sep 2026, 09:15 AM"
  },
  {
    id: "SVCE-HOD-ECE",
    name: "Dr. M. Anuradha",
    email: "hod.ece@svce.edu.in",
    phone: "+91 99887 76655",
    role: "HOD",
    department: "Electronics & Communication Engineering",
    status: "Active",
    invitationStatus: "Accepted",
    collegeId: "SVCE1234",
    createdDate: "12 May 2025",
    lastLogin: "17 Sep 2026, 11:00 AM"
  },
  {
    id: "SVCE-HOD-IT",
    name: "Dr. G. Lalitha",
    email: "hod.it@svce.edu.in",
    phone: "+91 97777 88899",
    role: "HOD",
    department: "Information Technology",
    status: "Active",
    invitationStatus: "Accepted",
    collegeId: "SVCE1234",
    createdDate: "12 May 2025",
    lastLogin: "16 Sep 2026, 04:20 PM"
  },
  {
    id: "SVCE-HOD-AIDS",
    name: "Dr. Suresh Babu",
    email: "hod.aids@svce.edu.in",
    phone: "+91 98450 12345",
    role: "HOD",
    department: "AI & Data Science",
    status: "Active",
    invitationStatus: "Accepted",
    collegeId: "SVCE1234",
    createdDate: "14 May 2025",
    lastLogin: "15 Sep 2026, 02:40 PM"
  },
  {
    id: "SVCE-HOD-MECH",
    name: "Dr. K. Srinivas",
    email: "hod.mech@svce.edu.in",
    phone: "+91 95555 66677",
    role: "HOD",
    department: "Mechanical Engineering",
    status: "Active",
    invitationStatus: "Accepted",
    collegeId: "SVCE1234",
    createdDate: "14 May 2025",
    lastLogin: "14 Sep 2026, 01:10 PM"
  },
  {
    id: "SVCE-HOD-CIVIL",
    name: "Prof. P. Venkat",
    email: "hod.civil@svce.edu.in",
    phone: "+91 96666 77788",
    role: "HOD",
    department: "Civil Engineering",
    status: "Active",
    invitationStatus: "Accepted",
    collegeId: "SVCE1234",
    createdDate: "15 May 2025",
    lastLogin: "13 Sep 2026, 11:35 AM"
  },
  {
    id: "SVCE-HOD-EEE",
    name: "Dr. N. Chandrasekhar",
    email: "hod.eee@svce.edu.in",
    phone: "+91 94444 88811",
    role: "HOD",
    department: "Electrical & Electronics Engineering",
    status: "Active",
    invitationStatus: "Pending",
    collegeId: "SVCE1234",
    createdDate: "01 Jun 2025"
  },
  {
    id: "SVCE-TPO-002",
    name: "Kiran Kumar",
    email: "tpo.corporate@svce.edu.in",
    phone: "+91 94444 55566",
    role: "TPO",
    accessScope: "Entire College",
    status: "Active",
    invitationStatus: "Accepted",
    collegeId: "SVCE1234",
    createdDate: "13 May 2025",
    lastLogin: "17 Sep 2026, 10:00 AM"
  },
  {
    id: "SVCE-TPO-003",
    name: "Divya Nair",
    email: "tpo.core@svce.edu.in",
    phone: "+91 98111 22334",
    role: "TPO",
    accessScope: "Selected Departments",
    selectedDepartments: ["Mechanical Engineering", "Civil Engineering", "Electrical & Electronics Engineering"],
    status: "Active",
    invitationStatus: "Accepted",
    collegeId: "SVCE1234",
    createdDate: "18 May 2025",
    lastLogin: "16 Sep 2026, 03:30 PM"
  },
  {
    id: "SVCE-TPO-004",
    name: "Arun Joshi",
    email: "tpo.software@svce.edu.in",
    phone: "+91 98222 33445",
    role: "TPO",
    accessScope: "Selected Departments",
    selectedDepartments: ["Computer Science & Engineering", "Information Technology", "AI & Data Science"],
    status: "Active",
    invitationStatus: "Accepted",
    collegeId: "SVCE1234",
    createdDate: "20 May 2025",
    lastLogin: "17 Sep 2026, 08:50 AM"
  },
  {
    id: "SVCE-TPO-005",
    name: "Pooja Hegde",
    email: "tpo.internships@svce.edu.in",
    phone: "+91 98333 44556",
    role: "TPO",
    accessScope: "Entire College",
    status: "Active",
    invitationStatus: "Accepted",
    collegeId: "SVCE1234",
    createdDate: "22 May 2025",
    lastLogin: "15 Sep 2026, 05:15 PM"
  },
  {
    id: "SVCE-TPO-006",
    name: "Manoj Sharma",
    email: "tpo.tier1@svce.edu.in",
    phone: "+91 98444 55667",
    role: "TPO",
    accessScope: "Entire College",
    status: "Inactive",
    invitationStatus: "Accepted",
    collegeId: "SVCE1234",
    createdDate: "25 May 2025",
    lastLogin: "02 Sep 2026, 12:00 PM"
  },
  {
    id: "SVCE-TPO-007",
    name: "Sunita Reddy",
    email: "tpo.drives@svce.edu.in",
    phone: "+91 98555 66778",
    role: "TPO",
    accessScope: "Entire College",
    status: "Active",
    invitationStatus: "Pending",
    collegeId: "SVCE1234",
    createdDate: "05 Jun 2025"
  }
];

class MockSuperAdminStore {
  private isBrowser(): boolean {
    return typeof window !== "undefined";
  }

  // ================= STUDENTS =================
  getStudents(collegeId?: string): SuperAdminStudent[] {
    if (!this.isBrowser()) return INITIAL_SUPER_ADMIN_STUDENTS;
    try {
      const cached = localStorage.getItem(STORAGE_KEYS.STUDENTS);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length >= 50) {
          return parsed;
        }
      }
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(INITIAL_SUPER_ADMIN_STUDENTS));
    } catch {}
    return INITIAL_SUPER_ADMIN_STUDENTS;
  }

  saveStudents(students: SuperAdminStudent[]): void {
    if (!this.isBrowser()) return;
    try {
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
    } catch {}
  }

  createStudent(collegeId: string, payload: any): SuperAdminStudent {
    const list = this.getStudents(collegeId);
    const newStudent: SuperAdminStudent = {
      rollNumber: payload.rollNumber || `21CS${(list.length + 1).toString().padStart(3, "0")}`,
      firstName: payload.firstName,
      lastName: payload.lastName,
      personalEmail: payload.personalEmail,
      officialEmail: payload.officialEmail || `${payload.firstName.toLowerCase()}.${payload.rollNumber?.toLowerCase() || "stu"}@college.edu`,
      contactNumber: payload.contactNumber,
      department: payload.department || "Computer Science & Engineering",
      section: payload.section || "A",
      currentSemester: Number(payload.currentSemester) || 7,
      graduationYear: Number(payload.graduationYear) || 2025,
      cgpa: payload.cgpa ? Number(payload.cgpa) : 8.0,
      status: payload.status || "Active",
      joinedCourse: payload.joinedCourse || "B.Tech - Computer Science & Engineering",
      collegeId: collegeId || "SVCE1234",
      invitationStatus: "Accepted",
      createdDate: new Date().toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }),
      paymentVerified: "Verified",
      licenseActive: "Active",
      placementEligible: "Eligible",
      verificationDate: new Date().toISOString().split("T")[0]
    };
    const updated = [newStudent, ...list];
    this.saveStudents(updated);
    return newStudent;
  }

  updateStudent(collegeId: string, rollNumber: string, payload: any): SuperAdminStudent | null {
    const list = this.getStudents(collegeId);
    const idx = list.findIndex(s => s.rollNumber.toLowerCase() === rollNumber.toLowerCase());
    if (idx === -1) return null;
    const updatedStudent = { ...list[idx], ...payload };
    list[idx] = updatedStudent;
    this.saveStudents(list);
    return updatedStudent;
  }

  deleteStudent(collegeId: string, rollNumber: string): boolean {
    const list = this.getStudents(collegeId);
    const filtered = list.filter(s => s.rollNumber.toLowerCase() !== rollNumber.toLowerCase());
    this.saveStudents(filtered);
    return true;
  }

  toggleStudentStatus(collegeId: string, rollNumber: string, status: "Active" | "Inactive"): SuperAdminStudent | null {
    return this.updateStudent(collegeId, rollNumber, { status });
  }

  bulkImportStudents(collegeId: string, importedList: any[], strategy: "skip" | "update", fileName?: string, importedBy?: string) {
    const current = this.getStudents(collegeId);
    let success = 0;
    let skipped = 0;

    const updatedList = [...current];

    importedList.forEach(item => {
      const roll = item.rollNumber || item.RollNumber || item["Roll No"];
      if (!roll) {
        skipped++;
        return;
      }
      const existingIdx = updatedList.findIndex(s => s.rollNumber.toLowerCase() === roll.toLowerCase());
      if (existingIdx >= 0) {
        if (strategy === "update") {
          updatedList[existingIdx] = { ...updatedList[existingIdx], ...item };
          success++;
        } else {
          skipped++;
        }
      } else {
        const newStu: SuperAdminStudent = {
          rollNumber: roll,
          firstName: item.firstName || item.FirstName || item.name?.split(" ")[0] || "Student",
          lastName: item.lastName || item.LastName || item.name?.split(" ")[1] || "Record",
          personalEmail: item.personalEmail || item.email || `${roll.toLowerCase()}@example.com`,
          officialEmail: item.officialEmail || `${roll.toLowerCase()}@college.edu`,
          contactNumber: item.contactNumber || item.phone || "+91 9800000000",
          department: item.department || "Computer Science & Engineering",
          section: item.section || "A",
          currentSemester: Number(item.currentSemester) || 7,
          graduationYear: Number(item.graduationYear) || 2025,
          cgpa: Number(item.cgpa) || 8.0,
          status: "Active",
          collegeId: collegeId || "SVCE1234",
          invitationStatus: "Accepted",
          createdDate: new Date().toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }),
          paymentVerified: "Verified",
          licenseActive: "Active",
          placementEligible: "Eligible",
          verificationDate: new Date().toISOString().split("T")[0]
        };
        updatedList.push(newStu);
        success++;
      }
    });

    this.saveStudents(updatedList);
    return { successCount: success, skippedCount: skipped, totalCount: importedList.length };
  }

  // ================= STAFF (HOD & TPO) =================
  getStaff(collegeId?: string): SuperAdminStaff[] {
    if (!this.isBrowser()) return INITIAL_SUPER_ADMIN_STAFF;
    try {
      const cached = localStorage.getItem(STORAGE_KEYS.STAFF);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
      localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(INITIAL_SUPER_ADMIN_STAFF));
    } catch {}
    return INITIAL_SUPER_ADMIN_STAFF;
  }

  saveStaff(staff: SuperAdminStaff[]): void {
    if (!this.isBrowser()) return;
    try {
      localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(staff));
    } catch {}
  }

  createStaff(collegeId: string, data: any): SuperAdminStaff {
    const list = this.getStaff(collegeId);
    const newStaff: SuperAdminStaff = {
      id: data.employeeId || data.id || `SVCE-STAFF-${list.length + 1}`,
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: data.role || "HOD",
      department: data.department,
      accessScope: data.accessScope,
      selectedDepartments: data.selectedDepartments,
      status: data.status || "Active",
      invitationStatus: "Accepted",
      collegeId: collegeId || "SVCE1234",
      createdDate: new Date().toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }),
      lastLogin: "Just now"
    };
    const updated = [newStaff, ...list];
    this.saveStaff(updated);
    return newStaff;
  }

  updateStaff(collegeId: string, id: string, data: any): SuperAdminStaff | null {
    const list = this.getStaff(collegeId);
    const idx = list.findIndex(s => s.id === id);
    if (idx === -1) return null;
    const updated = { ...list[idx], ...data };
    list[idx] = updated;
    this.saveStaff(list);
    return updated;
  }

  deleteStaff(collegeId: string, id: string): boolean {
    const list = this.getStaff(collegeId);
    const filtered = list.filter(s => s.id !== id);
    this.saveStaff(filtered);
    return true;
  }

  toggleStaffStatus(collegeId: string, id: string, status: string): SuperAdminStaff | null {
    return this.updateStaff(collegeId, id, { status });
  }

  resetPassword(collegeId: string, id: string): boolean {
    return true;
  }

  // ================= HOD ACTIVATION PANEL =================
  getHodActivationPanel(collegeId?: number | string): DepartmentActivationItem[] {
    const students = this.getStudents();
    
    // Compute accurate departmental metrics from actual students
    const cseAStudents = students.filter(s => s.section === "A");
    const cseBStudents = students.filter(s => s.section === "B");

    const cseAActive = cseAStudents.filter(s => s.paymentVerified === "Verified").length;
    const cseBActive = cseBStudents.filter(s => s.paymentVerified === "Verified").length;

    return [
      {
        department: "Computer Science & Engineering",
        section: "Section A",
        college_name: "Sri Venkateswara College of Engineering",
        college_id: "SVCE1234",
        total_students: cseAStudents.length,
        activated_students: cseAActive,
        pending_students: cseAStudents.length - cseAActive,
        activation_percentage: Math.round((cseAActive / (cseAStudents.length || 1)) * 100),
        hod_name: "Dr. Rajesh Varma",
        last_updated: "Today, 02:30 PM"
      },
      {
        department: "Computer Science & Engineering",
        section: "Section B",
        college_name: "Sri Venkateswara College of Engineering",
        college_id: "SVCE1234",
        total_students: cseBStudents.length,
        activated_students: cseBActive,
        pending_students: cseBStudents.length - cseBActive,
        activation_percentage: Math.round((cseBActive / (cseBStudents.length || 1)) * 100),
        hod_name: "Dr. Rajesh Varma",
        last_updated: "Today, 01:15 PM"
      },
      {
        department: "Electronics & Communication Engineering",
        section: "Section A",
        college_name: "Sri Venkateswara College of Engineering",
        college_id: "SVCE1234",
        total_students: 32,
        activated_students: 29,
        pending_students: 3,
        activation_percentage: 91,
        hod_name: "Dr. M. Anuradha",
        last_updated: "Yesterday, 05:40 PM"
      },
      {
        department: "Information Technology",
        section: "Section A",
        college_name: "Sri Venkateswara College of Engineering",
        college_id: "SVCE1234",
        total_students: 26,
        activated_students: 25,
        pending_students: 1,
        activation_percentage: 96,
        hod_name: "Dr. G. Lalitha",
        last_updated: "Yesterday, 04:10 PM"
      },
      {
        department: "AI & Data Science",
        section: "Section A",
        college_name: "Sri Venkateswara College of Engineering",
        college_id: "SVCE1234",
        total_students: 30,
        activated_students: 27,
        pending_students: 3,
        activation_percentage: 90,
        hod_name: "Dr. Suresh Babu",
        last_updated: "Today, 11:20 AM"
      },
      {
        department: "Mechanical Engineering",
        section: "Section A",
        college_name: "Sri Venkateswara College of Engineering",
        college_id: "SVCE1234",
        total_students: 24,
        activated_students: 20,
        pending_students: 4,
        activation_percentage: 83,
        hod_name: "Dr. K. Srinivas",
        last_updated: "2 days ago"
      }
    ];
  }

  batchActivateDepartment(department: string, section: string): boolean {
    const students = this.getStudents();
    const updated = students.map(s => {
      if (s.department === department && s.section === section) {
        return {
          ...s,
          status: "Active" as const,
          paymentVerified: "Verified" as const,
          licenseActive: "Active" as const
        };
      }
      return s;
    });
    this.saveStudents(updated);
    return true;
  }

  // ================= TPO VERIFICATION LEDGER =================
  getTpoVerificationLedger(collegeId?: number | string, search?: string) {
    const students = this.getStudents();
    let roster = students.map(s => ({
      roll_number: s.rollNumber,
      student_name: `${s.firstName} ${s.lastName}`,
      college_name: "Sri Venkateswara College of Engineering",
      department: s.department,
      section: s.section,
      cgpa: s.cgpa || 7.5,
      payment_verified: s.paymentVerified,
      license_active: s.licenseActive,
      placement_eligible: s.placementEligible,
      verification_date: s.verificationDate
    }));

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      roster = roster.filter(r =>
        r.student_name.toLowerCase().includes(q) ||
        r.roll_number.toLowerCase().includes(q) ||
        r.department.toLowerCase().includes(q) ||
        r.college_name.toLowerCase().includes(q)
      );
    }

    return roster;
  }

  toggleTpoStudentVerification(rollNumber: string): boolean {
    const students = this.getStudents();
    const idx = students.findIndex(s => s.rollNumber.toLowerCase() === rollNumber.toLowerCase());
    if (idx === -1) return false;
    const current = students[idx].paymentVerified;
    students[idx].paymentVerified = current === "Verified" ? "Pending" : "Verified";
    students[idx].licenseActive = students[idx].paymentVerified === "Verified" ? "Active" : "Pending";
    this.saveStudents(students);
    return true;
  }

  // ================= DASHBOARD STATS =================
  getDashboardStats() {
    const students = this.getStudents();
    const staff = this.getStaff();
    const pendingStaff = staff.filter(s => s.invitationStatus === "Pending" || s.invitationStatus === "Sent").length;
    const pendingStudents = students.filter(s => s.status === "Inactive" || s.invitationStatus === "Pending").length;

    return {
      totalStaff: staff.length,
      totalStudents: students.length,
      verifiedDomains: 4,
      pendingStaffInvitations: pendingStaff,
      pendingStudentInvitations: pendingStudents
    };
  }

  // ================= SUPER ADMIN CONSOLIDATED ANALYTICS =================
  getSuperAdminAnalytics(department?: string) {
    const students = this.getStudents();
    const cseStudents = students.filter(s => s.department.includes("Computer"));

    return {
      summary: {
        totalAttempts: 78,
        completedAttempts: 72,
        avgScore: 78,
        passingRate: 84,
        flaggedCount: 3,
        avgIntegrity: 94
      },
      examPerformance: [
        {
          exam_id: 1,
          title: "CS401: Advanced Data Structures & Algorithms",
          category: "Academic",
          totalAttempts: 42,
          completedAttempts: 40,
          avgScore: 82,
          passingRate: 88,
          highestScore: 98,
          lowestScore: 48,
          avgIntegrity: 96,
          registeredStudents: 56,
          activeConcurrent: 2
        },
        {
          exam_id: 2,
          title: "CS402: Full-Stack Web Architecture & System Design",
          category: "Academic",
          totalAttempts: 36,
          completedAttempts: 32,
          avgScore: 74,
          passingRate: 79,
          highestScore: 95,
          lowestScore: 42,
          avgIntegrity: 92,
          registeredStudents: 56,
          activeConcurrent: 4
        }
      ],
      attempts: students.slice(0, 20).map((s, i) => ({
        id: `att-${100 + i}`,
        student: {
          full_name: `${s.firstName} ${s.lastName}`,
          roll_number: s.rollNumber,
          department: s.department,
          cgpa: s.cgpa
        },
        exam: {
          title: i % 2 === 0 ? "CS401: Advanced Data Structures & Algorithms" : "CS402: Full-Stack Web Architecture",
          total_marks: 100,
          passing_pct: 40
        },
        total_score: Math.min(98, Math.round(55 + (i * 7) % 43)),
        status: "completed",
        integrity_score: i === 3 ? 62 : i === 7 ? 68 : 95,
        tab_switches: i === 3 ? 4 : i === 7 ? 3 : 0,
        submitted_at: new Date(Date.now() - (i + 1) * 3600000 * 4).toISOString()
      })),
      activityLogs: [
        {
          id: "log-sa-1",
          timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          type: "proctor_alert",
          studentName: "Manish Tiwari",
          rollNumber: "21CS018",
          department: "Computer Science & Engineering",
          examTitle: "CS401: Advanced Data Structures & Algorithms",
          tabSwitches: 4,
          integrityScore: 62,
          message: "Proctor Warning: Manish Tiwari (21CS018) triggered 4th tab switch violation."
        },
        {
          id: "log-sa-2",
          timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
          type: "placement_activation",
          studentName: "Aarav Sharma",
          rollNumber: "21CS001",
          department: "Computer Science & Engineering",
          examTitle: "Amazon SDE-1 Recruitment Assessment",
          message: "Verification Complete: Aarav Sharma approved for Amazon campus drive."
        }
      ],
      placementAnalytics: {
        summary: {
          totalJobs: 12,
          publishedJobs: 8,
          totalApplications: 142,
          appliedCount: 56,
          pendingCount: 18,
          shortlistedCount: 24,
          rejectedCount: 14
        },
        byDepartment: [
          { department: "Computer Science & Engineering", applications: 78, placed: 22 },
          { department: "Electronics & Communication", applications: 34, placed: 8 },
          { department: "Information Technology", applications: 30, placed: 10 }
        ],
        byCompany: [
          { company: "Amazon Web Services", role: "Software Development Engineer", applicants: 42, shortlisted: 8 },
          { company: "Google Cloud", role: "Cloud Solutions Architect", applicants: 38, shortlisted: 6 },
          { company: "Microsoft India", role: "Full Stack Engineer", applicants: 35, shortlisted: 7 }
        ]
      }
    };
  }
}

export const mockSuperAdminStore = new MockSuperAdminStore();
