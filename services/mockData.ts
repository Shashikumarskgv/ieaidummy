export interface MockQuestion {
  question: string;
  difficulty: "Easy" | "Medium" | "Hard";
  topic: string;
  shortAnswer: string;
}

export const MOCK_HR_QUESTIONS: MockQuestion[] = [
  {
    question: "Tell me about yourself.",
    difficulty: "Easy",
    topic: "HR / Behavioral",
    shortAnswer: "Start with a brief overview of your current role/studies, highlight key achievements, mention core tech skills, and conclude with why you are interested in this specific opportunity."
  },
  {
    question: "Why do you want to join our company?",
    difficulty: "Easy",
    topic: "HR / Behavioral",
    shortAnswer: "Align your answer with the company's culture, mission, and technology stack. Reference recent news or projects of theirs that excite you and explain how your skillset matches their goals."
  },
  {
    question: "Describe a challenge you faced and how you overcame it.",
    difficulty: "Medium",
    topic: "Problem Solving",
    shortAnswer: "Use the STAR method (Situation, Task, Action, Result). Focus on a technical blocker, your methodical debugging process, collaboration, and the positive outcome/learnings."
  },
  {
    question: "Where do you see yourself in 5 years?",
    difficulty: "Easy",
    topic: "HR / Behavioral",
    shortAnswer: "Express a desire to grow technically, take on leadership responsibilities, and contribute deeply to system design and product architecture."
  }
];

export const MOCK_WEAK_QUESTIONS: MockQuestion[] = [
  {
    question: "Explain the difference between synchronous and asynchronous execution in Node.js.",
    difficulty: "Medium",
    topic: "Node.js Fundamentals",
    shortAnswer: "Synchronous operations block the event loop, stopping execution until complete. Asynchronous operations run concurrently using callbacks, promises, or async/await without blocking main execution."
  },
  {
    question: "What is a memory leak and how do you trace it in a JavaScript environment?",
    difficulty: "Hard",
    topic: "Performance Tuning",
    shortAnswer: "A memory leak occurs when allocated memory is no longer needed but not released. Trace using Chrome DevTools heap snapshots, comparing snapshots to locate growing objects or uncollected closures."
  },
  {
    question: "Explain prototypical inheritance in JavaScript.",
    difficulty: "Medium",
    topic: "JavaScript Core",
    shortAnswer: "Every JavaScript object has a prototype property that links it to another object. If a property or method is not found on the instance, JavaScript traverses up the prototype chain until it finds it or hits null."
  }
];

export const MOCK_PROJECT_QUESTIONS: MockQuestion[] = [
  {
    question: "How did you manage application state in your main web application project?",
    difficulty: "Medium",
    topic: "Architecture",
    shortAnswer: "Detailed state management breakdown: explain context APIs, Redux Toolkit slices, local states, server-state caching (e.g. React Query), and performance considerations."
  },
  {
    question: "Explain the database schema design of your e-commerce/chat project.",
    difficulty: "Hard",
    topic: "Database Design",
    shortAnswer: "Detail table structures, foreign key relationships, indexing strategies on critical search/user fields, and how you optimized query lookups using database view constructs."
  },
  {
    question: "How did you implement secure user authentication in your application?",
    difficulty: "Hard",
    topic: "Security",
    shortAnswer: "Detail token verification (JWT, access/refresh tokens stored in HttpOnly cookies), password hashing using bcrypt, and role-based route guard checks."
  }
];

export const MOCK_COURSE_QUESTIONS: MockQuestion[] = [
  {
    question: "What are the SOLID design principles?",
    difficulty: "Medium",
    topic: "Software Design",
    shortAnswer: "Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, and Dependency Inversion. They enable maintainable, loosely coupled, and testable object-oriented architectures."
  },
  {
    question: "Explain time and space complexity of QuickSort.",
    difficulty: "Medium",
    topic: "Data Structures & Algorithms",
    shortAnswer: "Average time complexity is O(N log N) using partition swaps. Worst-case is O(N^2) if pivot selection is skewed. Space complexity is O(log N) due to recursive stack calls."
  },
  {
    question: "What is database normalization and explain 1NF, 2NF, 3NF.",
    difficulty: "Medium",
    topic: "Databases",
    shortAnswer: "Normalization reduces data redundancy. 1NF: Atomic values, unique records. 2NF: Meets 1NF, removes partial dependencies. 3NF: Meets 2NF, removes transitive dependencies."
  }
];
