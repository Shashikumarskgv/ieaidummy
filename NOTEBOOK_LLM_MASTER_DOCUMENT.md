# DataQuotes LMS (Multi-Tenant) — NotebookLM Master Mind-Map & Source Blueprint

**Document Intent**: Optimized Master Source Text specifically formatted for Google **NotebookLM** to auto-generate Mind Maps, Concept Maps, Audio Overviews (Podcasts), and Interactive Q&A.  
**System Architecture**: Enterprise Multi-Tenant Learning Management & Placement Platform  
**Target Platform**: DataQuotes LMS  

---

# ROOT BRANCH: DATAQUOTES LMS PLATFORM ECOSYSTEM

```
                                 DATAQUOTES LMS ECOSYSTEM
                                            │
   ┌───────────────────┬────────────────────┼───────────────────┬───────────────────┐
   ▼                   ▼                    ▼                   ▼                   ▼
1. Platform      2. Academic &       3. Proctored Exam    4. Profile & AI    5. Corporate TPO
Foundation       User Governance      Assessment Engine     Interview Engine   Placement Engine
```

---

## NODE 1: PLATFORM FOUNDATION & MULTI-TENANT ARCHITECTURE

### 1.1 Multi-Tenant Database Isolation Model
* **Global Database (`dq_lms_main`)**:
  * Stores tenant registry, subscription licenses, global settings, DataQuotes Admin (DQ-Admin) credentials, and global audit logs.
  * Managed exclusively by **DataQuotes Admin (DQ-Admin)**.
  * Ensures zero student data leakage across tenant databases.
* **Tenant Databases (`dq_lms_<college_code>`)**:
  * Each onboarded college receives a dedicated, isolated MySQL database (e.g., `dq_lms_college_1`).
  * Managed at the institution level by the **College Admin (College Super Admin)**.
  * Houses student profiles, exam submissions, question banks, academic details, and placement applications.

### 1.2 Access Gateway & RBAC Hierarchy
* **DataQuotes Admin (DQ-Admin)**: Platform Owner / Global Admin. Controls global platform infrastructure, tenant DB creation, global settings, and license limits.
* **College Admin**: College Super Admin. Institution-level head. Manages college profile, academic hierarchy, departments, semesters, staff, and student accounts.
* **HOD (Head of Department)**: Departmental head. Manages department curriculum, faculty assignments, question bank approvals, and exam publishing.
* **Faculty**: Subject teacher / Evaluator. Authors questions and assists in exam evaluation.
* **TPO (Training & Placement Officer)**: Corporate placement head. Manages recruiter accounts, job postings, academic eligibility filters, and placement tracking.
* **Student**: Primary learner. Takes proctored exams, completes profile (100% completion engine), practices Gemini AI interview preparation, and applies for placement jobs.

---

## NODE 2: INSTITUTIONAL ONBOARDING & USER GOVERNANCE

### 2.1 Academic Structure Tree
* **Institution Level**: Configured by **College Admin (College Super Admin)** — College Profile, Approved Email Domains (e.g., `dataquotes.net`), Address, Admin Contacts.
* **Department Level**: CSE, ECE, EEE, MECH, CIVIL, IT, Biotech.
* **Program / Degree Level**: B.Tech, M.Tech, MCA, Diploma.
* **Academic Batches**: Graduation Year (e.g., 2023–2027).
* **Semesters & Sections**: Semester 1 to 8, Sections A, B, C.
* **Subject Directory**: Subject codes mapped to specific Semesters and Departments.

### 2.2 Bulk Provisioning & Data Sanitation
* **Student Bulk Import**:
  * CSV/Excel upload managed by College Admin with Roll Number, First Name, Last Name, Official Email, Department, Graduation Year.
  * Duplicate Roll Number and Email validation.
  * Invalid rows captured in `tbl_student_import_failed_rows` for downloadable error auditing.
* **Staff Import & Role Mapping**:
  * Provisioning of HODs, Faculty, and TPO members with role IDs (`Role 1: Admin, 2: HOD, 3: Faculty, 4: TPO`).

---

## NODE 3: PROCTORED EXAMINATION & EVALUATION ENGINE

### 3.1 Question Bank Management
* **Manual Question Authoring**: MCQs and Coding Challenges created by Faculty/HOD.
* **Gemini AI Question Generation**:
  * Faculty inputs topic, difficulty (Easy, Medium, Hard), and Bloom's Taxonomy level.
  * Gemini AI generates structured question JSON with choices, correct answers, and test cases.
  * Question approval workflow before adding to active exam pools.
* **Coding Question Structure**: Sample test cases (visible) + Hidden test cases (evaluated in sandboxed execution).

### 3.2 Exam Creation & Scheduling Rules
* **Exam Types**: MCQ Only, Coding Only, or Hybrid (MCQ + Coding).
* **Proctoring Rules**: Fullscreen enforcement, maximum allowed tab switches (auto-submit on exceed).
* **Targeting Rules**: Assigned to specific Departments, Sections, Batches, or individual Students.
* **Delayed Result Release Policy**:
  * HODs, Faculty, and College Admin receive real-time evaluation statistics immediately.
  * Students see submissions completed, but detailed scores and explanations remain **locked until the Exam End Time passes**.

---

## NODE 4: STUDENT EXAM EXECUTION & AUTOMATED SCORING

### 4.1 Exam Session Execution Flow
1. **Student Login & Authentication**: Verifies valid session and active exam target.
2. **Session Initialization**: Enforces fullscreen proctoring lockdown.
3. **Auto-Save Engine**: Periodically saves selected options and code editor text every 10 seconds to database `tbl_exam_submissions`.
4. **Automated Submission & Evaluation**:
   * MCQs evaluated instantly against correct option indices.
   * Code submissions executed inside sandboxed containers against hidden test cases.
5. **Delayed Score Unlock**: Unlocks student performance reports after configured Exam End Time.

---

## NODE 5: 100% DYNAMIC STUDENT PROFILE COMPLETION ENGINE

### 5.1 Dynamic 28-Attribute Calculation Framework
The profile completion engine dynamically checks **28 fields** across three sections:

#### Section 1: Personal Attributes (12 Fields)
1. Profile Photo (`profile_photo`)
2. Full Name (`first_name` / `name`)
3. Email (`personal_email` / `email`)
4. Phone (`contact_number` / `mobile`)
5. Gender (`gender`)
6. Date of Birth (`dob`) — *Handles JS Date instances from MySQL DATE columns*
7. Address (`address`)
8. Bio / Description (`description`)
9. Designation (`designation`)
10. LinkedIn URL (`linkedin_url`)
11. GitHub URL (`github_url`)
12. Portfolio URL (`portfolio_url`)

#### Section 2: Academic Attributes (8 Fields)
13. Department (`department` / `academic_details[0].course`)
14. College / Institution (`college` / `tbl_college.college_name` / `academic_details[0].institution`)
15. Program Level & Degree (`joined_course` / `academic_details[0].type` / `department`)
16. Roll Number (`roll_number` / `academic_details[0].roll_number`)
17. Current Semester (`current_semester` / `year_of_study`)
18. CGPA (`cgpa` / `academic_details[0].score`)
19. Graduation Year (`graduation_year` / `academic_details[0].end_year`)
20. Education Records (`academic_details` array length > 0)

#### Section 3: Career Attributes (8 Fields)
21. Target Role (`target_role`)
22. Experience (`experience` non-null)
23. Employment Preference (`working_type`)
24. Resume URL (`resume_url`)
25. Weak Areas (`weak_areas`)
26. Skills (`skills` array length > 0)
27. Projects (`tbl_projects` DB count > 0)
28. Achievements (`tbl_achievements` DB count > 0)

### 5.2 Single Source of Truth & Gating Rule
* Calculation Rule: `(Completed Fields / 28) * 100`.
* **Gating Requirement**: Interview Preparation is **strictly locked** until `profile_completion == 100%`.

---

## NODE 6: GEMINI AI INTERVIEW PREPARATION ENGINE

### 6.1 Unlocking & Dataset Architecture
* **Prerequisite**: Student Profile Completion must equal **100%**.
* **Monthly Dataset Engine**: Automatically compiles student parameters (target role, skills, projects, weak areas) to generate 300+ monthly questions via Gemini AI.

### 6.2 Question Category Breakdown
* **Role-Based Questions**: 250 questions across 5 customizable role panels.
* **Project-Based Questions**: 30 technical questions derived from student's `tbl_projects`.
* **Weak Area Questions**: 20 targeted questions derived from past exam failures (topics < 50% score).
* **HR & Behavioural Questions**: 20 situational questions with model responses.

### 6.3 Practice & Attempt Modes
* Students practice questions or take timed MCQ/Coding tests based on active monthly datasets.

---

## NODE 7: CORPORATE PLACEMENT & TPO MANAGEMENT ENGINE

### 7.1 Job Announcement & Academic Filtering
* TPO publishes corporate job openings with explicit criteria:
  * Minimum CGPA
  * Eligible Branches / Departments
  * Maximum Allowed Backlogs
  * Graduation Year Batch
* **Automated Dashboard Filtering**: Jobs are visible and actionable ONLY to students meeting 100% of the academic criteria.

### 7.2 Recruitment Lifecycle Tracking
```
[Applied] ──> [Shortlisted] ──> [Technical Round] ──> [HR Round] ──> [Offered] ──> [Placed]
```
* Status updates in real-time on student and TPO placement dashboards.
* Acceptance of offer updates student profile status to "Placed" and updates college placement statistics.

---

## NODE 8: END-TO-END MASTER PROCESS FLOW (STEP-BY-STEP)

```
[1. DataQuotes Admin (DQ-Admin) Logs In] ──> [2. Provisions College & Tenant DB]
                                                        │
                                                        ▼
[3. College Admin (College Super Admin) Logs In] ──> [4. Sets Up Departments, Courses, Semesters]
                                                        │
                                                        ▼
[5. Bulk Imports Staff & Students] ──> [6. Maps Courses & Faculty]
                                            │
                                            ▼
[7. HOD/Faculty Creates Exam Questions (Manual + AI)]
                                            │
                                            ▼
[8. HOD Publishes Proctored Exam (MCQ + Coding)]
                                            │
                                            ▼
[9. Students Complete Proctored Exam (Auto-Saving)]
                                            │
                                            ▼
[10. Auto Evaluation -> Instant HOD Results | Delayed Student Results]
                                            │
                                            ▼
[11. Student Completes 28 Profile Attributes to 100%]
                                            │
                                            ▼
[12. 100% Profile Unlocks Gemini AI Interview Prep Engine]
                                            │
                                            ▼
[13. Student Practices Monthly AI Datasets (Role, Project, Weak, HR)]
                                            │
                                            ▼
[14. TPO Posts Job Openings with Eligibility Criteria]
                                            │
                                            ▼
[15. Eligible Student Applies -> Clears Selection Rounds]
                                            │
                                            ▼
[16. Student Marked "Placed" -> Transitions to Placed Alumni Roster]
```

---

## NODE 9: NOTEBOOKLM MIND MAP CORE CONCEPTS SUMMARY

| Mind Map Parent Node | Sub-Branches & Key Concepts |
| :--- | :--- |
| **1. Multi-Tenant Architecture** | Global DB (`dq_lms_main`), Tenant DBs (`dq_lms_<code >`), Schema Isolation, Connection Pooling, RBAC Security |
| **2. Roles & Governance** | DataQuotes Admin (DQ-Admin: Global Platform Admin), College Admin (College Super Admin: Institution Head), HOD, Faculty, TPO, Student |
| **3. Academic Hierarchy** | Institution, Department, Program/Degree, Academic Batch, Semester, Subject Catalog, Section Mapping |
| **4. Examination Engine** | MCQ Questions, Coding Challenges, Manual Creation, Gemini AI Generation, Fullscreen Proctoring, Auto-Save |
| **5. Delayed Scoring Policy** | Instant HOD Analytics, Delayed Student Results (Released only after Exam End Time passes) |
| **6. Profile Completion (100%)** | 28 Attributes (Personal: 12, Academic: 8, Career: 8), Fallback College/Degree, Gatekeeper to Interview Prep |
| **7. Gemini AI Interview Engine** | 100% Gating Check, Monthly Regeneration, Role Panels (250 Qs), Project Qs (30), Weak Area Qs (20), HR Qs (20) |
| **8. TPO Placement Portal** | Recruiter Profiles, Job Announcements, CGPA/Branch Eligibility Filtering, Application Pipeline, Placed Status |

---

> [!TIP]
> **NotebookLM Usage Tip**: Upload this file (`NOTEBOOK_LLM_MASTER_DOCUMENT.md`) directly into **Google NotebookLM**. You can prompt it with:
> - *"Generate a complete hierarchical Mind Map for this LMS project."*
> - *"Explain the distinction between DataQuotes Admin (DQ-Admin) and College Admin (College Super Admin)."*
> - *"Create an Audio Overview (Podcast episode) explaining the end-to-end student journey from onboarding to placement."*
