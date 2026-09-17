import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, Sparkles, Loader2, GraduationCap, Briefcase, Target, MessageSquare, CheckCircle2, ChevronRight, History, AlertTriangle, CalendarCheck } from "lucide-react";
import { toast } from "sonner";
import InterviewService from "@/services/interview.service";
import AuthService from "@/services/auth.service";
import ProfileService from "@/services/profile.service";

type SectionKey = "project" | "weak" | "hr" | "role";

const SECTIONS: { key: SectionKey; title: string; count: number; testable: boolean; icon: any; gradient: string; desc: string }[] = [
  { key: "role", title: "Role Based Questions", count: 50, testable: true, icon: GraduationCap, gradient: "from-blue-500/20 to-blue-500/5", desc: "Choose target roles across 5 custom prep panels." },
  { key: "project", title: "Project Based", count: 30, testable: true, icon: Briefcase, gradient: "from-purple-500/20 to-purple-500/5", desc: "Tailored to your projects, internships and technologies." },
  { key: "weak", title: "Weak Areas", count: 20, testable: true, icon: Target, gradient: "from-orange-500/20 to-orange-500/5", desc: "Targeted at topics where you scored low." },
  { key: "hr", title: "HR Questions", count: 20, testable: true, icon: MessageSquare, gradient: "from-green-500/20 to-green-500/5", desc: "Behavioural and HR-round questions with sample answers." },
];

export const InterviewPrep = () => {
  const [questionsMap, setQuestionsMap] = useState<Record<string, any[]>>({});
  const [recentTests, setRecentTests] = useState<any[]>([]);
  const [monthlyStatus, setMonthlyStatus] = useState<any>({ canGenerate: true, currentMonth: "", lastGeneratedAt: null });
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const user = AuthService.getUser();
      if (user && user.id) {
        try {
          const prof = await ProfileService.getById(user.id);
          setProfile(prof || null);
        } catch (err) {
          console.warn("Profile fetch warning:", err);
        }
      }

      // Check monthly generation eligibility
      try {
        const mStatus = await InterviewService.checkMonthlyStatus();
        setMonthlyStatus(mStatus || { canGenerate: true, currentMonth: new Date().toISOString().substring(0, 7) });
      } catch (err) {
        setMonthlyStatus({ canGenerate: true, currentMonth: new Date().toISOString().substring(0, 7) });
      }

      // Fetch test histories from database
      try {
        const tests = await InterviewService.getTestResults();
        setRecentTests((tests || []).slice(0, 5));
      } catch (err) {
        setRecentTests([]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }

    // Asynchronously check cached questions map
    try {
      const map: Record<string, any[]> = {};
      for (const s of SECTIONS) {
        const pNum = s.key === "role" ? 1 : 0;
        const savedKey = s.key === "role" ? `dq_role_panel_qs_${pNum}` : `dq_section_qs_${s.key}`;
        const cached = localStorage.getItem(savedKey);
        if (cached) {
          try { map[s.key] = JSON.parse(cached); } catch {}
        }
      }
      setQuestionsMap(map);
    } catch (e) {}
  };

  useEffect(() => { loadData(); }, []);

  const handleGenerateMonthlyData = async () => {
    if (!monthlyStatus.canGenerate) {
      toast.error(`Monthly dataset for ${monthlyStatus.currentMonth} has already been generated. Generation is restricted to once per month.`);
      return;
    }

    setGenerating(true);
    toast.info("Generating AI interview question bank from profile & database...");

    try {
      await InterviewService.generateMonthlyData();
      toast.success(`Monthly AI dataset for ${monthlyStatus.currentMonth} generated and saved to DB successfully!`);
    } catch (err: any) {
      toast.error(err.message || "Failed to generate monthly dataset.");
    } finally {
      setGenerating(false);
      await loadData();
    }
  };

  const rawProfileObj = profile?.data?.data || profile?.data || profile || {};
  const completionPct = Number(rawProfileObj.profile_completion ?? 0);
  const isProfileConfigured = completionPct === 100;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary" /> Interview Preparation
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Dynamic database-driven interview preparation & AI mock datasets.
          </p>
        </div>
        {isProfileConfigured && (
          <Button
            onClick={handleGenerateMonthlyData}
            disabled={generating || !monthlyStatus.canGenerate}
            size="lg"
            className="rounded-xl font-bold text-xs"
          >
            {generating ? (
              <><Loader2 className="w-4 h-4 animate-spin mr-1" /> Generating Dataset...</>
            ) : !monthlyStatus.canGenerate ? (
              <><CalendarCheck className="w-4 h-4 mr-1 text-green-400" /> Generated for {monthlyStatus.currentMonth}</>
            ) : (
              <><Sparkles className="w-4 h-4 mr-1 text-yellow-300" /> Generate Monthly Data ({monthlyStatus.currentMonth})</>
            )}
          </Button>
        )}
      </div>

      {isProfileConfigured && monthlyStatus.canGenerate && (
        <Card className="border-blue-500/40 bg-blue-500/5 p-4 rounded-xl flex items-start gap-3 shadow-xs">
          <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="font-bold text-sm text-foreground">Monthly Interview Dataset Pending</h4>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                No interview dataset has been generated for this month ({monthlyStatus.currentMonth}). Click "Generate Monthly Data" to generate your personalized interview preparation.
              </p>
            </div>
            <Button onClick={handleGenerateMonthlyData} disabled={generating} size="sm" className="rounded-xl font-bold text-xs shrink-0 bg-primary text-white">
              {generating ? <><Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> Generating...</> : <><Sparkles className="w-3.5 h-3.5 mr-1" /> Generate Monthly Data</>}
            </Button>
          </div>
        </Card>
      )}

      {!isProfileConfigured && (
        <Card className="border-amber-500/40 bg-amber-500/5 p-4 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm text-foreground">Profile Configuration Required</h4>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Complete your profile to generate personalized Interview Preparation questions.
              Please ensure you have specified your Personal info, Academic Details, Skills, and Projects in your student profile.
            </p>
            <a href="/student/profile" className="inline-block mt-3 text-xs font-bold text-primary hover:underline bg-background px-3 py-1.5 rounded-lg border border-border shadow-sm">
              Complete Profile
            </a>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SECTIONS.map((s) => {
          const Icon = s.icon;
          const questions = questionsMap[s.key] || [];
          const count = questions.length || s.count;
          const completedCount = questions.filter((q: any) => q.isCompleted).length;
          const ready = isProfileConfigured;

          return (
            <Card key={s.key} className={`relative overflow-hidden bg-gradient-to-br ${s.gradient} border-border/60 hover:border-primary/40 transition-colors`}>
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-background/60 flex items-center justify-center"><Icon className="w-5 h-5 text-primary" /></div>
                    <div>
                      <h3 className="font-semibold text-foreground">{s.title}</h3>
                      <p className="text-xs text-muted-foreground">{count} questions · {s.testable ? "Test Available" : "No Test"}</p>
                    </div>
                  </div>
                  {ready && <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary flex items-center gap-1 font-bold"><CheckCircle2 className="w-3 h-3" /> {completedCount}/{count}</span>}
                </div>
                <p className="text-xs text-muted-foreground">{s.desc}</p>
                <Link to={ready ? `/section/${s.key}` : "#"} className="block pt-1" onClick={(e) => { if (!ready) e.preventDefault(); }}>
                  <Button variant={ready ? "default" : "outline"} className="w-full rounded-xl text-xs font-bold" disabled={!ready}>
                    {isProfileConfigured ? <>Start Practice / Test <ChevronRight className="w-4 h-4 ml-1" /></> : "Profile Configuration Required"}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {recentTests.length > 0 && isProfileConfigured && (
        <Card className="border-border/60">
          <CardContent className="p-4 space-y-2">
            <h3 className="font-semibold text-foreground flex items-center gap-2 text-sm"><History className="w-4 h-4 text-primary" /> Recent Test Results</h3>
            <div className="divide-y divide-border/60">
              {recentTests.map((t) => (
                <a key={t.id} href={`/student/reports/prep/${t.id}`} className="flex justify-between items-center py-2 px-1 rounded hover:bg-muted/40 text-xs">
                  <span className="capitalize font-bold text-foreground">{t.section} · {t.test_type} test</span>
                  <span className="text-muted-foreground font-mono">{t.status === "completed" ? `${t.score}/${t.total} (${t.percentage}%)` : "In progress"}</span>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InterviewPrep;
