# DataQuotes LMS (Multi-Tenant) - Master Functional Workflow Document

**Document Type**: Functional Workflow Document / Solution Architecture Blueprint  
**System Name**: DataQuotes LMS (Multi-Tenant Enterprise Platform)  
**Author Role**: Senior Business Analyst & Solution Architect  
**Version**: 1.1.0  

---

## 1. Executive Summary & Architecture Paradigm

DataQuotes LMS is an enterprise-grade, multi-tenant Learning Management, Examination, Assessment, and Career Placement Acceleration Platform built for educational institutions, universities, and corporate training ecosystems. 

The system operates on an isolated multi-tenant architecture where each onboarded college/institution maintains dedicated tenant database isolation under a centralized management umbrella operated by **DataQuotes Admin (DQ-Admin)**.

The functional scope encompasses the complete lifecycle of higher education institutions:
1. **System Provisioning & Multi-Tenant Database Initialization** (DataQuotes Admin)
2. **Institutional Onboarding & Academic Hierarchy Configuration** (College Admin / College Super Admin)
3. **Bulk User Provisioning (Students & Staff)**
4. **Academic Operations & Course-Faculty Mappings**
5. **AI-Powered & Manual Examination Lifecycle**
6. **Student Proctored Exam Execution & Delayed Result Delivery**
7. **Multi-Dimensional Analytics & Diagnostic Reporting**
8. **Comprehensive Student Profile & Resume Building**
9. **Gemini AI Interview Preparation & Monthly Dataset Engine**
10. **Placement Portal, Job Postings & Placement Tracking**

---

## 2. Comprehensive Module Workflows

---

### PHASE 1: SYSTEM INITIALIZATION

#### Module 1.1: System Provisioning & Global Setup
- **Objective**: Provision the cloud platform infrastructure, establish the Global Management Database (`dq_lms_main`), initialize environment configurations, and set up global security policies.
- **Actors**: DataQuotes Admin (DQ-Admin).
- **Inputs**: Platform credentials, Global Configuration Parameters, SMTP Server Details, Gemini AI API Keys, Cloud Storage Buckets.
- **Outputs**: Active DataQuotes Admin Portal, Operational Global Database, Environment Registry.
- **Business Rules**:
  1. Only DataQuotes Admin (DQ-Admin) has access to global DB schema migrations and tenant creation controls.
  2. Global DB stores global system settings, tenant metadata, license keys, and DQ-Admin logs.
  3. No tenant-specific data (e.g., student answers, marks) can exist inside the global database.
- **Dependencies**: None (Root Workflow).
- **Next Workflow**: Institution Management & Tenant DB Creation.

#### Module 1.2: Tenant Database & Institution Creation
- **Objective**: Provision a dedicated, isolated database for a newly onboarded college and initialize default roles, tables, permissions, and administrative settings.
- **Actors**: DataQuotes Admin (DQ-Admin).
- **Inputs**: Institution Name, Institution Code, Domain Name, Approved Email Domains, College Admin Contact Details, Allocated Capacity.
- **Outputs**: Isolated Tenant Database (e.g., `dq_lms_<college_code>`), Initialized Tenant Schema, Primary College Admin Credentials.
- **Business Rules**:
  1. Each tenant database must be created with default system tables (`tbl_students`, `tbl_staff`, `tbl_college`, `tbl_exams`, `tbl_projects`, `tbl_achievements`, etc.).
  2. Default RBAC roles (College Admin, HOD, TPO, Faculty, Student) must be automatically seeded into the tenant database.
  3. Approved email domains restrict student registration and login exclusively to authorized institutional emails.
- **Dependencies**: System Provisioning & Global Setup.
- **Next Workflow**: College Onboarding.

---

### PHASE 2: COLLEGE ONBOARDING

#### Module 2.1: Institutional Hierarchy & Academic Setup
- **Objective**: Configure the organizational structure of the institution, including departments, academic programs, degrees, semesters, and subjects.
- **Actors**: College Admin (College Super Admin).
- **Inputs**: Department Names (e.g., CSE, ECE, MECH), Degree Programs (e.g., B.Tech, M.Tech, MCA), Academic Years, Semester Schedules, Course Catalog / Subjects list.
- **Outputs**: Configured Academic Hierarchy, Subject Master Directory, Semester Timelines.
- **Business Rules**:
  1. Programs must map directly to valid Departments.
  2. Every Subject must be assigned to a specific Semester, Program, and Department.
  3. Academic Years must define current active batches (e.g., 2023–2027 Batch).
- **Dependencies**: Tenant Database Creation & Initial College Admin Login.
- **Next Workflow**: User Management & Staff / Student Provisioning.

---

### PHASE 3: USER MANAGEMENT

#### Module 3.1: Bulk Provisioning & Access Allocation
- **Objective**: Import, create, and manage student accounts, faculty members, Head of Departments (HODs), and Training & Placement Officers (TPOs).
- **Actors**: College Admin (College Super Admin), HOD.
- **Inputs**: Student CSV/Excel Master Files (Roll Number, First Name, Last Name, Email, Department, Graduation Year), Staff Master Files.
- **Outputs**: Active User Accounts, Role Assignments, System Credentials, Failed Import Audit Logs.
- **Business Rules**:
  1. Roll numbers and official email addresses must be unique across the tenant database.
  2. Invalid rows during bulk import must be captured into an audit table (`tbl_student_import_failed_rows`) for downloadable reporting without interrupting valid row imports.
  3. Newly provisioned users receive an activation invitation with a secure initial password setup link.
- **Dependencies**: Institutional Hierarchy Setup.
- **Next Workflow**: Academic Operations & Course Mapping.

---

### PHASE 4: ACADEMIC MANAGEMENT

#### Module 4.1: Academic Allocation & Course-Faculty Mapping
- **Objective**: Assign faculty members to subjects, map students to sections and semester batches, and manage the active academic calendar.
- **Actors**: College Admin (College Super Admin), HOD.
- **Inputs**: Faculty-to-Subject assignments, Student-to-Section mappings, Semester Start/End dates.
- **Outputs**: Active Course-Faculty Assignment Registry, Student Class Roster, Operational Academic Calendar.
- **Business Rules**:
  1. HODs can only manage mappings within their assigned department.
  2. A student can belong to only one active section per semester.
  3. Faculty members assigned to a subject gain authorization to create questions and exams for that subject.
- **Dependencies**: User Provisioning & Academic Hierarchy Setup.
- **Next Workflow**: Exam Creation & Question Bank Management.

---

### PHASE 5: EXAM MANAGEMENT

#### Module 5.1: Question Bank Authoring (Manual & Gemini AI)
- **Objective**: Build a comprehensive subject-wise question repository containing Multiple Choice Questions (MCQs) and Coding Challenges using manual authoring and Gemini AI generation.
- **Actors**: HOD, Faculty.
- **Inputs**: Subject Name, Topic/Module, Difficulty Level, Bloom's Taxonomy Level, Manual Question Text/Options/Code Constraints OR AI Prompt parameters (Topic, Count, Difficulty).
- **Outputs**: Approved Question Repository, Test Cases for Coding Problems, Solution Explanations.
- **Business Rules**:
  1. Coding questions must include sample test cases (visible) and hidden test cases (for automated evaluation).
  2. Questions generated via Gemini AI must undergo faculty approval before being tagged as "Approved" for exams.
  3. Every question must be tagged with Topic, Difficulty (Easy, Medium, Hard), and Marks weightage.
- **Dependencies**: Subject Catalog & Faculty Mapping.
- **Next Workflow**: Exam Setup & Scheduling.

#### Module 5.2: Exam Creation & Publishing
- **Objective**: Assemble questions into structured examinations, configure proctoring settings, schedule time windows, and target specific student batches.
- **Actors**: HOD, Faculty, College Admin.
- **Inputs**: Exam Title, Type (MCQ, Coding, Hybrid), Selected Questions/Section Rules, Duration, Start Time, End Time, Passing Score, Targeted Departments/Sections/Batches, Proctoring Rules (Tab Switch Limit, Fullscreen Enforcement).
- **Outputs**: Scheduled Exam Event, Targeted Student Invites, Live Exam Session Record.
- **Business Rules**:
  1. Draft exams can be edited freely; Published exams lock question parameters.
  2. Exams can be mapped to specific Departments, Sections, or Individual Students.
  3. Delayed Result Policy: Student scores remain hidden during active exam window and automatically publish ONLY AFTER the configured Exam End Date & End Time expires. HODs receive real-time scoring immediately.
- **Dependencies**: Approved Question Repository & Student Mapping.
- **Next Workflow**: Student Exam Execution.

---

### PHASE 6: STUDENT EXAM FLOW

#### Module 6.1: Secure Student Exam Execution & Real-Time Evaluation
- **Objective**: Provide a secure, proctored environment for students to attempt MCQ and Coding assessments with automated real-time saving and submission evaluation.
- **Actors**: Student, Automated Evaluation Engine.
- **Inputs**: Student Login Session, Active Exam Assignment, Student Question Answers, Code Submissions.
- **Outputs**: Evaluated Submission Record, Execution Log, Automated Test Case Pass/Fail Audit, Final Calculated Score.
- **Business Rules**:
  1. **Session Lockdown**: Fullscreen mode is enforced; tab switches exceeding the maximum permitted limit trigger automatic exam submission.
  2. **Auto-Save**: MCQ choices and code editor contents auto-save every 10 seconds to prevent data loss on network interruption.
  3. **Coding Execution**: Coding submissions run against sandboxed execution environments, evaluating input/output matches across all hidden test cases.
  4. **Access Timeline**: Students can launch exams only within the designated Start Time and End Time window.
- **Dependencies**: Published Exam & Active Student Account.
- **Next Workflow**: Evaluation & Diagnostic Reporting.

---

### PHASE 7: REPORTS & DIAGNOSTICS

#### Module 7.1: Assessment Analytics & Diagnostic Reporting
- **Objective**: Aggregate exam performance, generate individual and class-level diagnostic reports, analyze topic strengths/weaknesses, and track historic growth.
- **Actors**: Student, HOD, College Admin, Faculty.
- **Inputs**: Completed Exam Submissions, MCQ Correctness Data, Code Execution Results, Time-per-Question Logs.
- **Outputs**: Student Performance Dashboard, HOD Class Summary Report, Weak Topic Heatmaps, Question Quality Metrics.
- **Business Rules**:
  1. HODs and College Admins see real-time submission statistics and instant performance analytics as students complete exams.
  2. Students access their detailed result breakdown (correct answers, explanations, score analytics) strictly after the Exam End Time has elapsed.
  3. System automatically identifies student "Weak Areas" (topics with < 50% accuracy) for integration into career preparation workflows.
- **Dependencies**: Completed Exam Submissions.
- **Next Workflow**: Student Profile Building & Interview Preparation.

---

### PHASE 8: PROFILE CONFIGURATION

#### Module 8.1: 100% Student Profile Completion Engine
- **Objective**: Capture comprehensive student academic, personal, and career parameters, calculate dynamic profile completion percentage, and enforce the 100% completion requirement.
- **Actors**: Student, Dynamic Profile Completion Engine.
- **Inputs**: Personal Info (Photo, Bio, Designation, Contact, Address, Social Links), Academic History (Multiple Education Records, CGPA, Roll Number, Semester, Branch), Career Preferences (Target Role, Experience, Preferred Location, Resume URL, Skills, Projects, Achievements, Weak Areas).
- **Outputs**: Updated Student Profile Record, Calculated `profile_completion` Percentage (0–100%).
- **Business Rules**:
  1. Profile completion percentage is calculated dynamically across **28 distinct attributes** across Personal (12), Academic (8), and Career (8) sections.
  2. **Fallback Integration**: Missing student college or degree attributes automatically fall back to tenant institutional defaults (`tbl_college`) and education history (`academic_details`).
  3. **100% Gating Rule**: Interview Preparation dataset generation remains strictly locked until `profile_completion == 100%`.
- **Dependencies**: Active Student Account.
- **Next Workflow**: Gemini AI Interview Preparation.

---

### PHASE 9: INTERVIEW PREPARATION

#### Module 9.1: Gemini AI Interview Question Bank & Monthly Dataset Engine
- **Objective**: Generate personalized, monthly-regenerated interview preparation question banks tailored to the student's 100% completed profile, target role, weak areas, and projects.
- **Actors**: Student, Gemini AI Service Engine.
- **Inputs**: 100% Completed Student Profile, Selected Target Role, Project Descriptions, Identified Academic Weak Areas.
- **Outputs**: Monthly Interview Datasets (Role-Based: 250 Qs, Project-Based: 30 Qs, Weak Areas: 20 Qs, HR: 20 Qs), Model Answers, Technical Explanations, MCQ Mock Tests.
- **Business Rules**:
  1. **Access Lock**: Unlocking Interview Preparation requires `profile_completion == 100%`.
  2. **Monthly Dataset Regeneration**: Interview datasets automatically refresh monthly to ensure continuous learning progression.
  3. **Structured Dataset Storage**: All generated questions, model answers, and explanations persist in the tenant database for offline review and test execution.
  4. **Practice Options**: Students can take timed mock tests (MCQ/Coding) generated from their active interview datasets.
- **Dependencies**: 100% Student Profile Completion.
- **Next Workflow**: Placement Management & Job Applications.

---

### PHASE 10: PLACEMENT MANAGEMENT

#### Module 10.1: Corporate Recruitment, Eligibility Mapping & Job Portal
- **Objective**: Enable Training & Placement Officers (TPOs) to manage corporate recruiter profiles, post job openings with automated academic eligibility filtering, and track applications through placement completion.
- **Actors**: TPO, Student, Corporate Recruiter.
- **Inputs**: Corporate Partner Profile, Job Posting Details (Role, CTC Package, Location, Job Description, External Link), Eligibility Criteria (Minimum CGPA, Eligible Branches, Maximum Backlogs, Passing Year).
- **Outputs**: Published Job Announcements, Filtered Student Eligibility Roster, Student Job Applications, Placement Status Reports.
- **Business Rules**:
  1. Jobs automatically filter student dashboards; only eligible students can view and apply to specific job postings.
  2. Application tracking tracks status progression: *Applied -> Shortlisted -> Technical Round -> HR Round -> Offered -> Placed*.
  3. Once a student accepts a placement offer, their placement status updates to "Placed", updating college placement statistics.
- **Dependencies**: Student Academic Data & TPO Role.
- **Next Workflow**: System Analytics & Alumni Tracking.

---

## 3. Platform-Wide Operational Workflows

---

### PHASE 11: ANALYTICS & INSIGHTS

#### Module 11.1: Multi-Tier Operational Analytics
- **Objective**: Provide role-specific real-time intelligence across all administrative and academic layers of the organization.
- **Actors**: DataQuotes Admin (DQ-Admin), College Admin, HOD, TPO, Student.
- **Workflows**:
  1. **DataQuotes Admin Analytics**: Global tenant health, active student counts, API token usage, database storage utilization.
  2. **College Admin Analytics**: Departmental performance comparison, exam completion rates, total student enrollment growth.
  3. **HOD Analytics**: Subject-wise accuracy metrics, class average trends, faculty content creation output, weak topic distributions.
  4. **TPO Analytics**: Campus placement rate, average CTC package offered, top recruiting companies, branch-wise placement breakdown.
  5. **Student Analytics**: Personal assessment score history, speed/accuracy charts, weak area mastery progression, placement application statuses.

---

### PHASE 12: NOTIFICATION ENGINE

#### Module 12.1: Multi-Channel Communication Service
- **Objective**: Deliver real-time transactional, alert, and reminder notifications across email, SMS, and in-app channels.
- **Actors**: Automated System Event Triggers.
- **Triggers & Delivery Workflows**:
  - **Account Invitation**: Sent when a new student/staff account is provisioned.
  - **Exam Schedule Alert**: Sent when a new exam is published targeting the student's branch/section.
  - **Result Publication Alert**: Delivered automatically when an exam's End Time passes and scores become visible.
  - **Job Notification Alert**: Delivered to eligible students when TPO posts a matching job opportunity.
  - **Interview Practice Reminder**: Sent monthly when new AI interview datasets are regenerated.

---

### PHASE 13: ROLE & PERMISSION MATRIX (RBAC)

The platform enforces strict Role-Based Access Control (RBAC) across 5 primary actor roles:

| Module / Feature Area | DataQuotes Admin (DQ-Admin) | College Admin (College Super Admin) | HOD | TPO | Student |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Global Tenant Provisioning & DB Creation** | **FULL** | NO | NO | NO | NO |
| **College Profile & Department Configuration** | READ | **FULL** | READ | READ | NO |
| **Staff & Student Account Provisioning** | READ | **FULL** | **DEPT** | READ | NO |
| **Academic Mapping & Subject Allocation** | NO | **FULL** | **DEPT** | NO | NO |
| **Question Bank Authoring & Approval** | NO | READ | **FULL** | NO | NO |
| **Exam Creation, Scheduling & Publishing** | NO | READ | **FULL** | NO | NO |
| **Exam Execution & Code Submission** | NO | NO | NO | NO | **FULL** |
| **Real-Time HOD Exam Evaluation & Analytics** | READ | READ | **FULL** | NO | NO |
| **Delayed Student Exam Result Access** | NO | NO | NO | NO | **AFTER END** |
| **100% Student Profile & Resume Management** | NO | NO | NO | NO | **OWN** |
| **Gemini AI Interview Prep & Dataset Gen** | NO | NO | NO | NO | **IF 100%** |
| **Job Posting & Eligibility Criteria Config** | NO | READ | READ | **FULL** | NO |
| **Job Application Submission** | NO | NO | NO | READ | **ELIGIBLE** |
| **Placement Analytics & Offer Tracking** | READ | READ | READ | **FULL** | READ (OWN) |

---

### PHASE 14: DATABASE LIFECYCLE (HIGH-LEVEL)

The database lifecycle describes how data moves across system operations without hardcoding SQL:

1. **Provisioning Stage**:
   - DataQuotes Admin (DQ-Admin) triggers tenant creation -> Global DB creates tenant metadata record -> Tenant MySQL database is created -> Base migration scripts initialize standard tables and default seeds.
2. **Operational Read/Write Stage**:
   - User actions (Login, Profile Edits, Exam Submissions) execute transactional `INSERT`, `UPDATE`, and `SELECT` queries strictly within the authenticated tenant database context.
3. **Cascading Soft Deletion Stage**:
   - Entities (students, staff, exams) marked for deletion receive a `deleted_at` timestamp flag, removing them from active application queries while preserving historical reporting integrity.
4. **Data Aggregation & Archival Stage**:
   - Completed exam results and academic years are periodically archived into historic summary tables, keeping primary operational tables slim and fast.

---

### PHASE 15: AI LIFECYCLE (GEMINI INTEGRATION)

The Gemini AI Service is embedded deeply into evaluation, assessment, and career preparation workflows:

```
[Student Profile Data & Past Exam Weak Topics]
                       │
                       ▼
         [Gemini AI Context Builder]
                       │
                       ▼
      [Prompt Engineering & Constraint Masking]
                       │
                       ▼
         [Gemini API Model Execution]
                       │
                       ▼
       [JSON Response Validation & Parsing]
                       │
                       ▼
   [Dataset Persistence in Tenant Database]
                       │
                       ▼
[Student Interview Prep & Interactive Practice]
```

1. **Question Generation Stage**: Faculty inputs topic/difficulty -> AI generates structured MCQs, coding prompts, and test cases -> Faculty approves -> Added to Question Bank.
2. **Weak Area Analysis Stage**: System evaluates student exam submissions -> Identifies topics with accuracy < 50% -> Tags topics as "Student Weak Areas".
3. **Personalized Dataset Generation Stage**: Student reaches 100% profile completion -> System compiles target role, skills, projects, and weak areas -> Gemini AI generates 300+ personalized interview questions (Role, Project, Weak Area, HR).
4. **Monthly Regeneration Stage**: System executes monthly cron schedules -> Refreshes interview datasets with advanced questions as student academic year progresses.

---

## 4. End-to-End Complete Business Flow

Below is the complete, unbroken, sequential operational workflow of the DataQuotes LMS platform from system inception to successful student placement:

```
[1. DataQuotes Admin (DQ-Admin) Logs In] 
         │
         ▼
[2. Provisions New College & Tenant DB]
         │
         ▼
[3. College Admin (College Super Admin) Logs In to Tenant Portal]
         │
         ▼
[4. Configures Academic Structure (Depts, Degrees, Courses, Semesters)]
         │
         ▼
[5. Bulk Imports Staff (HOD, Faculty, TPO) & Students]
         │
         ▼
[6. HOD / Faculty Author Question Bank (Manual + Gemini AI)]
         │
         ▼
[7. HOD Schedules & Publishes Proctored Exam (MCQ + Coding)]
         │
         ▼
[8. Students Attempt Exam via Lockdown Browser]
         │
         ▼
[9. Automated Real-Time Submission Evaluation & HOD Instant Results]
         │
         ▼
[10. Exam End Time Expires -> Student Results Automatically Published]
         │
         ▼
[11. Student Fills Profile (Personal, Academic, Career) to 100%]
         │
         ▼
[12. 100% Completion Unlocks Gemini AI Interview Preparation Portal]
         │
         ▼
[13. Student Generates & Practices Monthly AI Datasets (Role, Project, Weak Areas, HR)]
         │
         ▼
[14. TPO Posts Job Openings with Academic Eligibility Criteria]
         │
         ▼
[15. Eligible Student Views Job -> Applies via Portal]
         │
         ▼
[16. Student Progresses Through Recruiter Rounds -> Accepted Offer]
         │
         ▼
[17. Status Updated to "Placed" -> Student Transitions to Placed Alumni Roster]
```

---

## 5. Master Structural Artifacts

---

### Section 5.1: Complete Module Dependency Text Architecture

```
[SYSTEM INITIALIZATION] 
    └──> [COLLEGE ONBOARDING]
            └──> [USER MANAGEMENT]
                    └──> [ACADEMIC MANAGEMENT]
                            ├──> [EXAM MANAGEMENT]
                            │       └──> [STUDENT EXAM FLOW]
                            │               └──> [REPORTS & ANALYTICS]
                            │
                            └──> [PROFILE CONFIGURATION (100% Engine)]
                                    └──> [INTERVIEW PREPARATION (Gemini AI)]
                                            └──> [PLACEMENT MANAGEMENT]
                                                    └──> [PLACED ALUMNI STATUS]
```

---

### Section 5.2: Master Actor Interaction Summary

1. **DataQuotes Admin (DQ-Admin)**: Global Platform Owner / Admin. Provisions tenant databases, manages global system environment settings, monitors multi-tenant resource usage.
2. **College Admin (College Super Admin)**: Institutional Head / Super Admin of the College. Sets up institutional academic hierarchy, imports users in bulk, maps subjects to departments, oversees college operations.
3. **HOD & Faculty**: Authors questions, generates AI questions, publishes exams, monitors class-level real-time evaluation analytics.
4. **Student**: Takes proctored exams, reviews delayed score reports, completes profile to 100%, practices monthly AI interview datasets, applies for eligible placement opportunities.
5. **TPO (Training & Placement Officer)**: Manages corporate recruiter contacts, posts job openings with eligibility criteria, tracks recruitment rounds, reports campus placement metrics.

---

## 6. Document Sign-Off & Utilization Instructions

> [!NOTE]
> This master functional document represents the authoritative architectural blueprint for DataQuotes LMS (Multi-Tenant). You can provide this document to AI diagramming tools, software development teams, or project stakeholders to generate:
> - **BPMN 2.0 Workflows**
> - **UML Sequence & Activity Diagrams**
> - **Entity Relationship Models (ERD)**
> - **Business Requirements Documents (BRD)**
> - **Software Requirements Specifications (SRS)**
