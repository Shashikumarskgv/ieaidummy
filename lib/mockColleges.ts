export interface College {
  id: string;
  name: string;
  code: string;
  adminName: string;
  adminEmail: string;
  adminPhone: string;
  adminDesignation: string;
  website?: string;
  domains: string[];
  country: string;
  state: string;
  city: string;
  district: string;
  streetAddress: string;
  coordinates?: string;
  postalCode: string;
  types: string[];
  degrees: string[];
  capacity: number;
  logoUrl?: string;
  coverUrl?: string;
  status: "Active" | "Pending" | "Inactive" | "Invited" | "Archived";
  createdDate: string;
  academicProfile?: any;
}

export interface ActivityLog {
  id: string;
  collegeId?: string;
  collegeName: string;
  event: string;
  timestamp: string;
  status: string;
}

export const INITIAL_COLLEGES: College[] = [
  {
    id: "SVCE1234",
    name: "Sri Venkateswara College of Engineering",
    code: "SVCE1234",
    adminName: "R. Prakash",
    adminEmail: "placement@svce.edu",
    adminPhone: "+91 98765 43210",
    adminDesignation: "TPO",
    website: "https://www.svce.edu",
    domains: ["svce.edu", "student.svce.edu"],
    country: "India",
    state: "Andhra Pradesh",
    city: "Tirupati",
    district: "Chittoor District",
    streetAddress: "Karakambadi Road, Near Renigunta",
    coordinates: "13.6288, 79.4192",
    postalCode: "517507",
    types: ["Engineering"],
    degrees: ["B.Tech", "M.Tech", "MBA"],
    capacity: 3450,
    logoUrl: "",
    coverUrl: "",
    status: "Active",
    createdDate: "20 May 2025"
  },
  {
    id: "VIT5678",
    name: "Vignan Institute of Technology",
    code: "VIT5678",
    adminName: "B. Lakshmi",
    adminEmail: "placements@vignan.ac.in",
    adminPhone: "+91 91234 56789",
    adminDesignation: "TPO",
    website: "https://vignan.ac.in",
    domains: ["vignan.ac.in", "student.vignan.ac.in"],
    country: "India",
    state: "Telangana",
    city: "Hyderabad",
    district: "Medchal District",
    streetAddress: "Deshmukhi Village, Pochampally Mandal",
    coordinates: "17.3850, 78.4867",
    postalCode: "500080",
    types: ["Engineering", "Degree"],
    degrees: ["B.Tech", "M.Tech", "MBA", "MCA"],
    capacity: 2890,
    logoUrl: "",
    coverUrl: "",
    status: "Pending",
    createdDate: "18 May 2025"
  },
  {
    id: "STAN3456",
    name: "St. Ann's Degree College",
    code: "STAN3456",
    adminName: "S. John",
    adminEmail: "info@stannscollege.edu",
    adminPhone: "+91 99887 66554",
    adminDesignation: "Principal",
    website: "https://stannscollege.edu",
    domains: ["stannscollege.edu"],
    country: "India",
    state: "Karnataka",
    city: "Bangalore",
    district: "Bangalore Urban",
    streetAddress: "23rd Cross Road, Jayanagar",
    coordinates: "12.9716, 77.5946",
    postalCode: "560001",
    types: ["Degree", "Arts"],
    degrees: ["B.Sc", "B.Com", "B.A."],
    capacity: 1230,
    logoUrl: "",
    coverUrl: "",
    status: "Active",
    createdDate: "15 May 2025"
  },
  {
    id: "AUR6789",
    name: "Aurora Polytechnic",
    code: "AUR6789",
    adminName: "M. Ramesh",
    adminEmail: "admin@aurora.edu.in",
    adminPhone: "+91 90000 11122",
    adminDesignation: "Principal",
    website: "https://aurora.edu.in",
    domains: ["aurora.edu.in"],
    country: "India",
    state: "Tamil Nadu",
    city: "Chennai",
    district: "Chennai District",
    streetAddress: "Anna Salai, Mount Road",
    coordinates: "13.0827, 80.2707",
    postalCode: "600002",
    types: ["Polytechnic"],
    degrees: ["Diploma in Eng."],
    capacity: 980,
    logoUrl: "",
    coverUrl: "",
    status: "Invited",
    createdDate: "12 May 2025"
  },
  {
    id: "GFAS1122",
    name: "Greenfield Arts & Science",
    code: "GFAS1122",
    adminName: "K. Deepa",
    adminEmail: "info@gfascollege.edu",
    adminPhone: "+91 94444 55667",
    adminDesignation: "HOD",
    website: "https://gfascollege.edu",
    domains: ["gfascollege.edu"],
    country: "India",
    state: "Kerala",
    city: "Trivandrum",
    district: "Thiruvananthapuram District",
    streetAddress: "Technopark Campus Road",
    coordinates: "8.5241, 76.9366",
    postalCode: "695001",
    types: ["Arts", "Degree"],
    degrees: ["B.Sc", "B.Com", "B.A."],
    capacity: 1560,
    logoUrl: "",
    coverUrl: "",
    status: "Inactive",
    createdDate: "10 May 2025"
  }
];

export const INITIAL_ACTIVITIES: ActivityLog[] = [
  {
    id: "act-1",
    collegeName: "Sri Venkateswara College of Engineering",
    event: "College profile activated by R. Prakash",
    timestamp: "20 May 2025 10:30 AM",
    status: "Activated"
  },
  {
    id: "act-2",
    collegeName: "Vignan Institute of Technology",
    event: "Verification email sent to placements@vignan.ac.in",
    timestamp: "18 May 2025 04:15 PM",
    status: "Email Sent"
  },
  {
    id: "act-3",
    collegeName: "Aurora Polytechnic",
    event: "Invitation link generated",
    timestamp: "12 May 2025 11:20 AM",
    status: "Invited"
  },
  {
    id: "act-4",
    collegeName: "Greenfield Arts & Science",
    event: "College profile deactivated",
    timestamp: "10 May 2025 09:45 AM",
    status: "Deactivated"
  }
];

export function getStoredColleges(): College[] {
  if (typeof window === "undefined") return INITIAL_COLLEGES;
  const stored = localStorage.getItem("dq_colleges");
  if (!stored) {
    localStorage.setItem("dq_colleges", JSON.stringify(INITIAL_COLLEGES));
    return INITIAL_COLLEGES;
  }
  return JSON.parse(stored);
}

export function saveColleges(colleges: College[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem("dq_colleges", JSON.stringify(colleges));
}

export function getStoredActivities(): ActivityLog[] {
  if (typeof window === "undefined") return INITIAL_ACTIVITIES;
  const stored = localStorage.getItem("dq_activities");
  if (!stored) {
    localStorage.setItem("dq_activities", JSON.stringify(INITIAL_ACTIVITIES));
    return INITIAL_ACTIVITIES;
  }
  return JSON.parse(stored);
}

export function saveActivities(activities: ActivityLog[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem("dq_activities", JSON.stringify(activities));
}

export function addActivity(collegeName: string, event: string, status: string) {
  const activities = getStoredActivities();
  const newActivity: ActivityLog = {
    id: "act-" + Date.now(),
    collegeName,
    event,
    timestamp: new Date().toLocaleString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    }),
    status
  };
  saveActivities([newActivity, ...activities]);
}

// College Staff Schema
export interface Staff {
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

const INITIAL_STAFF: Staff[] = [
  {
    id: "SVCE-TPO-001",
    name: "R Prakash",
    email: "tpo@svce.edu.in",
    phone: "9876543210",
    role: "TPO",
    accessScope: "Entire College",
    status: "Active",
    invitationStatus: "Accepted",
    collegeId: "SVCE1234",
    createdDate: "10 May 2025",
    lastLogin: "12 May 2025, 10:30 AM"
  },
  {
    id: "SVCE-HOD-CSE",
    name: "S Jeevan",
    email: "hod.cse@svce.edu.in",
    phone: "9876543210",
    role: "HOD",
    department: "Computer Science & Engineering (CSE)",
    status: "Active",
    invitationStatus: "Accepted",
    collegeId: "SVCE1234",
    createdDate: "11 May 2025",
    lastLogin: "12 May 2025, 09:15 AM"
  },
  {
    id: "SVCE-HOD-ECE",
    name: "M. Anuradha",
    email: "hod.ece@svce.edu.in",
    phone: "9988776655",
    role: "HOD",
    department: "Electronics & Communication Engineering (ECE)",
    status: "Active",
    invitationStatus: "Accepted",
    collegeId: "SVCE1234",
    createdDate: "12 May 2025",
    lastLogin: "12 May 2025, 11:00 AM"
  },
  {
    id: "SVCE-TPO-002",
    name: "Kiran Kumar",
    email: "tpo2@svce.edu.in",
    phone: "9444455566",
    role: "TPO",
    accessScope: "Selected Departments",
    selectedDepartments: ["Mechanical Engineering", "Civil Engineering"],
    status: "Inactive",
    invitationStatus: "Accepted",
    collegeId: "SVCE1234",
    createdDate: "13 May 2025",
    lastLogin: "14 May 2025, 03:20 PM"
  },
  {
    id: "SVCE-HOD-MECH",
    name: "Dr. K. Srinivas",
    email: "hod.mech@svce.edu.in",
    phone: "9555566677",
    role: "HOD",
    department: "Mechanical Engineering",
    status: "Active",
    invitationStatus: "Pending",
    collegeId: "SVCE1234",
    createdDate: "14 May 2025"
  },
  {
    id: "SVCE-HOD-CIVIL",
    name: "Prof. P. Venkat",
    email: "hod.civil@svce.edu.in",
    phone: "9666677788",
    role: "HOD",
    department: "Civil Engineering",
    status: "Active",
    invitationStatus: "Sent",
    collegeId: "SVCE1234",
    createdDate: "15 May 2025"
  },
  {
    id: "SVCE-HOD-IT",
    name: "Dr. G. Lalitha",
    email: "hod.it@svce.edu.in",
    phone: "9777788899",
    role: "HOD",
    department: "Information Technology (IT)",
    status: "Active",
    invitationStatus: "Expired",
    collegeId: "SVCE1234",
    createdDate: "05 May 2025"
  }
];

export function getStoredStaff(): Staff[] {
  if (typeof window === "undefined") return INITIAL_STAFF;
  const stored = localStorage.getItem("dq_staff");
  if (!stored) {
    localStorage.setItem("dq_staff", JSON.stringify(INITIAL_STAFF));
    return INITIAL_STAFF;
  }
  return JSON.parse(stored);
}

export function saveStaff(staff: Staff[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem("dq_staff", JSON.stringify(staff));
}

// Student & Import History Schema
export interface Student {
  invitationStatus: string;
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
  collegeId: string;
  createdDate: string;
}

export interface ImportErrorDetail {
  row: number;
  column: string;
  error: string;
}

export interface ImportHistory {
  id: string;
  fileName: string;
  importedBy: string;
  importDate: string;
  successCount: number;
  failedCount: number;
  skippedCount: number;
  collegeId: string;
  errors: ImportErrorDetail[];
}

const INITIAL_IMPORT_HISTORY: ImportHistory[] = [
  {
    id: "imp-1",
    fileName: "Students_Batch_2027_CSE.xlsx",
    importedBy: "R Prakash",
    importDate: "12 May 2025, 10:30 AM",
    successCount: 1186,
    failedCount: 36,
    skippedCount: 28,
    collegeId: "SVCE1234",
    errors: [
      { row: 12, column: "Department", error: "Invalid Department (CS instead of CSE)" },
      { row: 18, column: "Section", error: "Invalid Section C for ECE Dept" },
      { row: 25, column: "Roll Number", error: "Duplicate Roll Number (20711A0501 already exists)" },
      { row: 46, column: "Email", error: "Invalid Official Email Domain (gmail.com instead of svce.edu.in)" }
    ]
  },
  {
    id: "imp-2",
    fileName: "ECE_PreFinal_Admissions.csv",
    importedBy: "S Jeevan",
    importDate: "08 May 2025, 02:15 PM",
    successCount: 120,
    failedCount: 0,
    skippedCount: 5,
    collegeId: "SVCE1234",
    errors: []
  }
];


export function getStoredStudents(): Student[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem("dq_students");
  if (!stored) {
    localStorage.setItem("dq_students", JSON.stringify([]));
    return [];
  }
  return JSON.parse(stored);
}

export function saveStudents(students: Student[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem("dq_students", JSON.stringify(students));
}

export function getStoredImportHistory(): ImportHistory[] {
  if (typeof window === "undefined") return INITIAL_IMPORT_HISTORY;
  const stored = localStorage.getItem("dq_import_history");
  if (!stored) {
    localStorage.setItem("dq_import_history", JSON.stringify(INITIAL_IMPORT_HISTORY));
    return INITIAL_IMPORT_HISTORY;
  }
  return JSON.parse(stored);
}

export function saveImportHistory(history: ImportHistory[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem("dq_import_history", JSON.stringify(history));
}


