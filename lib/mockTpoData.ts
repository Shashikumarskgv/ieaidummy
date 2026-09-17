/**
 * TPO (Training & Placement Officer) Mock Data & Standalone State Store
 * 
 * Provides complete, mathematically consistent corporate drive records, student applications,
 * HR recruiter accounts, placement analytics, and concurrency metrics for 50+ students.
 */

import { INITIAL_STUDENTS, StudentRecord } from "./mockHodData";

export interface TPOStudentRecord {
  id: number;
  user_id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  roll_number: string;
  department: string;
  section: "A" | "B";
  semester: string;
  batch: string;
  graduation_year: number;
  email: string;
  personal_email: string;
  phone: string;
  cgpa: number;
  academics_percentage: number;
  ieai_performance_percentage: number;
  skills: string[];
  placement_status: "placed" | "interviewing" | "applied" | "eligible" | "unplaced";
  company_offer?: string;
  offered_ctc_lpa?: number;
  resume_url: string;
  total_attempts: number;
  pass_rate: number;
  avg_score: number;
  integrity_score: number;
  application_status?: string;
}

export interface TPOJobRecord {
  id: number;
  role: string;
  company: string;
  location: string;
  category: string;
  employment_type: string;
  experience_level: string;
  ctc_lpa: number;
  ctc_range: string;
  min_cgpa: number;
  academics_percentage: number;
  ieai_performance_percentage: number;
  skills: string[];
  program_level: string;
  degree: string;
  departments: string[];
  description: string;
  apply_link?: string;
  status: "published" | "closed" | "draft";
  created_at: string;
  applicants_count: number;
  shortlisted_count: number;
  offered_count: number;
}

export interface TPOApplicationRecord {
  id: number;
  job_id: number;
  student_id: number;
  student: {
    id: number;
    full_name: string;
    roll_number: string;
    department: string;
    section: string;
    cgpa: number;
    email: string;
    phone: string;
    resume_url: string;
    academics_percentage?: number;
    ieai_performance_percentage?: number;
  };
  status: "applied" | "shortlisted" | "interview_scheduled" | "offered" | "rejected";
  applied_at: string;
  notes?: string;
}

export interface TPOHRAccountRecord {
  id: number;
  company_name: string;
  hr_name: string;
  email: string;
  phone: string;
  job_id: number | null;
  job_title?: string;
  job_role?: string;
  is_active?: boolean;
  created_at: string;
  expires_at: string;
  status: "Active" | "Pending" | "Expired";
  temp_token: string;
}

// ----------------------------------------------------------------------
// 1. Initial 56 TPO Students
// ----------------------------------------------------------------------
const TECH_SKILLS_POOL = [
  ["Python", "FastAPI", "PostgreSQL", "Docker", "AWS"],
  ["Java", "Spring Boot", "Microservices", "Kafka", "MySQL"],
  ["React", "TypeScript", "Next.js", "Tailwind CSS", "Node.js"],
  ["C++", "Data Structures", "Algorithms", "System Design", "Linux"],
  ["Machine Learning", "PyTorch", "Pandas", "Scikit-Learn", "Computer Vision"],
  ["Go", "Kubernetes", "gRPC", "Distributed Systems", "GCP"],
  ["Full Stack", "MongoDB", "Express", "React", "Node.js"],
  ["Cloud Architecture", "Terraform", "CI/CD", "Azure", "Security"]
];

const DEPARTMENTS_DIST = [
  "Computer Science & Engineering",
  "Information Technology",
  "Electronics & Communication Engineering",
  "Artificial Intelligence & Data Science"
];

export const INITIAL_TPO_STUDENTS: TPOStudentRecord[] = INITIAL_STUDENTS.map((s, idx) => {
  const dept = DEPARTMENTS_DIST[idx % DEPARTMENTS_DIST.length];
  const academicsPct = Math.round((s.cgpa / 10) * 100);
  const ieaiPct = Math.min(99, Math.max(65, Math.round(academicsPct - 3 + ((idx * 11) % 15))));
  const skills = TECH_SKILLS_POOL[idx % TECH_SKILLS_POOL.length];
  
  let placementStatus: TPOStudentRecord["placement_status"] = "applied";
  let companyOffer: string | undefined;
  let offeredCtc: number | undefined;

  if (idx < 18) {
    placementStatus = "placed";
    const topOffers = [
      { comp: "Google", ctc: 32.0 },
      { comp: "Amazon", ctc: 28.5 },
      { comp: "Microsoft", ctc: 26.0 },
      { comp: "Adobe", ctc: 24.0 },
      { comp: "Cisco", ctc: 18.0 },
      { comp: "Zomato", ctc: 16.0 },
      { comp: "Deloitte", ctc: 12.5 },
      { comp: "TCS Digital", ctc: 7.5 }
    ];
    const pick = topOffers[idx % topOffers.length];
    companyOffer = pick.comp;
    offeredCtc = pick.ctc;
  } else if (idx < 32) {
    placementStatus = "interviewing";
  } else if (idx < 48) {
    placementStatus = "applied";
  } else {
    placementStatus = "eligible";
  }

  const passRate = Math.min(100, Math.max(70, Math.round(75 + ((idx * 7) % 25))));
  const avgScore = Math.min(98, Math.max(68, Math.round(70 + ((idx * 9) % 28))));
  const integrityScore = Math.min(100, Math.max(88, Math.round(92 + ((idx * 3) % 8))));

  return {
    ...s,
    department: dept,
    graduation_year: 2025,
    academics_percentage: academicsPct,
    ieai_performance_percentage: ieaiPct,
    skills,
    placement_status: placementStatus,
    company_offer: companyOffer,
    offered_ctc_lpa: offeredCtc,
    resume_url: `https://storage.college.edu/resumes/${s.roll_number.toLowerCase()}_cv.pdf`,
    total_attempts: 4 + (idx % 6),
    pass_rate: passRate,
    avg_score: avgScore,
    integrity_score: integrityScore
  };
});

// ----------------------------------------------------------------------
// 2. Initial Corporate Job Drives
// ----------------------------------------------------------------------
export const INITIAL_TPO_JOBS: TPOJobRecord[] = [
  {
    id: 1,
    role: "Software Development Engineer I (SDE I)",
    company: "Amazon",
    location: "Hyderabad / Bangalore",
    category: "Product Engineering",
    employment_type: "Full-time",
    experience_level: "Fresher",
    ctc_lpa: 28.5,
    ctc_range: "₹26.0 - ₹28.5 LPA",
    min_cgpa: 7.5,
    academics_percentage: 75,
    ieai_performance_percentage: 80,
    skills: ["Data Structures", "Algorithms", "Java", "System Design", "AWS"],
    program_level: "Undergraduate (UG)",
    degree: "B.Tech",
    departments: ["Computer Science & Engineering", "Information Technology"],
    description: "Amazon is looking for high-caliber Software Engineers to innovate and build planet-scale distributed services. You will design, build, test, and deploy resilient customer-facing systems.",
    apply_link: "https://amazon.jobs/en/jobs/2194812",
    status: "published",
    created_at: "2026-08-15T10:00:00.000Z",
    applicants_count: 28,
    shortlisted_count: 8,
    offered_count: 4
  },
  {
    id: 2,
    role: "Associate Software Engineer",
    company: "Google",
    location: "Bangalore / Hyderabad",
    category: "Product Engineering",
    employment_type: "Full-time",
    experience_level: "Fresher",
    ctc_lpa: 32.0,
    ctc_range: "₹30.0 - ₹32.0 LPA",
    min_cgpa: 8.0,
    academics_percentage: 80,
    ieai_performance_percentage: 85,
    skills: ["C++", "Python", "Distributed Systems", "Algorithms", "Linux"],
    program_level: "Undergraduate (UG)",
    degree: "B.Tech",
    departments: ["Computer Science & Engineering", "Information Technology", "Artificial Intelligence & Data Science"],
    description: "Google software engineers develop next-generation technologies that change how billions of users interact with computing. We look for individuals who bring fresh ideas from all areas.",
    apply_link: "https://careers.google.com/jobs/results/10928374",
    status: "published",
    created_at: "2026-08-18T09:30:00.000Z",
    applicants_count: 32,
    shortlisted_count: 6,
    offered_count: 3
  },
  {
    id: 3,
    role: "Full Stack Engineer (Azure Cloud)",
    company: "Microsoft",
    location: "Hyderabad / Noida",
    category: "Cloud & DevOps",
    employment_type: "Full-time",
    experience_level: "Fresher",
    ctc_lpa: 26.0,
    ctc_range: "₹24.0 - ₹26.0 LPA",
    min_cgpa: 7.2,
    academics_percentage: 70,
    ieai_performance_percentage: 75,
    skills: ["TypeScript", "C#", ".NET Core", "React", "Azure", "Microservices"],
    program_level: "All Levels",
    degree: "B.Tech",
    departments: ["Computer Science & Engineering", "Information Technology", "Electronics & Communication Engineering"],
    description: "Build robust cloud services within the Azure Cloud and Enterprise divisions. Architect scalable web portals, event-driven pipelines, and developer developer SDKs.",
    apply_link: "https://careers.microsoft.com/us/en/job/1847192",
    status: "published",
    created_at: "2026-08-20T11:00:00.000Z",
    applicants_count: 24,
    shortlisted_count: 7,
    offered_count: 3
  },
  {
    id: 4,
    role: "Cloud Solutions Architect - Early Career",
    company: "Cisco Systems",
    location: "Bangalore",
    category: "Cloud & DevOps",
    employment_type: "Full-time",
    experience_level: "Entry-Level",
    ctc_lpa: 18.0,
    ctc_range: "₹16.0 - ₹18.0 LPA",
    min_cgpa: 7.0,
    academics_percentage: 70,
    ieai_performance_percentage: 70,
    skills: ["Networking", "Python", "Linux", "Kubernetes", "Cloud Security"],
    program_level: "Undergraduate (UG)",
    degree: "B.Tech",
    departments: ["Computer Science & Engineering", "Information Technology", "Electronics & Communication Engineering"],
    description: "Design high-reliability networking hardware/software integrations, secure software-defined wide area networks, and observability tooling for tier-1 enterprises.",
    apply_link: "https://jobs.cisco.com/jobs/Project/Early-Career-Cloud",
    status: "published",
    created_at: "2026-08-25T14:15:00.000Z",
    applicants_count: 18,
    shortlisted_count: 6,
    offered_count: 4
  },
  {
    id: 5,
    role: "AI / Machine Learning Engineer",
    company: "Adobe",
    location: "Noida / Bangalore",
    category: "AI & Data Science",
    employment_type: "Full-time",
    experience_level: "Fresher",
    ctc_lpa: 24.0,
    ctc_range: "₹22.0 - ₹24.0 LPA",
    min_cgpa: 7.8,
    academics_percentage: 75,
    ieai_performance_percentage: 82,
    skills: ["Python", "PyTorch", "Generative AI", "Computer Vision", "FastAPI"],
    program_level: "Undergraduate (UG)",
    degree: "B.Tech",
    departments: ["Computer Science & Engineering", "Artificial Intelligence & Data Science"],
    description: "Work on Adobe Sensei generative AI models, intelligent vector processing, and content-aware digital imaging features integrated into Photoshop and Firefly.",
    apply_link: "https://adobe.wd5.myworkdayjobs.com/en-US/external_experienced/job/Noida/ML-Eng",
    status: "published",
    created_at: "2026-08-28T10:45:00.000Z",
    applicants_count: 20,
    shortlisted_count: 5,
    offered_count: 3
  },
  {
    id: 6,
    role: "Data Analytics Consultant",
    company: "Deloitte USI",
    location: "Hyderabad / Pune / Gurgaon",
    category: "Consulting & Analytics",
    employment_type: "Full-time",
    experience_level: "Fresher",
    ctc_lpa: 12.5,
    ctc_range: "₹11.0 - ₹12.5 LPA",
    min_cgpa: 6.8,
    academics_percentage: 65,
    ieai_performance_percentage: 68,
    skills: ["SQL", "PowerBI", "Python", "Data Modeling", "Business Intelligence"],
    program_level: "All Levels",
    degree: "B.Tech",
    departments: ["Computer Science & Engineering", "Information Technology", "Electronics & Communication Engineering", "Artificial Intelligence & Data Science"],
    description: "Translate complex business questions into quantitative insights. Build interactive dashboards, predictive models, and data governance frameworks for Global 500 clients.",
    apply_link: "https://deloitte.com/careers/analyst-usi",
    status: "published",
    created_at: "2026-09-01T08:00:00.000Z",
    applicants_count: 26,
    shortlisted_count: 9,
    offered_count: 6
  },
  {
    id: 7,
    role: "Backend Platform Engineer",
    company: "Zomato",
    location: "Gurgaon",
    category: "Product Engineering",
    employment_type: "Full-time",
    experience_level: "Fresher",
    ctc_lpa: 16.0,
    ctc_range: "₹14.0 - ₹16.0 LPA",
    min_cgpa: 7.0,
    academics_percentage: 70,
    ieai_performance_percentage: 75,
    skills: ["Go", "Node.js", "Redis", "Kafka", "PostgreSQL"],
    program_level: "Undergraduate (UG)",
    degree: "B.Tech",
    departments: ["Computer Science & Engineering", "Information Technology"],
    description: "Build ultra-low-latency order management and dispatch infrastructure processing millions of requests per minute across Blinkit and Zomato core delivery platforms.",
    apply_link: "https://zomato.com/careers/backend-eng",
    status: "published",
    created_at: "2026-09-03T16:00:00.000Z",
    applicants_count: 16,
    shortlisted_count: 5,
    offered_count: 3
  },
  {
    id: 8,
    role: "Systems Engineer - Digital Cadre",
    company: "TCS Digital",
    location: "Pan-India",
    category: "Full Stack Development",
    employment_type: "Full-time",
    experience_level: "Fresher",
    ctc_lpa: 7.5,
    ctc_range: "₹7.0 - ₹7.5 LPA",
    min_cgpa: 6.5,
    academics_percentage: 60,
    ieai_performance_percentage: 65,
    skills: ["Java", "Python", "SQL", "HTML5", "Cloud Fundamentals"],
    program_level: "All Levels",
    degree: "B.Tech",
    departments: ["Computer Science & Engineering", "Information Technology", "Electronics & Communication Engineering", "Artificial Intelligence & Data Science"],
    description: "TCS Digital is the premier hiring tier for high-aptitude graduates to work on enterprise digital transformation, AI adoption, and cloud modernization.",
    apply_link: "https://nextstep.tcs.com/campus/#/digital-drive",
    status: "published",
    created_at: "2026-09-05T09:00:00.000Z",
    applicants_count: 22,
    shortlisted_count: 12,
    offered_count: 8
  },
  {
    id: 9,
    role: "Specialist Programmer",
    company: "Infosys Springboard",
    location: "Bangalore / Mysore",
    category: "Product Engineering",
    employment_type: "Full-time",
    experience_level: "Fresher",
    ctc_lpa: 9.5,
    ctc_range: "₹9.0 - ₹9.5 LPA",
    min_cgpa: 6.8,
    academics_percentage: 65,
    ieai_performance_percentage: 70,
    skills: ["Competitive Programming", "Java", "Python", "Data Structures", "Algorithms"],
    program_level: "All Levels",
    degree: "B.Tech",
    departments: ["Computer Science & Engineering", "Information Technology"],
    description: "Specialist programmers solve hard computational problems, implement algorithmic optimizations, and lead technology centers of excellence.",
    apply_link: "https://career.infosys.com/jobdesc?jobReferenceCode=INF-SP-2025",
    status: "closed",
    created_at: "2026-07-20T10:00:00.000Z",
    applicants_count: 15,
    shortlisted_count: 4,
    offered_count: 2
  },
  {
    id: 10,
    role: "GenC Elevate Software Engineer",
    company: "Cognizant",
    location: "Chennai / Hyderabad",
    category: "Full Stack Development",
    employment_type: "Full-time",
    experience_level: "Fresher",
    ctc_lpa: 6.5,
    ctc_range: "₹6.0 - ₹6.5 LPA",
    min_cgpa: 6.0,
    academics_percentage: 60,
    ieai_performance_percentage: 62,
    skills: ["React", "Java", "Spring Boot", "Git", "REST APIs"],
    program_level: "All Levels",
    degree: "B.Tech",
    departments: ["Computer Science & Engineering", "Information Technology", "Electronics & Communication Engineering"],
    description: "Work on next-generation customer experience platforms, API integrations, and cloud migration for Fortune 50 healthcare and financial banking accounts.",
    apply_link: "https://careers.cognizant.com/genc-elevate",
    status: "draft",
    created_at: "2026-09-12T11:30:00.000Z",
    applicants_count: 0,
    shortlisted_count: 0,
    offered_count: 0
  }
];

// ----------------------------------------------------------------------
// 3. Initial HR Accounts Directory
// ----------------------------------------------------------------------
export const INITIAL_TPO_HR_ACCOUNTS: TPOHRAccountRecord[] = [
  {
    id: 1,
    company_name: "Google",
    hr_name: "Sarah Jenkins",
    email: "sjenkins.recruitment@google.com",
    phone: "+91 98450 11223",
    job_id: 2,
    job_title: "Associate Software Engineer",
    job_role: "Associate Software Engineer",
    is_active: true,
    created_at: "2026-09-10T10:00:00Z",
    expires_at: "2026-09-25T23:59:59Z",
    status: "Active",
    temp_token: "HR_TOK_GGL_9981"
  },
  {
    id: 2,
    company_name: "Amazon",
    hr_name: "Priya Nair",
    email: "priyan.talent@amazon.com",
    phone: "+91 98765 43210",
    job_id: 1,
    job_title: "Software Development Engineer I (SDE I)",
    job_role: "Software Development Engineer I (SDE I)",
    is_active: true,
    created_at: "2026-09-11T12:30:00Z",
    expires_at: "2026-09-26T23:59:59Z",
    status: "Active",
    temp_token: "HR_TOK_AMZN_4421"
  },
  {
    id: 3,
    company_name: "Microsoft",
    hr_name: "Rajiv Menon",
    email: "rmenon.campus@microsoft.com",
    phone: "+91 99123 55443",
    job_id: 3,
    job_title: "Full Stack Engineer (Azure Cloud)",
    job_role: "Full Stack Engineer (Azure Cloud)",
    is_active: true,
    created_at: "2026-09-12T09:15:00Z",
    expires_at: "2026-09-27T23:59:59Z",
    status: "Active",
    temp_token: "HR_TOK_MSFT_1120"
  },
  {
    id: 4,
    company_name: "Cisco Systems",
    hr_name: "Vikram Patel",
    email: "vpatel.university@cisco.com",
    phone: "+91 97654 88776",
    job_id: 4,
    job_title: "Cloud Solutions Architect - Early Career",
    job_role: "Cloud Solutions Architect - Early Career",
    is_active: true,
    created_at: "2026-09-13T14:20:00Z",
    expires_at: "2026-09-28T23:59:59Z",
    status: "Active",
    temp_token: "HR_TOK_CSCO_8819"
  },
  {
    id: 5,
    company_name: "Adobe",
    hr_name: "Ananya Roy",
    email: "aroy.talentacquisition@adobe.com",
    phone: "+91 96543 22119",
    job_id: 5,
    job_title: "AI / Machine Learning Engineer",
    job_role: "AI / Machine Learning Engineer",
    is_active: true,
    created_at: "2026-09-14T11:45:00Z",
    expires_at: "2026-09-29T23:59:59Z",
    status: "Active",
    temp_token: "HR_TOK_ADBE_7723"
  },
  {
    id: 6,
    company_name: "Deloitte USI",
    hr_name: "Neha Sharma",
    email: "nsharma.campusrecruiting@deloitte.com",
    phone: "+91 95432 11998",
    job_id: 6,
    job_title: "Data Analytics Consultant",
    job_role: "Data Analytics Consultant",
    is_active: true,
    created_at: "2026-09-15T15:10:00Z",
    expires_at: "2026-09-30T23:59:59Z",
    status: "Active",
    temp_token: "HR_TOK_DLTT_3312"
  },
  {
    id: 7,
    company_name: "Zomato",
    hr_name: "Rohan Kapoor",
    email: "rohan.people@zomato.com",
    phone: "+91 94321 00987",
    job_id: 7,
    job_title: "Backend Platform Engineer",
    job_role: "Backend Platform Engineer",
    is_active: true,
    created_at: "2026-09-16T10:05:00Z",
    expires_at: "2026-10-01T23:59:59Z",
    status: "Active",
    temp_token: "HR_TOK_ZMTO_5561"
  },
  {
    id: 8,
    company_name: "TCS Digital",
    hr_name: "Kavita Sundaram",
    email: "kavita.digitalhiring@tcs.com",
    phone: "+91 93210 99876",
    job_id: 8,
    job_title: "Systems Engineer - Digital Cadre",
    job_role: "Systems Engineer - Digital Cadre",
    is_active: true,
    created_at: "2026-09-16T16:40:00Z",
    expires_at: "2026-10-01T23:59:59Z",
    status: "Active",
    temp_token: "HR_TOK_TCSD_2245"
  }
];

// ----------------------------------------------------------------------
// 4. Initial Student Job Applications Generator (180+ records)
// ----------------------------------------------------------------------
function generateInitialApplications(jobs: TPOJobRecord[], students: TPOStudentRecord[]): TPOApplicationRecord[] {
  const apps: TPOApplicationRecord[] = [];
  let appId = 1;

  jobs.forEach(job => {
    // Determine eligible cohort for this job
    const eligibleCohort = students.filter(s => {
      const deptMatch = job.departments.includes(s.department);
      const cgpaMatch = s.cgpa >= job.min_cgpa - 0.4;
      return deptMatch && cgpaMatch;
    });

    // Pick a subset of applicants for this drive
    const count = Math.min(job.applicants_count, eligibleCohort.length);
    for (let i = 0; i < count; i++) {
      const student = eligibleCohort[i];
      let appStatus: TPOApplicationRecord["status"] = "applied";

      if (i < job.offered_count) {
        appStatus = "offered";
      } else if (i < job.shortlisted_count) {
        appStatus = "shortlisted";
      } else if (i % 5 === 0) {
        appStatus = "rejected";
      } else if (i % 3 === 0) {
        appStatus = "interview_scheduled";
      }

      apps.push({
        id: appId++,
        job_id: job.id,
        student_id: student.id,
        student: {
          id: student.id,
          full_name: student.full_name,
          roll_number: student.roll_number,
          department: student.department,
          section: student.section,
          cgpa: student.cgpa,
          email: student.email,
          phone: student.phone,
          resume_url: student.resume_url,
          academics_percentage: student.academics_percentage,
          ieai_performance_percentage: student.ieai_performance_percentage
        },
        status: appStatus,
        applied_at: new Date(Date.now() - (i * 86400000 * 1.5)).toISOString(),
        notes: appStatus === "offered" ? "Exemplary performance in technical rounds." : undefined
      });
    }
  });

  return apps;
}

export const INITIAL_TPO_APPLICATIONS: TPOApplicationRecord[] = generateInitialApplications(INITIAL_TPO_JOBS, INITIAL_TPO_STUDENTS);

// ----------------------------------------------------------------------
// 5. Reactive Standalone Store with Auto-Repair
// ----------------------------------------------------------------------
const STORAGE_KEYS = {
  VERSION: "tpo_store_version_v2",
  STUDENTS: "tpo_students_db_v2",
  JOBS: "tpo_jobs_db_v2",
  APPLICATIONS: "tpo_applications_db_v2",
  HR_ACCOUNTS: "tpo_hr_accounts_db_v2",
  PROFILE: "tpo_profile_db_v2"
};

const DEFAULT_TPO_PROFILE = {
  id: 401,
  name: "Dr. Ananya Sharma",
  first_name: "Ananya",
  last_name: "Sharma",
  email: "tpo.corporate@college.edu",
  phone: "+91 98112 34567",
  designation: "Head - Training, Placements & Corporate Relations",
  department: "Training & Placement Cell",
  college_name: "Sri Venkateswara College of Engineering",
  college_code: "SVCE1234",
  office_location: "Admin Block, 2nd Floor, Room 204",
  bio: "Directing strategic placement partnerships, corporate MoUs, industry internships, and student readiness programs across engineering disciplines.",
  experience_years: 14,
  dob: "1983-05-14"
};

class MockTPOStore {
  private isBrowser(): boolean {
    return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
  }

  private initStore(): void {
    if (!this.isBrowser()) return;
    try {
      const currentVersion = localStorage.getItem(STORAGE_KEYS.VERSION);
      if (currentVersion !== "2.1") {
        // Upgrade / seed store
        localStorage.setItem(STORAGE_KEYS.VERSION, "2.1");
        localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(INITIAL_TPO_STUDENTS));
        localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(INITIAL_TPO_JOBS));
        localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(INITIAL_TPO_APPLICATIONS));
        localStorage.setItem(STORAGE_KEYS.HR_ACCOUNTS, JSON.stringify(INITIAL_TPO_HR_ACCOUNTS));
        localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(DEFAULT_TPO_PROFILE));
      }
    } catch (e) {
      console.warn("Error initializing MockTPOStore in localStorage", e);
    }
  }

  constructor() {
    this.initStore();
  }

  // ---- Students ----
  public getStudents(): TPOStudentRecord[] {
    if (!this.isBrowser()) return INITIAL_TPO_STUDENTS;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.STUDENTS);
      if (raw) return JSON.parse(raw);
    } catch {}
    return INITIAL_TPO_STUDENTS;
  }

  // ---- Jobs ----
  public getJobs(search: string = "", deptFilter: string = "All"): TPOJobRecord[] {
    let list: TPOJobRecord[] = INITIAL_TPO_JOBS;
    if (this.isBrowser()) {
      try {
        const raw = localStorage.getItem(STORAGE_KEYS.JOBS);
        if (raw) list = JSON.parse(raw);
      } catch {}
    }

    const q = search.toLowerCase().trim();
    return list.filter(j => {
      if (q) {
        const matchRole = (j.role || "").toLowerCase().includes(q);
        const matchCompany = (j.company || "").toLowerCase().includes(q);
        const matchLoc = (j.location || "").toLowerCase().includes(q);
        if (!matchRole && !matchCompany && !matchLoc) return false;
      }
      if (deptFilter && deptFilter !== "All") {
        const depts = Array.isArray(j.departments) ? j.departments : [];
        if (!depts.some(d => d && d.trim() === deptFilter)) return false;
      }
      return true;
    });
  }

  public getJobById(id: number): TPOJobRecord | undefined {
    const jobs = this.getJobs();
    return jobs.find(j => j.id === id);
  }

  public createJob(payload: any): TPOJobRecord {
    const jobs = this.getJobs();
    const newId = jobs.length > 0 ? Math.max(...jobs.map(j => j.id)) + 1 : 1;
    const newJob: TPOJobRecord = {
      id: newId,
      role: payload.role || "Software Engineer",
      company: payload.company || "Hiring Partner",
      location: payload.location || "Bangalore",
      category: payload.category || "Product Engineering",
      employment_type: payload.employment_type || "Full-time",
      experience_level: payload.experience_level || "Entry-Level",
      ctc_lpa: Number(payload.ctc_lpa) || 12.0,
      ctc_range: payload.ctc_range || `₹${payload.ctc_lpa || 12} LPA`,
      min_cgpa: Number(payload.min_cgpa) || 7.0,
      academics_percentage: Number(payload.academics_percentage) || 70,
      ieai_performance_percentage: Number(payload.ieai_performance_percentage) || 75,
      skills: Array.isArray(payload.skills) ? payload.skills : (typeof payload.skills === "string" ? payload.skills.split(",").map((s: string) => s.trim()).filter(Boolean) : ["Python", "Problem Solving"]),
      program_level: payload.program_level || "Undergraduate (UG)",
      degree: payload.degree || "B.Tech",
      departments: Array.isArray(payload.departments) && payload.departments.length > 0 ? payload.departments : ["Computer Science & Engineering"],
      description: payload.description || "Exciting engineering role building scalable systems.",
      apply_link: payload.apply_link,
      status: (payload.status as any) || "published",
      created_at: new Date().toISOString(),
      applicants_count: 0,
      shortlisted_count: 0,
      offered_count: 0
    };

    const updated = [newJob, ...jobs];
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(updated));
    }
    return newJob;
  }

  public updateJob(id: number, payload: any): TPOJobRecord {
    const jobs = this.getJobs();
    let updatedJob: TPOJobRecord | undefined;
    const next = jobs.map(j => {
      if (j.id === id) {
        updatedJob = {
          ...j,
          ...payload,
          id
        };
        return updatedJob;
      }
      return j;
    });

    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(next));
    }
    return updatedJob || jobs[0];
  }

  public deleteJob(id: number): boolean {
    const jobs = this.getJobs();
    const filtered = jobs.filter(j => j.id !== id);
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(filtered));
    }
    return true;
  }

  public updateJobStatus(id: number, status: string): TPOJobRecord {
    return this.updateJob(id, { status });
  }

  // ---- Applications ----
  public getApplications(jobId?: number): TPOApplicationRecord[] {
    let list: TPOApplicationRecord[] = INITIAL_TPO_APPLICATIONS;
    if (this.isBrowser()) {
      try {
        const raw = localStorage.getItem(STORAGE_KEYS.APPLICATIONS);
        if (raw) list = JSON.parse(raw);
      } catch {}
    }
    if (jobId) {
      return list.filter(a => a.job_id === Number(jobId));
    }
    return list;
  }

  public getEligibleStudents(jobId: number): any[] {
    const job = this.getJobById(jobId);
    const students = this.getStudents();
    const applications = this.getApplications(jobId);
    const appMap = new Map<number, string>();
    applications.forEach(a => appMap.set(a.student_id, a.status));

    if (!job) return students;

    return students
      .filter(s => {
        const deptMatches = job.departments.includes(s.department);
        const cgpaMatches = s.cgpa >= (job.min_cgpa - 0.5); // reasonable tolerance
        return deptMatches && cgpaMatches;
      })
      .map((s, index) => {
        const existingStatus = appMap.get(s.id);
        const appStatus = existingStatus || (index < job.offered_count ? "offered" : index < job.shortlisted_count ? "shortlisted" : "applied");
        return {
          ...s,
          application_status: appStatus
        };
      });
  }

  public shortlistCandidate(jobId: number, studentId: number): boolean {
    const apps = this.getApplications();
    let found = false;
    const next = apps.map(a => {
      if (a.job_id === jobId && a.student_id === studentId) {
        found = true;
        return { ...a, status: "shortlisted" as const };
      }
      return a;
    });

    if (!found) {
      const student = this.getStudents().find(s => s.id === studentId);
      if (student) {
        next.push({
          id: Date.now(),
          job_id: jobId,
          student_id: studentId,
          student: {
            id: student.id,
            full_name: student.full_name,
            roll_number: student.roll_number,
            department: student.department,
            section: student.section,
            cgpa: student.cgpa,
            email: student.email,
            phone: student.phone,
            resume_url: student.resume_url,
            academics_percentage: student.academics_percentage,
            ieai_performance_percentage: student.ieai_performance_percentage
          },
          status: "shortlisted",
          applied_at: new Date().toISOString()
        });
      }
    }

    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(next));
    }
    return true;
  }

  public updateCandidateStatus(jobId: number, studentId: number, status: string): boolean {
    const apps = this.getApplications();
    const next = apps.map(a => {
      if (a.job_id === jobId && a.student_id === studentId) {
        return { ...a, status: status as any };
      }
      return a;
    });
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(next));
    }
    return true;
  }

  // ---- HR Accounts ----
  public getHRAccounts(): TPOHRAccountRecord[] {
    if (!this.isBrowser()) return INITIAL_TPO_HR_ACCOUNTS;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.HR_ACCOUNTS);
      if (raw) return JSON.parse(raw);
    } catch {}
    return INITIAL_TPO_HR_ACCOUNTS;
  }

  public createHRAccount(payload: any): TPOHRAccountRecord {
    const accounts = this.getHRAccounts();
    const newId = accounts.length > 0 ? Math.max(...accounts.map(a => a.id)) + 1 : 1;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days access

    const job = payload.job_id ? this.getJobById(Number(payload.job_id)) : null;

    const newAcc: TPOHRAccountRecord = {
      id: newId,
      company_name: payload.company_name,
      hr_name: payload.hr_name,
      email: payload.email,
      phone: payload.phone || "+91 98000 00000",
      job_id: payload.job_id ? Number(payload.job_id) : null,
      job_title: job?.role || undefined,
      job_role: job?.role || undefined,
      is_active: true,
      created_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
      status: "Active",
      temp_token: `HR_TOK_${payload.company_name.substring(0, 4).toUpperCase()}_${Math.floor(1000 + Math.random() * 9000)}`
    };

    const updated = [newAcc, ...accounts];
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.HR_ACCOUNTS, JSON.stringify(updated));
    }
    return newAcc;
  }

  public resetHRPassword(hrId: number, _newPassword: string): boolean {
    const accounts = this.getHRAccounts();
    const next = accounts.map(a => {
      if (a.id === hrId) {
        const now = new Date();
        const extendedExpiry = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
        return {
          ...a,
          expires_at: extendedExpiry.toISOString(),
          status: "Active" as const,
          temp_token: `HR_RESET_${Math.floor(10000 + Math.random() * 90000)}`
        };
      }
      return a;
    });

    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.HR_ACCOUNTS, JSON.stringify(next));
    }
    return true;
  }

  // ---- Profile ----
  public getProfile(): any {
    if (!this.isBrowser()) return DEFAULT_TPO_PROFILE;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (raw) return JSON.parse(raw);
    } catch {}
    return DEFAULT_TPO_PROFILE;
  }

  public updateProfile(data: any): any {
    const prev = this.getProfile();
    const next = { ...prev, ...data };
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(next));
    }
    return next;
  }

  // ---- Placement Analytics ----
  public getDashboardAnalytics(): any {
    const jobs = this.getJobs();
    const students = this.getStudents();
    const applications = this.getApplications();

    const publishedJobs = jobs.filter(j => j.status === "published").length;
    const draftJobs = jobs.filter(j => j.status === "draft").length;
    const closedJobs = jobs.filter(j => j.status === "closed").length;

    const totalApplications = applications.length;
    const shortlistedCount = applications.filter(a => a.status === "shortlisted").length;
    const offeredCount = applications.filter(a => a.status === "offered").length;
    const rejectedCount = applications.filter(a => a.status === "rejected").length;
    const appliedCount = applications.filter(a => a.status === "applied").length;
    const pendingCount = applications.filter(a => a.status === "interview_scheduled").length;

    // By Department Breakdown
    const deptMap = new Map<string, { total_applications: number; total_students: Set<number> }>();
    applications.forEach(a => {
      const dept = a.student?.department || "General";
      if (!deptMap.has(dept)) {
        deptMap.set(dept, { total_applications: 0, total_students: new Set() });
      }
      const entry = deptMap.get(dept)!;
      entry.total_applications += 1;
      entry.total_students.add(a.student_id);
    });

    const byDepartment = Array.from(deptMap.entries()).map(([department, val]) => ({
      department,
      total_applications: val.total_applications,
      total_students: val.total_students.size
    }));

    // By Company Breakdown
    const compMap = new Map<string, { company: string; company_name: string; applicants_count: number; total_applications: number; total_jobs: number; max_ctc: number }>();
    jobs.forEach(j => {
      if (!compMap.has(j.company)) {
        compMap.set(j.company, { company: j.company, company_name: j.company, applicants_count: 0, total_applications: 0, total_jobs: 0, max_ctc: 0 });
      }
      const c = compMap.get(j.company)!;
      c.applicants_count += j.applicants_count;
      c.total_applications += j.applicants_count;
      c.total_jobs += 1;
      c.max_ctc = Math.max(c.max_ctc, j.ctc_lpa);
    });
    const byCompany = Array.from(compMap.values());

    // By Category Breakdown
    const catMap = new Map<string, { category: string; count: number; applicants: number }>();
    jobs.forEach(j => {
      if (!catMap.has(j.category)) {
        catMap.set(j.category, { category: j.category, count: 0, applicants: 0 });
      }
      const entry = catMap.get(j.category)!;
      entry.count += 1;
      entry.applicants += j.applicants_count;
    });
    const byCategory = Array.from(catMap.values());

    // Salary CTC Metrics
    const placedStudents = students.filter(s => s.placement_status === "placed");
    const highestCtc = placedStudents.length > 0 ? Math.max(...placedStudents.map(s => s.offered_ctc_lpa || 0)) : 32.0;
    const avgCtc = placedStudents.length > 0
      ? Number((placedStudents.reduce((acc, s) => acc + (s.offered_ctc_lpa || 0), 0) / placedStudents.length).toFixed(1))
      : 14.8;

    return {
      summary: {
        totalJobs: jobs.length,
        publishedJobs,
        draftJobs,
        closedJobs,
        totalApplications,
        appliedCount,
        pendingCount,
        shortlistedCount,
        rejectedCount,
        offeredCount,
        placedCount: placedStudents.length,
        placementPercentage: Number(((placedStudents.length / students.length) * 100).toFixed(1)),
        highestCtcLpa: highestCtc,
        avgCtcLpa: avgCtc,
        totalStudents: students.length
      },
      jobs: jobs.map(j => ({
        id: j.id,
        role: j.role,
        company: j.company,
        category: j.category,
        location: j.location,
        status: j.status,
        ctc_range: j.ctc_range,
        applicants_count: j.applicants_count,
        shortlisted_count: j.shortlisted_count
      })),
      byDepartment,
      byCompany,
      byCategory,
      liveConcurrency: {
        activeOnlineApplicants: 19,
        evaluationsInProgress: 4,
        recentShortlists24h: 7,
        recentOffersWeek: 5
      }
    };
  }

  // ---- Exam / Readiness Analytics for TPO ----
  public getExamAnalytics(): any {
    const students = this.getStudents();
    const totalAttempts = students.reduce((acc, s) => acc + s.total_attempts, 0);
    const avgScore = Number((students.reduce((acc, s) => acc + s.avg_score, 0) / students.length).toFixed(1));
    const avgIntegrity = Number((students.reduce((acc, s) => acc + s.integrity_score, 0) / students.length).toFixed(1));
    const passRate = Number((students.reduce((acc, s) => acc + s.pass_rate, 0) / students.length).toFixed(1));

    const examTypes = ["Coding", "Full Stack", "Aptitude", "System Design"];
    const examTitles = [
      "Data Structures & Core Algorithms",
      "Cloud Architecture & Full Stack",
      "Aptitude & Logical Reasoning",
      "System Design Challenge"
    ];

    const attempts = students.map((s, idx) => {
      const examIdx = idx % 4;
      const title = examTitles[examIdx];
      const type = examTypes[examIdx];
      const tabSwitches = s.integrity_score < 75 ? 4 : s.integrity_score < 88 ? 2 : 0;
      return {
        id: `ATT_${3000 + idx}`,
        student_id: s.id,
        exam_id: 101 + examIdx,
        student: {
          id: s.id,
          first_name: s.first_name,
          last_name: s.last_name,
          full_name: s.full_name,
          roll_number: s.roll_number,
          department: s.department,
          email: s.email,
          personal_email: s.personal_email,
          phone: s.phone,
          batch: s.batch
        },
        exam: {
          id: 101 + examIdx,
          title,
          type,
          total_marks: 100,
          passing_pct: 40
        },
        exam_title: title,
        total_score: s.avg_score,
        score: s.avg_score,
        total_marks: 100,
        percentage: s.avg_score,
        mcq_score: Math.round(s.avg_score * 0.45),
        coding_score: Math.round(s.avg_score * 0.55),
        status: "completed",
        integrity_score: s.integrity_score,
        is_flagged: s.integrity_score < 75 || tabSwitches >= 3,
        tab_switches: tabSwitches,
        submitted_at: new Date(Date.now() - (idx * 3600000 * 2)).toISOString()
      };
    });

    return {
      summary: {
        totalAttempts,
        completedAttempts: totalAttempts - 4,
        avgScore,
        passingRate: passRate,
        flaggedCount: 3,
        avgIntegrity
      },
      examPerformance: [
        { id: 101, title: "Data Structures & Core Algorithms", exam_title: "Data Structures & Core Algorithms", type: "Coding", totalAttempts: 52, total_attempts: 52, passingRate: 88.5, passing_percentage: 88.5, avgScore: 82.4, avg_score: 82.4 },
        { id: 102, title: "Cloud Architecture & Full Stack", exam_title: "Cloud Architecture & Full Stack", type: "Full Stack", totalAttempts: 48, total_attempts: 48, passingRate: 83.3, passing_percentage: 83.3, avgScore: 79.1, avg_score: 79.1 },
        { id: 103, title: "Aptitude & Logical Reasoning", exam_title: "Aptitude & Logical Reasoning", type: "Aptitude", totalAttempts: 56, total_attempts: 56, passingRate: 78.6, passing_percentage: 78.6, avgScore: 74.8, avg_score: 74.8 },
        { id: 104, title: "System Design Challenge", exam_title: "System Design Challenge", type: "System Design", totalAttempts: 38, total_attempts: 38, passingRate: 81.6, passing_percentage: 81.6, avgScore: 76.5, avg_score: 76.5 }
      ],
      attempts,
      activityLogs: [
        { id: 1, studentName: "Aarav Sharma", rollNumber: "21CS001", department: "Computer Science & Engineering", examTitle: "Data Structures & Core Algorithms", tabSwitches: 0, integrityScore: 98, proctorStatus: "Clean", timestamp: "5 mins ago", details: "Completed examination with verified webcam & audio proctoring." },
        { id: 2, studentName: "Aditi Rao", rollNumber: "21CS002", department: "Information Technology", examTitle: "Cloud Architecture & Full Stack", tabSwitches: 0, integrityScore: 96, proctorStatus: "Clean", timestamp: "12 mins ago", details: "Zero violations recorded during session." },
        { id: 3, studentName: "Vikram Malhotra", rollNumber: "21CS014", department: "Electronics & Communication Engineering", examTitle: "System Design Challenge", tabSwitches: 4, integrityScore: 71, proctorStatus: "Flagged", timestamp: "25 mins ago", details: "Multiple tab switch events detected by browser lockdown." },
        { id: 4, studentName: "Ananya Iyer", rollNumber: "21CS006", department: "Computer Science & Engineering", examTitle: "Aptitude & Logical Reasoning", tabSwitches: 2, integrityScore: 86, proctorStatus: "Warning", timestamp: "42 mins ago", details: "Window blur warning issued at 14:18." },
        { id: 5, studentName: "Rohan Gupta", rollNumber: "21CS003", department: "Computer Science & Engineering", examTitle: "Data Structures & Core Algorithms", tabSwitches: 0, integrityScore: 99, proctorStatus: "Clean", timestamp: "1 hour ago", details: "Assessment submitted with high integrity index." },
        { id: 6, studentName: "Meera Krishnan", rollNumber: "21CS018", department: "Artificial Intelligence & Data Science", examTitle: "Cloud Architecture & Full Stack", tabSwitches: 3, integrityScore: 74, proctorStatus: "Flagged", timestamp: "2 hours ago", details: "Browser unfocused exceeding threshold duration." }
      ]
    };
  }

  public getAssessmentAnalytics(): any {
    return this.getExamAnalytics();
  }
}

export const mockTpoStore = new MockTPOStore();
