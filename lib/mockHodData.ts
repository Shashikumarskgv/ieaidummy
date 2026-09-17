// lib/mockHodData.ts
// Single source of truth for the HOD Portal with 56 realistic students, 6 exams, and 75+ attempt records.

export interface StudentRecord {
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
  personal_email: string;
  email: string;
  contact_number: string;
  phone: string;
  cgpa: number;
  avatar_seed: string;
  status: "Active" | "Inactive";
}

export interface ExamRecord {
  id: number;
  title: string;
  description: string;
  course_name: string;
  course_id: number;
  duration: number; // in minutes
  start_date: string;
  end_date: string;
  total_marks: number;
  mcq_marks: number;
  coding_marks: number;
  pass_percentage: number;
  negative_marking: boolean;
  status: "Published" | "Ongoing" | "Completed" | "Draft";
  category: string;
  mcq_count: number;
  coding_count: number;
  registered_students_count: number;
  instructions?: string;
  exam_type_id?: number;
  exam_setting_id?: number;
  assigned_student_ids?: string[];
  assigned_type?: "course" | "students";
  mcqs?: any[];
  mcq_questions?: any[];
  codings?: any[];
  coding_questions?: any[];
}

export interface AttemptRecord {
  id: number;
  student_id: number;
  student: {
    id: number;
    full_name: string;
    roll_number: string;
    department: string;
    email: string;
    phone: string;
    batch: string;
    section: string;
    cgpa?: number;
  };
  exam_id: number;
  exam_title: string;
  exam: {
    id: number;
    title: string;
    total_marks: number;
    mcq_marks: number;
    coding_marks: number;
    passing_pct: number;
    duration: number;
    category: string;
  };
  total_score: number;
  mcq_score: number;
  coding_score: number;
  status: "completed" | "reassigned" | "in_progress";
  integrity_score: number; // 0 - 100
  tab_switches: number;
  face_violations: number;
  audio_violations: number;
  attempt_time_minutes: number;
  submitted_at: string | null;
  started_at: string;
  is_concurrent_active: boolean;
  ip_address: string;
  reassign_reason?: string;
  reassigned_at?: string;
  answers?: {
    mcq_answers: Array<{
      question_id: number;
      question: string;
      options: string[];
      selected_option: number;
      correct_option: number;
      is_correct: boolean;
      marks_obtained: number;
      explanation: string;
    }>;
    coding_submissions: Array<{
      question_id: number;
      title: string;
      statement: string;
      language: string;
      code: string;
      score: number;
      max_marks: number;
      test_cases_passed: number;
      total_test_cases: number;
      execution_time_ms: number;
      memory_kb: number;
      status: "Accepted" | "Wrong Answer" | "Partially Accepted" | "Runtime Error";
    }>;
    proctor_events: Array<{
      timestamp: string;
      event: string;
      type: "warning" | "violation" | "info";
      details: string;
    }>;
  };
}

export interface HODProfileData {
  id: number;
  full_name: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  designation: string;
  department: string;
  college_name: string;
  college_code: string;
  employee_id: string;
  office_location: string;
  experience_years: number;
  qualifications: string;
  research_areas: string;
  gender: string;
  dob: string;
  address: string;
  joining_date: string;
  bio: string;
  name?: string;
  role?: string;
}

// 56 realistic student roster
const FIRST_NAMES = [
  "Aarav", "Ananya", "Rohan", "Priya", "Aditi", "Siddharth", "Vikram", "Sneha",
  "Devendra", "Ishaan", "Pooja", "Rahul", "Kavya", "Varun", "Neha", "Arjun",
  "Rhea", "Manish", "Divya", "Karan", "Tanvi", "Akash", "Swati", "Nikhil",
  "Meera", "Shreyas", "Ritika", "Gaurav", "Simran", "Harish", "Deepika", "Kunal",
  "Aishwarya", "Pranav", "Shruti", "Sameer", "Preeti", "Tushar", "Ankita", "Mohit",
  "Sanjana", "Yash", "Nandini", "Abhishek", "Bhavna", "Ritesh", "Payal", "Saurabh",
  "Pallavi", "Vivek", "Komal", "Mayank", "Monika", "Chirag", "Jyoti", "Hemant"
];

const LAST_NAMES = [
  "Sharma", "Iyer", "Verma", "Nair", "Patel", "Rao", "Malhotra", "Kulkarni",
  "Joshi", "Kapoor", "Chopra", "Reddy", "Menon", "Bhat", "Deshmukh", "Singhal",
  "Bose", "Tiwari", "Pillai", "Choudhury", "Saxena", "Das", "Agarwal", "Bansal",
  "Mishra", "Gupta", "Chatterjee", "Shetty", "Gowda", "Naidu", "Sen", "Mehta",
  "Tripathi", "Soni", "Pandey", "Shukla", "Garg", "Jain", "Dubey", "Mahajan",
  "Bhattacharya", "Sinha", "Prasad", "Patil", "Deshpande", "Kashyap", "Vyas", "Chawla",
  "Bhardwaj", "Chauhan", "Rawat", "Thakur", "Rathore", "Bhandari", "Khatri", "Sethi"
];

export const INITIAL_STUDENTS: StudentRecord[] = FIRST_NAMES.map((fn, idx) => {
  const ln = LAST_NAMES[idx % LAST_NAMES.length];
  const num = (idx + 1).toString().padStart(3, "0");
  const roll = `21CS${num}`;
  const section: "A" | "B" = idx % 2 === 0 ? "A" : "B";
  const cgpaRaw = 6.4 + ((idx * 7 + 13) % 35) / 10;
  const cgpa = Number(Math.min(9.88, cgpaRaw).toFixed(2));

  return {
    id: idx + 1,
    user_id: `STU_${1000 + idx + 1}`,
    first_name: fn,
    last_name: ln,
    full_name: `${fn} ${ln}`,
    roll_number: roll,
    department: "Computer Science & Engineering",
    section,
    semester: "7th Semester",
    batch: "2021 - 2025",
    personal_email: `${fn.toLowerCase()}.${ln.toLowerCase()}@example.com`,
    email: `${fn.toLowerCase()}.${roll.toLowerCase()}@college.edu`,
    contact_number: `+91 ${9800000000 + idx * 11117}`,
    phone: `+91 ${9800000000 + idx * 11117}`,
    cgpa,
    avatar_seed: `${fn}-${ln}`,
    status: "Active"
  };
});

export interface CourseRecord {
  id: number;
  name: string;
  code: string;
  department: string;
  displayLabel?: string;
}

export const INITIAL_COURSES: CourseRecord[] = [
  { id: 1, name: "Computer Science Engineering (CSE)", code: "CSE", department: "Computer Science & Engineering", displayLabel: "B.Tech → Computer Science Engineering (CSE)" },
  { id: 2, name: "Master of Computer Applications (MCA)", code: "MCA", department: "Computer Applications", displayLabel: "Postgraduate → Master of Computer Applications (MCA)" },
  { id: 3, name: "Electronics & Communication Engineering (ECE)", code: "ECE", department: "Electronics & Communication", displayLabel: "B.Tech → Electronics & Communication Engineering (ECE)" },
  { id: 4, name: "Information Technology (IT)", code: "IT", department: "Information Technology", displayLabel: "B.Tech → Information Technology (IT)" },
  { id: 5, name: "Artificial Intelligence & Data Science (AI & DS)", code: "AIDS", department: "AI & Data Science", displayLabel: "B.Tech → Artificial Intelligence & Data Science (AI & DS)" }
];

const ALL_STUDENT_IDS = INITIAL_STUDENTS.map(s => String(s.id));

const CS401_MCQS = [
  {
    id: "mcq-401-1",
    question: "What is the amortized time complexity of inserting an element into a dynamic array (like std::vector or ArrayList)?",
    options: ["O(1)", "O(N)", "O(log N)", "O(N log N)"],
    correct_index: 0,
    marks: 8,
    negative_marks: 2,
    difficulty: "easy",
    topic: "Arrays & Amortized Analysis",
    explanation: "Although array doubling takes O(N), N insertions require approximately 2N copy steps, yielding O(1) amortized.",
    sort_order: 0
  },
  {
    id: "mcq-401-2",
    question: "Which data structure is fundamentally utilized in Tarjan's strongly connected components algorithm?",
    options: ["Queue", "Stack", "Priority Queue / Min-Heap", "Segment Tree"],
    correct_index: 1,
    marks: 8,
    negative_marks: 2,
    difficulty: "hard",
    topic: "Graph Algorithms",
    explanation: "Tarjan's algorithm uses a DFS recursion stack to track the exploration path and subtree components.",
    sort_order: 1
  },
  {
    id: "mcq-401-3",
    question: "What is the worst-case space complexity of Dijkstra's algorithm implemented with an Adjacency Matrix?",
    options: ["O(V + E)", "O(V^2)", "O(E log V)", "O(V log E)"],
    correct_index: 1,
    marks: 8,
    negative_marks: 2,
    difficulty: "medium",
    topic: "Shortest Paths",
    explanation: "An adjacency matrix occupies a 2D array of dimension V x V, which is O(V^2) space.",
    sort_order: 2
  },
  {
    id: "mcq-401-4",
    question: "Which of the following problems cannot be solved in polynomial time by a deterministic Turing machine unless P = NP?",
    options: ["Minimum Spanning Tree (Kruskal)", "Shortest Path (Bellman-Ford)", "0/1 Knapsack Problem", "Matrix Multiplication (Strassen)"],
    correct_index: 2,
    marks: 8,
    negative_marks: 2,
    difficulty: "hard",
    topic: "NP-Completeness",
    explanation: "0/1 Knapsack is an NP-complete problem solvable in pseudo-polynomial time via Dynamic Programming.",
    sort_order: 3
  },
  {
    id: "mcq-401-5",
    question: "In an AVL tree, what is the maximum permissible difference in height between left and right subtrees of any node?",
    options: ["0", "1", "2", "log(N)"],
    correct_index: 1,
    marks: 8,
    negative_marks: 2,
    difficulty: "easy",
    topic: "Balanced Trees",
    explanation: "The AVL balance factor must be in {-1, 0, +1}, meaning height difference cannot exceed 1.",
    sort_order: 4
  }
];

const CS401_CODINGS = [
  {
    id: "cod-401-1",
    title: "Find Longest Increasing Subsequence with Indices",
    statement: "Given an integer array nums, return the length of the longest strictly increasing subsequence and print one valid sequence of indices in O(N log N) time.",
    constraints: "1 <= nums.length <= 10^5, -10^4 <= nums[i] <= 10^4",
    input_format: "First line contains integer N. Second line contains N space-separated integers.",
    output_format: "Print length of LIS on first line, followed by the space-separated elements.",
    sample_input: "6\n10 9 2 5 3 7 101",
    sample_output: "4\n2 5 7 101",
    marks: 30,
    time_limit_ms: 2000,
    memory_limit_kb: 128000,
    languages: ["cpp", "python", "java"],
    starter_code: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    int n;\n    if (!(cin >> n)) return 0;\n    vector<int> nums(n);\n    for (int i = 0; i < n; i++) cin >> nums[i];\n    // TODO: Implement O(N log N) patience sorting\n    return 0;\n}`,
    sort_order: 0,
    test_cases: [
      { input: "6\n10 9 2 5 3 7 101", expected_output: "4", weight: 10, is_hidden: false, sort_order: 0 },
      { input: "6\n0 1 0 3 2 3", expected_output: "4", weight: 10, is_hidden: false, sort_order: 1 },
      { input: "7\n7 7 7 7 7 7 7", expected_output: "1", weight: 10, is_hidden: true, sort_order: 2 }
    ]
  },
  {
    id: "cod-401-2",
    title: "Graph Cycle Detection and TopoSort in Directed Acyclic Graph",
    statement: "Given a directed graph with V vertices and E edges, detect whether a cycle exists using Kahn's algorithm or DFS 3-coloring. If acyclic, output topological sort order; otherwise output -1.",
    constraints: "1 <= V <= 50000, 0 <= E <= 100000",
    input_format: "First line contains V and E. Next E lines contain directed edges u v.",
    output_format: "Space-separated topological order or -1.",
    sample_input: "4 4\n0 1\n0 2\n1 3\n2 3",
    sample_output: "0 1 2 3",
    marks: 30,
    time_limit_ms: 2000,
    memory_limit_kb: 128000,
    languages: ["python", "java", "cpp"],
    starter_code: `def topological_sort(v, edges):\n    # TODO: Implement Kahn's BFS or DFS cycle detection\n    pass`,
    sort_order: 1,
    test_cases: [
      { input: "4 4\n0 1\n0 2\n1 3\n2 3", expected_output: "0 1 2 3", weight: 15, is_hidden: false, sort_order: 0 },
      { input: "3 3\n0 1\n1 2\n2 0", expected_output: "-1", weight: 15, is_hidden: true, sort_order: 1 }
    ]
  }
];

const CS302_MCQS = [
  {
    id: "mcq-302-1",
    question: "In transaction management, which ACID property ensures that partial execution of a transaction is never reflected in the database?",
    options: ["Atomicity", "Consistency", "Isolation", "Durability"],
    correct_index: 0,
    marks: 8,
    negative_marks: 2,
    difficulty: "easy",
    topic: "Transaction Management",
    explanation: "Atomicity guarantees that all operations in a transaction succeed together, or all are rolled back.",
    sort_order: 0
  },
  {
    id: "mcq-302-2",
    question: "What is the key architectural difference in leaf nodes between a B+ Tree and a standard B-Tree?",
    options: ["B+ trees store data pointers only in internal nodes", "B+ trees store all actual records in leaf nodes linked as a contiguous list", "B trees do not support range scans", "B+ trees have variable height per subtree"],
    correct_index: 1,
    marks: 8,
    negative_marks: 2,
    difficulty: "medium",
    topic: "Database Indexing",
    explanation: "In B+ trees, all record pointers reside in leaf nodes, which are doubly linked for efficient sequential range traversal.",
    sort_order: 1
  },
  {
    id: "mcq-302-3",
    question: "A relational schema is in Boyce-Codd Normal Form (BCNF) if for every non-trivial functional dependency X -> Y:",
    options: ["X is a super key", "Y is a prime attribute", "X is a candidate key and Y is atomic", "X and Y share a common determinant"],
    correct_index: 0,
    marks: 8,
    negative_marks: 2,
    difficulty: "hard",
    topic: "Normalization Theory",
    explanation: "BCNF strictly requires the left-hand side X of any functional dependency to be a super key.",
    sort_order: 2
  },
  {
    id: "mcq-302-4",
    question: "Which SQL join returns all rows from the left table along with matched rows from the right table, substituting NULLs when no match exists?",
    options: ["INNER JOIN", "LEFT OUTER JOIN", "CROSS JOIN", "FULL OUTER JOIN"],
    correct_index: 1,
    marks: 8,
    negative_marks: 2,
    difficulty: "easy",
    topic: "SQL Joins",
    explanation: "LEFT OUTER JOIN preserves every row from the left table, padding missing right-side values with NULL.",
    sort_order: 3
  },
  {
    id: "mcq-302-5",
    question: "Under the Two-Phase Locking (2PL) protocol, once a transaction enters its shrinking phase:",
    options: ["It may only acquire shared read locks", "It cannot acquire any new lock of any kind", "It must immediately execute COMMIT", "It triggers cascading aborts"],
    correct_index: 1,
    marks: 8,
    negative_marks: 2,
    difficulty: "medium",
    topic: "Concurrency Control",
    explanation: "Under 2PL, a transaction cannot acquire any new locks once it begins releasing existing locks.",
    sort_order: 4
  }
];

const CS302_CODINGS = [
  {
    id: "cod-302-1",
    title: "SQL: Find the Department-Wise Second Highest Salary with Null Fallback",
    statement: "Write an SQL query to retrieve the second highest salary in each department. If a department has only one employee or all employees share the same salary, return NULL.",
    constraints: "Employee table has up to 10^5 rows. Multiple employees may have identical salaries.",
    input_format: "Employee (id INT, name VARCHAR, salary INT, department_id INT)",
    output_format: "Columns: department_id, second_highest_salary",
    sample_input: "1, Joe, 85000, 1\n2, Henry, 80000, 2\n3, Sam, 60000, 2\n4, Max, 90000, 1",
    sample_output: "1, 85000\n2, 60000",
    marks: 30,
    time_limit_ms: 2000,
    memory_limit_kb: 128000,
    languages: ["sql", "python"],
    starter_code: `-- Write your SQL query below\nSELECT department_id, salary\nFROM (\n    SELECT department_id, salary, DENSE_RANK() OVER (PARTITION BY department_id ORDER BY salary DESC) as rnk\n    FROM Employee\n) t\nWHERE rnk = 2;`,
    sort_order: 0,
    test_cases: [
      { input: "Dept 1: 90k, 85k. Dept 2: 80k, 60k", expected_output: "Dept 1: 85k, Dept 2: 60k", weight: 15, is_hidden: false, sort_order: 0 },
      { input: "Dept 3: 50k (single employee)", expected_output: "Dept 3: NULL", weight: 15, is_hidden: true, sort_order: 1 }
    ]
  },
  {
    id: "cod-302-2",
    title: "Transaction Concurrency: Detect Deadlock in Wait-For Graph",
    statement: "Given a list of transaction lock request edges T1 -> T2 (meaning T1 is waiting for lock held by T2), determine if a deadlock cycle exists and return the cycle path.",
    constraints: "1 <= NumTransactions <= 1000",
    input_format: "N transactions, followed by M wait-for directed edges.",
    output_format: "Return DEADLOCK or NO_DEADLOCK.",
    sample_input: "3 3\n1 2\n2 3\n3 1",
    sample_output: "DEADLOCK",
    marks: 30,
    time_limit_ms: 2000,
    memory_limit_kb: 128000,
    languages: ["python", "cpp", "java"],
    starter_code: `def check_deadlock(n, edges):\n    # TODO: Build directed wait-for graph and detect cycle\n    pass`,
    sort_order: 1,
    test_cases: [
      { input: "3 3\n1 2\n2 3\n3 1", expected_output: "DEADLOCK", weight: 15, is_hidden: false, sort_order: 0 },
      { input: "3 2\n1 2\n2 3", expected_output: "NO_DEADLOCK", weight: 15, is_hidden: false, sort_order: 1 }
    ]
  }
];

const CS405_MCQS = [
  {
    id: "mcq-405-1",
    question: "In React 18 / 19 Fiber architecture, what allows concurrent rendering without blocking the browser main thread?",
    options: ["Time-slicing and prioritized fiber work units", "Native Web Worker thread spawning", "Synchronous DOM reconciliation", "Service Worker caching"],
    correct_index: 0,
    marks: 8,
    negative_marks: 2,
    difficulty: "medium",
    topic: "React Architecture",
    explanation: "React Fiber breaks reconciliation into small incremental work units (time-slicing), yielding control to browser paint events.",
    sort_order: 0
  },
  {
    id: "mcq-405-2",
    question: "Which cookie flag prevents client-side JavaScript (e.g., document.cookie) from accessing authentication tokens, mitigating XSS token theft?",
    options: ["Secure", "HttpOnly", "SameSite=Strict", "Domain"],
    correct_index: 1,
    marks: 8,
    negative_marks: 2,
    difficulty: "easy",
    topic: "Web Security",
    explanation: "The HttpOnly directive ensures cookies are inaccessible via Document.cookie APIs, protecting them from XSS exfiltration.",
    sort_order: 1
  },
  {
    id: "mcq-405-3",
    question: "In Node.js event loop, which queue has highest priority and executes immediately following the current operation, before the next tick?",
    options: ["Check (setImmediate)", "Timers (setTimeout)", "process.nextTick and microtask queue (Promises)", "Poll (I/O)"],
    correct_index: 2,
    marks: 8,
    negative_marks: 2,
    difficulty: "hard",
    topic: "Node.js Event Loop",
    explanation: "process.nextTick queue is resolved immediately after the current phase completes, before any macrotask queues.",
    sort_order: 2
  },
  {
    id: "mcq-405-4",
    question: "What HTTP response header is sent by a server during a CORS preflight OPTIONS request to specify allowed HTTP methods?",
    options: ["Access-Control-Allow-Methods", "Access-Control-Allow-Origin", "Access-Control-Request-Headers", "Allow-Methods-List"],
    correct_index: 0,
    marks: 8,
    negative_marks: 2,
    difficulty: "easy",
    topic: "HTTP & REST",
    explanation: "Access-Control-Allow-Methods specifies the methods allowed when accessing the resource in response to a preflight request.",
    sort_order: 3
  },
  {
    id: "mcq-405-5",
    question: "Which of the following is a primary performance benefit of HTTP/2 over HTTP/1.1?",
    options: ["Elimination of SSL handshakes", "Multiplexing multiple bidirectional requests over a single TCP connection", "Automatic server-side SQL query caching", "Replacing JSON with XML schemas"],
    correct_index: 1,
    marks: 8,
    negative_marks: 2,
    difficulty: "medium",
    topic: "Web Protocols",
    explanation: "HTTP/2 introduces binary framing and multiplexing, allowing multiple concurrent requests over a single TCP socket.",
    sort_order: 4
  }
];

const CS405_CODINGS = [
  {
    id: "cod-405-1",
    title: "Implement Debounce Function with Immediate Execution Option",
    statement: "Implement a debounce(fn, wait, immediate) utility in JavaScript or Python that delays invoking fn until after wait milliseconds have elapsed since the last time it was invoked.",
    constraints: "Function must cancel trailing calls if called repeatedly within wait ms.",
    input_format: "fn callback, wait ms, immediate boolean",
    output_format: "Debounced function handle",
    sample_input: "wait: 200, calls at: [0ms, 50ms, 100ms]",
    sample_output: "1 invocation at 300ms",
    marks: 30,
    time_limit_ms: 2000,
    memory_limit_kb: 128000,
    languages: ["javascript", "typescript", "python"],
    starter_code: `function debounce(func, wait, immediate) {\n    let timeout;\n    return function(...args) {\n        // TODO: Implement debouncing\n    };\n}`,
    sort_order: 0,
    test_cases: [
      { input: "calls: 3 in 50ms, wait: 100ms", expected_output: "1 call executed", weight: 15, is_hidden: false, sort_order: 0 },
      { input: "immediate: true, first call", expected_output: "immediate call at 0ms", weight: 15, is_hidden: true, sort_order: 1 }
    ]
  },
  {
    id: "cod-405-2",
    title: "Async Middleware Pipeline (Express.js next() Pattern)",
    statement: "Build a middleware pipeline runner that registers async functions and invokes them sequentially using an asynchronous next() callback.",
    constraints: "Support error handling when next(err) is triggered.",
    input_format: "Array of middleware functions",
    output_format: "Final response output",
    sample_input: "mw1 -> mw2 -> mw3",
    sample_output: "Executed mw1, mw2, mw3",
    marks: 30,
    time_limit_ms: 2000,
    memory_limit_kb: 128000,
    languages: ["javascript", "python"],
    starter_code: `class MiddlewarePipeline {\n    constructor() {\n        this.middlewares = [];\n    }\n    use(fn) {\n        this.middlewares.push(fn);\n    }\n    execute(context) {\n        // TODO: Run sequential next() chain\n    }\n}`,
    sort_order: 1,
    test_cases: [
      { input: "3 chained middlewares", expected_output: "OK", weight: 15, is_hidden: false, sort_order: 0 },
      { input: "Error inside mw2", expected_output: "Caught Error in mw2", weight: 15, is_hidden: true, sort_order: 1 }
    ]
  }
];

export const INITIAL_EXAMS: ExamRecord[] = [
  {
    id: 101,
    title: "CS401: Advanced Data Structures & Algorithms End-Term",
    description: "Comprehensive evaluation of trees, dynamic programming, graph algorithms, and competitive coding complexity.",
    course_name: "Computer Science Engineering (CSE)",
    course_id: 1,
    duration: 90,
    start_date: "2026-09-10T09:00:00Z",
    end_date: "2026-09-25T18:00:00Z",
    total_marks: 100,
    mcq_marks: 40,
    coding_marks: 60,
    pass_percentage: 50,
    negative_marking: true,
    status: "Published",
    category: "Data Structures & Algorithms",
    mcq_count: 5,
    coding_count: 2,
    registered_students_count: 56,
    exam_type_id: 3,
    exam_setting_id: 1,
    assigned_type: "students",
    assigned_student_ids: ALL_STUDENT_IDS,
    mcqs: CS401_MCQS,
    mcq_questions: CS401_MCQS,
    codings: CS401_CODINGS,
    coding_questions: CS401_CODINGS
  },
  {
    id: 102,
    title: "CS302: Database Management Systems & SQL Proficiency",
    description: "Assessment on relational algebra, ACID properties, transaction concurrency, indexing, and complex SQL joins.",
    course_name: "Computer Science Engineering (CSE)",
    course_id: 1,
    duration: 60,
    start_date: "2026-09-01T10:00:00Z",
    end_date: "2026-09-15T17:00:00Z",
    total_marks: 100,
    mcq_marks: 40,
    coding_marks: 60,
    pass_percentage: 45,
    negative_marking: false,
    status: "Completed",
    category: "Database Systems",
    mcq_count: 5,
    coding_count: 2,
    registered_students_count: 56,
    exam_type_id: 3,
    exam_setting_id: 1,
    assigned_type: "students",
    assigned_student_ids: ALL_STUDENT_IDS,
    mcqs: CS302_MCQS,
    mcq_questions: CS302_MCQS,
    codings: CS302_CODINGS,
    coding_questions: CS302_CODINGS
  },
  {
    id: 103,
    title: "CS405: Full Stack Web Architecture & React/Node.js",
    description: "Evaluation on RESTful APIs, JWT state management, asynchronous event loops, SSR/CSR, and WebSocket communication.",
    course_name: "Computer Science Engineering (CSE)",
    course_id: 1,
    duration: 75,
    start_date: "2026-09-12T14:00:00Z",
    end_date: "2026-09-28T20:00:00Z",
    total_marks: 100,
    mcq_marks: 40,
    coding_marks: 60,
    pass_percentage: 50,
    negative_marking: true,
    status: "Published",
    category: "Web Technologies",
    mcq_count: 5,
    coding_count: 2,
    registered_students_count: 56,
    exam_type_id: 3,
    exam_setting_id: 1,
    assigned_type: "students",
    assigned_student_ids: ALL_STUDENT_IDS,
    mcqs: CS405_MCQS,
    mcq_questions: CS405_MCQS,
    codings: CS405_CODINGS,
    coding_questions: CS405_CODINGS
  },
  {
    id: 104,
    title: "CS408: Operating Systems & Systems Programming",
    description: "Process synchronization, semaphores, deadlock handling, virtual memory management, and POSIX thread coding.",
    course_name: "Computer Science Engineering (CSE)",
    course_id: 1,
    duration: 60,
    start_date: "2026-08-20T10:00:00Z",
    end_date: "2026-08-30T16:00:00Z",
    total_marks: 100,
    mcq_marks: 40,
    coding_marks: 60,
    pass_percentage: 40,
    negative_marking: false,
    status: "Completed",
    category: "Operating Systems",
    mcq_count: 5,
    coding_count: 2,
    registered_students_count: 56,
    exam_type_id: 3,
    exam_setting_id: 1,
    assigned_type: "students",
    assigned_student_ids: ALL_STUDENT_IDS,
    mcqs: CS401_MCQS,
    mcq_questions: CS401_MCQS,
    codings: CS401_CODINGS,
    coding_questions: CS401_CODINGS
  },
  {
    id: 105,
    title: "AI301: Machine Learning & Predictive Modeling Lab",
    description: "Supervised learning, gradient descent optimization, loss functions, CNN architecture, and Python ML pipelines.",
    course_name: "Computer Science Engineering (CSE)",
    course_id: 1,
    duration: 90,
    start_date: "2026-09-15T09:30:00Z",
    end_date: "2026-09-30T18:00:00Z",
    total_marks: 100,
    mcq_marks: 40,
    coding_marks: 60,
    pass_percentage: 50,
    negative_marking: true,
    status: "Published",
    category: "Artificial Intelligence",
    mcq_count: 5,
    coding_count: 2,
    registered_students_count: 56,
    exam_type_id: 3,
    exam_setting_id: 1,
    assigned_type: "students",
    assigned_student_ids: ALL_STUDENT_IDS,
    mcqs: CS401_MCQS,
    mcq_questions: CS401_MCQS,
    codings: CS401_CODINGS,
    coding_questions: CS401_CODINGS
  },
  {
    id: 106,
    title: "CS306: Computer Networks & Security Protocols",
    description: "TCP/IP sliding window protocols, subnet masking, DNS resolution, cryptographic hashes, and SSL handshake validation.",
    course_name: "Computer Science Engineering (CSE)",
    course_id: 1,
    duration: 60,
    start_date: "2026-10-05T10:00:00Z",
    end_date: "2026-10-15T18:00:00Z",
    total_marks: 100,
    mcq_marks: 40,
    coding_marks: 60,
    pass_percentage: 40,
    negative_marking: false,
    status: "Draft",
    category: "Networks & Security",
    mcq_count: 5,
    coding_count: 2,
    registered_students_count: 56,
    exam_type_id: 3,
    exam_setting_id: 1,
    assigned_type: "students",
    assigned_student_ids: ALL_STUDENT_IDS,
    mcqs: CS405_MCQS,
    mcq_questions: CS405_MCQS,
    codings: CS405_CODINGS,
    coding_questions: CS405_CODINGS
  }
];

// Sample questions & coding solutions for the detailed audit report
const SAMPLE_MCQ_BREAKDOWN = [
  {
    question_id: 1,
    question: "What is the amortized time complexity of inserting an element into a dynamic array (like std::vector or ArrayList)?",
    options: ["O(1)", "O(N)", "O(log N)", "O(N log N)"],
    selected_option: 0,
    correct_option: 0,
    is_correct: true,
    marks_obtained: 2,
    explanation: "Although resizing takes O(N), doubling capacity ensures that N insertions take roughly 2N operations, yielding O(1) amortized."
  },
  {
    question_id: 2,
    question: "Which data structure is fundamentally utilized in Tarjan's strongly connected components algorithm?",
    options: ["Queue", "Stack", "Priority Queue / Min-Heap", "Segment Tree"],
    selected_option: 1,
    correct_option: 1,
    is_correct: true,
    marks_obtained: 2,
    explanation: "Tarjan's algorithm uses a DFS recursion stack to track the exploration path and subtree components."
  },
  {
    question_id: 3,
    question: "What is the worst-case space complexity of Dijkstra's algorithm implemented with an Adjacency Matrix?",
    options: ["O(V + E)", "O(V^2)", "O(E log V)", "O(V log E)"],
    selected_option: 1,
    correct_option: 1,
    is_correct: true,
    marks_obtained: 2,
    explanation: "An adjacency matrix occupies a 2D array of dimension V x V, which is O(V^2) space."
  },
  {
    question_id: 4,
    question: "Which of the following problems cannot be solved in polynomial time by a deterministic Turing machine unless P = NP?",
    options: ["Minimum Spanning Tree (Kruskal)", "Shortest Path (Bellman-Ford)", "0/1 Knapsack Problem", "Matrix Multiplication (Strassen)"],
    selected_option: 2,
    correct_option: 2,
    is_correct: true,
    marks_obtained: 2,
    explanation: "0/1 Knapsack is an NP-complete problem solvable in pseudo-polynomial time via Dynamic Programming."
  },
  {
    question_id: 5,
    question: "In an AVL tree, what is the maximum permissible difference in height between left and right subtrees of any node?",
    options: ["0", "1", "2", "log(N)"],
    selected_option: 1,
    correct_option: 1,
    is_correct: true,
    marks_obtained: 2,
    explanation: "The AVL balance factor must be in {-1, 0, +1}, meaning height difference cannot exceed 1."
  }
];

const SAMPLE_CODING_BREAKDOWN = [
  {
    question_id: 101,
    title: "Find Longest Increasing Subsequence with Indices",
    statement: "Given an integer array nums, return the length of the longest strictly increasing subsequence and print one valid sequence of indices in O(N log N) time.",
    language: "cpp",
    code: `#include <bits/stdc++.h>
using namespace std;

vector<int> longestIncreasingSubsequence(vector<int>& nums) {
    if (nums.empty()) return {};
    int n = nums.size();
    vector<int> tails, tail_indices, parent(n, -1);
    
    for (int i = 0; i < n; ++i) {
        auto it = lower_bound(tails.begin(), tails.end(), nums[i]);
        int idx = distance(tails.begin(), it);
        if (it == tails.end()) {
            tails.push_back(nums[i]);
            tail_indices.push_back(i);
        } else {
            *it = nums[i];
            tail_indices[idx] = i;
        }
        if (idx > 0) parent[i] = tail_indices[idx - 1];
    }
    
    vector<int> result;
    int curr = tail_indices.back();
    while (curr != -1) {
        result.push_back(nums[curr]);
        curr = parent[curr];
    }
    reverse(result.begin(), result.end());
    return result;
}`,
    score: 30,
    max_marks: 30,
    test_cases_passed: 5,
    total_test_cases: 5,
    execution_time_ms: 42,
    memory_kb: 4820,
    status: "Accepted" as const
  },
  {
    question_id: 102,
    title: "Graph Cycle Detection and TopoSort in Directed Acyclic Graph",
    statement: "Detect if a directed graph contains a cycle using Kahn's algorithm or DFS 3-color coloring. If acyclic, output topological ordering.",
    language: "java",
    code: `import java.util.*;

public class Solution {
    public static List<Integer> topoSort(int v, List<List<Integer>> adj) {
        int[] inDegree = new int[v];
        for (int i = 0; i < v; i++) {
            for (int neighbor : adj.get(i)) inDegree[neighbor]++;
        }
        Queue<Integer> q = new LinkedList<>();
        for (int i = 0; i < v; i++) {
            if (inDegree[i] == 0) q.add(i);
        }
        List<Integer> order = new ArrayList<>();
        while (!q.isEmpty()) {
            int u = q.poll();
            order.add(u);
            for (int neighbor : adj.get(u)) {
                if (--inDegree[neighbor] == 0) q.add(neighbor);
            }
        }
        return order.size() == v ? order : Collections.emptyList();
    }
}`,
    score: 28,
    max_marks: 30,
    test_cases_passed: 4,
    total_test_cases: 5,
    execution_time_ms: 88,
    memory_kb: 9240,
    status: "Partially Accepted" as const
  }
];

// Generate deterministic, realistic attempt records for all 56 students on flagship exam CS401
export const generateInitialAttempts = (): AttemptRecord[] => {
  const flagshipExam = INITIAL_EXAMS[0]; // CS401
  const attempts: AttemptRecord[] = [];

  INITIAL_STUDENTS.forEach((student, index) => {
    // Determine status:
    // Students 48-55 (8 students) are currently "in_progress" (live active test concurrency!)
    // Students 17, 34, 42, 51 (4 students) are "reassigned" (retake granted)
    // All other 44 students are "completed"
    let status: "completed" | "reassigned" | "in_progress" = "completed";
    let is_concurrent_active = false;
    let submitted_at: string | null = "2026-09-14T11:45:22Z";

    if (index >= 48) {
      status = "in_progress";
      is_concurrent_active = true;
      submitted_at = null;
    } else if (index === 17 || index === 34 || index === 41 || index === 47) {
      status = "reassigned";
      submitted_at = "2026-09-12T14:10:00Z";
    }

    // Realistic score generation based on CGPA and student index
    let totalScore = 0;
    let mcqScore = 0;
    let codingScore = 0;
    let integrity = 95;
    let tabSwitches = 0;
    let faceViolations = 0;
    let audioViolations = 0;
    let attemptMinutes = 45;

    if (status === "in_progress") {
      mcqScore = Math.round(18 + (index % 12));
      codingScore = Math.round(15 + (index % 20));
      totalScore = mcqScore + codingScore;
      integrity = index % 3 === 0 ? 84 : 98;
      tabSwitches = index % 3 === 0 ? 2 : 0;
      attemptMinutes = 35 + (index % 25);
    } else if (index === 0) {
      // Rank 1
      mcqScore = 39.5;
      codingScore = 59.0;
      totalScore = 98.5;
      integrity = 99;
      tabSwitches = 0;
      attemptMinutes = 62;
    } else if (index === 1) {
      // Rank 2
      mcqScore = 38.0;
      codingScore = 58.0;
      totalScore = 96.0;
      integrity = 100;
      tabSwitches = 0;
      attemptMinutes = 58;
    } else if (index === 41) {
      // Lowest score / Failed
      mcqScore = 14.0;
      codingScore = 14.0;
      totalScore = 28.0;
      integrity = 62;
      tabSwitches = 4;
      faceViolations = 2;
      attemptMinutes = 41;
    } else {
      const factor = (student.cgpa - 6.0) / 4.0; // 0.1 to 0.95
      mcqScore = Number((18 + factor * 21 + (index % 5) - 2).toFixed(1));
      mcqScore = Math.max(12, Math.min(40, mcqScore));

      codingScore = Number((22 + factor * 36 + ((index * 3) % 7) - 3).toFixed(1));
      codingScore = Math.max(10, Math.min(60, codingScore));

      totalScore = Number((mcqScore + codingScore).toFixed(1));

      if (index === 7 || index === 19 || index === 28 || index === 39 || index === 45) {
        integrity = Math.round(58 + (index % 15));
        tabSwitches = 3 + (index % 3);
        faceViolations = 1 + (index % 2);
        audioViolations = index % 2;
      } else {
        integrity = Math.round(88 + ((index * 4) % 12));
        tabSwitches = index % 2;
      }

      attemptMinutes = Math.round(42 + ((index * 13) % 45));
    }

    const proctor_events: Array<{ timestamp: string; event: string; type: "warning" | "violation" | "info"; details: string }> = [
      { timestamp: "10:00:15", event: "Assessment session initiated & full screen locked", type: "info", details: "Client agent verified. WebRTC stream connected." }
    ];
    if (tabSwitches > 0) {
      proctor_events.push({
        timestamp: `10:${15 + tabSwitches * 3}:00`,
        event: `Browser focus lost / Tab switch detected (${tabSwitches} occurrence${tabSwitches > 1 ? "s" : ""})`,
        type: "warning" as const,
        details: "User navigated away from active assessment viewport."
      });
    }
    if (faceViolations > 0) {
      proctor_events.push({
        timestamp: "10:32:45",
        event: "Proctor Vision: Multiple faces / Face missing alert",
        type: "violation" as const,
        details: "Secondary subject detected in camera bounding box."
      });
    }
    if (status === "completed") {
      proctor_events.push({
        timestamp: `10:${attemptMinutes}:12`,
        event: "Assessment submission finalized",
        type: "info" as const,
        details: "All test cases compiled and final score calculated."
      });
    }

    attempts.push({
      id: 2000 + index + 1,
      student_id: student.id,
      student: {
        id: student.id,
        full_name: student.full_name,
        roll_number: student.roll_number,
        department: student.department,
        email: student.email,
        phone: student.phone,
        batch: student.batch,
        section: student.section,
        cgpa: student.cgpa
      },
      exam_id: flagshipExam.id,
      exam_title: flagshipExam.title,
      exam: {
        id: flagshipExam.id,
        title: flagshipExam.title,
        total_marks: flagshipExam.total_marks,
        mcq_marks: flagshipExam.mcq_marks,
        coding_marks: flagshipExam.coding_marks,
        passing_pct: flagshipExam.pass_percentage,
        duration: flagshipExam.duration,
        category: flagshipExam.category
      },
      total_score: totalScore,
      mcq_score: mcqScore,
      coding_score: codingScore,
      status,
      integrity_score: integrity,
      tab_switches: tabSwitches,
      face_violations: faceViolations,
      audio_violations: audioViolations,
      attempt_time_minutes: attemptMinutes,
      submitted_at: status === "completed" || status === "reassigned" 
        ? new Date(Date.now() - (56 - index) * 3600 * 1000).toISOString()
        : null,
      started_at: new Date(Date.now() - (attemptMinutes + 10) * 60 * 1000).toISOString(),
      is_concurrent_active,
      ip_address: `192.168.10.${100 + (index % 50)}`,
      reassign_reason: status === "reassigned" ? "Reassigned by HOD: Candidate experienced network interruption during coding test." : undefined,
      reassigned_at: status === "reassigned" ? new Date(Date.now() - 12 * 3600 * 1000).toISOString() : undefined,
      answers: {
        mcq_answers: SAMPLE_MCQ_BREAKDOWN,
        coding_submissions: SAMPLE_CODING_BREAKDOWN,
        proctor_events
      }
    });
  });

  // 14 attempts on DBMS for cross-exam depth
  for (let i = 0; i < 14; i++) {
    const student = INITIAL_STUDENTS[i];
    const exam = INITIAL_EXAMS[1]; // DBMS
    const mcqScore = 48 + (i % 10);
    const codingScore = 32 + (i % 8);
    attempts.push({
      id: 3000 + i + 1,
      student_id: student.id,
      student: {
        id: student.id,
        full_name: student.full_name,
        roll_number: student.roll_number,
        department: student.department,
        email: student.email,
        phone: student.phone,
        batch: student.batch,
        section: student.section,
        cgpa: student.cgpa
      },
      exam_id: exam.id,
      exam_title: exam.title,
      exam: {
        id: exam.id,
        title: exam.title,
        total_marks: exam.total_marks,
        mcq_marks: exam.mcq_marks,
        coding_marks: exam.coding_marks,
        passing_pct: exam.pass_percentage,
        duration: exam.duration,
        category: exam.category
      },
      total_score: mcqScore + codingScore,
      mcq_score: mcqScore,
      coding_score: codingScore,
      status: "completed",
      integrity_score: 94 + (i % 6),
      tab_switches: i % 2,
      face_violations: 0,
      audio_violations: 0,
      attempt_time_minutes: 52,
      submitted_at: new Date(Date.now() - (70 - i) * 3600 * 1000).toISOString(),
      started_at: new Date(Date.now() - (71 - i) * 3600 * 1000).toISOString(),
      is_concurrent_active: false,
      ip_address: `192.168.10.${150 + i}`,
      answers: {
        mcq_answers: SAMPLE_MCQ_BREAKDOWN,
        coding_submissions: SAMPLE_CODING_BREAKDOWN,
        proctor_events: [
          { timestamp: "14:00:00", event: "DBMS Assessment started", type: "info", details: "Proctor active" },
          { timestamp: "14:52:00", event: "DBMS Assessment completed", type: "info", details: "All queries passed" }
        ]
      }
    });
  }

  return attempts;
};

export const INITIAL_HOD_PROFILE: HODProfileData = {
  id: 301,
  full_name: "Dr. Rajesh Varma",
  first_name: "Rajesh",
  last_name: "Varma",
  email: "hod.cse@college.edu",
  phone: "+91 98450 12345",
  designation: "Head of Department & Professor",
  department: "Computer Science & Engineering",
  college_name: "Sri Venkateswara College of Engineering",
  college_code: "SVCE1234",
  employee_id: "EMP-HOD-042",
  office_location: "Block B, Room 304, Department of CSE",
  experience_years: 18,
  qualifications: "Ph.D. in Computer Science (IISc Bangalore), M.Tech (IIT Bombay), B.Tech (IIT Madras)",
  research_areas: "Distributed Systems, Algorithmic Game Theory, Cloud & Edge Security, Machine Learning Acceleration",
  gender: "Male",
  dob: "1978-05-14",
  address: "Faculty Quarters #12, SVCE Campus, Tirupati, Andhra Pradesh - 517507",
  joining_date: "2012-08-01",
  name: "Dr. Rajesh Varma",
  role: "Head of Department (HOD)",
  bio: "Dr. Rajesh Varma serves as the Professor and Head of the Computer Science & Engineering department. He leads academic curriculum development, automated coding assessments, research grants, and student innovation labs."
};

const STORAGE_KEYS = {
  STUDENTS: "dq_hod_mock_students",
  EXAMS: "dq_hod_mock_exams",
  ATTEMPTS: "dq_hod_mock_attempts",
  PROFILE: "dq_hod_mock_profile"
};

class MockHODStore {
  private isBrowser(): boolean {
    return typeof window !== "undefined";
  }

  getStudents(): StudentRecord[] {
    if (!this.isBrowser()) return INITIAL_STUDENTS;
    try {
      const cached = localStorage.getItem(STORAGE_KEYS.STUDENTS);
      if (cached) return JSON.parse(cached);
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
    } catch {
      // ignore
    }
    return INITIAL_STUDENTS;
  }

  getStudentById(id: number | string): StudentRecord | null {
    const students = this.getStudents();
    return students.find(s => String(s.id) === String(id) || s.user_id === String(id) || s.roll_number === String(id)) || null;
  }

  getCourses(): CourseRecord[] {
    return INITIAL_COURSES;
  }

  getExams(search: string = ""): ExamRecord[] {
    let exams = INITIAL_EXAMS;
    if (this.isBrowser()) {
      try {
        const cached = localStorage.getItem(STORAGE_KEYS.EXAMS);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].mcqs && parsed[0].mcqs.length > 0) {
            exams = parsed;
          } else {
            exams = INITIAL_EXAMS;
            localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(INITIAL_EXAMS));
          }
        } else {
          localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(INITIAL_EXAMS));
        }
      } catch {
        // ignore
      }
    }

    if (!search.trim()) return exams;
    const q = search.toLowerCase();
    return exams.filter(e => e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q) || e.category.toLowerCase().includes(q));
  }

  getExamById(id: number | string): ExamRecord | null {
    const exams = this.getExams();
    const found = exams.find(e => String(e.id) === String(id));
    if (found) return found;
    return exams[0] || null;
  }

  createExam(payload: any): ExamRecord {
    const exams = this.getExams();
    const newId = Math.max(...exams.map(e => e.id), 100) + 1;
    const newExam: ExamRecord = {
      id: newId,
      title: payload.title || "Untitled Assessment",
      description: payload.description || "",
      course_name: payload.course_name || "Computer Science Engineering (CSE)",
      course_id: payload.course_id || 1,
      duration: Number(payload.duration) || 60,
      start_date: payload.start_date || new Date().toISOString(),
      end_date: payload.end_date || new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
      total_marks: Number(payload.total_marks) || 100,
      mcq_marks: Number(payload.mcq_marks) || 40,
      coding_marks: Number(payload.coding_marks) || 60,
      pass_percentage: Number(payload.pass_percentage) || 40,
      negative_marking: Boolean(payload.negative_marking),
      status: "Published",
      category: payload.category || "General",
      mcq_count: payload.mcqs?.length || 10,
      coding_count: payload.coding_questions?.length || 2,
      registered_students_count: this.getStudents().length
    };
    const updated = [newExam, ...exams];
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(updated));
    }
    return newExam;
  }

  updateExam(id: number | string, payload: any): ExamRecord | null {
    const exams = this.getExams();
    const idx = exams.findIndex(e => String(e.id) === String(id));
    if (idx === -1) return null;
    const updatedExam = { ...exams[idx], ...payload };
    exams[idx] = updatedExam;
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(exams));
    }
    return updatedExam;
  }

  deleteExam(id: number | string): boolean {
    const exams = this.getExams();
    const filtered = exams.filter(e => String(e.id) !== String(id));
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(filtered));
    }
    return true;
  }

  getAttempts(): AttemptRecord[] {
    if (!this.isBrowser()) return generateInitialAttempts();
    try {
      const cached = localStorage.getItem(STORAGE_KEYS.ATTEMPTS);
      if (cached) return JSON.parse(cached);
      const initial = generateInitialAttempts();
      localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(initial));
      return initial;
    } catch {
      return generateInitialAttempts();
    }
  }

  getAttemptById(id: number | string): AttemptRecord | null {
    const attempts = this.getAttempts();
    return attempts.find(a => String(a.id) === String(id)) || null;
  }

  reassignAttempt(attemptId: number | string, reason: string): boolean {
    const attempts = this.getAttempts();
    const idx = attempts.findIndex(a => String(a.id) === String(attemptId));
    if (idx === -1) return false;

    attempts[idx] = {
      ...attempts[idx],
      status: "reassigned",
      reassign_reason: reason || "Reassigned by HOD for re-evaluation/retake.",
      reassigned_at: new Date().toISOString()
    };

    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(attempts));
    }
    return true;
  }

  getProfile(): HODProfileData {
    if (!this.isBrowser()) return INITIAL_HOD_PROFILE;
    try {
      const cached = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (cached) return JSON.parse(cached);
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(INITIAL_HOD_PROFILE));
    } catch {
      // ignore
    }
    return INITIAL_HOD_PROFILE;
  }

  updateProfile(payload: Partial<HODProfileData>): HODProfileData {
    const current = this.getProfile();
    const updated = { ...current, ...payload };
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(updated));
    }
    return updated;
  }

  getDashboardStats() {
    const students = this.getStudents();
    const exams = this.getExams();
    const attempts = this.getAttempts();

    const totalStudents = students.length;
    const totalExams = exams.length;
    const completedExams = exams.filter(e => e.status === "Completed").length;
    const upcomingExams = exams.filter(e => e.status === "Published" || e.status === "Ongoing").length;

    const completedAttempts = attempts.filter(a => a.status === "completed");
    const reassignedAttempts = attempts.filter(a => a.status === "reassigned");
    const inProgressAttempts = attempts.filter(a => a.status === "in_progress");

    let totalScoreSum = 0;
    let highestScore = 0;
    let lowestScore = 100;
    let passedCount = 0;
    let totalIntegritySum = 0;
    let totalAttemptTimeSum = 0;

    completedAttempts.forEach(a => {
      const totalMarks = a.exam?.total_marks || 100;
      const score = Number(a.total_score || 0);
      const scorePct = totalMarks > 0 ? (score / totalMarks) * 100 : score;

      totalScoreSum += scorePct;
      if (score > highestScore) highestScore = score;
      if (score < lowestScore) lowestScore = score;

      const passingPct = a.exam?.passing_pct || 40;
      if (scorePct >= passingPct) passedCount++;

      totalIntegritySum += Number(a.integrity_score || 100);
      totalAttemptTimeSum += Number(a.attempt_time_minutes || 0);
    });

    if (completedAttempts.length === 0) {
      lowestScore = 0;
    }

    const averageScore = completedAttempts.length > 0 
      ? Number((totalScoreSum / completedAttempts.length).toFixed(1)) 
      : 0.0;

    const passPercentage = completedAttempts.length > 0
      ? Number(((passedCount / completedAttempts.length) * 100).toFixed(1))
      : 0;

    const failPercentage = Number((100 - passPercentage).toFixed(1));

    const integrityScore = completedAttempts.length > 0
      ? Math.round(totalIntegritySum / completedAttempts.length)
      : 100;

    const avgAttemptTimeMinutes = completedAttempts.length > 0
      ? Math.round(totalAttemptTimeSum / completedAttempts.length)
      : 0;

    const reattemptRate = attempts.length > 0
      ? Number(((reassignedAttempts.length / attempts.length) * 100).toFixed(1))
      : 0;

    const activeConcurrentStudents = inProgressAttempts.length;
    const peakConcurrency = 48;

    return {
      totalStudents,
      totalExams,
      completedExams,
      upcomingExams,
      averageScore: averageScore.toString(),
      integrityScore,
      passPercentage,
      failPercentage,
      highestScore: highestScore.toFixed(1),
      lowestScore: lowestScore.toFixed(1),
      avgAttemptTimeMinutes,
      reattemptRate,
      activeConcurrentStudents,
      peakConcurrency,
      totalAttempts: attempts.length,
      completedAttemptsCount: completedAttempts.length,
      inProgressCount: inProgressAttempts.length,
      reassignedCount: reassignedAttempts.length
    };
  }

  getAnalyticsData(department?: string) {
    const stats = this.getDashboardStats();
    const attempts = this.getAttempts();
    const exams = this.getExams();

    const flaggedAttempts = attempts.filter(a => (a.integrity_score || 100) < 70 || (a.tab_switches || 0) >= 3);

    const examPerformance = exams.map(exam => {
      const examAttempts = attempts.filter(a => a.exam_id === exam.id);
      const completed = examAttempts.filter(a => a.status === "completed");
      let sumScore = 0;
      let passed = 0;
      let high = 0;
      let low = 100;
      let intSum = 0;

      completed.forEach(a => {
        sumScore += a.total_score;
        if (a.total_score > high) high = a.total_score;
        if (a.total_score < low) low = a.total_score;
        const pct = (a.total_score / (exam.total_marks || 100)) * 100;
        if (pct >= exam.pass_percentage) passed++;
        intSum += a.integrity_score || 100;
      });

      if (completed.length === 0) low = 0;

      return {
        exam_id: exam.id,
        title: exam.title,
        type: exam.category || "General",
        category: exam.category,
        totalAttempts: examAttempts.length,
        completedAttempts: completed.length,
        avgScore: completed.length > 0 ? Math.round(sumScore / completed.length) : 0,
        passRate: completed.length > 0 ? Math.round((passed / completed.length) * 100) : 0,
        passingRate: completed.length > 0 ? Math.round((passed / completed.length) * 100) : 0,
        highestScore: high,
        lowestScore: low,
        avgIntegrity: completed.length > 0 ? Math.round(intSum / completed.length) : 100,
        registeredStudents: exam.registered_students_count,
        activeConcurrent: examAttempts.filter(a => a.status === "in_progress").length
      };
    });

    const activityLogs = [
      {
        id: "log-1",
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        type: "proctor_alert",
        message: "Proctor Warning: Manish Tiwari (21CS042) triggered 4th tab switch violation.",
        studentName: "Manish Tiwari",
        student_name: "Manish Tiwari",
        rollNumber: "21CS042",
        department: "CSE",
        examTitle: "CS401: Advanced Data Structures",
        exam_title: "CS401: Advanced Data Structures",
        tabSwitches: 4,
        integrityScore: 62,
        proctorStatus: "Flagged"
      },
      {
        id: "log-2",
        timestamp: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
        type: "submission",
        message: "Exam Submitted: Aarav Sharma (21CS001) completed evaluation with 98.5/100.",
        studentName: "Aarav Sharma",
        student_name: "Aarav Sharma",
        rollNumber: "21CS001",
        department: "CSE",
        examTitle: "CS401: Advanced Data Structures",
        exam_title: "CS401: Advanced Data Structures",
        tabSwitches: 0,
        integrityScore: 99,
        proctorStatus: "Verified"
      },
      {
        id: "log-3",
        timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
        type: "concurrency_peak",
        message: "Concurrency Alert: Peak active examinees reached 48 concurrent test sessions.",
        studentName: "Sneha Kulkarni",
        student_name: "Sneha Kulkarni",
        rollNumber: "21CS008",
        department: "CSE",
        examTitle: "CS401: Advanced Data Structures",
        exam_title: "CS401: Advanced Data Structures",
        tabSwitches: 3,
        integrityScore: 68,
        proctorStatus: "Warning"
      },
      {
        id: "log-4",
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        type: "reassign",
        message: "Retake Approved: HOD authorized attempt reset for Priya Nair (21CS004).",
        studentName: "Priya Nair",
        student_name: "Priya Nair",
        rollNumber: "21CS004",
        department: "CSE",
        examTitle: "CS401: Advanced Data Structures",
        exam_title: "CS401: Advanced Data Structures",
        tabSwitches: 1,
        integrityScore: 91,
        proctorStatus: "Verified"
      },
      {
        id: "log-5",
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        type: "proctor_alert",
        message: "Integrity Flag: Multiple human voices detected in candidate microphone feed.",
        studentName: "Karan Choudhury",
        student_name: "Karan Choudhury",
        rollNumber: "21CS020",
        department: "CSE",
        examTitle: "CS401: Advanced Data Structures",
        exam_title: "CS401: Advanced Data Structures",
        tabSwitches: 3,
        integrityScore: 65,
        proctorStatus: "Flagged"
      }
    ];

    return {
      summary: {
        totalAttempts: stats.totalAttempts,
        completedAttempts: stats.completedAttemptsCount,
        avgScore: Number(stats.averageScore),
        passingRate: stats.passPercentage,
        flaggedCount: flaggedAttempts.length,
        avgIntegrity: stats.integrityScore,
        activeConcurrent: stats.activeConcurrentStudents,
        peakConcurrency: stats.peakConcurrency
      },
      examPerformance,
      attempts,
      activityLogs
    };
  }
}

export const mockHodStore = new MockHODStore();
