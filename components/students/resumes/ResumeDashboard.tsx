import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Plus, Trash2, ArrowRight, FileText, Calendar, Sparkles, CheckCircle2,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import api from "@/lib/api";
import { 
  MOCK_TEMPLATES,
  ResumeData 
} from "./templates";

const ROLE_PRESETS = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Java Developer",
  "Python Developer",
  "Data Analyst",
  "DevOps"
];

const TEMPLATE_CATEGORIES = [
  "All",
  "Professional",
  "Modern",
  "Minimal",
  "Executive",
  "Student",
  "Creative"
];

type ResumeApiItem = ResumeData | { data: ResumeData };

export default function ResumeDashboard() {
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<ResumeData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Wizard modal state
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardData, setWizardData] = useState({
    title: "",
    targetRole: "",
    experienceLevel: "Fresher" as "Fresher" | "Junior" | "Senior",
    country: "India"
  });
  const [selectedTemplate, setSelectedTemplate] = useState<ResumeData | null>(null);

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const res = await api.get("/student/resumes");
        if (res.data && res.data.success && Array.isArray(res.data.data)) {
          const fetched = res.data.data.map((item: ResumeApiItem) =>
            "data" in item ? item.data : item
          );
          setResumes(fetched);
          localStorage.setItem("dq_user_resumes", JSON.stringify(fetched));
          return;
        }
      } catch (err) {
        console.warn("Backend resumes API fetch offline, using local cache:", err);
      }
      const saved = localStorage.getItem("dq_user_resumes");
      if (saved) {
        try { setResumes(JSON.parse(saved)); } catch { setResumes([]); }
      }
    };
    fetchResumes();
  }, []);

  const saveResumes = async (updated: ResumeData[]) => {
    setResumes(updated);
    localStorage.setItem("dq_user_resumes", JSON.stringify(updated));
  };

  const handleOpenWizard = (rolePreset?: string, template?: ResumeData) => {
    setSelectedTemplate(template || null);
    const templateRole = template && ROLE_PRESETS.includes(template.jobTitle)
      ? template.jobTitle
      : undefined;
    const targetRole = rolePreset || templateRole || "Frontend Developer";
    setWizardData({
      title: template ? `${template.title} Copy` : rolePreset ? `${rolePreset} Resume` : "My New Resume",
      targetRole,
      experienceLevel: "Fresher",
      country: "India"
    });
    setIsWizardOpen(true);
  };

  const handleCloseWizard = () => {
    setIsWizardOpen(false);
  };

  const handleCreateResume = () => {
    if (!wizardData.title.trim()) {
      toast.error("Please enter a resume title");
      return;
    }

    const newResume: ResumeData = {
      id: `res_${Date.now()}`,
      title: wizardData.title,
      fullName: "Your Name",
      jobTitle: wizardData.targetRole,
      email: "email@domain.com",
      phone: "+91 00000 00000",
      website: "myportfolio.dev",
      location: `City, ${wizardData.country}`,
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120",
      professionalSummary: `Dedicated ${wizardData.targetRole} seeking professional growth. Proficient in web architectures and design patterns.`,
      employmentHistory: [],
      education: [],
      skills: wizardData.targetRole === "Data Analyst" ? ["Python", "SQL", "Pandas"] : ["React", "JavaScript", "TypeScript"],
      hobbies: [],
      styles: selectedTemplate ? { ...selectedTemplate.styles } : {
        fontFamily: "Outfit",
        primaryColor: "#2563eb",
        fontSize: "14px",
        alignment: "left",
        layout: "single"
      },
      targetRole: wizardData.targetRole,
      experienceLevel: wizardData.experienceLevel,
      country: wizardData.country,
      completionPercent: 35,
      atsScore: 48,
      projects: [],
      achievements: [],
      certifications: [],
      technicalSkills: wizardData.targetRole === "Data Analyst" ? ["Python", "SQL", "Pandas"] : ["React", "JavaScript", "TypeScript"],
      softSkills: ["Problem Solving", "Teamwork"],
      languages: ["English"]
    };

    const updated = [newResume, ...resumes];
    saveResumes(updated);
    toast.success("New resume initialized via wizard!");
    setIsWizardOpen(false);
    navigate(`/dashboard/resumes/edit/${newResume.id}`);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this resume?")) return;
    const updated = resumes.filter((r) => r.id !== id);
    saveResumes(updated);
    toast.success("Resume deleted.");
  };

  // Filter templates mock representation mapping category tag
  const filteredTemplates = MOCK_TEMPLATES.filter((temp) => {
    if (selectedCategory === "All") return true;
    // Map layouts to categories for mock variation
    if (selectedCategory === "Minimal" && temp.styles.fontFamily === "Geist") return true;
    if (selectedCategory === "Modern" && temp.styles.fontFamily === "Inter") return true;
    if (selectedCategory === "Creative" && temp.styles.fontFamily === "Playfair Display") return true;
    if (selectedCategory === "Professional") return temp.styles.layout === "double";
    return temp.id.includes(selectedCategory.toLowerCase()) || temp.jobTitle.includes(selectedCategory);
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header and Hero Block */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border border-primary/20 rounded-3xl p-6 relative overflow-hidden shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-1.5 z-10">
          <span className="text-[10px] font-extrabold tracking-wider bg-primary/10 text-primary px-2.5 py-0.5 rounded-full uppercase">
            Resume Hub
          </span>
          <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-2 pt-1">
            <Sparkles className="w-7 h-7 text-primary" /> Build a Job-Winning Resume
          </h1>
          <p className="text-sm text-muted-foreground max-w-xl">
            Design professional resumes optimized with live ATS scoring engines, AI-assisted summaries, and targeted career track alignments.
          </p>
        </div>
        <Button 
          onClick={() => handleOpenWizard()}
          className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold rounded-xl text-xs px-6 py-3 shadow-md flex items-center gap-1.5 shrink-0 z-10"
        >
          <Plus className="w-4.5 h-4.5 stroke-[3]" />
          <span>Create Resume</span>
        </Button>
      </div>

      {/* Resume Progress List */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-foreground">Continue Editing</h2>
            <p className="text-xs text-muted-foreground">Resume drafts with live completion rates and ATS indices</p>
          </div>
        </div>

        {resumes.length === 0 ? (
          <div className="bg-card border border-border rounded-3xl p-12 text-center text-muted-foreground text-sm font-medium shadow-sm max-w-md mx-auto">
            <FileText className="w-10 h-10 mx-auto mb-3 text-muted-foreground/60" />
            <p className="font-bold text-foreground mb-1">No drafts found</p>
            <p className="text-xs text-muted-foreground mb-4">Start by creating a new blank resume or choosing a template</p>
            <Button onClick={() => handleOpenWizard()} size="sm" className="rounded-xl text-xs font-bold">
              Launch Creator Wizard
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {resumes.map((res) => {
              const compVal = res.completionPercent ?? 50;
              const atsVal = res.atsScore ?? 65;
              
              // Color tags based on scores
              const getAtsColor = (score: number) => {
                if (score >= 90) return "text-green-500 bg-green-500/10 border-green-500/20";
                if (score >= 70) return "text-amber-500 bg-amber-500/10 border-amber-500/20";
                return "text-red-500 bg-red-500/10 border-red-500/20";
              };

              return (
                <Card 
                  key={res.id}
                  onClick={() => navigate(`/dashboard/resumes/edit/${res.id}`)}
                  className="border-border/60 overflow-hidden shadow-sm hover:shadow-md cursor-pointer hover:border-primary/40 transition-all duration-300 group flex flex-col justify-between"
                >
                  <CardContent className="p-5 space-y-4 flex-1">
                    <div className="flex justify-between items-start gap-2">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded border ${getAtsColor(atsVal)}`}>
                          ATS: {atsVal}
                        </span>
                        <button 
                          onClick={(e) => handleDelete(res.id, e)}
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 p-1.5 rounded-lg transition-all"
                          title="Delete Resume"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-bold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                        {res.title}
                      </h4>
                      <p className="text-xs text-muted-foreground truncate">{res.fullName}</p>
                      <span className="inline-block text-[10px] bg-muted px-2 py-0.5 rounded font-bold text-muted-foreground mt-1">
                        {res.jobTitle}
                      </span>
                    </div>

                    {/* Progress details */}
                    <div className="space-y-1.5 border-t border-border/60 pt-3">
                      <div className="flex justify-between items-center text-[10px] text-muted-foreground font-bold">
                        <span>Profile Completion</span>
                        <span>{compVal}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-primary h-1.5 rounded-full transition-all duration-300" 
                          style={{ width: `${compVal}%` }} 
                        />
                      </div>
                    </div>
                  </CardContent>

                  <div className="bg-muted/40 border-t border-border/60 px-5 py-2.5 flex items-center justify-between text-[10px] text-muted-foreground font-semibold">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> Updated recently
                    </span>
                    {compVal === 100 && (
                      <span className="text-emerald-600 flex items-center gap-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Finalized
                      </span>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Role-Specific Resume Creation Fast Panel */}
      <div className="space-y-4 pt-2">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-foreground">Create Role Specific Resume</h2>
          <p className="text-xs text-muted-foreground">Select a targeted track to pre-populate relevant skills matrices</p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {ROLE_PRESETS.map((role) => (
            <button
              key={role}
              onClick={() => handleOpenWizard(role)}
              className="bg-card hover:bg-primary hover:text-primary-foreground border border-border/80 hover:border-primary text-foreground text-xs font-bold px-4 py-2.5 rounded-xl transition-all duration-200 shadow-sm flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>{role}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Templates Section */}
      <div className="space-y-4 pt-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-foreground">Resume Design Templates</h2>
            <p className="text-xs text-muted-foreground">Choose from a variety of layout templates crafted for recruiters</p>
          </div>

          <div className="flex flex-wrap gap-1.5 bg-muted/60 border border-border p-1 rounded-xl">
            {TEMPLATE_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all uppercase tracking-wider ${
                  selectedCategory === cat
                    ? "bg-card text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {filteredTemplates.map((template) => (
            <div 
              key={template.id}
                  onClick={() => handleOpenWizard(undefined, template)}
              className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:border-primary group flex flex-col justify-between h-[210px]"
            >
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-border bg-muted shrink-0">
                    <img src={template.avatar} alt={template.fullName} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-xs text-foreground truncate">{template.fullName}</h4>
                    <p className="text-[10px] text-muted-foreground truncate">{template.jobTitle}</p>
                  </div>
                </div>
                
                <p className="text-[10px] text-muted-foreground line-clamp-3 leading-relaxed mt-2.5 italic">
                  &quot;{template.professionalSummary}&quot;
                </p>

                <div className="mt-3.5 flex items-center gap-1.5">
                  <span className="text-[9px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                    {template.styles.layout} Layout
                  </span>
                  <span className="text-[9px] bg-muted text-muted-foreground font-semibold px-2 py-0.5 rounded">
                    {template.styles.fontFamily}
                  </span>
                </div>
              </div>

              <div className="bg-muted/40 border-t border-border px-5 py-2.5 flex justify-between items-center text-[10px]">
                <span className="font-semibold text-muted-foreground flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" /> High-conversion rates
                </span>
                <span className="font-bold text-primary group-hover:underline flex items-center gap-0.5">
                  Select <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CREATE RESUME WIZARD MODAL DIALOG */}
      {isWizardOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-border/80 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-sm text-foreground">Resume Creation Wizard</h3>
              </div>
              <button 
                onClick={handleCloseWizard}
                className="text-muted-foreground hover:text-foreground font-bold text-xs"
              >
                ✕
              </button>
            </div>
            
            <div className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase text-muted-foreground tracking-wider">
                  Resume Name
                </label>
                <Input
                  value={wizardData.title}
                  onChange={(e) => setWizardData({ ...wizardData, title: e.target.value })}
                  placeholder="e.g. MERN Resume, Frontend Resume"
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase text-muted-foreground tracking-wider">
                  Target Role
                </label>
                <select
                  value={wizardData.targetRole}
                  onChange={(e) => setWizardData({ ...wizardData, targetRole: e.target.value })}
                  className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary font-semibold"
                >
                  {ROLE_PRESETS.map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                  <option value="Java Developer">Java Developer</option>
                  <option value="DevOps Engineer">DevOps Engineer</option>
                  <option value="Cloud Architect">Cloud Architect</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase text-muted-foreground tracking-wider">
                  Experience Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["Fresher", "Junior", "Senior"] as const).map((lvl) => (
                    <Button
                      key={lvl}
                      type="button"
                      variant={wizardData.experienceLevel === lvl ? "default" : "outline"}
                      onClick={() => setWizardData({ ...wizardData, experienceLevel: lvl })}
                      className="text-xs font-bold rounded-xl h-9"
                    >
                      {lvl}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase text-muted-foreground tracking-wider">
                  Country
                </label>
                <Input
                  value={wizardData.country}
                  onChange={(e) => setWizardData({ ...wizardData, country: e.target.value })}
                  placeholder="e.g. India, United States"
                  className="text-xs"
                />
              </div>
            </div>

            <div className="p-4 bg-muted/30 border-t border-border flex justify-end gap-2">
              <Button 
                variant="outline"
                onClick={handleCloseWizard}
                className="rounded-xl font-bold text-xs h-9"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateResume}
                className="bg-primary hover:bg-primary/95 text-primary-foreground rounded-xl font-bold text-xs h-9 px-4"
              >
                Build My Resume
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
