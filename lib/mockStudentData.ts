/**
 * Student Panel Mock Data & Standalone State Store
 * 
 * Provides complete, mathematically consistent student profile records,
 * 56-student cohort peer rankings, live concurrency metrics, interview preparation,
 * ATS resumes, and subscription payment simulation.
 */

import { INITIAL_STUDENTS } from "./mockHodData";
import { INITIAL_TPO_JOBS, TPOJobRecord } from "./mockTpoData";
import { StudentProfileData } from "@/components/students/types";
import { ResumeData } from "@/components/students/resumes/templates";

const STORAGE_KEYS = {
  PROFILE: "dq_student_profile_data",
  BOOKMARKED_JOBS: "dq_student_saved_jobs",
  STUDENT_APPLICATIONS: "dq_student_applications",
  ROLE_PANELS: "student_role_panels",
  TEST_RESULTS: "dq_test_results",
  USER_RESUMES: "dq_user_resumes",
  LICENSE: "dq_student_license",
  PRICING: "dq_student_pricing"
};

// ----------------------------------------------------------------------
// 1. Primary Student Profile (Aarav Sharma)
// ----------------------------------------------------------------------
export const INITIAL_STUDENT_PROFILE: StudentProfileData = {
  id: 1,
  roll_number: "21CS001",
  first_name: "Aarav",
  last_name: "Sharma",
  name: "Aarav Sharma",
  email: "aarav.sharma@college.edu",
  official_email: "aarav.sharma@college.edu",
  mobile: "+91 98765 43210",
  contact_number: "+91 98765 43210",
  department: "Computer Science & Engineering",
  section: "A",
  dob: "2003-05-14",
  gender: "Male",
  address: "Block 4, Campus Towers, Tech City, Bengaluru, Karnataka 560100",
  profile_photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250",
  description: "Final-year Computer Science & Engineering undergraduate specializing in Distributed Systems, High-Concurrency Web Architecture, and Applied Algorithms. Solved 450+ LeetCode problems with 9.4 CGPA and production microservices experience.",
  designation: "Student Candidate",
  company: "Apex Institute of Technology",
  college: "Apex Institute of Technology",
  year_of_study: "Final Year (4th Year)",
  batch_code: "CSE-2021-25",
  current_semester: 8,
  joined_course: "B.Tech Computer Science & Engineering",
  target_role: "Software Development Engineer (SDE 1)",
  working_type: "Onsite",
  preferred_location: "Bengaluru / Hyderabad",
  placement_status: "Shortlisted",
  interview_status: "Technical Round 2",
  earned_points: 1480,
  skills: [
    "React", "TypeScript", "Next.js", "Python", "Node.js", 
    "PostgreSQL", "Docker", "AWS", "Data Structures", "System Design"
  ],
  languages: [
    "English (Fluent)", "Hindi (Native)", "Kannada (Conversational)"
  ],
  linkedin_url: "https://linkedin.com/in/aarav-sharma-cs",
  github_url: "https://github.com/aaravsharma-dev",
  portfolio_url: "https://aaravsharma.dev",
  resume_url: "https://storage.college.edu/resumes/21cs001_cv.pdf",
  profile_completion: 100,
  academic_details: [
    {
      id: "acad_1",
      type: "Graduation",
      institution: "Apex Institute of Technology",
      course: "B.Tech Computer Science & Engineering",
      score: "9.4 CGPA",
      start_year: "2021",
      end_year: "2025",
      roll_number: "21CS001"
    },
    {
      id: "acad_2",
      type: "Intermediate",
      institution: "Delhi Public School",
      course: "CBSE Class XII (Physics, Chemistry, Math, CS)",
      score: "96.4%",
      start_year: "2019",
      end_year: "2021"
    },
    {
      id: "acad_3",
      type: "School",
      institution: "Delhi Public School",
      course: "CBSE Class X",
      score: "97.8%",
      start_year: "2017",
      end_year: "2019"
    }
  ],
  projects: [
    {
      id: "proj_1",
      title: "Enterprise Microservices E-Commerce Platform",
      role: "Lead Backend & Systems Architect",
      duration: "6 Months",
      technologies: "Next.js, FastAPI, PostgreSQL, Apache Kafka, Redis, Docker",
      github: "https://github.com/aaravsharma-dev/ecommerce-microservices",
      liveDemo: "https://shop-demo.aaravsharma.dev",
      description: "Architected high-throughput checkout microservice processing 4,000+ events/sec using Kafka stream partitions and optimistic Redis locking to prevent double-spending.",
      achievements: "Reduced average checkout latency by 45% with sub-50ms p99 latency."
    },
    {
      id: "proj_2",
      title: "AI Real-Time Proctoring & Code Sandbox",
      role: "Full Stack Engineer",
      duration: "4 Months",
      technologies: "React, WebRTC, Python, OpenCV, Docker Sandbox",
      github: "https://github.com/aaravsharma-dev/ai-proctor-sandbox",
      liveDemo: "https://proctor.aaravsharma.dev",
      description: "Developed automated proctoring module analyzing webcam feeds for multi-face detection, head-pose yaw/pitch estimation, and browser window blur events.",
      achievements: "Piloted across 3 college departments with 99.2% proctoring verification accuracy."
    },
    {
      id: "proj_3",
      title: "Distributed KV Store Engine",
      role: "Systems Developer",
      duration: "3 Months",
      technologies: "Go, Raft Consensus, gRPC, Protobuf",
      github: "https://github.com/aaravsharma-dev/distributed-kv-raft",
      liveDemo: "https://kv.aaravsharma.dev",
      description: "Implemented distributed fault-tolerant key-value store using Raft consensus algorithm with leader election, log replication, and automated cluster membership changes.",
      achievements: "Maintained 100% linearizable reads and zero data loss under simulated network partitions."
    }
  ],
  achievements: [
    { id: "ach_1", title: "1st Place - Smart India Hackathon (College Level)", year: "2024" },
    { id: "ach_2", title: "Dean's Merit List for Academic Excellence (6 Semesters)", year: "2022-2024" },
    { id: "ach_3", title: "Top 1% in College Technical Assessment Series", year: "2024" }
  ]
};

// ----------------------------------------------------------------------
// 2. 56-Student Cohort Metrics & Concurrency
// ----------------------------------------------------------------------
export const COHORT_STUDENTS_METRICS = {
  totalStudents: 56,
  studentRank: 2,
  percentile: 96.4,
  batchAverageCgpa: 8.24,
  studentCgpa: 9.4,
  batchAverageScore: 78.4,
  studentAverageScore: 92.5,
  liveConcurrency: {
    peersOnline: 18,
    peersInExams: 12,
    peersInInterviews: 3,
    recentOffersWeek: 5
  },
  topPeersLeaderboard: INITIAL_STUDENTS.slice(0, 10).map((s, idx) => ({
    rank: idx + 1,
    id: s.id,
    name: s.full_name,
    roll_number: s.roll_number,
    department: s.department,
    cgpa: s.cgpa,
    score: Math.round(98 - idx * 1.5),
    isCurrentUser: s.id === 1
  }))
};

// ----------------------------------------------------------------------
// 3. Interview Preparation Questions & Panels
// ----------------------------------------------------------------------
export const INITIAL_ROLE_PANELS = [
  {
    panelNumber: 1,
    id: 1,
    selectedRole: "Software Development Engineer (SDE 1)",
    roleName: "Software Development Engineer (SDE 1)",
    name: "Software Development Engineer (SDE 1)",
    status: "generated" as const,
    isLocked: false,
    isDefault: true,
    questionsCount: 50,
    testsCompleted: 4,
    avgScore: 88
  },
  {
    panelNumber: 2,
    id: 2,
    selectedRole: "Full Stack Web Developer",
    roleName: "Full Stack Web Developer",
    name: "Full Stack Web Developer",
    status: "generated" as const,
    isLocked: false,
    isDefault: false,
    questionsCount: 50,
    testsCompleted: 2,
    avgScore: 82
  },
  {
    panelNumber: 3,
    id: 3,
    selectedRole: "Backend & Systems Architect",
    roleName: "Backend & Systems Architect",
    name: "Backend & Systems Architect",
    status: "generated" as const,
    isLocked: false,
    isDefault: false,
    questionsCount: 50,
    testsCompleted: 3,
    avgScore: 85
  },
  {
    panelNumber: 4,
    id: 4,
    selectedRole: "DevOps & Cloud Infrastructure Engineer",
    roleName: "DevOps & Cloud Infrastructure Engineer",
    name: "DevOps & Cloud Infrastructure Engineer",
    status: "generated" as const,
    isLocked: false,
    isDefault: false,
    questionsCount: 50,
    testsCompleted: 1,
    avgScore: 90
  },
  {
    panelNumber: 5,
    id: 5,
    selectedRole: "AI / ML Solutions Engineer",
    roleName: "AI / ML Solutions Engineer",
    name: "AI / ML Solutions Engineer",
    status: "generated" as const,
    isLocked: false,
    isDefault: false,
    questionsCount: 50,
    testsCompleted: 1,
    avgScore: 87
  }
];

export const INITIAL_SECTION_QUESTIONS = {
  role: [
    {
      id: 1,
      question: "Explain the time and space complexity trade-offs of QuickSort vs MergeSort in practice.",
      difficulty: "Medium",
      topic: "Algorithms & Complexity",
      shortAnswer: "QuickSort runs in O(N log N) average time and O(log N) auxiliary space in-place with lower constant factors, but degrades to O(N^2) worst case. MergeSort guarantees O(N log N) worst-case time with O(N) auxiliary space, making it stable but memory-heavy.",
      longAnswer: "QuickSort uses in-place partitioning with lower cache-miss penalties and smaller hidden constants, making it faster in practice for random arrays. MergeSort is stable and parallelizable, ideal for linked lists and external disk sorting where contiguous memory is limited.",
      explanation: "QuickSort average time is O(N log N) with O(log N) space. MergeSort requires O(N) auxiliary memory.",
      options: [
        "QuickSort is in-place O(N log N) average with O(log N) space, while MergeSort guarantees O(N log N) with O(N) space",
        "MergeSort is in-place O(1) space, while QuickSort requires O(N^2) auxiliary memory allocation",
        "Both algorithms require O(N) space and degrade to O(N^2) time on presorted input data",
        "QuickSort is stable by default, whereas MergeSort cannot preserve duplicate element ordering"
      ],
      correctIndex: 0,
      completed: true,
      category: "role"
    },
    {
      id: 2,
      question: "How would you design a distributed rate limiter for high-volume API requests?",
      difficulty: "Hard",
      topic: "System Design",
      shortAnswer: "Use a Token Bucket or Sliding Window Log algorithm implemented over Redis with atomic Lua scripts. For global scale, combine local memory caching with periodic Redis synchronization.",
      longAnswer: "In multi-region distributed deployments, atomic Lua scripts execute sliding-window increment and timestamp trimming in a single atomic Redis round-trip. To avoid network bottlenecks, application nodes can reserve tokens in batches using local memory token buckets.",
      explanation: "Redis atomic Lua scripts execute sliding window or token bucket calculations without race conditions.",
      options: [
        "Use Redis with atomic Lua scripts implementing Token Bucket or Sliding Window algorithms",
        "Rely on client-side localStorage timeouts to reject rapid consecutive API requests",
        "Store API call counters in a PostgreSQL database table locked with SERIALIZABLE isolation",
        "Use round-robin DNS routing to naturally disperse request bursts across application servers"
      ],
      correctIndex: 0,
      completed: true,
      category: "role"
    },
    {
      id: 3,
      question: "What are database isolation levels and explain dirty reads vs phantom reads.",
      difficulty: "Hard",
      topic: "Databases & Transactions",
      shortAnswer: "Four levels: Read Uncommitted, Read Committed, Repeatable Read, Serializable. Dirty reads occur when a transaction reads uncommitted changes. Phantom reads occur when new rows inserted by another transaction match a range query.",
      longAnswer: "Dirty reads happen in Read Uncommitted when uncommitted dirty pages are observed. Non-repeatable reads happen when a row is re-read with modified data. Phantom reads happen when new rows satisfying a range predicate are inserted concurrently. Serializable prevents all anomalies.",
      explanation: "Dirty read: reading uncommitted writes. Phantom read: concurrent transaction inserts matching range predicate.",
      options: [
        "Dirty read reads uncommitted writes; phantom read occurs when new rows match a range query during transaction",
        "Dirty read occurs in Serializable mode; phantom read occurs exclusively in Read Committed mode",
        "Dirty read implies duplicate primary keys; phantom read implies table index corruption",
        "Both terms describe identical cache staleness issues in NoSQL document stores"
      ],
      correctIndex: 0,
      completed: true,
      category: "role"
    },
    {
      id: 4,
      question: "Describe how the JavaScript event loop handles microtasks vs macrotasks.",
      difficulty: "Medium",
      topic: "JavaScript Runtime",
      shortAnswer: "Microtasks (Promises, process.nextTick) are drained completely at the end of every execution frame before the next macrotask (setTimeout, setInterval, I/O) is processed from the task queue.",
      longAnswer: "When the call stack empties, the microtask queue runs until exhaustion, including any microtasks queued during its own cycle. Only after the microtask queue is completely empty does the event loop pick the next macrotask.",
      explanation: "The microtask queue is drained fully after every stack frame before processing the next macrotask.",
      options: [
        "Microtasks (Promises) are drained completely before the next macrotask (setTimeout, I/O) is executed",
        "Macrotasks take precedence over microtasks in the event queue order",
        "Microtasks and macrotasks are processed in strict alternating 1-to-1 order",
        "Microtasks run only in worker threads while macrotasks run in the main thread"
      ],
      correctIndex: 0,
      completed: false,
      category: "role"
    },
    {
      id: 5,
      question: "How do TCP and UDP differ, and when would you choose UDP over TCP?",
      difficulty: "Medium",
      topic: "Computer Networks",
      shortAnswer: "TCP is connection-oriented, reliable, with congestion control and retransmission. UDP is connectionless and low-latency. Choose UDP for live gaming, video streaming, and DNS where low latency outweighs lost packets.",
      longAnswer: "TCP provides byte-stream reliability via 3-way handshakes, sequence numbers, and sliding window flow control. UDP provides minimal datagram protocol with 8-byte header overhead and no retransmission delays, making it optimal for real-time UDP audio/video and WebRTC.",
      explanation: "UDP trades delivery guarantees and retransmission for minimal latency and lower packet header overhead.",
      options: [
        "UDP is connectionless and low-latency without retransmission; ideal for real-time media and gaming",
        "UDP is connection-oriented with guaranteed packet delivery and congestion control",
        "TCP has lower overhead and smaller headers compared to UDP datagrams",
        "TCP cannot operate over IP networks, whereas UDP operates across all routing layers"
      ],
      correctIndex: 0,
      completed: true,
      category: "role"
    },
    {
      id: 6,
      question: "Explain LRU Cache implementation details and time complexity constraints.",
      difficulty: "Medium",
      topic: "Data Structures",
      shortAnswer: "Implement using a Hash Map paired with a Doubly Linked List. The hash map maps keys to node pointers in O(1). The doubly linked list allows moving accessed nodes to the head and evicting from the tail in O(1).",
      longAnswer: "A hash map provides O(1) lookup to find node references. A doubly linked list enables O(1) removal and insertion at the head. When capacity is exceeded, the node before the dummy tail is removed in O(1).",
      explanation: "Combining a hash map with a doubly linked list yields O(1) get and put time complexity.",
      options: [
        "Hash Map combined with a Doubly Linked List guarantees O(1) get and put operations",
        "A sorted array provides O(1) search and O(1) eviction for LRU items",
        "A binary search tree provides O(1) insertion and O(N) lookup for cached nodes",
        "A singly linked list with tail pointer achieves O(1) search and O(1) deletion"
      ],
      correctIndex: 0,
      completed: false,
      category: "role"
    },
    {
      id: 7,
      question: "What is the difference between optimistic and pessimistic concurrency control?",
      difficulty: "Medium",
      topic: "Database Concurrency",
      shortAnswer: "Pessimistic locking acquires exclusive row/table locks upfront (SELECT ... FOR UPDATE). Optimistic locking uses a version timestamp column and checks for concurrent modifications at commit time.",
      longAnswer: "Optimistic locking is preferred for high-read, low-contention workloads because it avoids holding database locks. Pessimistic locking prevents deadlocks and rollbacks in high-contention financial ledger transactions.",
      explanation: "Optimistic concurrency uses version checks at commit time; pessimistic concurrency acquires locks upfront.",
      options: [
        "Optimistic concurrency validates version fields at commit; pessimistic concurrency acquires explicit locks upfront",
        "Pessimistic locking never causes deadlocks, while optimistic locking always locks tables",
        "Optimistic locking requires distributed hardware locks across cluster nodes",
        "Both models require database transactions to run in read-uncommitted mode"
      ],
      correctIndex: 0,
      completed: true,
      category: "role"
    },
    {
      id: 8,
      question: "How does HTTPS establish a secure session via TLS 1.3 handshake?",
      difficulty: "Hard",
      topic: "Security & Cryptography",
      shortAnswer: "TLS 1.3 achieves 1-RTT handshake using Ephemeral Diffie-Hellman (ECDHE) for perfect forward secrecy and certificate verification via digital signatures.",
      longAnswer: "In TLS 1.3, ClientHello includes key share parameters upfront. ServerHello responds with its key share and encrypted certificate. Both parties derive symmetric keys immediately, reducing handshake latency by half compared to TLS 1.2.",
      explanation: "TLS 1.3 combines key exchange into the initial ClientHello/ServerHello round trip with ECDHE.",
      options: [
        "Uses ECDHE key exchange in 1-RTT to establish symmetric session keys with forward secrecy",
        "Encrypts all communication using the server's public RSA key throughout the entire session",
        "Sends passwords in cleartext during handshake before activating symmetric AES encryption",
        "Requires 4 round-trips to verify certificate revocation lists with root authorities"
      ],
      correctIndex: 0,
      completed: true,
      category: "role"
    }
  ],
  project: [
    {
      id: 101,
      question: "How did you manage distributed transactions or consistency across services in your microservices project?",
      difficulty: "Hard",
      topic: "Distributed Systems",
      shortAnswer: "Used the Saga pattern with orchestrated compensation events over Kafka. When payment fails, compensation events trigger inventory release and order status update.",
      longAnswer: "Implemented Choreographed Saga over Kafka topic partitions with idempotent event consumers. Each microservice writes local changes transactionally with an Outbox table to guarantee at-least-once delivery.",
      explanation: "Saga pattern with compensating transactions ensures eventual consistency across distributed boundaries without blocking 2PC locks.",
      options: [
        "Implemented Saga pattern with compensating events over Kafka message partitions",
        "Used two-phase commit (2PC) locks across all microservice PostgreSQL databases",
        "Shared a single monolithic database instance between all microservices",
        "Ignored failed service calls and manually resolved discrepancies in weekly batch jobs"
      ],
      correctIndex: 0,
      completed: true,
      category: "project"
    },
    {
      id: 102,
      question: "Explain the database indexing strategy in your project. Which columns were indexed and why?",
      difficulty: "Medium",
      topic: "Database Optimization",
      shortAnswer: "Created composite B-tree index on (user_id, status, created_at) for efficient filtering and sorting. Added partial indexes for active records to minimize index maintenance overhead.",
      longAnswer: "Analyzed slow query logs using EXPLAIN ANALYZE. Replaced sequential table scans with composite B-tree indexes ordered by equality columns first then range columns. Created partial index on active status rows.",
      explanation: "Composite indexes ordered by equality predicates before range predicates optimize multi-column WHERE clauses.",
      options: [
        "Created composite B-tree index on (user_id, status, created_at) to avoid sequential scans",
        "Created individual single-column indexes on all 35 columns in the user orders table",
        "Used hash indexes on text description columns for fuzzy full-text searching",
        "Avoided indexes entirely because indexes slow down read query performance"
      ],
      correctIndex: 0,
      completed: true,
      category: "project"
    },
    {
      id: 103,
      question: "How did you implement secure authentication and prevent CSRF / XSS attacks?",
      difficulty: "Hard",
      topic: "Security",
      shortAnswer: "Stored JWT access tokens in memory and refresh tokens in HttpOnly, Secure, SameSite=Strict cookies. Used CSP headers and sanitized all user inputs with DOMPurify.",
      longAnswer: "Short-lived access tokens (15m) reside in React memory, shielded from XSS. Refresh tokens reside in HttpOnly cookies unreachable by JS. CSRF is mitigated with SameSite=Strict and anti-CSRF double-submit tokens.",
      explanation: "HttpOnly Secure SameSite cookies protect refresh tokens; CSP and input sanitization prevent XSS injection.",
      options: [
        "Short-lived in-memory JWTs paired with HttpOnly, Secure, SameSite=Strict refresh cookies and CSP headers",
        "Stored authentication tokens in plain localStorage and disabled CORS validation on API routes",
        "Passed plaintext passwords in URL query parameters with base64 encoding",
        "Allowed all cross-origin requests by setting Access-Control-Allow-Origin to '*'"
      ],
      correctIndex: 0,
      completed: true,
      category: "project"
    },
    {
      id: 104,
      question: "What caching strategies did you use to reduce database load?",
      difficulty: "Medium",
      topic: "Performance Tuning",
      shortAnswer: "Employed Cache-Aside with Redis. Cache hits serve requests in <2ms. On cache miss, fetch from PostgreSQL, write to Redis with 15-minute TTL, and invalidate on write events.",
      longAnswer: "Used Cache-Aside (Lazy Loading) with Redis clusters. Added jitter to TTL to prevent cache avalanche. High-cardinality metadata is stored in Redis hashes with compression.",
      explanation: "Cache-Aside pattern checks Redis first; on miss, queries DB, populates cache with TTL, and invalidates on mutations.",
      options: [
        "Cache-Aside pattern using Redis with TTL and event-driven invalidation on data mutations",
        "Stored entire database tables in browser session storage on initial page load",
        "Cached all read requests in global Node.js variables without expiration policies",
        "Write-through caching that permanently disables database writes"
      ],
      correctIndex: 0,
      completed: true,
      category: "project"
    },
    {
      id: 105,
      question: "How did you structure error handling and resilience in your API communication layer?",
      difficulty: "Medium",
      topic: "Resilience & Reliability",
      shortAnswer: "Configured Axios interceptors with exponential backoff retries, centralized error boundary logging, and circuit breakers for downstream external services.",
      longAnswer: "Implemented circuit breaker pattern using opossum. Handled transient 503/504 errors with jittered exponential retries. Normalized API error payloads into structured `{ code, message, fieldErrors }` format.",
      explanation: "Circuit breakers prevent cascading failures when third-party microservices experience downstream latency or downtime.",
      options: [
        "Exponential backoff retry with jitter, circuit breaker pattern, and normalized error responses",
        "Wrapped every HTTP call in empty try/catch blocks that suppress all network errors",
        "Infinite while loop retries until the external service becomes responsive",
        "Allowed client unhandled promise rejections to bubble directly to user browser console"
      ],
      correctIndex: 0,
      completed: true,
      category: "project"
    }
  ],
  weak: [
    {
      id: 201,
      question: "Explain closures, lexical scoping, and memory leak pitfalls in JavaScript.",
      difficulty: "Medium",
      topic: "JavaScript Core",
      shortAnswer: "A closure retains access to its lexical scope even when executed outside that scope. Memory leaks occur if closures retain large objects inside long-lived event listeners or intervals.",
      longAnswer: "Functions in JS enclose variables from their outer lexical environment. If an inner function is attached to a global DOM listener or timer, the entire lexical environment remains reachable by GC roots.",
      explanation: "Closures preserve variable references from their enclosing lexical scope, which can cause leaks if references persist in long-lived listeners.",
      options: [
        "A closure preserves access to its outer lexical scope; leaks occur when retained in long-lived listeners",
        "Closures automatically clone all variables into global scope upon invocation",
        "Closures run in separate operating system threads and cannot cause memory leaks",
        "Closures are deprecated in modern ES6+ in favor of arrow function syntax"
      ],
      correctIndex: 0,
      initialScore: 40,
      currentScore: 85,
      progress: 85,
      completed: true,
      category: "weak"
    },
    {
      id: 202,
      question: "Analyze worst-case pivot selection in QuickSort and explain randomized / median-of-three mitigations.",
      difficulty: "Hard",
      topic: "Algorithms",
      shortAnswer: "Sorted or reverse-sorted inputs cause O(N^2) if the first/last element is always picked as pivot. Median-of-three or randomized selection ensures expected O(N log N) complexity.",
      longAnswer: "Picking extreme elements produces unbalanced partitions (1 and N-1 elements), degenerating recurrence to T(N) = T(N-1) + O(N) = O(N^2). Median-of-three inspects first, middle, and last elements to guarantee balanced splits.",
      explanation: "Median-of-three pivot selection prevents adversarial worst-case O(N^2) performance on sorted inputs.",
      options: [
        "Median-of-three chooses median of first, middle, last elements to prevent O(N^2) degeneration on sorted data",
        "Randomized pivot guarantees that QuickSort never performs any comparisons",
        "Worst-case QuickSort is caused by duplicate elements and is solved by binary search",
        "QuickSort always runs in O(N log N) regardless of pivot selection choice"
      ],
      correctIndex: 0,
      initialScore: 35,
      currentScore: 78,
      progress: 78,
      completed: true,
      category: "weak"
    },
    {
      id: 203,
      question: "Explain database EXPLAIN ANALYZE output and identify sequential scans vs index scans.",
      difficulty: "Medium",
      topic: "Database Performance",
      shortAnswer: "EXPLAIN ANALYZE runs the query and displays actual execution times. Look for sequential scans on large tables where an index scan or index only scan should be utilized.",
      longAnswer: "EXPLAIN estimates cost; EXPLAIN ANALYZE executes the statement and reveals actual startup time, total time, rows filtered, and buffer cache hits. High cost Sequential Scan with high rows removed indicates missing index.",
      explanation: "EXPLAIN ANALYZE executes query measuring actual time, rows, and buffer hits, highlighting costly sequential scans.",
      options: [
        "EXPLAIN ANALYZE executes the query and compares estimated cost with actual execution time and scan types",
        "EXPLAIN ANALYZE rewrites the SQL query automatically to execute in sub-millisecond time",
        "Sequential scan is always faster than index scan because it avoids tree traversal overhead",
        "Index scan performs a full table scan followed by in-memory hash filtering"
      ],
      correctIndex: 0,
      initialScore: 50,
      currentScore: 80,
      progress: 80,
      completed: true,
      category: "weak"
    },
    {
      id: 204,
      question: "How does the garbage collector identify unreachable objects in V8 / Node.js?",
      difficulty: "Hard",
      topic: "Memory Management",
      shortAnswer: "V8 uses Mark-and-Sweep with generational collection (Scavenger for young generation, Mark-Sweep-Compact for old generation).",
      longAnswer: "Objects are allocated in the Nursery. Surviving objects migrate to Old Space. Roots include stack pointers, global objects, and active DOM nodes. Unreachable objects not traversed from roots are swept.",
      explanation: "Mark-Sweep begins at GC roots; objects not reachable through pointer chains are reclaimed during sweeping.",
      options: [
        "Tracing GC (Mark-and-Sweep) traverses reference graphs starting from root objects",
        "Reference counting immediately frees memory whenever an assignment operator is used",
        "Objects are automatically destroyed exactly 60 seconds after instantiation",
        "Memory is never freed in Node.js until process termination"
      ],
      correctIndex: 0,
      initialScore: 45,
      currentScore: 82,
      progress: 82,
      completed: true,
      category: "weak"
    }
  ],
  hr: [
    {
      id: 301,
      question: "Tell me about yourself and your journey into software engineering.",
      difficulty: "Easy",
      topic: "HR / Behavioral",
      shortAnswer: "Structure into Past (academic foundations), Present (recent projects and technical strengths in distributed systems), and Future (why this team and role aligns with career ambitions).",
      longAnswer: "I am a final-year CS undergraduate with a passion for high-concurrency backend architecture. Over the last 2 years, I designed microservices handling thousands of requests per second, led technical teams, and solved 450+ algorithmic problems. I am eager to bring this engineering focus to your cloud platform team.",
      explanation: "Past-Present-Future structure provides a coherent, impact-driven self introduction.",
      options: [
        "Structure response using Past (foundations), Present (key projects/strengths), and Future (alignment with role)",
        "Recite entire resume line-by-line starting from kindergarten schooling",
        "Focus solely on personal hobbies and weekend activities outside technology",
        "State that your technical achievements speak for themselves without elaboration"
      ],
      correctIndex: 0,
      completed: true,
      category: "hr"
    },
    {
      id: 302,
      question: "Describe a significant technical disagreement with a teammate and how you resolved it.",
      difficulty: "Medium",
      topic: "Collaboration & Conflict",
      shortAnswer: "Use STAR method. Disagreed on REST vs GraphQL for the project. Benchmarked response times, analyzed client query requirements, aligned objectively on REST for our use case, and documented decisions.",
      longAnswer: "During our e-commerce project, teammate advocated GraphQL while I favored REST for caching simplicity. Rather than arguing opinions, we built a 2-day proof of concept measuring payload sizes and Redis caching hit rates. Data showed REST cut p99 latency by 35% for our workload. We aligned enthusiastically and documented the ADR.",
      explanation: "Use STAR with data-driven benchmarking and objective alignment to resolve architectural conflicts.",
      options: [
        "Use STAR method: isolate technical tradeoff, build data-driven benchmark/PoC, and align objectively",
        "Escalate immediately to the professor or department head to decide the outcome",
        "Privately commit your preferred code without notifying team members",
        "Concede without discussion to prevent any team disagreements"
      ],
      correctIndex: 0,
      completed: true,
      category: "hr"
    },
    {
      id: 303,
      question: "Where do you see yourself in 3 to 5 years?",
      difficulty: "Easy",
      topic: "Career Aspirations",
      shortAnswer: "I aim to grow into a senior engineer taking end-to-end ownership of core distributed systems, mentoring junior developers, and contributing to high-availability architecture.",
      longAnswer: "In 3 years, I plan to master the domain, design mission-critical services independently, and mentor new grads. By year 5, I want to lead technical initiatives on system resilience and high-throughput data processing.",
      explanation: "Demonstrate realistic progression from strong IC ownership to mentorship and technical leadership.",
      options: [
        "Grow into senior engineer owning high-impact systems, driving architecture, and mentoring teammates",
        "Transition completely out of software engineering into executive management within 6 months",
        "State that 5 years is too far in the future to have any professional aspirations",
        "Aim to launch a competing startup using the company's proprietary codebase"
      ],
      correctIndex: 0,
      completed: true,
      category: "hr"
    },
    {
      id: 304,
      question: "Why do you want to join our organization specifically?",
      difficulty: "Easy",
      topic: "Company Fit",
      shortAnswer: "Reference specific engineering challenges, open-source initiatives, or tech stack alignment that excites you, demonstrating genuine research and enthusiasm.",
      longAnswer: "I have followed your team's engineering blogs on distributed stream processing. The scale at which you operate—processing millions of transactions daily—directly matches my passion for high-concurrency systems. I want to contribute to an engineering culture that prizes performance and developer excellence.",
      explanation: "Demonstrate specific knowledge of the company's technical scale, products, and engineering culture.",
      options: [
        "Highlight alignment with specific company engineering challenges, scale, and technical blog publications",
        "Mention that you applied to 50 companies and this was the first to offer an interview",
        "State that the company has the highest salary package on campus",
        "Explain that your friend works at the company and recommended the cafeteria food"
      ],
      correctIndex: 0,
      completed: false,
      category: "hr"
    },
    {
      id: 305,
      question: "How do you handle deadlines and prioritizing competing tasks during high-stress sprint cycles?",
      difficulty: "Medium",
      topic: "Time Management",
      shortAnswer: "Use Eisenhower Matrix or MoSCoW prioritization. Communicate blockers early with stakeholders, renegotiate scope if needed, and maintain test coverage.",
      longAnswer: "I break deliverables into Must-Have and Nice-to-Have milestones. When priorities shift, I immediately sync with the tech lead to realign expectations rather than compromising code quality or test coverage.",
      explanation: "Proactive communication and structured prioritization prevent burnout and technical debt during tight sprints.",
      options: [
        "Categorize tasks by business impact, communicate blockers proactively, and protect code quality",
        "Skip all unit tests and documentation to meet artificial delivery dates",
        "Work 24-hour shifts without informing managers about unrealistic project scope",
        "Ignore lower-priority tasks permanently without notifying stakeholders"
      ],
      correctIndex: 0,
      completed: true,
      category: "hr"
    }
  ]
};

export const INITIAL_TEST_RESULTS = [
  {
    id: "test_res_1",
    section: "role",
    scope: "all",
    test_type: "mcq",
    title: "Software Engineering Core Evaluation",
    total_questions: 5,
    total: 5,
    score: 5,
    correct: 5,
    wrong: 0,
    percentage: 100,
    status: "completed",
    started_at: new Date(Date.now() - 86400000 * 2 - 1800000).toISOString(),
    completed_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    duration_minutes: 25,
    answers: [0, 0, 0, 0, 0],
    mcqs: [
      {
        id: 1,
        question: "Explain the time and space complexity trade-offs of QuickSort vs MergeSort in practice.",
        options: [
          "QuickSort is in-place O(N log N) average with O(log N) space, while MergeSort guarantees O(N log N) with O(N) space",
          "MergeSort is in-place O(1) space, while QuickSort requires O(N^2) auxiliary memory allocation",
          "Both algorithms require O(N) space and degrade to O(N^2) time on presorted input data",
          "QuickSort is stable by default, whereas MergeSort cannot preserve duplicate element ordering"
        ],
        correctIndex: 0,
        explanation: "QuickSort average time is O(N log N) with O(log N) space. MergeSort requires O(N) auxiliary memory."
      },
      {
        id: 2,
        question: "How would you design a distributed rate limiter for high-volume API requests?",
        options: [
          "Use Redis with atomic Lua scripts implementing Token Bucket or Sliding Window algorithms",
          "Rely on client-side localStorage timeouts to reject rapid consecutive API requests",
          "Store API call counters in a PostgreSQL database table locked with SERIALIZABLE isolation",
          "Use round-robin DNS routing to naturally disperse request bursts across application servers"
        ],
        correctIndex: 0,
        explanation: "Redis atomic Lua scripts execute sliding window or token bucket calculations without race conditions."
      },
      {
        id: 3,
        question: "What are database isolation levels and explain dirty reads vs phantom reads.",
        options: [
          "Dirty read reads uncommitted writes; phantom read occurs when new rows match a range query during transaction",
          "Dirty read occurs in Serializable mode; phantom read occurs exclusively in Read Committed mode",
          "Dirty read implies duplicate primary keys; phantom read implies table index corruption",
          "Both terms describe identical cache staleness issues in NoSQL document stores"
        ],
        correctIndex: 0,
        explanation: "Dirty read: reading uncommitted writes. Phantom read: concurrent transaction inserts matching range predicate."
      },
      {
        id: 4,
        question: "Describe how the JavaScript event loop handles microtasks vs macrotasks.",
        options: [
          "Microtasks (Promises) are drained completely before the next macrotask (setTimeout, I/O) is executed",
          "Macrotasks take precedence over microtasks in the event queue order",
          "Microtasks and macrotasks are processed in strict alternating 1-to-1 order",
          "Microtasks run only in worker threads while macrotasks run in the main thread"
        ],
        correctIndex: 0,
        explanation: "The microtask queue is drained fully after every stack frame before processing the next macrotask."
      },
      {
        id: 5,
        question: "How do TCP and UDP differ, and when would you choose UDP over TCP?",
        options: [
          "UDP is connectionless and low-latency without retransmission; ideal for real-time media and gaming",
          "UDP is connection-oriented with guaranteed packet delivery and congestion control",
          "TCP has lower overhead and smaller headers compared to UDP datagrams",
          "TCP cannot operate over IP networks, whereas UDP operates across all routing layers"
        ],
        correctIndex: 0,
        explanation: "UDP trades delivery guarantees and retransmission for minimal latency and lower packet header overhead."
      }
    ]
  },
  {
    id: "test_res_2",
    section: "project",
    scope: "all",
    test_type: "mcq",
    title: "Project Deep-Dive Technical Mock",
    total_questions: 4,
    total: 4,
    score: 4,
    correct: 4,
    wrong: 0,
    percentage: 100,
    status: "completed",
    started_at: new Date(Date.now() - 86400000 * 5 - 1200000).toISOString(),
    completed_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    duration_minutes: 20,
    answers: [0, 0, 0, 0],
    mcqs: [
      {
        id: 101,
        question: "How did you manage distributed transactions or consistency across services in your microservices project?",
        options: [
          "Implemented Saga pattern with compensating events over Kafka message partitions",
          "Used two-phase commit (2PC) locks across all microservice PostgreSQL databases",
          "Shared a single monolithic database instance between all microservices",
          "Ignored failed service calls and manually resolved discrepancies in weekly batch jobs"
        ],
        correctIndex: 0,
        explanation: "Saga pattern with compensating transactions ensures eventual consistency across distributed boundaries without blocking 2PC locks."
      },
      {
        id: 102,
        question: "Explain the database indexing strategy in your project. Which columns were indexed and why?",
        options: [
          "Created composite B-tree index on (user_id, status, created_at) to avoid sequential scans",
          "Created individual single-column indexes on all 35 columns in the user orders table",
          "Used hash indexes on text description columns for fuzzy full-text searching",
          "Avoided indexes entirely because indexes slow down read query performance"
        ],
        correctIndex: 0,
        explanation: "Composite indexes ordered by equality predicates before range predicates optimize multi-column WHERE clauses."
      },
      {
        id: 103,
        question: "How did you implement secure authentication and prevent CSRF / XSS attacks?",
        options: [
          "Short-lived in-memory JWTs paired with HttpOnly, Secure, SameSite=Strict refresh cookies and CSP headers",
          "Stored authentication tokens in plain localStorage and disabled CORS validation on API routes",
          "Passed plaintext passwords in URL query parameters with base64 encoding",
          "Allowed all cross-origin requests by setting Access-Control-Allow-Origin to '*'"
        ],
        correctIndex: 0,
        explanation: "HttpOnly Secure SameSite cookies protect refresh tokens; CSP and input sanitization prevent XSS injection."
      },
      {
        id: 104,
        question: "What caching strategies did you use to reduce database load?",
        options: [
          "Cache-Aside pattern using Redis with TTL and event-driven invalidation on data mutations",
          "Stored entire database tables in browser session storage on initial page load",
          "Cached all read requests in global Node.js variables without expiration policies",
          "Write-through caching that permanently disables database writes"
        ],
        correctIndex: 0,
        explanation: "Cache-Aside pattern checks Redis first; on miss, queries DB, populates cache with TTL, and invalidates on mutations."
      }
    ]
  },
  {
    id: "test_res_3",
    section: "weak",
    scope: "all",
    test_type: "mcq",
    title: "Targeted Weak Areas Retest",
    total_questions: 3,
    total: 3,
    score: 3,
    correct: 3,
    wrong: 0,
    percentage: 100,
    status: "completed",
    started_at: new Date(Date.now() - 86400000 * 8 - 900000).toISOString(),
    completed_at: new Date(Date.now() - 86400000 * 8).toISOString(),
    duration_minutes: 15,
    answers: [0, 0, 0],
    mcqs: [
      {
        id: 201,
        question: "Explain closures, lexical scoping, and memory leak pitfalls in JavaScript.",
        options: [
          "A closure preserves access to its outer lexical scope; leaks occur when retained in long-lived listeners",
          "Closures automatically clone all variables into global scope upon invocation",
          "Closures run in separate operating system threads and cannot cause memory leaks",
          "Closures are deprecated in modern ES6+ in favor of arrow function syntax"
        ],
        correctIndex: 0,
        explanation: "Closures preserve variable references from their enclosing lexical scope, which can cause leaks if references persist in long-lived listeners."
      },
      {
        id: 202,
        question: "Analyze worst-case pivot selection in QuickSort and explain randomized / median-of-three mitigations.",
        options: [
          "Median-of-three chooses median of first, middle, last elements to prevent O(N^2) degeneration on sorted data",
          "Randomized pivot guarantees that QuickSort never performs any comparisons",
          "Worst-case QuickSort is caused by duplicate elements and is solved by binary search",
          "QuickSort always runs in O(N log N) regardless of pivot selection choice"
        ],
        correctIndex: 0,
        explanation: "Median-of-three pivot selection prevents adversarial worst-case O(N^2) performance on sorted inputs."
      },
      {
        id: 203,
        question: "Explain database EXPLAIN ANALYZE output and identify sequential scans vs index scans.",
        options: [
          "EXPLAIN ANALYZE executes the query and compares estimated cost with actual execution time and scan types",
          "EXPLAIN ANALYZE rewrites the SQL query automatically to execute in sub-millisecond time",
          "Sequential scan is always faster than index scan because it avoids tree traversal overhead",
          "Index scan performs a full table scan followed by in-memory hash filtering"
        ],
        correctIndex: 0,
        explanation: "EXPLAIN ANALYZE executes query measuring actual time, rows, and buffer hits, highlighting costly sequential scans."
      }
    ]
  },
  {
    id: "test_res_4",
    section: "hr",
    scope: "all",
    test_type: "mcq",
    title: "HR Fitment & Cultural Alignment Mock",
    total_questions: 3,
    total: 3,
    score: 3,
    correct: 3,
    wrong: 0,
    percentage: 100,
    status: "completed",
    started_at: new Date(Date.now() - 86400000 * 12 - 1000000).toISOString(),
    completed_at: new Date(Date.now() - 86400000 * 12).toISOString(),
    duration_minutes: 18,
    answers: [0, 0, 0],
    mcqs: [
      {
        id: 301,
        question: "Tell me about yourself and your journey into software engineering.",
        options: [
          "Structure response using Past (foundations), Present (key projects/strengths), and Future (alignment with role)",
          "Recite entire resume line-by-line starting from kindergarten schooling",
          "Focus solely on personal hobbies and weekend activities outside technology",
          "State that your technical achievements speak for themselves without elaboration"
        ],
        correctIndex: 0,
        explanation: "Past-Present-Future structure provides a coherent, impact-driven self introduction."
      },
      {
        id: 302,
        question: "Describe a significant technical disagreement with a teammate and how you resolved it.",
        options: [
          "Use STAR method: isolate technical tradeoff, build data-driven benchmark/PoC, and align objectively",
          "Escalate immediately to the professor or department head to decide the outcome",
          "Privately commit your preferred code without notifying team members",
          "Concede without discussion to prevent any team disagreements"
        ],
        correctIndex: 0,
        explanation: "Use STAR with data-driven benchmarking and objective alignment to resolve architectural conflicts."
      },
      {
        id: 303,
        question: "Where do you see yourself in 3 to 5 years?",
        options: [
          "Grow into senior engineer owning high-impact systems, driving architecture, and mentoring teammates",
          "Transition completely out of software engineering into executive management within 6 months",
          "State that 5 years is too far in the future to have any professional aspirations",
          "Aim to launch a competing startup using the company's proprietary codebase"
        ],
        correctIndex: 0,
        explanation: "Demonstrate realistic progression from strong IC ownership to mentorship and technical leadership."
      }
    ]
  }
];

// ----------------------------------------------------------------------
// 4. Pre-seeded ATS Resumes for Student
// ----------------------------------------------------------------------
export const INITIAL_STUDENT_RESUMES: ResumeData[] = [
  {
    id: "resume_aarav_sde",
    title: "Software Development Engineer (SDE-1) Resume",
    fullName: "Aarav Sharma",
    jobTitle: "Software Development Engineer (SDE 1)",
    email: "aarav.sharma@college.edu",
    phone: "+91 98765 43210",
    website: "aaravsharma.dev",
    location: "Bengaluru, India",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250",
    professionalSummary: "High-performing Computer Science graduate with strong expertise in Distributed Systems, React/Next.js, Python, and PostgreSQL. Proven track record building high-throughput microservices and competitive programming (450+ LeetCode problems, 9.4 CGPA).",
    styles: {
      fontFamily: "Inter",
      primaryColor: "#2563eb",
      fontSize: "14px",
      alignment: "left",
      layout: "double"
    },
    targetRole: "Software Development Engineer",
    experienceLevel: "Fresher",
    country: "India",
    completionPercent: 96,
    atsScore: 94,
    skills: ["Data Structures & Algorithms", "React", "TypeScript", "Next.js", "Python", "FastAPI", "PostgreSQL", "Docker", "Apache Kafka", "AWS"],
    hobbies: ["Open Source Development", "Competitive Coding", "System Architecture Tech Blogs"],
    employmentHistory: [
      {
        id: "exp_1",
        role: "Software Engineering Intern",
        company: "TechScale Solutions",
        location: "Bengaluru (Hybrid)",
        startDate: "Jan 2024",
        endDate: "Jun 2024",
        description: "Engineered high-performance real-time notifications service handling 50k daily active users using WebSockets and Redis pub/sub. Improved database query response times by 35% through query analysis and indexing."
      }
    ],
    education: [
      {
        id: "edu_1",
        degree: "Bachelor of Technology - Computer Science & Engineering",
        school: "Apex Institute of Technology",
        location: "Bengaluru",
        startDate: "Aug 2021",
        endDate: "May 2025",
        description: "9.4 CGPA. Core Coursework: Distributed Systems, Operating Systems, Database Management Systems, Computer Networks, Object-Oriented Analysis."
      }
    ],
    projects: [
      {
        id: "p_1",
        title: "Enterprise Microservices E-Commerce Platform",
        role: "Lead Backend Developer",
        duration: "6 Months",
        technologies: "Next.js, FastAPI, PostgreSQL, Apache Kafka, Docker",
        github: "https://github.com/aaravsharma-dev/ecommerce-microservices",
        liveDemo: "https://shop-demo.aaravsharma.dev",
        description: "Built scalable order processing pipeline with event-driven architecture over Apache Kafka.",
        achievements: "Achieved sub-50ms p99 latency under 4,000 requests/second load test."
      },
      {
        id: "p_2",
        title: "AI Real-Time Proctoring & Sandbox",
        role: "Full Stack Engineer",
        duration: "4 Months",
        technologies: "React, WebRTC, OpenCV, Python",
        github: "https://github.com/aaravsharma-dev/ai-proctor-sandbox",
        liveDemo: "https://proctor.aaravsharma.dev",
        description: "Developed browser lockdown and AI face-orientation proctoring engine with 99.2% accuracy.",
        achievements: "Adopted by college department for mock placement screening tests."
      }
    ],
    certifications: [
      "AWS Certified Solutions Architect - Associate",
      "Meta Front-End Developer Professional Certificate"
    ]
  },
  {
    id: "resume_aarav_fullstack",
    title: "Full Stack Cloud & Web Specialist Resume",
    fullName: "Aarav Sharma",
    jobTitle: "Full Stack Developer",
    email: "aarav.sharma@college.edu",
    phone: "+91 98765 43210",
    website: "aaravsharma.dev",
    location: "Bengaluru, India",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250",
    professionalSummary: "Product-focused Full Stack Developer proficient in React, Node.js, TypeScript, and AWS cloud deployment. Enthusiastic about creating intuitive responsive user interfaces backed by resilient APIs.",
    styles: {
      fontFamily: "Geist",
      primaryColor: "#059669",
      fontSize: "14px",
      alignment: "left",
      layout: "single"
    },
    targetRole: "Full Stack Developer",
    experienceLevel: "Fresher",
    country: "India",
    completionPercent: 92,
    atsScore: 91,
    skills: ["React", "Next.js", "Node.js", "Express", "TypeScript", "Tailwind CSS", "MongoDB", "PostgreSQL", "Docker", "Git"],
    hobbies: ["UI/UX Prototyping", "Technical Writing", "Open Source"],
    employmentHistory: [
      {
        id: "exp_fs_1",
        role: "Web Development Intern",
        company: "Apex Tech Labs",
        location: "Bengaluru",
        startDate: "Jun 2023",
        endDate: "Dec 2023",
        description: "Developed interactive analytics dashboards in React with dynamic chart visualizers and reduced bundle size by 28% using code-splitting."
      }
    ],
    education: [
      {
        id: "edu_fs_1",
        degree: "B.Tech Computer Science & Engineering",
        school: "Apex Institute of Technology",
        location: "Bengaluru",
        startDate: "2021",
        endDate: "2025",
        description: "Grade: 9.4 CGPA. Specialization in Software Engineering and Web Architecture."
      }
    ],
    projects: [
      {
        id: "p_fs_1",
        title: "Collaborative Real-time Whiteboard",
        role: "Frontend & WebSocket Engineer",
        duration: "3 Months",
        technologies: "Next.js, Canvas API, Socket.io, Node.js",
        github: "https://github.com/aaravsharma-dev/collab-whiteboard",
        liveDemo: "https://board.aaravsharma.dev",
        description: "Built multi-user canvas with conflict-free vector sync and low-latency drawing strokes.",
        achievements: "Tested with 50 simultaneous collaborators on a single room."
      }
    ]
  }
];

// ----------------------------------------------------------------------
// 5. HR Company Assessments (Linked with Corporate Placement Drives)
// ----------------------------------------------------------------------
export const INITIAL_STUDENT_HR_ASSESSMENTS = [
  {
    id: 501,
    title: "Google Online Technical Assessment (SWE I)",
    company_name: "Google",
    company_logo: "https://www.google.com/favicon.ico",
    job_role: "Software Development Engineer (Cloud & Distributed)",
    job_title: "Software Development Engineer (Cloud & Distributed)",
    duration: 90,
    duration_minutes: 90,
    total_marks: 100,
    mcq_count: 5,
    coding_count: 2,
    passing_pct: 75,
    pass_percentage: 75,
    attempt_status: "in_progress",
    attempt_id: 6001,
    attempt: {
      id: 6001,
      status: "in_progress",
      total_score: null,
      percentage: null
    },
    score: null,
    start_date: new Date(Date.now() - 86400000).toISOString(),
    end_date: new Date(Date.now() + 86400000 * 3).toISOString(),
    description: "Evaluates algorithms, dynamic programming, and systems concurrency for SDE candidates.",
    instructions: "Webcam and screen proctoring is enabled. Full-screen mode is required.",
    mcqs: [
      {
        id: 5001,
        question: "In distributed systems, what is the key distinction between linearizability and serializability?",
        options: [
          "Linearizability is a real-time recency guarantee on single operations, while serializability is a multi-operation transactional guarantee",
          "Linearizability applies only to relational databases, whereas serializability applies strictly to document stores",
          "Serializability requires physical clocks, whereas linearizability relies exclusively on logical vector clocks",
          "Both terms are interchangeable synonyms in the CAP theorem"
        ],
        correct_index: 0,
        marks: 5,
        explanation: "Linearizability provides composable real-time ordering constraints on single object register reads/writes. Serializability ensures multi-operation transactions appear to execute sequentially."
      },
      {
        id: 5002,
        question: "What is the worst-case space complexity of storing N keys in a standard Trie with alphabet size Sigma?",
        options: [
          "O(Sigma * N * L) where L is the maximum key length",
          "O(N * log(Sigma)) using contiguous vector memory",
          "O(Sigma^2) independent of the string lengths",
          "O(1) constant auxiliary space with memory compression"
        ],
        correct_index: 0,
        marks: 5,
        explanation: "Each node contains up to Sigma child pointers, and with N strings of length L, worst case memory is bounded by O(Sigma * N * L)."
      },
      {
        id: 5003,
        question: "How does the Raft consensus algorithm prevent split-brain during leader election partitions?",
        options: [
          "Requires a majority quorum (N/2 + 1 votes) and higher term numbers to elect a leader",
          "Delegates election decisions to an external centralized ZooKeeper cluster",
          "Assigns static leader seniority strictly based on node IP addresses",
          "Uses random sleep intervals to automatically terminate non-majority nodes"
        ],
        correct_index: 0,
        marks: 5,
        explanation: "Raft requires candidate nodes to obtain votes from a strict majority (N/2 + 1) of all cluster nodes, ensuring at most one leader can be elected per term."
      },
      {
        id: 5004,
        question: "Which data structure is most optimal for implementing a monotonic stack to find the Next Greater Element in O(N)?",
        options: [
          "Stack maintaining indices of elements in descending order",
          "Min-Heap with rebalancing on every push operation",
          "Balanced AVL Tree storing prefix maximum values",
          "Doubly-ended circular queue with binary search eviction"
        ],
        correct_index: 0,
        marks: 5,
        explanation: "A monotonic stack stores elements in monotonically decreasing order; popping smaller elements on encountering a larger one solves NGE in O(N) linear time."
      },
      {
        id: 5005,
        question: "Why is Consistent Hashing preferred over simple modulus hashing (hash(key) % N) in distributed caching clusters?",
        options: [
          "When adding or removing nodes, only K/N keys need to be remapped on average, avoiding cache stampedes",
          "Modulus hashing requires O(N^2) CPU cycles to compute MurmurHash values",
          "Consistent hashing eliminates all memory consumption across replica nodes",
          "Consistent hashing encrypts cached keys automatically using SHA-256"
        ],
        correct_index: 0,
        marks: 5,
        explanation: "In modulus hashing, changing N remaps nearly 100% of keys. Consistent hashing maps keys and nodes to a hash ring, remapping only K/N keys when cluster topology changes."
      }
    ],
    codings: [
      {
        id: 6001,
        title: "Longest Substring Without Repeating Characters",
        statement: "Given a string s, find the length of the longest substring without duplicate characters. Analyze time and space complexity.",
        difficulty: "Medium",
        constraints: "0 <= s.length <= 5 * 10^4, s consists of English letters, digits, symbols and spaces.",
        input_format: "A single line containing string s.",
        output_format: "Integer representing the length of the longest unique substring.",
        sample_input: "abcabcbb",
        sample_output: "3",
        marks: 25,
        time_limit_ms: 2000,
        memory_limit_kb: 262144,
        languages: ["python", "javascript", "java", "cpp"],
        starter_code: "def lengthOfLongestSubstring(s: str) -> int:\n    # Write your solution here\n    char_map = {}\n    left = 0\n    max_len = 0\n    for right, char in enumerate(s):\n        if char in char_map and char_map[char] >= left:\n            left = char_map[char] + 1\n        char_map[char] = right\n        max_len = max(max_len, right - left + 1)\n    return max_len\n\nimport sys\nif __name__ == '__main__':\n    input_str = sys.stdin.read().strip()\n    print(lengthOfLongestSubstring(input_str))\n",
        test_cases: [
          { input: "abcabcbb", expected_output: "3", is_hidden: false, weight: 10 },
          { input: "bbbbb", expected_output: "1", is_hidden: false, weight: 10 },
          { input: "pwwkew", expected_output: "3", is_hidden: true, weight: 5 }
        ]
      },
      {
        id: 6002,
        title: "Maximum Subarray Sum (Kadane's Algorithm)",
        statement: "Given an integer array nums, find the subarray with the largest sum, and return its sum.",
        difficulty: "Medium",
        constraints: "1 <= nums.length <= 10^5, -10^4 <= nums[i] <= 10^4",
        input_format: "First line contains N. Second line contains N space-separated integers.",
        output_format: "A single integer denoting the maximum subarray sum.",
        sample_input: "9\n-2 1 -3 4 -1 2 1 -5 4",
        sample_output: "6",
        marks: 25,
        time_limit_ms: 2000,
        memory_limit_kb: 262144,
        languages: ["python", "javascript", "java", "cpp"],
        starter_code: "import sys\n\ndef maxSubArray(nums):\n    max_so_far = nums[0]\n    current_max = nums[0]\n    for x in nums[1:]:\n        current_max = max(x, current_max + x)\n        max_so_far = max(max_so_far, current_max)\n    return max_so_far\n\nif __name__ == '__main__':\n    lines = sys.stdin.read().split()\n    if lines:\n        n = int(lines[0])\n        nums = [int(x) for x in lines[1:n+1]]\n        print(maxSubArray(nums))\n",
        test_cases: [
          { input: "9\n-2 1 -3 4 -1 2 1 -5 4", expected_output: "6", is_hidden: false, weight: 10 },
          { input: "1\n1", expected_output: "1", is_hidden: false, weight: 10 },
          { input: "5\n5 4 -1 7 8", expected_output: "23", is_hidden: true, weight: 5 }
        ]
      }
    ]
  },
  {
    id: 502,
    title: "Amazon SDE I Technical Screening Round",
    company_name: "Amazon",
    company_logo: "https://www.amazon.com/favicon.ico",
    job_role: "Software Development Engineer (High Throughput Systems)",
    job_title: "Software Development Engineer (High Throughput Systems)",
    duration: 75,
    duration_minutes: 75,
    total_marks: 100,
    mcq_count: 5,
    coding_count: 2,
    passing_pct: 70,
    pass_percentage: 70,
    attempt_status: "completed",
    attempt_id: 6002,
    attempt: {
      id: 6002,
      status: "completed",
      total_score: 88,
      percentage: 88
    },
    score: 88,
    start_date: new Date(Date.now() - 86400000 * 4).toISOString(),
    end_date: new Date(Date.now() + 86400000 * 2).toISOString(),
    description: "Assessment on trees, graphs, and Amazon Leadership Principles behavioral scenarios.",
    instructions: "Completed and submitted. Result: Shortlisted for Technical Round 2.",
    mcqs: [
      {
        id: 5011,
        question: "Which Amazon Leadership Principle emphasizes seeking diverse perspectives and working to disconfirm one's own beliefs?",
        options: [
          "Are Right, A Lot",
          "Frugality",
          "Bias for Action",
          "Invent and Simplify"
        ],
        correct_index: 0,
        marks: 5,
        explanation: "Leaders who 'Are Right, A Lot' have strong judgment and good instincts. They seek diverse perspectives and work to disconfirm their beliefs."
      },
      {
        id: 5012,
        question: "What is the time complexity of searching a node in a Red-Black Tree containing N elements?",
        options: [
          "O(log N) worst case guaranteed",
          "O(N) worst case if elements are inserted in ascending order",
          "O(1) amortized hash time",
          "O(N * log N) due to color rotation passes"
        ],
        correct_index: 0,
        marks: 5,
        explanation: "Red-Black trees enforce strict black-height balancing, ensuring maximum tree height is <= 2 * log2(N + 1), guaranteeing O(log N) search."
      }
    ],
    codings: [
      {
        id: 6003,
        title: "Two Sum II - Input Array Is Sorted",
        statement: "Given a 1-indexed array of integers numbers that is already sorted in non-decreasing order, find two numbers such that they add up to a specific target number.",
        difficulty: "Easy",
        constraints: "2 <= numbers.length <= 3 * 10^4, -1000 <= numbers[i] <= 1000",
        input_format: "First line contains N and Target. Second line contains N integers.",
        output_format: "Indices index1 and index2 separated by space.",
        sample_input: "4 9\n2 7 11 15",
        sample_output: "1 2",
        marks: 25,
        time_limit_ms: 1000,
        memory_limit_kb: 131072,
        languages: ["python", "javascript", "java", "cpp"],
        starter_code: "import sys\n\ndef twoSum(numbers, target):\n    l, r = 0, len(numbers) - 1\n    while l < r:\n        s = numbers[l] + numbers[r]\n        if s == target:\n            return f\"{l+1} {r+1}\"\n        elif s < target:\n            l += 1\n        else:\n            r -= 1\n    return \"-1 -1\"\n\nif __name__ == '__main__':\n    lines = sys.stdin.read().split()\n    if lines:\n        n, target = int(lines[0]), int(lines[1])\n        nums = [int(x) for x in lines[2:2+n]]\n        print(twoSum(nums, target))\n",
        test_cases: [
          { input: "4 9\n2 7 11 15", expected_output: "1 2", is_hidden: false, weight: 10 },
          { input: "3 6\n2 3 4", expected_output: "1 3", is_hidden: false, weight: 10 }
        ]
      }
    ]
  },
  {
    id: 503,
    title: "Microsoft Azure Engineering Challenge",
    company_name: "Microsoft",
    company_logo: "https://www.microsoft.com/favicon.ico",
    job_role: "Software Engineer (Azure Core & Cloud Infra)",
    job_title: "Software Engineer (Azure Core & Cloud Infra)",
    duration: 60,
    duration_minutes: 60,
    total_marks: 100,
    mcq_count: 5,
    coding_count: 1,
    passing_pct: 70,
    pass_percentage: 70,
    attempt_status: "completed",
    attempt_id: 6003,
    attempt: {
      id: 6003,
      status: "completed",
      total_score: 95,
      percentage: 95
    },
    score: 95,
    start_date: new Date(Date.now() - 86400000 * 6).toISOString(),
    end_date: new Date(Date.now() + 86400000).toISOString(),
    description: "Cloud computing fundamentals, microservices scalability, and algorithmic challenges.",
    instructions: "Completed with distinction (Top 3% percentile).",
    mcqs: [
      {
        id: 5021,
        question: "What is the primary benefit of deploying services across Azure Availability Zones?",
        options: [
          "Protects applications from entire datacenter failures within a region through independent power and networking",
          "Guarantees sub-microsecond latency across trans-oceanic geographical continents",
          "Eliminates the requirement for software error handling and health probes",
          "Provides free unlimited egress bandwidth for all internal virtual networks"
        ],
        correct_index: 0,
        marks: 10,
        explanation: "Availability Zones are physically separate datacenter facilities within an Azure region, equipped with independent power, cooling, and networking."
      }
    ],
    codings: [
      {
        id: 6004,
        title: "Valid Parentheses Checker",
        statement: "Given a string s containing '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
        difficulty: "Easy",
        constraints: "1 <= s.length <= 10^4",
        input_format: "Single line containing string s.",
        output_format: "true or false",
        sample_input: "()[]{}",
        sample_output: "true",
        marks: 40,
        time_limit_ms: 1000,
        memory_limit_kb: 131072,
        languages: ["python", "javascript", "java", "cpp"],
        starter_code: "import sys\n\ndef isValid(s: str) -> bool:\n    stack = []\n    mapping = {')': '(', '}': '{', ']': '['}\n    for char in s:\n        if char in mapping:\n            top = stack.pop() if stack else '#'\n            if mapping[char] != top:\n                return False\n        else:\n            stack.append(char)\n    return not stack\n\nif __name__ == '__main__':\n    line = sys.stdin.read().strip()\n    print(str(isValid(line)).lower())\n",
        test_cases: [
          { input: "()[]{}", expected_output: "true", is_hidden: false, weight: 20 },
          { input: "(]", expected_output: "false", is_hidden: false, weight: 20 }
        ]
      }
    ]
  },
  {
    id: 504,
    title: "Adobe Systems Member of Technical Staff Exam",
    company_name: "Adobe",
    company_logo: "https://www.adobe.com/favicon.ico",
    job_role: "Member of Technical Staff - Creative Cloud",
    job_title: "Member of Technical Staff - Creative Cloud",
    duration: 60,
    duration_minutes: 60,
    total_marks: 100,
    mcq_count: 5,
    coding_count: 1,
    passing_pct: 65,
    pass_percentage: 65,
    attempt_status: "not_started",
    attempt_id: null,
    attempt: null,
    score: null,
    start_date: new Date(Date.now() - 86400000 * 2).toISOString(),
    end_date: new Date(Date.now() + 86400000 * 5).toISOString(),
    description: "Computer graphics math, data structures, and multi-threaded programming evaluation.",
    instructions: "Click Start Assessment when ready. Proctoring webcam check will run before commencement.",
    mcqs: [
      {
        id: 5031,
        question: "In 2D computer graphics, which transformation matrix representation enables translation using linear matrix multiplication?",
        options: [
          "Homogeneous coordinates (3x3 matrix)",
          "Barycentric coordinate vector (2x1 matrix)",
          "Polar scalar coordinates",
          "Sparse diagonal identity matrix"
        ],
        correct_index: 0,
        marks: 10,
        explanation: "Homogeneous coordinates add a third dimension (w=1), allowing 2D affine translations to be represented as standard matrix multiplications."
      },
      {
        id: 5032,
        question: "Which color model is additive and used predominantly for digital monitor displays?",
        options: [
          "RGB",
          "CMYK",
          "Pantone Spot",
          "Grayscale Ink"
        ],
        correct_index: 0,
        marks: 10,
        explanation: "RGB is an additive color model where red, green, and blue light are combined together to create colors on emissive digital screens."
      }
    ],
    codings: [
      {
        id: 6005,
        title: "Matrix Transpose & Inversion",
        statement: "Given an N x N matrix, print its transpose.",
        difficulty: "Easy",
        constraints: "1 <= N <= 100",
        input_format: "First line contains N. Next N lines contain N integers each.",
        output_format: "N lines containing the transposed matrix.",
        sample_input: "2\n1 2\n3 4",
        sample_output: "1 3\n2 4",
        marks: 30,
        time_limit_ms: 1000,
        memory_limit_kb: 131072,
        languages: ["python", "javascript", "java", "cpp"],
        starter_code: "import sys\n\ndef transpose(matrix, n):\n    return [[matrix[j][i] for j in range(n)] for i in range(n)]\n\nif __name__ == '__main__':\n    tokens = sys.stdin.read().split()\n    if tokens:\n        n = int(tokens[0])\n        mat = []\n        idx = 1\n        for i in range(n):\n            mat.append([int(x) for x in tokens[idx:idx+n]])\n            idx += n\n        res = transpose(mat, n)\n        for row in res:\n            print(' '.join(map(str, row)))\n",
        test_cases: [
          { input: "2\n1 2\n3 4", expected_output: "1 3\n2 4", is_hidden: false, weight: 15 },
          { input: "1\n5", expected_output: "5", is_hidden: false, weight: 15 }
        ]
      }
    ]
  }
];

// ----------------------------------------------------------------------
// 6. Reactive Standalone Store Class
// ----------------------------------------------------------------------
class MockStudentStore {
  private isBrowser(): boolean {
    return typeof window !== "undefined" && typeof localStorage !== "undefined";
  }

  // ---- Profile ----
  public getProfile(): StudentProfileData {
    if (!this.isBrowser()) return INITIAL_STUDENT_PROFILE;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (raw) return JSON.parse(raw);
    } catch {}
    return INITIAL_STUDENT_PROFILE;
  }

  public updateProfile(payload: Partial<StudentProfileData>): StudentProfileData {
    const current = this.getProfile();
    const updated: StudentProfileData = {
      ...current,
      ...payload,
      name: payload.first_name || payload.last_name 
        ? `${payload.first_name || current.first_name} ${payload.last_name || current.last_name}`.trim()
        : (payload.name || current.name)
    };
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(updated));
    }
    return updated;
  }

  // ---- Dashboard Analytics ----
  public getDashboardAnalytics(): any {
    const profile = this.getProfile();
    const savedJobs = this.getSavedJobIds();
    const appliedJobs = this.getAppliedJobIds();

    return {
      appliedCount: appliedJobs.length,
      savedCount: savedJobs.length,
      earnedPoints: profile.earned_points || 1480,
      placementStatus: profile.placement_status || "Shortlisted",
      cohort: COHORT_STUDENTS_METRICS,
      interviewAnalytics: {
        hasStarted: true,
        roleBased: {
          role: profile.target_role || "Software Development Engineer (SDE 1)",
          testsTaken: 4,
          avgScore: 88,
          status: "Job Ready",
          breakdown: { fundamentals: 92, advanced: 85, systemDesign: 86 }
        },
        projectBased: {
          projectsScanned: (profile.projects || []).length,
          evaluation: "High architectural strength in microservices, Kafka streaming, and distributed state.",
          techStackMatched: ["Next.js", "FastAPI", "PostgreSQL", "Kafka", "Docker", "Redis", "React", "TypeScript"]
        },
        hrBased: {
          readinessPct: 92,
          completedTopics: [
            "Intro / Elevator Pitch", 
            "STAR Method Conflict Resolution", 
            "Technical Ambition Alignment",
            "Core Values & Culture Fit"
          ]
        },
        weakAreas: [
          { topic: "JavaScript Closures & Prototypical Chain", initialScore: 40, currentScore: 85, progress: 85, accuracy: 85, recommendedAction: "Practice scope chaining in Node runtimes" },
          { topic: "Time / Space Algorithm Analysis (QuickSort)", initialScore: 35, currentScore: 78, progress: 78, accuracy: 78, recommendedAction: "Review median-of-three pivot heuristics" },
          { topic: "Database Indexes & Query Performance Tuning", initialScore: 50, currentScore: 80, progress: 80, accuracy: 80, recommendedAction: "Practice EXPLAIN ANALYZE on PostgreSQL" }
        ]
      }
    };
  }

  // ---- Jobs Application & Bookmark state ----
  public getSavedJobIds(): number[] {
    if (!this.isBrowser()) return [1, 3];
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.BOOKMARKED_JOBS);
      if (raw) return JSON.parse(raw);
    } catch {}
    return [1, 3];
  }

  public toggleSaveJob(jobId: number): boolean {
    const current = this.getSavedJobIds();
    const next = current.includes(jobId) ? current.filter(id => id !== jobId) : [...current, jobId];
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.BOOKMARKED_JOBS, JSON.stringify(next));
    }
    return next.includes(jobId);
  }

  public getAppliedJobIds(): number[] {
    if (!this.isBrowser()) return [1, 2, 4];
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.STUDENT_APPLICATIONS);
      if (raw) return JSON.parse(raw);
    } catch {}
    return [1, 2, 4];
  }

  public applyToJob(jobId: number): boolean {
    const current = this.getAppliedJobIds();
    if (!current.includes(jobId)) {
      const next = [...current, jobId];
      if (this.isBrowser()) {
        localStorage.setItem(STORAGE_KEYS.STUDENT_APPLICATIONS, JSON.stringify(next));
      }
    }
    return true;
  }

  public withdrawApplication(jobId: number): boolean {
    const current = this.getAppliedJobIds();
    const next = current.filter(id => id !== jobId);
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.STUDENT_APPLICATIONS, JSON.stringify(next));
    }
    return true;
  }

  public getStudentJobsList(): any[] {
    const saved = new Set(this.getSavedJobIds());
    const applied = new Set(this.getAppliedJobIds());

    return INITIAL_TPO_JOBS.map(j => {
      let appStatus: string | null = null;
      if (applied.has(j.id)) {
        appStatus = "applied";
      } else if (saved.has(j.id)) {
        appStatus = "saved";
      }
      return {
        ...j,
        application_status: appStatus,
        applied_at: applied.has(j.id) ? new Date(Date.now() - 86400000 * 3).toISOString() : null,
        is_featured: j.id <= 3
      };
    });
  }

  // ---- Interview Panels & Questions ----
  public getInterviewPanels(): any[] {
    if (!this.isBrowser()) return INITIAL_ROLE_PANELS;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.ROLE_PANELS);
      if (raw) return JSON.parse(raw);
    } catch {}
    return INITIAL_ROLE_PANELS;
  }

  public getSectionQuestions(section: string, panelNumber = 0): any[] {
    if (this.isBrowser()) {
      const key = section === "role" ? `dq_role_panel_qs_${panelNumber}` : `dq_section_qs_${section}`;
      try {
        const raw = localStorage.getItem(key);
        if (raw) return JSON.parse(raw);
      } catch {}
    }
    const pool = (INITIAL_SECTION_QUESTIONS as any)[section] || INITIAL_SECTION_QUESTIONS.role;
    return pool;
  }

  public getTestResults(): any[] {
    if (!this.isBrowser()) return INITIAL_TEST_RESULTS;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.TEST_RESULTS);
      if (raw) return JSON.parse(raw);
    } catch {}
    return INITIAL_TEST_RESULTS;
  }

  // ---- Resumes ----
  public getUserResumes(): ResumeData[] {
    if (!this.isBrowser()) return INITIAL_STUDENT_RESUMES;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.USER_RESUMES);
      if (raw) return JSON.parse(raw);
    } catch {}
    return INITIAL_STUDENT_RESUMES;
  }

  // ---- Subscription & Payment ----
  public getPricing(): any {
    return {
      basePrice: 999,
      discount: 200,
      finalPrice: 799,
      currency: "INR",
      planName: "Annual Pro Placement & Assessment Pass",
      validity: "1 Year Access",
      features: [
        "Full Access to 50+ Assessment Drives",
        "Unlimited AI Mock Technical Interviews",
        "ATS Resume Builder with 7+ Premium Templates",
        "Direct Applications to Partner Corporate Openings",
        "Proctor Integrity Certification & Verifiable Badges",
        "Cohort Ranking & Peer Performance Analytics"
      ]
    };
  }

  public getLicenseStatus(): any {
    if (this.isBrowser()) {
      try {
        const raw = localStorage.getItem(STORAGE_KEYS.LICENSE);
        if (raw) return JSON.parse(raw);
      } catch {}
    }
    return {
      isLicensed: true,
      licenseKey: "LIC-PRO-2025-AARAV-8849",
      planName: "Pro Placement & Assessment Pass",
      validUntil: "2026-06-30T23:59:59.000Z",
      daysRemaining: 286,
      status: "Active",
      features: [
        "All Corporate Assessment Drives",
        "AI Mock Interviews & Test Sandbox",
        "ATS Resume Builder (Unlimited Exports)",
        "Cohort Leaderboard & Analytics"
      ]
    };
  }

  public createOrder(gateway: string = "Razorpay"): any {
    const orderId = `order_mock_${Math.floor(100000 + Math.random() * 900000)}`;
    return {
      orderId,
      amount: 79900,
      currency: "INR",
      gateway,
      keyId: "rzp_test_mock_123456"
    };
  }

  public verifyPayment(payload: any): any {
    const receiptNumber = `REC-2025-${Math.floor(10000 + Math.random() * 90000)}`;
    const transactionId = `txn_mock_${Math.floor(100000 + Math.random() * 900000)}`;
    const newLicense = {
      isLicensed: true,
      licenseKey: `LIC-PRO-${Math.floor(1000 + Math.random() * 9000)}-RENEWED`,
      planName: "Pro Placement & Assessment Pass (Renewed)",
      validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      daysRemaining: 365,
      status: "Active"
    };
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.LICENSE, JSON.stringify(newLicense));
    }
    return {
      success: true,
      receiptNumber,
      transactionId,
      amountPaid: 799,
      paymentDate: new Date().toISOString(),
      license: newLicense
    };
  }

  // Pre-seed initial data to localStorage if not present or stale
  public initStore(): void {
    if (!this.isBrowser()) return;
    try {
      const existingProf = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (!existingProf) {
        localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(INITIAL_STUDENT_PROFILE));
      } else {
        try {
          const parsed = JSON.parse(existingProf);
          if (!parsed.profile_completion || parsed.profile_completion < 100) {
            parsed.profile_completion = 100;
            localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(parsed));
          }
        } catch {
          localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(INITIAL_STUDENT_PROFILE));
        }
      }

      const existingPanels = localStorage.getItem(STORAGE_KEYS.ROLE_PANELS);
      if (!existingPanels) {
        localStorage.setItem(STORAGE_KEYS.ROLE_PANELS, JSON.stringify(INITIAL_ROLE_PANELS));
      } else {
        try {
          const parsed = JSON.parse(existingPanels);
          if (!Array.isArray(parsed) || parsed.length < 5 || !parsed[0]?.panelNumber) {
            localStorage.setItem(STORAGE_KEYS.ROLE_PANELS, JSON.stringify(INITIAL_ROLE_PANELS));
          }
        } catch {
          localStorage.setItem(STORAGE_KEYS.ROLE_PANELS, JSON.stringify(INITIAL_ROLE_PANELS));
        }
      }

      if (!localStorage.getItem(STORAGE_KEYS.USER_RESUMES)) {
        localStorage.setItem(STORAGE_KEYS.USER_RESUMES, JSON.stringify(INITIAL_STUDENT_RESUMES));
      }
      if (!localStorage.getItem(STORAGE_KEYS.TEST_RESULTS)) {
        localStorage.setItem(STORAGE_KEYS.TEST_RESULTS, JSON.stringify(INITIAL_TEST_RESULTS));
      }
      if (!localStorage.getItem(STORAGE_KEYS.BOOKMARKED_JOBS)) {
        localStorage.setItem(STORAGE_KEYS.BOOKMARKED_JOBS, JSON.stringify([1, 3]));
      }
      if (!localStorage.getItem(STORAGE_KEYS.STUDENT_APPLICATIONS)) {
        localStorage.setItem(STORAGE_KEYS.STUDENT_APPLICATIONS, JSON.stringify([1, 2, 4]));
      }
    } catch {}
  }
}

export const mockStudentStore = new MockStudentStore();
// Auto-initialize store in browser
if (typeof window !== "undefined") {
  mockStudentStore.initStore();
}
