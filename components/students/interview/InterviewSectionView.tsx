import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, FlaskConical, CheckCheck, Loader2, Lock, ChevronRight, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import InterviewService from "@/services/interview.service";

type SectionKey = "course" | "project" | "weak" | "hr" | "role";

const TITLES: Record<SectionKey, string> = {
  course: "Course Questions",
  project: "Project Based Questions",
  weak: "Weak Area Questions",
  hr: "HR Questions",
  role: "Role Based Questions",
};

const TESTABLE: Record<SectionKey, boolean> = { course: true, project: true, weak: true, hr: true, role: true };

const TARGET_ROLES = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Java Developer",
  "Python Developer",
  "React Developer",
  "Data Analyst",
  "Data Scientist",
  "AI Engineer",
  "DevOps Engineer"
];

export const generateQuestionsForRole = (role: string) => {
  const topics = ["Fundamentals", "Advanced Concepts", "System Design", "Best Practices", "Security & Scaling"];
  const difficulties = ["Easy", "Medium", "Hard"];
  
  return Array.from({ length: 50 }, (_, i) => {
    let questionText = "";
    let shortAnswerText = "";
    
    if (role === "Frontend Developer" || role === "React Developer") {
      questionText = [
        "What is semantic HTML and why is it important for SEO and screen readers?",
        "Explain the CSS Box Model components (content, padding, border, margin).",
        "What is the difference between local storage, session storage, and cookies?",
        "Explain JavaScript closures with a basic code example.",
        "What is the Virtual DOM and how does React use it to optimize rendering?",
        "What is the difference between state and props in React components?",
        "Explain React Hook rules and why hooks cannot be nested in conditional statements.",
        "How does the browser parse HTML and CSS to render pages?",
        "What is the difference between client-side rendering (CSR) and server-side rendering (SSR)?",
        "Explain CSS Flexbox vs CSS Grid. When do you choose each?",
        "What is the purpose of useEffect cleanup functions in React?",
        "How do you fetch data from a REST API in React using fetch or Axios?",
        "Explain React Fiber reconciliation trees and how async rendering updates layout nodes.",
        "How do you trace, profile, and fix memory leaks in large-scale React applications?",
        "Explain the JavaScript Event Loop, microtasks, and macrotasks scheduling mechanics.",
        "How do you implement secure JWT token storage using HTTPOnly cookies to prevent XSS/CSRF?",
        "How does tree shaking optimize production bundle chunks splits during Vite/Webpack compilation?",
        "What is hydration mismatch? How do you diagnose and fix it in SSR/Next.js frameworks?",
        "Explain React.memo, useMemo, and useCallback. Contrast performance gains with heap overheads.",
        "Explain CORS preflight requests. How do you configure backend headers to resolve origin blocks?",
        "What are service workers? How do you implement background caching strategies for PWAs?",
        "How do you monitor and optimize Web Vitals metrics: LCP, FID, CLS, and INP?",
        "Explain CSS Specificity collision resolution and CSS nesting scoping models.",
        "What is React Context performance bottleneck? How do you prevent unnecessary context re-renders?",
        "How do you design a custom state sync manager using custom React hook parameters?"
      ][i % 25] || `${role} advanced question: Detail browser runtime optimization parameters for ${role} applications.`;
      
      shortAnswerText = `Outline: Focus on JS event loops, React reconcilers, layout paints, DOM nodes, or security constraints.`;
    } else if (role === "Backend Developer" || role === "Java Developer" || role === "Python Developer") {
      questionText = [
        "Explain middleware pipelines and how execution passes through the router.",
        "What is a database index? How does it improve read query speed?",
        "Explain REST API method constraints: GET, POST, PUT, DELETE, PATCH.",
        "What is database normalization? Explain 1NF, 2NF, and 3NF database design guidelines.",
        "How do you prevent SQL injection vulnerabilities using parameterized queries?",
        "What are JSON Web Tokens (JWT)? Detail the header, payload, and signature blocks.",
        "Explain CRUD operations and how they coordinate with HTTP status codes.",
        "What is connection pooling in database clients? Why is it important?",
        "What is the difference between SQL (relational) and NoSQL (document) databases?",
        "How do you orchestrate secure file storage uploads using cloud object storage (e.g. AWS S3)?",
        "What is CORS and how do you configure it in a backend routing handler?",
        "What is a deadlock in concurrent operations? How do database schedulers resolve them?",
        "Explain event-driven non-blocking I/O loops and thread pool allocations.",
        "How do B-Tree and Hash indexes work internally inside database engines?",
        "How do you design a high-availability cache clustering and invalidation policy?",
        "Explain message queue brokers (RabbitMQ/Kafka) pub-sub architectures in microservices.",
        "How do you evaluate and optimize slow queries using database EXPLAIN execution logs?",
        "Detail vertical vs horizontal database sharding patterns. How do you handle transaction joins?",
        "Explain WebSockets vs Server-Sent Events (SSE). Contrast TCP connection heap limits.",
        "How do you design secure OAuth2 social login flows with access/refresh token rotation?",
        "What is microservices containerization? How do you write secure, multi-stage Dockerfiles?",
        "Explain serverless function scaling metrics and cold start optimizations.",
        "How do you build database replication sets to handle read/write splitting configurations?",
        "How do you implement API rate limiters using token bucket algorithms?",
        "Detail ACID transaction isolation levels: Read Uncommitted, Read Committed, Repeatable Read, Serializable."
      ][i % 25] || `${role} advanced question: Detail thread pools allocations and transactional constraints for ${role} applications.`;
      
      shortAnswerText = `Outline: Focus on async worker threads, caching rules, transactional isolation, or microservices topologies.`;
    } else {
      const generalPrompts = [
        `Explain the core lifecycle and architectural design patterns for a ${role}.`,
        `How do you profile performance bottlenecks in ${role} workloads?`,
        `Explain the security threat vectors and mitigations typical for a ${role} system.`,
        `What are the standard unit testing and mocking setups you use in ${role} development?`,
        `How do you design a scalable database schema or data pipeline for a ${role} application?`,
        `Explain how asynchronous processing or threading is handled in ${role} implementations.`,
        `How do you monitor logs, alerts, and runtime exceptions for ${role} services?`,
        `What is the difference between synchronous execution and asynchronous event handlers in ${role}?`,
        `How do you manage version control, migration scripts, and deployment pipelines as a ${role}?`,
        `Explain cache invalidation, key management, and data consistency models in ${role} setups.`
      ];
      questionText = `${role} Question #${i + 1}: ${generalPrompts[i % generalPrompts.length]}`;
      shortAnswerText = `Outline: Explain core configurations, data flows, thread layouts, or scaling criteria for a ${role}.`;
    }

    return {
      id: i + 1,
      question: questionText,
      difficulty: difficulties[i % 3],
      topic: topics[i % 5],
      shortAnswer: shortAnswerText,
      longAnswer: `${shortAnswerText} Detailed technical breakdown with implementation guidelines, execution trade-offs, and production examples.`,
      explanation: `Contextual explanation highlighting why this ${role} concept is crucial for software architecture and interview evaluations.`
    };
  });
};

interface RolePanel {
  panelNumber: number;
  selectedRole: string | null;
  status: "pending" | "generated";
  isLocked: boolean;
}

const InterviewSectionView = () => {
  const { section } = useParams<{ section: SectionKey }>();
  const sec = (section || "course") as SectionKey;
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<any[]>([]);
  const [progress, setProgress] = useState<Record<string, boolean>>({});
  const [selected, setSelected] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);

  // Panels states
  const [panels, setPanels] = useState<RolePanel[]>([]);
  const [activePanelToSelect, setActivePanelToSelect] = useState<number | null>(null);
  const [selectedRoleForModal, setSelectedRoleForModal] = useState<string>("");
  const [isConfirmingSelection, setIsConfirmingSelection] = useState(false);

  const loadPanels = () => {
    const saved = localStorage.getItem("student_role_panels");
    if (saved) {
      try {
        setPanels(JSON.parse(saved));
      } catch (e) {
        initPanels();
      }
    } else {
      initPanels();
    }
  };

  const initPanels = () => {
    const initialPanels: RolePanel[] = Array.from({ length: 5 }, (_, i) => ({
      panelNumber: i + 1,
      selectedRole: null,
      status: "pending",
      isLocked: i < 3
    }));
    localStorage.setItem("student_role_panels", JSON.stringify(initialPanels));
    setPanels(initialPanels);
  };

  useEffect(() => {
    const loadSectionData = async () => {
      setLoading(true);
      if (sec === "role") {
        const pList = await InterviewService.getPanels();
        setPanels(pList || []);
        setQuestions([1]);
      } else {
        const fetchedQuestions = await InterviewService.getSectionQuestions(sec);
        setQuestions(fetchedQuestions || []);
      }

      const progMap = JSON.parse(localStorage.getItem(`dq_section_progress_${sec}`) || "{}");
      setProgress(progMap);
      setLoading(false);
    };

    loadSectionData();
  }, [sec]);

  const toggleComplete = (i: number, checked: boolean) => {
    const key = `q_${i}`;
    const newProg = { ...progress, [key]: checked };
    setProgress(newProg);
    localStorage.setItem(`dq_section_progress_${sec}`, JSON.stringify(newProg));
  };

  const markAll = () => {
    const newProg: Record<string, boolean> = {};
    questions.forEach((_, i) => { newProg[`q_${i}`] = true; });
    setProgress(newProg);
    localStorage.setItem(`dq_section_progress_${sec}`, JSON.stringify(newProg));
    toast.success("All tasks marked complete internally.");
  };

  const selectedCount = useMemo(() => Object.values(selected).filter(Boolean).length, [selected]);

  const goToTest = () => {
    const indices = Object.entries(selected).filter(([, v]) => v).map(([k]) => Number(k));
    const qParam = indices.length > 0 ? `?indices=${indices.join(",")}` : "";
    navigate(`/test/setup/${sec}${qParam}`);
  };

  const handleSelectRole = async () => {
    if (!activePanelToSelect || !selectedRoleForModal) return;

    toast.info(`Generating 50 AI questions for ${selectedRoleForModal}...`);

    await InterviewService.setPanelRole(activePanelToSelect, selectedRoleForModal);
    await InterviewService.getSectionQuestions("role", activePanelToSelect);

    localStorage.setItem(`dq_panel_role_initialized_${activePanelToSelect}`, "true");
    localStorage.setItem(`dq_panel_role_override_${activePanelToSelect}`, selectedRoleForModal);

    const updatedPanels = panels.map((p) => {
      if (p.panelNumber === activePanelToSelect) {
        return {
          ...p,
          selectedRole: selectedRoleForModal,
          status: "generated" as const,
          isLocked: activePanelToSelect <= 3
        };
      }
      return p;
    });

    setPanels(updatedPanels);
    const panelNum = activePanelToSelect;
    setActivePanelToSelect(null);
    setSelectedRoleForModal("");

    toast.success(`Generated 50 AI questions for ${selectedRoleForModal}`);
    navigate(`/dashboard/interview-prep/panel/${panelNum}`);
  };

  const handleResetPanelForTesting = (panelNumber: number) => {
    localStorage.setItem(`dq_panel_role_override_${panelNumber}`, "clear");
    localStorage.removeItem(`dq_panel_role_initialized_${panelNumber}`);
    localStorage.removeItem(`dq_role_panel_qs_${panelNumber}`);
    localStorage.removeItem(`dq_role_panel_progress_${panelNumber}`);
    setPanels([...panels]);
    toast.success(`Panel ${panelNumber} reset to uninitialized state for testing.`);
  };

  const getPanelProgress = (panelNumber: number) => {
    const prog = JSON.parse(localStorage.getItem(`dq_role_panel_progress_${panelNumber}`) || "{}");
    return Object.values(prog).filter(Boolean).length;
  };

  const getRoleIcon = (role: string) => {
    const r = role.toLowerCase();
    if (r.includes("frontend")) return "💻";
    if (r.includes("backend")) return "⚙️";
    if (r.includes("full stack") || r.includes("fullstack")) return "🌐";
    if (r.includes("java")) return "☕";
    if (r.includes("python")) return "🐍";
    if (r.includes("react")) return "⚛️";
    if (r.includes("data analyst") || r.includes("analytics")) return "📊";
    if (r.includes("data scientist")) return "🧪";
    if (r.includes("ai") || r.includes("artificial")) return "🤖";
    if (r.includes("devops") || r.includes("cloud")) return "☁️";
    return "💼";
  };

  const getPanelMockActivity = (panelNumber: number, doneCount: number) => {
    if (doneCount === 0) {
      return {
        lastActive: "Not started yet",
        timeLeft: "Available Anytime"
      };
    }
    if (doneCount >= 50) {
      return {
        lastActive: "Completed!",
        timeLeft: "Available Anytime"
      };
    }
    const days = ["Yesterday", "2 days ago", "Today", "Last week"];
    const day = days[panelNumber % days.length];
    return {
      lastActive: `Last practiced: ${day}`,
      timeLeft: "Available Anytime"
    };
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  // Render Intermediate Role Panel Selection Page
  if (sec === "role") {
    const getActualRole = (p: RolePanel) => {
      const localOverride = typeof window !== "undefined" ? localStorage.getItem(`dq_panel_role_override_${p.panelNumber}`) : null;
      if (localOverride === "clear") return null;
      if (localOverride) return localOverride;

      const isInitialized = typeof window !== "undefined" ? localStorage.getItem(`dq_panel_role_initialized_${p.panelNumber}`) === "true" : false;
      if (!isInitialized) return null;

      return p.selectedRole;
    };

    const permanentInitialized = panels.filter(p => p.panelNumber <= 3 && getActualRole(p)).length;
    const flexibleInitialized = panels.filter(p => p.panelNumber > 3 && getActualRole(p)).length;
    const totalQuestionsCount = panels.filter(p => getActualRole(p)).length * 50;

    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
        <Link to="/dashboard/interview-prep" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Sections
        </Link>

        {/* Header Summary Dashboard Card */}
        <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-foreground">Role Based Questions</h1>
            <p className="text-sm text-muted-foreground">Select and lock your career paths or practice target skillsets with custom interview prep panels.</p>
          </div>
          <div className="flex gap-4 sm:gap-6 shrink-0 bg-muted/40 p-4 rounded-xl border border-border/40">
            <div className="text-center">
              <span className="text-xs font-bold text-muted-foreground block uppercase tracking-wider">Career Tracks</span>
              <span className="text-lg font-extrabold text-foreground">{permanentInitialized} / 3</span>
            </div>
            <div className="border-r border-border" />
            <div className="text-center">
              <span className="text-xs font-bold text-muted-foreground block uppercase tracking-wider">Practice Tracks</span>
              <span className="text-lg font-extrabold text-foreground">{flexibleInitialized} / 2</span>
            </div>
            <div className="border-r border-border" />
            <div className="text-center">
              <span className="text-xs font-bold text-muted-foreground block uppercase tracking-wider">Total Questions</span>
              <span className="text-lg font-extrabold text-primary">{totalQuestionsCount}</span>
            </div>
          </div>
        </div>

        {/* Section 1: Permanent Career Tracks */}
        <div className="space-y-4">
          <div className="border-b border-border pb-2">
            <h2 className="text-base font-black text-foreground flex items-center gap-2">
              <span>🎯</span> Permanent Career Tracks
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">These panels help you prepare for permanent career roles. Once initialized, they are locked and cannot be changed.</p>
          </div>

          <div className="grid gap-3">
            {panels.filter(p => p.panelNumber <= 3).map((p) => {
              const actualRole = getActualRole(p);
              const hasRole = !!actualRole;
              const done = hasRole ? getPanelProgress(p.panelNumber) : 0;
              const percent = hasRole ? Math.round((done / 50) * 100) : 0;
              const activity = getPanelMockActivity(p.panelNumber, done);
              const icon = hasRole ? getRoleIcon(actualRole!) : "";

              return (
                <Card key={p.panelNumber} className="border-border/60 hover:border-primary/30 transition-all shadow-sm overflow-hidden min-h-[90px] flex flex-col justify-center">
                  <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      {/* Top Header Badge Row */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-extrabold tracking-wider bg-amber-500/10 text-amber-750 px-2.5 py-0.5 rounded-full uppercase flex items-center gap-1">
                          🔒 Career Track {p.panelNumber}
                        </span>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">
                          Permanent
                        </span>
                        {hasRole && (
                          <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                            Locked
                          </span>
                        )}
                        <button
                          onClick={() => handleResetPanelForTesting(p.panelNumber)}
                          className="text-[10px] font-bold text-rose-500 hover:text-rose-700 hover:underline ml-2 transition-all"
                          title="Reset panel back to uninitialized state for UI testing"
                        >
                          [Reset Panel]
                        </button>
                      </div>

                      {/* Main Title Row */}
                      {hasRole ? (
                        <div className="space-y-2">
                          <h3 className="text-base font-extrabold text-foreground flex items-center gap-1.5">
                            <span className="text-xl">{icon}</span> {actualRole}
                          </h3>
                          {/* Progress bar */}
                          <div className="flex items-center gap-4 max-w-md">
                            <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
                              <div className="bg-primary h-1.5 rounded-full transition-all duration-300" style={{ width: `${percent}%` }} />
                            </div>
                            <span className="text-[11px] font-bold text-muted-foreground whitespace-nowrap">
                              {done} / 50 Qs ({percent}%)
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-0.5">
                          <h3 className="text-sm font-extrabold text-muted-foreground italic">No Role Selected</h3>
                          <p className="text-xs text-muted-foreground">Select a career track role to generate your locked prep roadmap.</p>
                        </div>
                      )}
                    </div>

                    {/* Right Action and Activity Row */}
                    <div className="flex flex-col sm:items-end justify-center gap-2 shrink-0">
                      {hasRole ? (
                        <>
                          <div className="text-right hidden sm:block">
                            <span className="text-[10px] font-bold text-muted-foreground block">{activity.lastActive}</span>
                            <span className="text-[10px] font-semibold text-primary block">{activity.timeLeft}</span>
                          </div>
                          <Button 
                            onClick={() => navigate(`/dashboard/interview-prep/panel/${p.panelNumber}`)}
                            className="rounded-xl font-extrabold text-xs px-5 shadow-sm h-9"
                          >
                            Continue Practice
                          </Button>
                        </>
                      ) : (
                        <Button 
                          onClick={() => { setActivePanelToSelect(p.panelNumber); setSelectedRoleForModal(TARGET_ROLES[0]); }}
                          variant="outline"
                          className="rounded-xl font-extrabold text-xs px-4 h-9 border-amber-500/20 hover:border-amber-500/40 text-amber-700 hover:bg-amber-500/5"
                        >
                          Initialize Panel
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Section 2: Flexible Practice */}
        <div className="space-y-4 pt-2">
          <div className="border-b border-border pb-2">
            <h2 className="text-base font-black text-foreground flex items-center gap-2">
              <span>🔄</span> Flexible Practice
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">These panels are designed for flexible, adaptive practice. You can change their roles at any time without locking restrictions.</p>
          </div>

          <div className="grid gap-3">
            {panels.filter(p => p.panelNumber > 3).map((p) => {
              const actualRole = getActualRole(p);
              const hasRole = !!actualRole;
              const done = hasRole ? getPanelProgress(p.panelNumber) : 0;
              const percent = hasRole ? Math.round((done / 50) * 100) : 0;
              const activity = getPanelMockActivity(p.panelNumber, done);
              const icon = hasRole ? getRoleIcon(actualRole!) : "";

              return (
                <Card key={p.panelNumber} className="border-border/60 hover:border-primary/30 transition-all shadow-sm overflow-hidden min-h-[90px] flex flex-col justify-center">
                  <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      {/* Top Header Badge Row */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-extrabold tracking-wider bg-blue-500/10 text-blue-700 px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
                          🔄 Practice Track {p.panelNumber - 3}
                        </span>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">
                          Flexible
                        </span>
                        {hasRole && (
                          <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                            Changeable
                          </span>
                        )}
                        <button
                          onClick={() => handleResetPanelForTesting(p.panelNumber)}
                          className="text-[10px] font-bold text-rose-500 hover:text-rose-700 hover:underline ml-2 transition-all"
                          title="Reset panel back to uninitialized state for UI testing"
                        >
                          [Reset Panel]
                        </button>
                      </div>

                      {/* Main Title Row */}
                      {hasRole ? (
                        <div className="space-y-2">
                          <h3 className="text-base font-extrabold text-foreground flex items-center gap-1.5">
                            <span className="text-xl">{icon}</span> {actualRole}
                          </h3>
                          {/* Progress bar */}
                          <div className="flex items-center gap-4 max-w-md">
                            <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
                              <div className="bg-primary h-1.5 rounded-full transition-all duration-300" style={{ width: `${percent}%` }} />
                            </div>
                            <span className="text-[11px] font-bold text-muted-foreground whitespace-nowrap">
                              {done} / 50 Qs ({percent}%)
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-0.5">
                          <h3 className="text-sm font-extrabold text-muted-foreground italic">No Role Selected</h3>
                          <p className="text-xs text-muted-foreground">Select a practice target role to dynamically generate interview questions.</p>
                        </div>
                      )}
                    </div>

                    {/* Right Action and Activity Row */}
                    <div className="flex flex-col sm:items-end justify-center gap-2 shrink-0">
                      {hasRole ? (
                        <div className="flex flex-col sm:items-end gap-2">
                          <div className="text-right hidden sm:block">
                            <span className="text-[10px] font-bold text-muted-foreground block">{activity.lastActive}</span>
                            <span className="text-[10px] font-semibold text-primary block">{activity.timeLeft}</span>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              onClick={() => { setActivePanelToSelect(p.panelNumber); setSelectedRoleForModal(actualRole || TARGET_ROLES[0]); }}
                              variant="outline"
                              className="rounded-xl font-extrabold text-xs px-3 h-9"
                            >
                              Change Role
                            </Button>
                            <Button 
                              onClick={() => navigate(`/dashboard/interview-prep/panel/${p.panelNumber}`)}
                              className="rounded-xl font-extrabold text-xs px-4 shadow-sm h-9"
                            >
                              Continue Practice
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button 
                          onClick={() => { setActivePanelToSelect(p.panelNumber); setSelectedRoleForModal(TARGET_ROLES[0]); }}
                          variant="outline"
                          className="rounded-xl font-extrabold text-xs px-4 h-9 border-blue-500/20 hover:border-blue-500/40 text-blue-700 hover:bg-blue-500/5"
                        >
                          Initialize Panel
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Target Role Selector / Lock Confirmation Modal Overlay */}
        {activePanelToSelect !== null && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-card border border-border/80 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 animate-in zoom-in-95 duration-200">
              
              {!isConfirmingSelection ? (
                // Step 1: Selection Dialog
                <>
                  <div className="space-y-1">
                    <h3 className="text-base font-black text-foreground">
                      {activePanelToSelect <= 3 ? "🔒 Choose Your Career Role" : "🔄 Select Practice Role"}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {activePanelToSelect <= 3 
                        ? `Choose a target role for Career Track ${activePanelToSelect}. Note that once initialized, this permanent selection cannot be altered.`
                        : `Choose a role for Practice Track ${activePanelToSelect - 3}. You are free to change this target role at any time.`
                      }
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Target Role</label>
                    <select
                      value={selectedRoleForModal}
                      onChange={(e) => setSelectedRoleForModal(e.target.value)}
                      className="w-full bg-background border border-input rounded-xl px-3 py-2.5 text-xs font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer shadow-sm"
                    >
                      {TARGET_ROLES.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button 
                      variant="ghost" 
                      className="rounded-xl font-bold text-xs h-9" 
                      onClick={() => { setActivePanelToSelect(null); setSelectedRoleForModal(""); }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      className="rounded-xl font-bold text-xs px-5 shadow-sm h-9" 
                      onClick={() => {
                        if (activePanelToSelect <= 3) {
                          setIsConfirmingSelection(true);
                        } else {
                          handleSelectRole();
                        }
                      }}
                    >
                      Continue
                    </Button>
                  </div>
                </>
              ) : (
                // Step 2: Lock Confirmation Dialog for Career Tracks (1-3)
                <>
                  <div className="space-y-3 text-center pb-2">
                    <div className="w-12 h-12 bg-rose-500/10 border border-rose-500/20 rounded-full flex items-center justify-center mx-auto text-rose-500 font-bold text-lg">
                      ⚠️
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base font-black text-foreground">Confirm Permanent Career Track</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        You are about to select <span className="font-bold text-foreground">{selectedRoleForModal}</span> as your permanent career specialization track.
                      </p>
                    </div>
                    <div className="text-xs text-rose-600 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20 font-bold leading-normal">
                      This selection is completely irreversible. You will not be able to modify, delete, or change this role afterwards.
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="ghost" 
                      className="flex-1 rounded-xl font-bold text-xs h-9" 
                      onClick={() => setIsConfirmingSelection(false)}
                    >
                      Go Back
                    </Button>
                    <Button 
                      variant="destructive"
                      className="flex-1 rounded-xl font-bold text-xs shadow-sm bg-rose-600 hover:bg-rose-700 h-9" 
                      onClick={() => {
                        handleSelectRole();
                        setIsConfirmingSelection(false);
                      }}
                    >
                      Confirm & Lock
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="max-w-4xl mx-auto">
        <Link to="/dashboard/interview-prep" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"><ArrowLeft className="w-4 h-4 mr-1" /> Back</Link>
        <Card><CardContent className="p-8 text-center text-muted-foreground">No questions yet. Go back and click "Generate Questions" on the main prep portal dashboard window.</CardContent></Card>
      </div>
    );
  }

  const doneCount = Object.values(progress).filter(Boolean).length;

  return (
    <>
      <div className="max-w-5xl mx-auto space-y-4">
        <Link to="/dashboard/interview-prep" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="w-4 h-4 mr-1" /> Back</Link>
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{TITLES[sec]}</h1>
            <p className="text-sm text-muted-foreground">{questions.length} questions · {doneCount}/{questions.length} completed</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {TESTABLE[sec] && (
              <Button onClick={goToTest}>
                <FlaskConical className="w-4 h-4" /> Test {selectedCount > 0 ? `(${selectedCount} selected)` : ""}
              </Button>
            )}
            <Button variant="outline" onClick={markAll}><CheckCheck className="w-4 h-4" /> Mark All Complete</Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-4">
            <Accordion type="multiple" className="w-full">
              {questions.map((q: any, i: number) => {
                const key = `q_${i}`;
                const done = !!progress[key];
                return (
                  <AccordionItem key={i} value={`q-${i}`}>
                    <div className="flex items-center gap-2 pr-2">
                      {TESTABLE[sec] && (
                        <Checkbox
                          checked={!!selected[i]}
                          onCheckedChange={(v) => setSelected((s) => ({ ...s, [i]: !!v }))}
                          onClick={(e) => e.stopPropagation()}
                        />
                      )}
                      <AccordionTrigger className="flex-1 text-left hover:no-underline">
                        <div className="flex items-start gap-3 pr-4 w-full">
                          <span className={`font-semibold shrink-0 ${done ? "text-green-500" : "text-primary"}`}>Q{i + 1}.</span>
                          <span className={`font-medium ${done ? "line-through text-muted-foreground" : "text-foreground"}`}>{q.question}</span>
                        </div>
                      </AccordionTrigger>
                    </div>
                    <AccordionContent>
                      <div className="space-y-3 pl-8">
                        <div className="flex gap-2 flex-wrap text-xs">
                          {q.difficulty && <span className="px-2 py-0.5 rounded bg-primary/10 text-primary">{q.difficulty}</span>}
                          {q.topic && <span className="px-2 py-0.5 rounded bg-muted text-muted-foreground">{q.topic}</span>}
                        </div>
                        {q.shortAnswer && (
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Answer Outline</p>
                            <p className="text-sm text-foreground">{q.shortAnswer}</p>
                          </div>
                        )}

                        {/* Read More Detailed Answer and Examples */}
                        <DetailedAnswer question={q.question} topic={q.topic} shortAnswer={q.shortAnswer} />

                        <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                          <Checkbox checked={done} onCheckedChange={(v) => toggleComplete(i, !!v)} />
                          <span className={done ? "text-green-500" : "text-foreground"}>{done ? "Completed" : "Mark as Complete"}</span>
                        </label>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

const getDetailedExplanation = (question: string, topic: string, shortAnswer: string) => {
  const lower = question.toLowerCase();
  let explanation = "";
  let example = "";

  if (lower.includes("rest") || lower.includes("api") || lower.includes("idempotency")) {
    explanation = "REST (Representational State Transfer) is an architectural style for network design. An operation is idempotent if making the same request multiple times produces the same result on the server state. For example, GET is safe and idempotent since it only retrieves data, whereas POST is not idempotent because repeating it creates multiple resource records.";
    example = "E-Commerce Payment API: When submitting a payment transaction, calling POST /payments might create duplicate charges if repeated due to network retries. Using an idempotency key header (e.g., Idempotency-Key: key_1234) allows the server to recognize subsequent identical requests and return the cached initial transaction result without duplicate charging.";
  } else if (lower.includes("normalization") || lower.includes("database") || lower.includes("b-tree")) {
    explanation = "Database normalization optimizes relational schema design to eliminate data redundancy and prevent anomalies. 1NF removes repeating groups; 2NF removes partial dependencies on composite keys; 3NF removes transitive dependencies (non-key columns depending on other non-key columns). B-Tree indices provide O(log N) search times by maintaining sorted keys in hierarchical nodes.";
    example = "Retail Order System: Storing Customer Name and Billing Address directly in every row of an Orders table causes duplicate data and update anomalies if the customer address changes. Splitting this into a Customers table and an Orders table referenced by CustomerID achieves 3NF, reducing storage footprint and safeguarding database consistency.";
  } else if (lower.includes("injection") || lower.includes("parameterized") || lower.includes("security")) {
    explanation = "SQL Injection (SQLi) occurs when untrusted input is directly concatenated into SQL query strings, allowing attackers to manipulate queries. Parameterized queries resolve this by pre-compiling the SQL statement template on the database server and passing parameters as isolated values that cannot be parsed as executable commands.";
    example = "User Login Verification: Concatenating input like `SELECT * FROM users WHERE email = '` + input + `'` allows an attacker to input `' OR '1'='1` to bypass security verification. Pre-compiling `SELECT * FROM users WHERE email = ?` treats the input purely as a literal string value, rendering the injection harmless.";
  } else if (lower.includes("event loop") || lower.includes("node") || lower.includes("non-blocking")) {
    explanation = "Node.js runs on a single-threaded event loop utilizing Libuv for asynchronous non-blocking I/O operations. Offloading heavy tasks (like file I/O or crypto operations) to Libuv's Thread Pool prevents blocking the execution of the main JS execution loop.";
    example = "Web Server File Upload: Instead of pausing server execution to read a large file off a disk (blocking other requests), Node initiates a read stream and returns execution control back to the event loop. The loop continues servicing incoming traffic and handles the file upload completion callback asynchronously.";
  } else {
    explanation = shortAnswer || "Detailed architectural overview of the concepts, best practices, execution cycles, runtime environments, and core security guidelines associated with this question.";
    example = "Production implementation scenario illustrating standard integration patterns, optimization approaches, and debugging strategies in enterprise-scale systems.";
  }

  return { explanation, example };
};

const DetailedAnswer = ({ question, topic, shortAnswer }: { question: string; topic: string; shortAnswer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { explanation, example } = getDetailedExplanation(question, topic, shortAnswer);

  return (
    <div className="mt-3 border-t border-border/40 pt-3">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="text-xs font-bold text-primary hover:text-primary/80 hover:underline flex items-center gap-1 transition-colors"
        >
          <span>📖</span> Read More (Detailed Answer & Examples)
        </button>
      ) : (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="bg-primary/5 border border-primary/10 rounded-xl p-3.5 space-y-2">
            <h4 className="text-xs font-extrabold text-primary uppercase tracking-wider flex items-center gap-1.5">
              <span>💡</span> Detailed Explanation
            </h4>
            <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-350 font-medium">
              {explanation}
            </p>
          </div>

          <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-3.5 space-y-2">
            <h4 className="text-xs font-extrabold text-emerald-600 dark:text-emerald-500 uppercase tracking-wider flex items-center gap-1.5">
              <span>🚀</span> Real-World Example
            </h4>
            <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-350 font-medium">
              {example}
            </p>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="text-xs font-bold text-muted-foreground hover:text-foreground hover:underline flex items-center gap-1 transition-colors"
          >
            Collapse
          </button>
        </div>
      )}
    </div>
  );
};

export default InterviewSectionView;