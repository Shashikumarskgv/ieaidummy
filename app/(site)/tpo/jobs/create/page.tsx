"use client";

import React, { useEffect, useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Briefcase, 
  ArrowLeft, 
  Save, 
  Award, 
  Info, 
  CheckCircle2, 
  Loader2, 
  Sparkles, 
  Layers, 
  BookOpen, 
  Building, 
  MapPin, 
  Code2, 
  Percent, 
  GraduationCap 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import JobsService from "@/services/jobs.service";
import { fetchAcademicCatalog, AcademicCatalogItem } from "@/services/college.service";

function CreateJobFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobIdParam = searchParams.get("id");
  const isEditing = !!jobIdParam;

  const [loading, setLoading] = useState(isEditing);
  const [formSaving, setFormSaving] = useState(false);
  const [catalog, setCatalog] = useState<AcademicCatalogItem[]>([]);

  // Form Fields
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [applyLink, setApplyLink] = useState("");
  const [employmentType, setEmploymentType] = useState("Full-time");
  const [experienceLevel, setExperienceLevel] = useState("Entry-Level");
  const [description, setDescription] = useState("");

  // 3 Requested New Fields
  const [academicsPercentage, setAcademicsPercentage] = useState<string>("");
  const [skillsStr, setSkillsStr] = useState<string>("");
  const [ieaiPerformancePercentage, setIeaiPerformancePercentage] = useState<string>("");

  // Eligibility Fields
  const [eligibleProgramLevel, setEligibleProgramLevel] = useState("");
  const [eligibleDegree, setEligibleDegree] = useState("");
  const [eligibleDepts, setEligibleDepts] = useState<string[]>([]);

  // Info Icon Hover Tooltip State
  const [showIeaiInfo, setShowIeaiInfo] = useState(false);

  const loadCatalog = async () => {
    try {
      const cat = await fetchAcademicCatalog();
      setCatalog(cat || []);
    } catch (e) {
      console.warn("Failed to load academic catalog:", e);
    }
  };

  const loadJobData = async () => {
    if (!isEditing || !jobIdParam) return;
    setLoading(true);
    try {
      const res = await JobsService.getTPOJobs();
      const allJobs = res.data?.data || [];
      const job = allJobs.find((j: any) => String(j.id) === String(jobIdParam));
      if (job) {
        setRole(job.role || "");
        setCompany(job.company || "");
        setLocation(job.location || "");
        setCategory(job.category || "");
        setApplyLink(job.apply_link || "");
        setEmploymentType(job.employment_type || "Full-time");
        setExperienceLevel(job.experience_level || "Entry-Level");
        setDescription(job.description || "");

        setAcademicsPercentage(job.academics_percentage !== undefined && job.academics_percentage !== null ? String(job.academics_percentage) : "");
        setSkillsStr(Array.isArray(job.skills) ? job.skills.join(", ") : (job.skills || ""));
        setIeaiPerformancePercentage(job.ieai_performance_percentage !== undefined && job.ieai_performance_percentage !== null ? String(job.ieai_performance_percentage) : "");

        setEligibleProgramLevel(job.program_level || "");
        setEligibleDegree(job.degree || "");
        setEligibleDepts(Array.isArray(job.departments) ? job.departments : []);
      } else {
        toast.error("Job posting record not found.");
      }
    } catch {
      toast.error("Failed to load job details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCatalog();
    if (isEditing) {
      loadJobData();
    }
  }, [jobIdParam]);

  // Extract levels, degrees and departments from catalog
  const getLevels = (): { id: string; name: string }[] => {
    const list: { id: string; name: string }[] = [];
    const seen = new Set<string>();
    
    catalog.forEach(inst => {
      inst.levels?.forEach(lvl => {
        const id = lvl.id.toUpperCase();
        if (!seen.has(id)) {
          seen.add(id);
          list.push({ id, name: lvl.name });
        }
      });
    });

    if (list.length === 0) {
      return [
        { id: "UG", name: "Undergraduate (UG)" },
        { id: "PG", name: "Postgraduate (PG)" },
        { id: "DIPLOMA", name: "Diploma" },
        { id: "INTEGRATED DEGREE", name: "Integrated Degree" }
      ];
    }
    return list;
  };

  const getDegrees = (): { id: string; name: string }[] => {
    if (!eligibleProgramLevel) return [];
    const list: { id: string; name: string }[] = [];
    const seen = new Set<string>();

    catalog.forEach(inst => {
      inst.levels?.forEach(lvl => {
        if (lvl.id.toUpperCase() === eligibleProgramLevel.toUpperCase()) {
          lvl.degrees?.forEach(deg => {
            const key = deg.id.toUpperCase();
            if (!seen.has(key)) {
              seen.add(key);
              list.push({ id: deg.id, name: deg.name });
            }
          });
        }
      });
    });

    return list;
  };

  const getDepartments = (): string[] => {
    if (!eligibleProgramLevel || !eligibleDegree) return [];
    const list: string[] = [];
    const seen = new Set<string>();

    catalog.forEach(inst => {
      inst.levels?.forEach(lvl => {
        if (lvl.id.toUpperCase() === eligibleProgramLevel.toUpperCase()) {
          lvl.degrees?.forEach(deg => {
            if (deg.id.toLowerCase() === eligibleDegree.toLowerCase()) {
              deg.departments?.forEach(dept => {
                if (!seen.has(dept)) {
                  seen.add(dept);
                  list.push(dept);
                }
              });
            }
          });
        }
      });
    });

    return list;
  };

  const availableDegrees = getDegrees();
  const availableDepts = getDepartments();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role.trim() || !company.trim()) {
      toast.error("Role name and company name are required.");
      return;
    }
    if (!eligibleProgramLevel || !eligibleDegree || eligibleDepts.length === 0) {
      toast.error("Please configure eligibility rules (Program level, Degree, and at least one Department).");
      return;
    }

    setFormSaving(true);
    const parsedSkills = skillsStr.split(",").map(s => s.trim()).filter(Boolean);
    const payload = {
      role: role.trim(),
      company: company.trim(),
      location: location.trim(),
      category: category.trim(),
      apply_link: applyLink.trim(),
      employment_type: employmentType,
      experience_level: experienceLevel,
      description: description.trim(),
      status: "published",
      program_level: eligibleProgramLevel,
      degree: eligibleDegree,
      departments: eligibleDepts,

      // 3 Requested New Fields
      academics_percentage: academicsPercentage !== "" ? Number(academicsPercentage) : null,
      skills: parsedSkills,
      ieai_performance_percentage: ieaiPerformancePercentage !== "" ? Number(ieaiPerformancePercentage) : null
    };

    try {
      if (isEditing && jobIdParam) {
        await JobsService.updateJob(Number(jobIdParam), payload);
        toast.success("Job posting updated successfully.");
      } else {
        await JobsService.createJob(payload);
        toast.success("Job posting created successfully.");
      }
      router.push("/tpo/jobs");
    } catch {
      toast.error("Failed to save job posting.");
    } finally {
      setFormSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-muted-foreground min-h-[400px]">
        <Loader2 className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4 text-primary" />
        <span className="text-sm font-semibold">Loading job posting form...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-20 max-w-5xl mx-auto">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="space-y-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/tpo/jobs")}
            className="text-xs text-muted-foreground hover:text-foreground pl-0 flex items-center gap-1.5 h-7 mb-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Job Postings</span>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Briefcase className="w-7 h-7 text-primary shrink-0" />
            <span>{isEditing ? "Edit Job Posting" : "Post a New Job Opportunity"}</span>
          </h1>
          <p className="text-xs text-muted-foreground">
            Configure job specifications, academic percentage criteria, required skill set, and IEAI performance requirements.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card 1: Primary Recruitment Details */}
        <Card className="bg-card border-border shadow-xs">
          <CardHeader className="pb-3 border-b border-border/60">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Building className="w-5 h-5 text-primary" />
              <span>Job & Company Specifications</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Role name, company details, employment contract, and location settings.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="font-bold">Role Name *</Label>
                <Input
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Software Development Engineer (SDE)"
                  className="rounded-xl text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-bold">Company Name *</Label>
                <Input
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Microsoft, Google, Infosys"
                  className="rounded-xl text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label>Job Location</Label>
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Remote, Hyderabad, Bangalore"
                  className="rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label>Job Category</Label>
                <Input
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. SDE, Data Science, AI/ML"
                  className="rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label>Employment Type</Label>
                <Select value={employmentType} onValueChange={setEmploymentType}>
                  <SelectTrigger className="rounded-xl text-xs">
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Full-time">Full-time</SelectItem>
                    <SelectItem value="Part-time">Part-time</SelectItem>
                    <SelectItem value="Internship">Internship</SelectItem>
                    <SelectItem value="Contract">Contract</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Experience Level</Label>
                <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                  <SelectTrigger className="rounded-xl text-xs">
                    <SelectValue placeholder="Select Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Entry-Level">Entry-Level</SelectItem>
                    <SelectItem value="Mid-Level">Mid-Level</SelectItem>
                    <SelectItem value="Senior-Level">Senior-Level</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <Label>External Application Link (Optional)</Label>
                <Input
                  value={applyLink}
                  onChange={(e) => setApplyLink(e.target.value)}
                  placeholder="https://careers.company.com/job/12345"
                  className="rounded-xl text-xs"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: 3 Requested New Requirement Fields */}
        <Card className="bg-gradient-to-r from-primary/5 via-card to-card border-primary/20 shadow-xs">
          <CardHeader className="pb-3 border-b border-border/60">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <span>Academic & Student Performance Criteria (3 Required Fields)</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Configure minimum academics percentage, comma-separated skill set, and student IEAI performance evaluation criteria.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-5 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* FIELD 1: Academics Percentage */}
              <div className="space-y-1.5 bg-card p-3.5 rounded-2xl border border-border/70 shadow-2xs">
                <Label className="font-bold flex items-center gap-1.5 text-xs">
                  <Percent className="w-4 h-4 text-emerald-500" />
                  <span>1. Academics Percentage (%)</span>
                </Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={academicsPercentage}
                  onChange={(e) => setAcademicsPercentage(e.target.value)}
                  placeholder="e.g. 60, 70, 75"
                  className="rounded-xl text-xs h-9.5"
                />
                <span className="text-[11px] text-muted-foreground block font-medium">
                  Minimum overall aggregate academic percentage required for candidate consideration.
                </span>
              </div>

              {/* FIELD 2: Comma Separated Skill Set */}
              <div className="space-y-1.5 bg-card p-3.5 rounded-2xl border border-border/70 shadow-2xs md:col-span-2">
                <Label className="font-bold flex items-center gap-1.5 text-xs">
                  <Code2 className="w-4 h-4 text-blue-500" />
                  <span>2. Required Skill Set (Comma Separated)</span>
                </Label>
                <Input
                  type="text"
                  value={skillsStr}
                  onChange={(e) => setSkillsStr(e.target.value)}
                  placeholder="e.g. React, Node.js, Python, SQL, Java, TypeScript"
                  className="rounded-xl text-xs h-9.5"
                />
                <span className="text-[11px] text-muted-foreground block font-medium">
                  Specify all required technical and domain skills separated by commas.
                </span>
              </div>

              {/* FIELD 3: Student Performance in IEAI (%) with Hover Info Icon */}
              <div className="space-y-1.5 bg-card p-3.5 rounded-2xl border border-primary/30 shadow-2xs md:col-span-3">
                <div className="flex items-center justify-between">
                  <Label className="font-bold flex items-center gap-1.5 text-xs text-foreground">
                    <Award className="w-4 h-4 text-indigo-500" />
                    <span>3. Student Performance in IEAI (%)</span>
                    
                    {/* Hover Info Icon */}
                    <div 
                      className="relative inline-block"
                      onMouseEnter={() => setShowIeaiInfo(true)}
                      onMouseLeave={() => setShowIeaiInfo(false)}
                    >
                      <Info className="w-4 h-4 text-indigo-500 cursor-pointer hover:text-indigo-600 transition-colors" />
                      
                      {showIeaiInfo && (
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 z-50 w-80 p-3.5 rounded-2xl bg-foreground text-background shadow-xl text-[11px] leading-relaxed border border-border animate-in fade-in duration-150">
                          <p className="font-bold text-xs mb-1 text-primary flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5" /> IEAI Performance Score (4 Factors)
                          </p>
                          <p>
                            This student percentage is calculated based on 4 equal factors (Total 100%):
                          </p>
                          <ul className="list-disc list-inside mt-1 space-y-0.5 font-medium opacity-90">
                            <li><strong>1. Total Attempts Progress</strong></li>
                            <li><strong>2. Exam Pass Rate (%)</strong></li>
                            <li><strong>3. Average Exam Score (%)</strong></li>
                            <li><strong>4. Proctor Integrity Score (%)</strong></li>
                          </ul>
                          <p className="mt-1.5 text-[10px] opacity-75 font-mono">
                            Formula: (Attempts + Pass Rate + Avg Score + Integrity Score) / 4 = Overall IEAI %
                          </p>
                        </div>
                      )}
                    </div>
                  </Label>
                  <span className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider">4 Factors Combined</span>
                </div>

                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={ieaiPerformancePercentage}
                    onChange={(e) => setIeaiPerformancePercentage(e.target.value)}
                    placeholder="e.g. 60"
                    className="rounded-xl text-xs h-9.5 max-w-xs font-bold text-foreground"
                  />
                  <span className="text-xs text-muted-foreground font-semibold">
                    Minimum aggregate percentage required across all 4 student report factors.
                  </span>
                </div>

                {/* Banner explaining the 4 factors */}
                <div className="p-3 bg-muted/40 rounded-xl border border-border/60 text-xs text-muted-foreground space-y-1 mt-2">
                  <span className="font-bold text-foreground flex items-center gap-1 text-[11px]">
                    <Info className="w-3.5 h-3.5 text-indigo-500" />
                    <span>How Student IEAI Percentage is Calculated:</span>
                  </span>
                  <p className="text-[11px] leading-relaxed">
                    Each student's performance contains 4 core analytics metrics from their report: 
                    <strong className="text-foreground"> Total Attempts (100% completion)</strong>, 
                    <strong className="text-emerald-600"> Pass Rate (%)</strong>, 
                    <strong className="text-foreground"> Average Score (%)</strong>, and 
                    <strong className="text-indigo-600"> Integrity Score (%)</strong>. 
                    These 4 factors total 100% equal weighting to calculate the student's overall IEAI progress percentage.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Academic Eligibility Rules */}
        <Card className="bg-card border-border shadow-xs">
          <CardHeader className="pb-3 border-b border-border/60">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-primary" />
              <span>Academic Eligibility & Department Allocation</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Select program level, degree, and eligible department branches.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Program Level Select */}
              <div className="space-y-1.5">
                <Label className="font-bold">Program Level *</Label>
                <Select
                  value={eligibleProgramLevel}
                  onValueChange={(val) => {
                    setEligibleProgramLevel(val);
                    setEligibleDegree("");
                    setEligibleDepts([]);
                  }}
                >
                  <SelectTrigger className="rounded-xl text-xs">
                    <SelectValue placeholder="Select Program Level" />
                  </SelectTrigger>
                  <SelectContent>
                    {getLevels().map((l) => (
                      <SelectItem key={l.id} value={l.id}>
                        {l.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Degree Select */}
              <div className="space-y-1.5">
                <Label className="font-bold">Degree / Program *</Label>
                <Select
                  value={eligibleDegree}
                  onValueChange={(val) => {
                    setEligibleDegree(val);
                    setEligibleDepts([]);
                  }}
                  disabled={!eligibleProgramLevel}
                >
                  <SelectTrigger className="rounded-xl text-xs">
                    <SelectValue placeholder="Select Degree" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDegrees.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Department Checkboxes */}
              <div className="sm:col-span-2 space-y-1.5">
                <Label className="font-bold">Eligible Departments / Branches *</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 bg-muted/40 p-3.5 rounded-2xl border border-border/60 max-h-56 overflow-y-auto">
                  {availableDepts.map((dept) => (
                    <label key={dept} className="flex items-center gap-2 text-xs font-semibold cursor-pointer hover:text-primary transition-colors p-1 rounded-lg">
                      <input
                        type="checkbox"
                        checked={eligibleDepts.includes(dept)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setEligibleDepts([...eligibleDepts, dept]);
                          } else {
                            setEligibleDepts(eligibleDepts.filter((d) => d !== dept));
                          }
                        }}
                        className="rounded border-input text-primary focus:ring-primary h-3.5 w-3.5"
                      />
                      <span>{dept}</span>
                    </label>
                  ))}
                  {availableDepts.length === 0 && (
                    <p className="text-xs text-muted-foreground italic col-span-3 py-2">
                      Please select a Program Level and Degree first to view available department branches.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Job Description */}
        <Card className="bg-card border-border shadow-xs">
          <CardHeader className="pb-3 border-b border-border/60">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              <span>Job Description & Responsibilities</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-5">
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed job roles, responsibilities, compensation breakdown, and interview selection process..."
              rows={5}
              className="rounded-2xl text-xs resize-none"
            />
          </CardContent>
        </Card>

        {/* Footer Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/tpo/jobs")}
            disabled={formSaving}
            className="rounded-xl text-xs font-semibold h-10 px-5"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={formSaving}
            className="rounded-xl text-xs font-bold bg-primary text-primary-foreground h-10 px-6 shadow-sm flex items-center gap-2"
          >
            {formSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Job Posting...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{isEditing ? "Update Job Posting" : "Publish Job Posting"}</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function CreateJobPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center p-20 text-muted-foreground min-h-[400px]">
        <Loader2 className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4 text-primary" />
        <span className="text-sm font-semibold">Loading Job Creation Page...</span>
      </div>
    }>
      <CreateJobFormContent />
    </Suspense>
  );
}
