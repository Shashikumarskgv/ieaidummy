# DataQuotes LMS (Multi-Tenant) - Master Project Diagrams & Architecture Blueprint

**Document Purpose**: Complete Graphical & Text-Based Technical Architecture Diagrams, Entity-Relationship Models, Sequence Workflows, and State Transition Diagrams for DataQuotes LMS.  
**Strict Code Policy Compliance**: No source code, APIs, or database schemas have been altered. This document serves strictly as architectural documentation.

---

## 1. High-Level System Architecture Diagram

```mermaid
graph TD
    subgraph Client Layer [Frontend Presentation Layer - Next.js App Router]
        A1[DataQuotes Admin Portal]
        A2[College Admin Portal]
        A3[HOD & Faculty Portal]
        A4[TPO Placement Portal]
        A5[Student Assessment & Prep Portal]
    end

    subgraph Gateway Layer [API & Authentication Gateway - Node.js / Express]
        B1[JWT & RBAC Middleware]
        B2[Tenant Context Resolver]
        B3[API Route Controllers]
    end

    subgraph Service Layer [Core Application Services]
        C1[Tenant Management Service]
        C2[Academic & User Service]
        C3[Exam & Evaluation Engine]
        C4[Dynamic Profile Completion Engine]
        C5[Gemini AI Dataset Service]
        C6[Placement & Job Matching Service]
    end

    subgraph External Engine Layer [AI & Execution Engines]
        D1[Google Gemini AI Engine]
        D2[Sandboxed Code Execution Engine]
    end

    subgraph Data Layer [Multi-Tenant Database Architecture]
        E1[(Global DB: dq_lms_main)]
        E2[(Tenant DB 1: dq_lms_college_1)]
        E3[(Tenant DB 2: dq_lms_college_2)]
        E4[(Tenant DB N: dq_lms_college_N)]
    end

    %% Connections
    A1 & A2 & A3 & A4 & A5 -->|HTTP / HTTPS REST| B1
    B1 --> B2
    B2 --> B3
    B3 --> C1 & C2 & C3 & C4 & C5 & C6
    
    C5 <-->|Generate Datasets / MCQs| D1
    C3 <-->|Execute Code & Test Cases| D2

    C1 <-->|Manage Tenants & Licenses| E1
    C2 & C3 & C4 & C5 & C6 <-->|Isolated Tenant Connection Pool| E2 & E3 & E4
```

---

## 2. Complete Entity-Relationship (ER) Diagram

The ER Diagram illustrates the relational database architecture across tenant databases (`dq_lms_<college_code>`):

```mermaid
erDiagram
    tbl_college ||--o{ tbl_students : "hosts"
    tbl_college ||--o{ tbl_staff : "employs"
    tbl_college ||--o{ tbl_jobs : "manages"

    tbl_staff ||--o{ tbl_exams : "authors"

    tbl_students ||--o{ tbl_projects : "owns"
    tbl_students ||--o{ tbl_achievements : "owns"
    tbl_students ||--o{ tbl_exam_attempts : "attempts"
    tbl_students ||--o{ tbl_job_applications : "applies"
    tbl_students ||--o{ tbl_interview_panels : "configures"

    tbl_exams ||--o{ tbl_exam_assignments : "targets"
    tbl_exams ||--o{ tbl_exam_mcq_questions : "contains"
    tbl_exams ||--o{ tbl_exam_coding_questions : "contains"
    tbl_exams ||--o{ tbl_exam_attempts : "evaluates"

    tbl_exam_attempts ||--o{ tbl_exam_submissions : "records"

    tbl_jobs ||--o{ tbl_job_applications : "receives"

    tbl_college {
        int id PK
        string college_name
        string college_code UK
        string database_name
        string admin_email
        string admin_name
        string status
        timestamp created_at
    }

    tbl_staff {
        int id PK
        string staff_code UK
        string first_name
        string last_name
        string email UK
        string role_id FK "1:College Admin, 2:HOD, 3:Faculty, 4:TPO"
        string department
        string designation
        string status
    }

    tbl_students {
        int id PK
        string roll_number UK
        string first_name
        string last_name
        string personal_email UK
        string official_email
        string contact_number
        string department
        int current_semester
        int graduation_year
        decimal cgpa
        string gender
        date dob
        text address
        string profile_photo
        text description
        string designation
        string linkedin_url
        string github_url
        string portfolio_url
        string target_role
        decimal experience
        string working_type
        string resume_url
        json skills
        text weak_areas
        json academic_details
        int profile_completion "Dynamic 0-100%"
        string status
    }

    tbl_projects {
        int id PK
        int user_id FK
        string title
        text description
        string link
        timestamp created_at
    }

    tbl_achievements {
        int id PK
        int user_id FK
        string title
        date achievement_date
        timestamp created_at
    }

    tbl_exams {
        int id PK
        string exam_title
        string exam_type "MCQ | Coding | Hybrid"
        int duration_minutes
        int total_marks
        int passing_score
        timestamp start_time
        timestamp end_time
        int created_by FK
        string status "Draft | Published | Archived"
    }

    tbl_exam_assignments {
        int id PK
        int exam_id FK
        string department
        string section
        int graduation_year
        int student_id FK "Optional individual mapping"
    }

    tbl_exam_attempts {
        int id PK
        int exam_id FK
        int student_id FK
        int score
        int total_questions
        int correct_answers
        int wrong_answers
        decimal percentage
        string status "in_progress | completed"
        timestamp started_at
        timestamp completed_at
    }

    tbl_exam_submissions {
        int id PK
        int attempt_id FK
        int question_id FK
        string question_type "mcq | coding"
        int mcq_answer_index
        text code_submission
        boolean is_correct
        int score_awarded
        timestamp submitted_at
    }

    tbl_jobs {
        int id PK
        string job_title
        string company_name
        string ctc_package
        string location
        decimal min_cgpa
        json eligible_branches
        int max_backlogs
        int graduation_year
        string external_apply_link
        string status "Active | Closed"
        timestamp posted_at
    }

    tbl_job_applications {
        int id PK
        int job_id FK
        int student_id FK
        string status "Applied | Shortlisted | Interviewed | Placed | Rejected"
        timestamp applied_at
    }

    tbl_interview_panels {
        int id PK
        int student_id FK
        int panel_number "1-5"
        string selected_role
        string status
    }

    tbl_interview_questions {
        int id PK
        int student_id FK
        string section "role | project | weak | hr"
        int panel_number
        string month_key "YYYY-MM"
        json questions
        timestamp generated_at
    }
```

---

## 3. Master End-to-End Business Flow Diagram

```mermaid
flowchart TD
    Start([Platform Inception]) --> Phase1[Phase 1: DataQuotes Admin Provisions College & Tenant DB]
    Phase1 --> Phase2[Phase 2: College Admin Onboards Academic Hierarchy & Subjects]
    Phase2 --> Phase3[Phase 3: Bulk Import of Students & Staff Accounts]
    Phase3 --> Phase4[Phase 4: Course-Faculty & Student Section Mappings]
    Phase4 --> Phase5[Phase 5: HOD/Faculty Authors Exam Questions via Manual & Gemini AI]
    Phase5 --> Phase6[Phase 6: Proctored Student Exam Execution & Real-Time Auto Saving]
    Phase6 --> Phase7[Phase 7: Automated Score Evaluation]
    
    Phase7 --> BranchHOD[HOD Receives Real-Time Analytics]
    Phase7 --> BranchStudent[Student Results Delayed Until Exam End Time Passes]
    
    BranchStudent --> Phase8[Phase 8: Student Completes 28 Profile Attributes to 100%]
    Phase8 --> Check100{Profile Completion == 100%?}
    
    Check100 -- No --> Lock[Lock Interview Prep & Warn Student]
    Lock --> Phase8
    
    Check100 -- Yes --> Phase9[Phase 9: Gemini AI Generates Monthly Interview Datasets]
    Phase9 --> Practice[Student Practices Role, Project, Weak Areas & HR Mock Tests]
    Practice --> Phase10[Phase 10: TPO Posts Jobs matching Academic Criteria]
    Phase10 --> FilterEligible{Student Meets Job Criteria?}
    
    FilterEligible -- No --> Hidden[Job Hidden from Student Dashboard]
    FilterEligible -- Yes --> Apply[Student Applies to Job Announcement]
    
    Apply --> Interviews[Recruitment Rounds: Shortlist -> Tech -> HR]
    Interviews --> Placed([Student Achieves Placement & Transitions to Alumni Roster])
```

---

## 4. Sequence Diagrams

### 4.1 Proctored Student Exam Execution & Delayed Result Sequence

```mermaid
sequenceDiagram
    autonumber
    actor S as Student
    participant FE as Frontend Dashboard
    participant API as Backend API Controller
    participant EE as Evaluation Engine
    participant DB as Tenant Database

    S->>FE: Click "Start Exam"
    FE->>API: GET /api/student/exams/:id
    API->>DB: Fetch Exam, Questions, and User Attempt
    DB-->>API: Return Exam Configuration & Lock Rules
    API-->>FE: Return Proctored Question Payload

    FE->>S: Enter Fullscreen Mode (Lockdown Active)
    
    loop Every 10 Seconds & On Answer Select
        S->>FE: Select Option / Edit Code
        FE->>API: POST /api/student/exams/auto-save
        API->>DB: UPDATE tbl_exam_submissions (Transient Save)
    end

    S->>FE: Click "Submit Exam"
    FE->>API: POST /api/student/exams/submit
    API->>EE: Evaluate MCQ Answers & Sandbox Code Test Cases
    EE-->>API: Calculated Marks & Analytics
    API->>DB: UPDATE tbl_exam_attempts (Status = 'completed', Score = X)
    
    API->>DB: Fetch Exam End Time
    alt Current Time < Exam End Time
        API-->>FE: Return "Submitted Successfully. Results will publish after Exam End Time."
    else Current Time >= Exam End Time
        API-->>FE: Return Detailed Results, Explanations & Score Breakdown
    end
```

---

### 4.2 Dynamic 100% Profile Completion & Gemini AI Interview Prep Sequence

```mermaid
sequenceDiagram
    autonumber
    actor S as Student
    participant FE as Frontend Profile Page
    participant BE as Profile Service & Completion Engine
    participant AI as Gemini AI Engine
    participant DB as Tenant Database

    S->>FE: Update Profile Fields (Photo, Semester, Skills, Projects)
    FE->>BE: PUT /api/student/profile
    BE->>DB: UPDATE tbl_students (photo, semester, skills, etc.)
    BE->>DB: Fetch Student, Projects Count, Achievements Count, Tenant College Name
    BE->>BE: calculateProfileCompletionDetailed() across 28 fields
    BE->>DB: UPDATE tbl_students (profile_completion = 100)
    BE-->>FE: Return { profile_completion: 100 }

    FE->>S: Update Progress Bar to 100% (Green Badge)
    S->>FE: Navigate to Interview Preparation Page
    FE->>BE: GET /api/student/profile
    BE-->>FE: Return { profile_completion: 100 }

    FE->>FE: Verify profile_completion == 100
    FE->>S: Hide Warning Banner & Enable "Generate Mock Datasets"

    S->>FE: Click "Generate Datasets"
    FE->>BE: GET /api/student/interview/questions/project
    BE->>AI: generateInterviewAI("generate_project", studentProfile)
    AI-->>BE: Return 30 Custom Technical Project Questions
    BE->>DB: INSERT into tbl_interview_questions (section='project', month='2026-07')
    BE-->>FE: Return Generated Monthly Dataset
    FE->>S: Enable Category Cards & Render "Start Test / Practice"
```

---

### 4.3 TPO Job Posting & Student Placement Application Sequence

```mermaid
sequenceDiagram
    autonumber
    actor TPO as Placement Officer (TPO)
    actor S as Student
    participant FE as Frontend Portal
    participant BE as Backend API Gateway
    participant DB as Tenant Database

    TPO->>FE: Create Job Posting (Min CGPA: 7.5, Max Backlogs: 0, Branch: CSE)
    FE->>BE: POST /api/tpo/jobs
    BE->>DB: INSERT into tbl_jobs
    BE-->>FE: Job Published Successfully

    S->>FE: Open Student Job Portal
    FE->>BE: GET /api/student/jobs
    BE->>DB: SELECT * FROM tbl_jobs WHERE status = 'Active'
    BE->>DB: SELECT cgpa, department, backlogs FROM tbl_students WHERE id = studentId
    BE->>BE: Filter Jobs: Check (Student CGPA >= Min CGPA && Branch Eligible)
    BE-->>FE: Return Filtered Eligible Job Listings

    FE->>S: Render Eligible Job Card with "Apply" Button
    S->>FE: Click "Apply Now"
    FE->>BE: POST /api/student/jobs/:id/apply
    BE->>DB: INSERT into tbl_job_applications (status = 'Applied')
    BE-->>FE: Return Application Status = "Applied"

    TPO->>FE: View Job Applicant Roster
    FE->>BE: GET /api/tpo/jobs/:id/applicants
    BE->>DB: SELECT * FROM tbl_job_applications JOIN tbl_students
    BE-->>FE: Return Applicants List

    TPO->>FE: Update Status to "Placed"
    FE->>BE: PATCH /api/tpo/applications/:id (Status = 'Placed')
    BE->>DB: UPDATE tbl_job_applications & UPDATE tbl_students (placement_status = 'Placed')
    BE-->>FE: Application Status Updated & Student Placed!
```

---

## 5. State Transition Diagrams

### 5.1 Student Exam Session State Machine

```mermaid
stateDiagram-v2
    [*] --> Scheduled: Exam Published by HOD
    Scheduled --> ActiveSession: Student Clicks Start Exam (Within Time Window)
    ActiveSession --> AutoSaving: Periodic MCQ/Code Save (Every 10s)
    AutoSaving --> ActiveSession: Save Acknowledged
    ActiveSession --> AutoSubmitted: Tab Switches Exceed Limit / Duration Expires
    ActiveSession --> SubmittedByUser: Student Clicks Submit Exam
    AutoSubmitted --> Evaluating: Sent to Real-Time Evaluation Engine
    SubmittedByUser --> Evaluating: Sent to Real-Time Evaluation Engine
    Evaluating --> ResultsPending: Score Stored in DB (Exam Window Still Open)
    Evaluating --> ResultsPublished: Score Stored in DB (Exam Window Closed)
    ResultsPending --> ResultsPublished: Exam End Time Elapsed
    ResultsPublished --> [*]
```

---

### 5.2 Job Application Lifecycle State Machine

```mermaid
stateDiagram-v2
    [*] --> Posted: TPO Publishes Job Announcement
    Posted --> Filtered: System Evaluates Student Eligibility (CGPA, Branch)
    Filtered --> Applied: Student Submits Application
    Applied --> Shortlisted: Recruiter Screens Resume & Profile
    Shortlisted --> TechnicalRound: Student Clears Initial Assessment
    TechnicalRound --> HRRound: Student Clears Technical Interview
    HRRound --> Offered: Recruiter Extends Offer Letter
    Offered --> Placed: Student Accepts Offer & TPO Finalizes Placement
    Applied --> Rejected: Screening Fail / Rejection
    Shortlisted --> Rejected: Technical Fail
    HRRound --> Rejected: HR Fail
    Placed --> [*]
```

---

## 6. Project Architecture Verification & File Mapping

| Architectural Component | Documented File Location | Status |
| :--- | :--- | :---: |
| **DataQuotes Admin API & Tenant Pool** | [c:\lms-b2b-api\src\config\db.ts](file:///c:/lms-b2b-api/src/config/db.ts) | Verified |
| **Schema Migration Engine** | [c:\lms-b2b-api\src\config\schemaMigration.ts](file:///c:/lms-b2b-api/src/config/schemaMigration.ts) | Verified |
| **Student Repository & Profile SQL** | [c:\lms-b2b-api\src\modules\student\student.repository.ts](file:///c:/lms-b2b-api/src/modules/student/student.repository.ts) | Verified |
| **Dynamic 100% Profile Completion Engine** | [c:\lms-b2b-api\src\modules\student\profileCompletion.ts](file:///c:/lms-b2b-api/src/modules/student/profileCompletion.ts) | Verified |
| **Gemini AI Interview Dataset Service** | [c:\lms-b2b-api\src\modules\student\interview\interview.service.ts](file:///c:/lms-b2b-api/src/modules/student/interview/interview.service.ts) | Verified |
| **Frontend Student Profile Page** | [c:\lms-b2b\components\students\profile\page.tsx](file:///c:/lms-b2b/components/students/profile/page.tsx) | Verified |
| **Frontend Interview Preparation Dashboard** | [c:\lms-b2b\components\students\interview\InterviewPrep.tsx](file:///c:/lms-b2b\components\students\interview\InterviewPrep.tsx) | Verified |

---

> [!TIP]
> This markdown document contains complete, valid **Mermaid** blocks (`mermaid`). You can render it directly in GitHub, Antigravity IDE, Notion, VS Code Mermaid previewers, or export it to PNG/SVG diagrams using any online Mermaid CLI or web tool.
