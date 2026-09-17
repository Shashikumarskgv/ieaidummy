"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Briefcase, MapPin, Calendar, Clock, Sparkles, Loader2, ExternalLink, Bookmark, Search, Award, CheckCircle2, BookmarkCheck, ArrowRight, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import JobsService from "@/services/jobs.service";
import ProfileService from "@/services/profile.service";
import AuthService from "@/services/auth.service";
import { toast } from "sonner";

interface Job {
  id: number;
  role: string;
  company: string;
  location: string;
  category: string;
  is_featured: boolean;
  status: string;
  apply_link: string;
  skills: string[];
  employment_type: string;
  experience_level: string;
  description: string;
  program_level: string;
  degree: string;
  departments: string[];
  created_at: string;
  application_status: string | null;
  applied_at: string | null;
}

export default function StudentJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"recommended" | "eligible" | "applied">("recommended");

  const loadData = async () => {
    setLoading(true);
    try {
      const user = AuthService.getCurrentUser();
      if (!user) return;

      const [profileRes, jobsRes] = await Promise.all([
        ProfileService.getById(user.id),
        JobsService.getStudentJobs()
      ]);

      setProfile(profileRes.data?.data || null);
      setJobs(jobsRes.data?.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load jobs portal data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const isProfileComplete = () => {
    if (!profile) return false;
    if (!profile.skills || !profile.department || !profile.joined_course) return false;
    
    let skills: string[] = [];
    try {
      skills = typeof profile.skills === "string" ? JSON.parse(profile.skills) : (profile.skills || []);
    } catch {
      skills = [];
    }
    if (skills.length === 0) return false;

    let academic: any[] = [];
    try {
      academic = typeof profile.academic_details === "string" ? JSON.parse(profile.academic_details) : (profile.academic_details || []);
    } catch {
      academic = [];
    }
    if (academic.length === 0) return false;

    return true;
  };

  const handleApply = async (job: Job) => {
    try {
      if (!job.apply_link) {
        toast.error("External apply link is not available for this job.");
        return;
      }
      
      // Store application in DB
      await JobsService.studentApply(job.id);
      toast.success(`Application registered for ${job.role} at ${job.company}!`);
      
      // Open link in new tab
      window.open(job.apply_link, "_blank");
      
      // Reload jobs to update status in UI
      loadData();
    } catch (err) {
      toast.error("Failed to submit job application.");
    }
  };

  const handleToggleSave = async (jobId: number) => {
    try {
      const res = await JobsService.studentToggleSave(jobId);
      const isSaved = res.data?.data?.saved;
      toast.success(isSaved ? "Job bookmarked!" : "Job bookmark removed.");
      loadData();
    } catch (err) {
      toast.error("Failed to update bookmark.");
    }
  };

  // Recommendations: matches jobs that contain student skills OR match target role
  const getRecommendedJobs = () => {
    if (!profile) return [];
    
    // Parse student skills
    let studentSkills: string[] = [];
    try {
      studentSkills = typeof profile.skills === "string" ? JSON.parse(profile.skills) : (profile.skills || []);
    } catch (e) {
      studentSkills = [];
    }
    const cleanStudentSkills = studentSkills.map(s => s.trim().toLowerCase());
    const studentRole = (profile.target_role || "").trim().toLowerCase();

    return jobs.filter(job => {
      // Must be eligible first (the API already filters eligible ones, but let's double check)
      const matchesRole = studentRole && job.role.toLowerCase().includes(studentRole);
      const matchesSkills = job.skills.some(skill => 
        cleanStudentSkills.includes(skill.trim().toLowerCase())
      );
      
      return matchesRole || matchesSkills;
    });
  };

  const getFilteredJobs = () => {
    let list = jobs;
    if (activeTab === "recommended") {
      list = getRecommendedJobs();
    } else if (activeTab === "applied") {
      list = jobs.filter(j => j.application_status === "applied");
    }

    const term = searchTerm.trim().toLowerCase();
    if (!term) return list;

    return list.filter(j => 
      j.role.toLowerCase().includes(term) ||
      j.company.toLowerCase().includes(term) ||
      j.location.toLowerCase().includes(term) ||
      j.skills.some(s => s.toLowerCase().includes(term))
    );
  };

  const filteredJobs = getFilteredJobs();

  if (!loading && !isProfileComplete()) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300 p-6 max-w-2xl mx-auto text-center mt-12">
        <Card className="border-border/80 shadow-md bg-card p-8 space-y-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
            <Award className="w-8 h-8 animate-pulse" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold tracking-tight text-foreground">Configure Your Academic Profile First</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We match job openings precisely with your graduation program level, degree, department branch, and dynamic tech skills. Complete your academic details to unlock the jobs portal.
            </p>
          </div>
          
          <div className="bg-muted/40 p-4 rounded-xl text-left border border-border/40 space-y-2 max-w-md mx-auto">
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Required Profile Sections:</div>
            <ul className="text-xs font-semibold text-foreground space-y-1.5">
              <li className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${profile?.joined_course ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                <span>Degree & Program Level (e.g. B.Tech UG)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${profile?.department ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                <span>Department / Specialization</span>
              </li>
              <li className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${profile?.skills && profile.skills.length > 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                <span>Skills & Technologies</span>
              </li>
              <li className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${profile?.academic_details && profile.academic_details.length > 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                <span>Academic Records (SSC, UG, PG milestones)</span>
              </li>
            </ul>
          </div>

          <div className="pt-2">
            <Link href="/student/profile">
              <Button className="rounded-xl text-xs font-bold px-6 h-10 shadow-sm flex items-center gap-1.5 bg-primary text-white mx-auto">
                <span>Complete Profile Now</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-sans flex items-center gap-2">
            <Briefcase className="w-8 h-8 text-primary shrink-0" />
            <span>Opportunities Portal</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Access job roles filtered precisely for your academic program level, degree, and department.
          </p>
        </div>
      </div>

      {/* Navigation Tabs and Search */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-3">
          <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border/40 shrink-0">
            <button
              onClick={() => { setActiveTab("recommended"); setSearchTerm(""); }}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                activeTab === "recommended"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Recommended <span className="opacity-70 text-[10px] ml-0.5">({getRecommendedJobs().length})</span>
            </button>
            <button
              onClick={() => { setActiveTab("eligible"); setSearchTerm(""); }}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                activeTab === "eligible"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All Eligible Jobs <span className="opacity-70 text-[10px] ml-0.5">({jobs.length})</span>
            </button>
            <button
              onClick={() => { setActiveTab("applied"); setSearchTerm(""); }}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                activeTab === "applied"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              My Applications <span className="opacity-70 text-[10px] ml-0.5">({jobs.filter(j => j.application_status === "applied").length})</span>
            </button>
          </div>

          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by role, company, or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-card border-border rounded-xl text-xs h-9"
            />
          </div>
        </div>
      </div>

      {/* Jobs list grid */}
      {loading ? (
        <div className="p-16 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="text-xs font-semibold">Scanning available job boards...</span>
        </div>
      ) : filteredJobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredJobs.map((job) => {
            const isApplied = job.application_status === "applied";
            const isSaved = job.application_status === "saved";
            
            return (
              <Card key={job.id} className="border-border/80 hover:border-primary/40 transition-all duration-300 bg-card shadow-sm hover:shadow-md flex flex-col relative overflow-hidden group">
                {job.is_featured && (
                  <div className="absolute top-0 right-0 bg-primary/10 text-primary text-[9px] font-black px-2.5 py-1 rounded-bl-xl border-l border-b border-primary/20 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Featured
                  </div>
                )}
                
                <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    {/* Company and Header row */}
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-wide">{job.company}</div>
                        <h3 className="text-lg font-black text-foreground group-hover:text-primary transition-colors leading-tight">{job.role}</h3>
                      </div>
                      
                      {/* Bookmark button */}
                      <button
                        onClick={() => handleToggleSave(job.id)}
                        className={`p-2 rounded-xl border transition-all ${
                          isSaved 
                            ? "bg-amber-500/10 border-amber-500/30 text-amber-600" 
                            : "hover:bg-muted border-border/80 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <Bookmark className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Metadata tags */}
                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs font-medium text-muted-foreground pt-1">
                      <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {job.location || "Remote / Hybrid"}</span>
                      <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {job.employment_type || "Full-time"}</span>
                      <span className="flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5" /> {job.experience_level || "Entry Level"}</span>
                    </div>

                    {/* Academic Eligibility Badge */}
                    <div className="bg-primary/5 border border-primary/10 p-2.5 rounded-xl text-[10px] space-y-1.5">
                      <div className="font-bold text-primary flex items-center gap-1">
                        <Award className="w-3.5 h-3.5" />
                        <span>Academic Eligibility Mapping:</span>
                      </div>
                      <div className="text-muted-foreground font-semibold flex items-center gap-1.5 flex-wrap">
                        <span className="uppercase bg-background px-1.5 py-0.5 rounded border border-border">{job.program_level || "UG"}</span>
                        <ChevronRight className="w-2.5 h-2.5" />
                        <span className="bg-background px-1.5 py-0.5 rounded border border-border">{job.degree || "B.Tech"}</span>
                        <ChevronRight className="w-2.5 h-2.5" />
                        <span className="bg-background px-1.5 py-0.5 rounded border border-border capitalize truncate max-w-[200px]">{job.departments?.join(", ") || "All Departments"}</span>
                      </div>
                    </div>

                    {/* Job description summary */}
                    {job.description && (
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 pt-1">
                        {job.description}
                      </p>
                    )}
                  </div>

                  {/* Skills required */}
                  <div className="space-y-4 pt-2 border-t border-border/40">
                    {job.skills && job.skills.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Required Skills</span>
                        <div className="flex flex-wrap gap-1.5">
                          {job.skills.map((skill, index) => (
                            <span key={index} className="px-2 py-0.5 bg-muted rounded text-[10px] font-semibold text-muted-foreground border border-border/60">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Apply actions */}
                    <div className="flex items-center justify-between gap-3 pt-2">
                      <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Posted {new Date(job.created_at).toLocaleDateString()}</span>
                      </div>

                      {isApplied ? (
                        <div className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl text-xs font-bold shadow-sm">
                          <CheckCircle2 className="w-4 h-4" /> Applied
                        </div>
                      ) : (
                        <Button 
                          onClick={() => handleApply(job)}
                          className="rounded-xl text-xs font-bold px-4 h-9 shadow-sm flex items-center gap-1.5"
                        >
                          <span>Apply External</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl p-16 text-center space-y-4 max-w-md mx-auto shadow-sm">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
            <Briefcase className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-foreground">No Matching Jobs</h3>
            <p className="text-xs text-muted-foreground">We couldn't find any job postings matching "{searchTerm}" for your academic specialization.</p>
          </div>
        </div>
      )}
    </div>
  );
}
