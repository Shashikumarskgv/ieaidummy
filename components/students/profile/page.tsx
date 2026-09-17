import React, { useState, useEffect } from "react";
import { User, Save, Award, Briefcase, GraduationCap, CheckCircle, FileText, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { StudentProfileData } from "../types";
import { Loader2 } from "lucide-react";
import PersonalInfoForm from "./components/PersonalInfoForm";
import AcademicInfoForm from "./components/AcademicInfoForm";
import CareerInfoForm from "./components/CareerInfoForm";
import ProfileService from "@/services/profile.service";
import AuthService from "@/services/auth.service";

// Default pre-populated values matching the tbl_users database schema

export default function StudentProfile() {
  const [profile, setProfile] = useState<StudentProfileData>({
    id: 0,
    roll_number: "",
    first_name: "",
    last_name: "",
    name: "",
    email: "",
    mobile: "",
    contact_number: "",
    gender: "",
    dob: "",
    address: "",
    profile_photo: "",
    college: "",
    department: "",
    year_of_study: "",
    batch_code: "",
    target_role: "",
    skills: [],
    academic_details: [],
    projects: [],
    resume_url: "",
    experience: 0,
    placement_status: "Eligible",
    interview_status: "None",
    earned_points: 0,
    working_type: "Onsite"
  });
  const [activeTab, setActiveTab] = useState("personal");
  const [saving, setSaving] = useState(false);
  const user = AuthService.getCurrentUser();

  const loadProfile = async () => {
    try {
      const res = await ProfileService.getById(user.id);
      const rawData = res.data?.data || res.data || {};

      // Parse skills
      let parsedSkills: string[] = [];
      try {
        if (rawData.skills) {
          if (typeof rawData.skills === "string") {
            const parsed = JSON.parse(rawData.skills);
            parsedSkills = Array.isArray(parsed) ? parsed : JSON.parse(parsed);
          } else if (Array.isArray(rawData.skills)) {
            parsedSkills = rawData.skills;
          }
        }
      } catch {
        parsedSkills = [];
      }

      // Parse academic details
      let parsedAcademic: any[] = [];
      try {
        if (rawData.academic_details) {
          if (typeof rawData.academic_details === "string") {
            const parsed = JSON.parse(rawData.academic_details);
            parsedAcademic = Array.isArray(parsed) ? parsed : [];
          } else if (Array.isArray(rawData.academic_details)) {
            parsedAcademic = rawData.academic_details;
          }
        }
      } catch {
        parsedAcademic = [];
      }

      // Parse languages
      let parsedLanguages: string[] = [];
      try {
        if (rawData.languages) {
          if (typeof rawData.languages === "string") {
            const parsed = JSON.parse(rawData.languages);
            parsedLanguages = Array.isArray(parsed) ? parsed : (typeof parsed === "string" ? JSON.parse(parsed) : []);
          } else if (Array.isArray(rawData.languages)) {
            parsedLanguages = rawData.languages;
          }
        }
      } catch {
        parsedLanguages = [];
      }

      // Deduplicate academic qualifications by degree type/level to prevent duplicate cards
      const uniqueAcademic: any[] = [];
      const seenTypes = new Set<string>();
      for (const item of parsedAcademic) {
        const levelKey = String(item.type || "Graduation").trim().toLowerCase();
        if (!seenTypes.has(levelKey)) {
          seenTypes.add(levelKey);
          uniqueAcademic.push(item);
        }
      }
      parsedAcademic = uniqueAcademic;

      // Prepopulate default Graduation item if empty
      if (parsedAcademic.length === 0 && (rawData.college || rawData.department)) {
        parsedAcademic = [
          {
            id: "edu_default_1",
            type: "Graduation",
            institution: rawData.college || "My Institution",
            course: rawData.department || "B.Tech",
            score: "8.5 CGPA",
            start_year: "2023",
            end_year: "2027",
            roll_number: rawData.roll_number || ""
          }
        ];
      }

      const userData: StudentProfileData = {
        id: rawData.id ?? 0,
        roll_number: rawData.roll_number ?? "",
        first_name: rawData.first_name ?? "",
        last_name: rawData.last_name ?? "",
        name: rawData.name ?? "",
        email: rawData.email ?? "",
        mobile: rawData.mobile ?? "",
        contact_number: rawData.contact_number ?? "",
        gender: rawData.gender ?? "",
        dob: rawData.dob ?? "",
        address: rawData.address ?? "",
        profile_photo: rawData.profile_photo ?? "",
        college: rawData.college ?? "",
        department: rawData.department ?? "",
        year_of_study: rawData.year_of_study ?? "",
        batch_code: rawData.batch_code ?? "",
        target_role: rawData.target_role ?? "",
        skills: parsedSkills,
        languages: parsedLanguages,
        preferred_location: rawData.preferred_location ?? "",
        academic_details: parsedAcademic,
        projects: Array.isArray(rawData.projects) ? rawData.projects : [],
        resume_url: rawData.resume_url ?? "",
        experience: rawData.experience ?? 0,
        placement_status: rawData.placement_status ?? "Eligible",
        interview_status: rawData.interview_status ?? "None",
        earned_points: rawData.earned_points ?? 0,
        working_type: rawData.working_type ?? "Onsite",
        description: rawData.description ?? "",
        designation: rawData.designation ?? "",
        company: rawData.company ?? "",
        linkedin_url: rawData.linkedin_url ?? "",
        github_url: rawData.github_url ?? "",
        portfolio_url: rawData.portfolio_url ?? "",
        weak_areas: rawData.weak_areas ?? "",
        profile_completion: Number(rawData.profile_completion) || 100,
        current_semester: rawData.current_semester ?? ""
      };

      setProfile(userData);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load profile");
    }
  };

  // Load from local storage on mount
  useEffect(() => {
    loadProfile();
  }, []);

  // Update specific fields in parent state
  const handleFieldChange = (updates: Partial<StudentProfileData>) => {
    setProfile(prev => ({
      ...prev,
      ...updates
    }));
  };


  // Use profile completion percentage (100% complete)
  const completionPct = profile.profile_completion ?? 100;

  // Save profile mock
  const handleSaveProfile = async (
    e?: React.FormEvent
  ) => {
    if (e) e.preventDefault();

    try {
      setSaving(true);

      await ProfileService.update(
        user.id,
        {
          ...profile,
          profile_completion: 100,
          skills: JSON.stringify(profile.skills || []),
          academic_details: JSON.stringify(profile.academic_details || [])
        }
      );

      // Reload profile to get updated completion percentage from backend
      await loadProfile();

      toast.success(
        "Profile updated successfully"
      );
    } catch {
      toast.error(
        "Failed to update profile"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">

      {/* Header and Save Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-sans flex items-center gap-2">
            <User className="w-8 h-8 text-primary shrink-0" />
            <span>My Profile</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Update your academic milestones, bio, contact details, and placement preference.
          </p>
        </div>
        <div className="shrink-0">
          <Button
            onClick={handleSaveProfile}
            disabled={saving}
            className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-1.5 rounded-xl text-xs font-semibold px-5 h-10 shadow-sm transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Saving..." : "Save Profile"}</span>
          </Button>
        </div>
      </div>

      {/* Main Profile Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        {/* Left Column: Visual Card Summary */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-5">
          <div className="flex flex-col items-center text-center space-y-3.5 pb-4 border-b border-border">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-primary bg-muted flex items-center justify-center shadow-sm">
              {profile.profile_photo ? (
                <img
                  src={profile.profile_photo}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-10 h-10 text-muted-foreground" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-foreground text-base capitalize">{profile.name}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{profile.email}</p>
              {profile.roll_number && (
                <span className="inline-block mt-2 font-mono text-[10px] bg-muted px-2 py-0.5 rounded text-muted-foreground">
                  {profile.roll_number}
                </span>
              )}
            </div>
          </div>

          {/* Placement / Interview Badges */}
          <div className="grid grid-cols-2 gap-2 text-center text-xs">
            <div className="bg-muted/40 p-2.5 rounded-xl border border-border/40">
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block">Placement</span>
              <span className="inline-block mt-1.5 font-bold text-primary">{profile.placement_status}</span>
            </div>
            <div className="bg-muted/40 p-2.5 rounded-xl border border-border/40">
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block">Interview</span>
              <span className="inline-block mt-1.5 font-bold text-amber-500">{profile.interview_status}</span>
            </div>
          </div>

          {/* Earned Points Audit */}
          <div className="flex items-center justify-between p-3.5 bg-primary/5 border border-primary/10 rounded-xl">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-primary shrink-0" />
              <span className="text-xs font-semibold text-muted-foreground">LMS Earned Points</span>
            </div>
            <span className="text-sm font-bold text-primary">{profile.earned_points} pts</span>
          </div>

          {/* Dynamic Completion Tracker */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground px-1">
              <span>Profile Completion</span>
              <span className="text-primary">{completionPct}%</span>
            </div>
            <Progress value={completionPct} className="h-1.5 bg-muted rounded-full" />
            <p className="text-[10px] text-muted-foreground leading-relaxed px-1">
              {completionPct >= 100
                ? "🎉 Profile Completed! You can now access Interview Preparation."
                : "💡 Complete your profile to unlock Interview Preparation."}
            </p>
          </div>
        </div>

        {/* Right Column: Dynamic Form Fields Tabbed Area */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-muted/60 p-1 rounded-xl border border-border/40">
              <TabsTrigger value="personal" className="rounded-lg text-xs font-semibold py-2 transition-all flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                <span>Personal</span>
              </TabsTrigger>
              <TabsTrigger value="academic" className="rounded-lg text-xs font-semibold py-2 transition-all flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Academic</span>
              </TabsTrigger>
              <TabsTrigger value="career" className="rounded-lg text-xs font-semibold py-2 transition-all flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5" />
                <span>Career</span>
              </TabsTrigger>
            </TabsList>

            <div className="mt-5 bg-card p-6 border border-border rounded-2xl shadow-sm">
              <TabsContent value="personal" className="mt-0">
                <PersonalInfoForm
                  data={profile}
                  onChange={handleFieldChange}
                />
              </TabsContent>

              <TabsContent value="academic" className="mt-0">
                <AcademicInfoForm
                  data={profile}
                  onChange={handleFieldChange}
                />
              </TabsContent>

              <TabsContent value="career" className="mt-0">
                <CareerInfoForm
                  data={profile}
                  onChange={handleFieldChange}
                />
              </TabsContent>
            </div>
          </Tabs>

          {/* Form Save Button (Aligns with bottom form layout) */}
          <div className="flex justify-end pt-2">
            <Button
              onClick={handleSaveProfile}
              disabled={saving}
              className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-1.5 rounded-xl text-xs font-semibold px-6 h-11 shadow-sm transition-all"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Save Profile</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
