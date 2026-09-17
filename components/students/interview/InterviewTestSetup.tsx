import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import AuthService from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, BookOpen, Code2, Layers, Sparkles, Crown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import InterviewService from "@/services/interview.service";

type SectionKey = "course" | "weak" | "role" | "project" | "hr";



const InterviewTestSetup = () => {
  const { section } = useParams<{ section: SectionKey }>();
  const sec = (section || "course") as SectionKey;
  const [sp] = useSearchParams();
  const user = AuthService.getUser();
  const navigate = useNavigate();

  const [scope, setScope] = useState<"selected" | "all">(sp.get("indices") ? "selected" : "all");
  const [testType, setTestType] = useState<"mcq" | "coding" | "mixed">("mcq");
  const [count, setCount] = useState<number>(10);
  const [allQuestions, setAllQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [building, setBuilding] = useState(false);

  const selectedIndices = useMemo(
    () => (sp.get("indices") || "").split(",").map((s) => Number(s)).filter((n) => !Number.isNaN(n)),
    [sp],
  );

  useEffect(() => {
    const loadPool = async () => {
      setLoading(true);
      const panelNumber = Number(sp.get("panel") || 1);
      const fetched = await InterviewService.getSectionQuestions(sec, panelNumber);
      setAllQuestions(fetched || []);
      setLoading(false);
    };
    loadPool();
  }, [sec, sp]);

  const sourcePool = scope === "selected" && selectedIndices.length > 0
    ? selectedIndices.map((i) => allQuestions[i]).filter(Boolean)
    : allQuestions;

  const countOptions = [10, 20, 30];

  const startTest = async () => {
    if (sourcePool.length === 0 && allQuestions.length === 0) {
      toast.error("No questions available in source panel context.");
      return;
    }
    setBuilding(true);

    try {
      const panelNumber = Number(sp.get("panel") || 0);
      const sessionData = await InterviewService.setupTestSession({
        section: sec,
        scope,
        count,
        indices: selectedIndices,
        panelNumber,
        testType
      });

      if (!sessionData || !sessionData.id) {
        toast.error("Failed to initialize assessment session in database.");
        setBuilding(false);
        return;
      }

      const testId = sessionData.id;
      setBuilding(false);
      toast.success("Assessment session initialized and stored in DB!");

      let cleanRoute = `/test/${testId}`;
      if (sec === "role") cleanRoute = `/role-based/test/${testId}`;
      else if (sec === "project") cleanRoute = `/project-based/test/${testId}`;
      else if (sec === "weak") cleanRoute = `/weak-areas/test/${testId}`;
      else if (sec === "hr") cleanRoute = `/hr/test/${testId}`;

      navigate(cleanRoute);
    } catch (e: any) {
      console.error("API setupTestSession error:", e);
      toast.error(e?.response?.data?.message || e?.message || "Failed to start test session.");
      setBuilding(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <>
      <div className="max-w-3xl mx-auto space-y-5">
        <Link to={sec === "role" && sp.get("panel") ? `/dashboard/interview-prep/panel/${sp.get("panel")}` : `/dashboard/interview-prep/section/${sec}`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="w-4 h-4 mr-1" /> Back</Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground capitalize">{sec} Section Test</h1>
          <p className="text-sm text-muted-foreground">Configure your test and start. 1 question = 1 minute.</p>
        </div>

        <Card>
          <CardContent className="p-5 space-y-3">
            <h3 className="font-semibold text-foreground">Step 1 · Test Scope</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setScope("selected")}
                disabled={selectedIndices.length === 0}
                className={`p-4 rounded-lg border text-left disabled:opacity-50 disabled:cursor-not-allowed ${scope === "selected" ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}`}
              >
                <p className="font-medium text-foreground">Selected Questions</p>
                <p className="text-xs text-muted-foreground">{selectedIndices.length} selected</p>
              </button>
              <button
                onClick={() => setScope("all")}
                className={`p-4 rounded-lg border text-left ${scope === "all" ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}`}
              >
                <p className="font-medium text-foreground">All Questions</p>
                <p className="text-xs text-muted-foreground">{allQuestions.length} questions</p>
              </button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 space-y-3">
            <h3 className="font-semibold text-foreground">Step 2 · Test Type</h3>
            <div className="grid grid-cols-3 gap-3">
              <button onClick={() => setTestType("mcq")} className={`p-4 rounded-lg border text-center ${testType === "mcq" ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}`}>
                <BookOpen className="w-6 h-6 mx-auto mb-1 text-primary" />
                <p className="font-medium text-foreground text-sm">MCQ</p>
                <p className="text-[10px] text-muted-foreground">Free</p>
              </button>
              <button onClick={() => setTestType("coding")} className={`p-4 rounded-lg border text-center relative ${testType === "coding" ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}`}>
                <Code2 className="w-6 h-6 mx-auto mb-1 text-primary" />
                <p className="font-medium text-foreground text-sm">Coding</p>
                <p className="text-[10px] text-yellow-500 flex items-center justify-center gap-1"><Crown className="w-3 h-3" /> Premium</p>
              </button>
              <button onClick={() => setTestType("mixed")} className={`p-4 rounded-lg border text-center relative ${testType === "mixed" ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}`}>
                <Layers className="w-6 h-6 mx-auto mb-1 text-primary" />
                <p className="font-medium text-foreground text-sm">Mixed</p>
                <p className="text-[10px] text-yellow-500 flex items-center justify-center gap-1"><Crown className="w-3 h-3" /> Premium</p>
              </button>
            </div>
          </CardContent>
        </Card>

        {testType === "mcq" && (
          <Card>
            <CardContent className="p-5 space-y-3">
              <h3 className="font-semibold text-foreground">Step 3 · Question Count</h3>
              <div className="grid grid-cols-3 gap-3">
                {countOptions.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCount(c)}
                    className={`p-4 rounded-lg border text-center ${count === c ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}`}
                  >
                    <p className="font-bold text-foreground text-lg">{c}</p>
                    <p className="text-xs text-muted-foreground">{c} min timer</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Button size="lg" className="w-full" disabled={building || count === 0} onClick={startTest}>
          {building ? <><Loader2 className="w-4 h-4 animate-spin" /> Building test...</> : <><Sparkles className="w-4 h-4" /> Start Test</>}
        </Button>
      </div>
    </>
  );
};

export default InterviewTestSetup;