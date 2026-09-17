import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, X, Award, Briefcase, FileCode } from "lucide-react";
import { StudentProfileData, WorkingType } from "../../types";
import { toast } from "sonner";
import ProjectService from "@/services/projects.service";
import AchievementService from "@/services/achievements.service";
import AuthService from "@/services/auth.service";

interface CareerInfoFormProps {
  data: StudentProfileData;
  onChange: (updates: Partial<StudentProfileData>) => void;
}

export default function CareerInfoForm({ data, onChange }: CareerInfoFormProps) {
  const [skillInput, setSkillInput] = useState("");
  const [langInput, setLangInput] = useState("");
  const [projTitle, setProjTitle] = useState("");
  const [projDesc, setProjDesc] = useState("");
  const [projLink, setProjLink] = useState("");
  const [achTitle, setAchTitle] = useState("");
  const [achDate, setAchDate] = useState("");

  const user = AuthService.getCurrentUser();

  const [projects, setProjects] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);

  useEffect(() => {
    loadProjects();
    loadAchievements();
  }, []);

  const loadProjects = async () => {
    try {
      const res = await ProjectService.getByUserId(user.id);
      setProjects(res.data.data || []);
    } catch {
      toast.error("Failed to load projects");
    }
  };

  const loadAchievements = async () => {
    try {
      const res = await AchievementService.getByUserId(user.id);
      setAchievements(res.data.data || []);
    } catch {
      toast.error("Failed to load achievements");
    }
  };

  const handleAddProject = async () => {
    try {
      if (!projTitle.trim()) {
        toast.error("Project title is required");
        return;
      }

      if (!projDesc.trim()) {
        toast.error("Project description is required");
        return;
      }

      await ProjectService.create({
        user_id: user.id,
        title: projTitle,
        description: projDesc,
        link: projLink || null,
      });

      await loadProjects();

      setProjTitle("");
      setProjDesc("");
      setProjLink("");

      toast.success("Project added");
    } catch {
      toast.error("Failed to add project");
    }
  };

  const handleDeleteProject = async (
    projectId: number
  ) => {
    try {
      await ProjectService.delete(projectId);

      await loadProjects();

      toast.success("Project removed");
    } catch {
      toast.error("Failed to remove project");
    }
  };

  const handleAddAchievement = async () => {
    try {
      if (!achTitle.trim()) {
        toast.error("Achievement title is required");
        return;
      }

      await AchievementService.create({
        user_id: user.id,
        title: achTitle,
        achievement_date: achDate || null,
      });

      await loadAchievements();

      setAchTitle("");
      setAchDate("");

      toast.success("Achievement added");
    } catch {
      toast.error("Failed to add achievement");
    }
  };

  const handleDeleteAchievement = async (
    achievementId: number
  ) => {
    try {
      await AchievementService.delete(
        achievementId
      );

      await loadAchievements();

      toast.success("Achievement removed");
    } catch {
      toast.error("Failed to remove achievement");
    }
  };

  const currentSkills = Array.isArray(data.skills)
    ? data.skills
    : [];


  const currentProjects = projects;
  const currentAchievements = achievements;

  // Add skill to tag list
  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSkill = skillInput.trim();
    if (!cleanSkill) return;

    if (currentSkills.some(s => s.toLowerCase() === cleanSkill.toLowerCase())) {
      toast.error(`Skill "${cleanSkill}" is already added`);
      return;
    }

    const updated = [...currentSkills, cleanSkill];
    onChange({ skills: updated });
    setSkillInput("");
  };

  // Remove skill from tag list
  const handleRemoveSkill = (skillToRemove: string) => {
    const updated = currentSkills.filter(s => s !== skillToRemove);
    onChange({ skills: updated });
  };

  const currentLanguages = Array.isArray(data.languages) ? data.languages : [];

  const handleAddLanguage = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanLang = langInput.trim();
    if (!cleanLang) return;

    if (currentLanguages.some(l => l.toLowerCase() === cleanLang.toLowerCase())) {
      toast.error(`Language "${cleanLang}" is already added`);
      return;
    }

    const updated = [...currentLanguages, cleanLang];
    onChange({ languages: updated });
    setLangInput("");
  };

  const handleRemoveLanguage = (langToRemove: string) => {
    const updated = currentLanguages.filter(l => l !== langToRemove);
    onChange({ languages: updated });
  };

  return (
    <div className="space-y-6">
      {/* Top details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Target Role */}
        <div className="space-y-1.5">
          <Label htmlFor="career-role" className="text-xs font-semibold text-muted-foreground">Target Role / Preferred Job Role</Label>
          <Input
            id="career-role"
            type="text"
            placeholder="e.g. Frontend Engineer, Data Scientist"
            value={data.target_role ?? ""}
            onChange={(e) => onChange({ target_role: e.target.value || null })}
            className="rounded-xl border-border bg-background text-sm"
          />
        </div>

        {/* Experience */}
        <div className="space-y-1.5">
          <Label htmlFor="career-exp" className="text-xs font-semibold text-muted-foreground">Experience (in Years)</Label>
          <Input
            id="career-exp"
            type="number"
            step="0.1"
            min="0"
            placeholder="e.g. 1.5"
            value={data.experience ?? ""}
            onChange={(e) => onChange({ experience: parseFloat(e.target.value) || 0 })}
            className="rounded-xl border-border bg-background text-sm"
          />
        </div>

        {/* Working Type */}
        <div className="space-y-1.5">
          <Label htmlFor="career-working" className="text-xs font-semibold text-muted-foreground">Working Type / Employment Preference</Label>
          <Select
            value={data.working_type ?? ""}
            onValueChange={(val: any) => onChange({ working_type: val })}
          >
            <SelectTrigger id="career-working" className="rounded-xl border-border bg-background text-sm">
              <SelectValue placeholder="Select preference" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border bg-card">
              <SelectItem value="Remote" className="text-xs">Remote</SelectItem>
              <SelectItem value="Onsite" className="text-xs">Onsite</SelectItem>
              <SelectItem value="Hybrid" className="text-xs">Hybrid</SelectItem>
              <SelectItem value="Part-Time" className="text-xs">Part-Time</SelectItem>
              <SelectItem value="Internship" className="text-xs">Internship</SelectItem>
              <SelectItem value="Freelance" className="text-xs">Freelance</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Preferred Location */}
        <div className="space-y-1.5">
          <Label htmlFor="career-location" className="text-xs font-semibold text-muted-foreground">Preferred Job Location</Label>
          <Input
            id="career-location"
            type="text"
            placeholder="e.g. Bangalore, Hyderabad, Remote"
            value={data.preferred_location ?? ""}
            onChange={(e) => onChange({ preferred_location: e.target.value || null })}
            className="rounded-xl border-border bg-background text-sm"
          />
        </div>

        {/* Resume URL */}
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="career-resume" className="text-xs font-semibold text-muted-foreground">Resume URL Link</Label>
          <Input
            id="career-resume"
            type="url"
            placeholder="https://drive.google.com/... or https://novoresume..."
            value={data.resume_url ?? ""}
            onChange={(e) => onChange({ resume_url: e.target.value || null })}
            className="rounded-xl border-border bg-background text-sm"
          />
        </div>
      </div>

      {/* Interactive Tag-based Skills Uploader */}
      <div className="space-y-2 bg-muted/10 p-4 border border-border/60 rounded-2xl shadow-sm">
        <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
          <FileCode className="w-4 h-4 text-primary shrink-0" />
          <span>Core Tech Skills & Technologies</span>
        </Label>

        <form onSubmit={handleAddSkill} className="flex gap-2 max-w-md pt-1">
          <Input
            type="text"
            placeholder="Type a skill (e.g. Python, React) and press Enter"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            className="rounded-xl border-border bg-background text-xs h-9"
          />
          <Button
            type="submit"
            size="sm"
            className="bg-primary hover:bg-primary/95 text-primary-foreground rounded-xl shrink-0 h-9 font-semibold text-xs px-3.5"
          >
            <Plus className="w-4 h-4 mr-1" />
            <span>Add</span>
          </Button>
        </form>

        <div className="flex flex-wrap gap-1.5 pt-2">
          {Array.isArray(currentSkills) && currentSkills.length > 0 ? (
            currentSkills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1 bg-primary/10 text-primary border border-primary/20 text-xs font-bold pl-2.5 pr-1.5 py-1 rounded-xl"
              >
                <span>{skill}</span>

                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="w-4 h-4 hover:bg-primary/20 text-primary hover:text-primary rounded-full flex items-center justify-center transition-all"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            ))
          ) : (
            <p className="text-xs text-muted-foreground italic py-1 pl-1">
              No skills added yet. Add a few above to boost your score.
            </p>
          )}
        </div>
      </div>

      {/* Textareas */}
      <div className="space-y-4">
        {/* Dynamic Projects Editor */}
        <div className="space-y-3 bg-muted/10 p-5 border border-border/60 rounded-2xl shadow-sm">
          <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <Briefcase className="w-4 h-4 text-primary shrink-0" />
            <span>Projects ({currentProjects.length})</span>
          </Label>

          {/* Existing Projects List */}
          <div className="space-y-2">
            {currentProjects.length > 0 ? (
              currentProjects.map((proj) => (
                <div key={proj.id} className="bg-background border border-border rounded-xl p-3.5 flex items-start justify-between gap-3 shadow-sm hover:border-primary/20 transition-all">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground text-sm">{proj.title}</span>
                      {proj.link && (
                        <a
                          href={proj.link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] font-semibold text-primary hover:underline"
                        >
                          Project Link
                        </a>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{proj.description}</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      handleDeleteProject(proj.id)
                    }
                    className="h-8 w-8 rounded-lg hover:bg-destructive/10 text-primary hover:text-destructive shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground italic py-1 pl-1">No projects added yet.</p>
            )}
          </div>

          {/* Add Project Form inline */}
          <div className="pt-3 border-t border-border/40 space-y-3">
            <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block">Add New Project</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">Project Title *</Label>
                <Input
                  type="text"
                  placeholder="e.g. Portfolio Website"
                  value={projTitle}
                  onChange={(e) => setProjTitle(e.target.value)}
                  className="rounded-xl border-border bg-background text-xs h-9"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">Project Link / Repo URL (Optional)</Label>
                <Input
                  type="url"
                  placeholder="https://github.com/..."
                  value={projLink}
                  onChange={(e) => setProjLink(e.target.value)}
                  className="rounded-xl border-border bg-background text-xs h-9"
                />
              </div>
              <div className="sm:col-span-2 space-y-1">
                <Label className="text-[10px] text-muted-foreground">Description *</Label>
                <Textarea
                  placeholder="Brief about the project, features, technologies used..."
                  value={projDesc}
                  onChange={(e) => setProjDesc(e.target.value)}
                  className="rounded-xl border-border bg-background text-xs min-h-[60px] resize-none"
                />
              </div>
            </div>
            <Button
              type="button"
              onClick={handleAddProject}
              className="bg-primary hover:bg-primary/95 text-primary-foreground rounded-xl font-semibold text-xs h-9 px-4"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              <span>Add Project</span>
            </Button>
          </div>
        </div>

        {/* Dynamic Achievements Editor */}
        <div className="space-y-3 bg-muted/10 p-5 border border-border/60 rounded-2xl shadow-sm">
          <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <Award className="w-4 h-4 text-primary shrink-0" />
            <span>Achievements ({currentAchievements.length})</span>
          </Label>

          {/* Existing Achievements List */}
          <div className="space-y-2">
            {currentAchievements.length > 0 ? (
              currentAchievements.map((ach) => (
                <div key={ach.id} className="bg-background border border-border rounded-xl p-3 flex items-center justify-between gap-3 shadow-sm hover:border-primary/20 transition-all">
                  <div className="flex-1">
                    <span className="font-semibold text-foreground text-sm">{ach.title}</span>

                    {ach.achievement_date && (
                      <span className="text-[10px] text-muted-foreground font-mono ml-2 font-semibold">
                        ({ach.achievement_date})
                      </span>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      handleDeleteAchievement(ach.id)
                    }
                    className="h-8 w-8 rounded-lg hover:bg-destructive/10 text-primary hover:text-destructive shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground italic py-1 pl-1">No achievements added yet.</p>
            )}
          </div>

          {/* Add Achievement Form inline */}
          <div className="pt-3 border-t border-border/40 space-y-3">
            <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block">Add New Achievement</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">Achievement Title *</Label>
                <Input
                  type="text"
                  placeholder="e.g. 1st place in Hackathon"
                  value={achTitle}
                  onChange={(e) => setAchTitle(e.target.value)}
                  className="rounded-xl border-border bg-background text-xs h-9"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">Date / Year (Optional)</Label>
                <Input
                  type="text"
                  placeholder="e.g. Jan 2025"
                  value={achDate}
                  onChange={(e) => setAchDate(e.target.value)}
                  className="rounded-xl border-border bg-background text-xs h-9"
                />
              </div>
            </div>
            <Button
              type="button"
              onClick={handleAddAchievement}
              className="bg-primary hover:bg-primary/95 text-primary-foreground rounded-xl font-semibold text-xs h-9 px-4"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              <span>Add Achievement</span>
            </Button>
          </div>
        </div>

        {/* Weak Areas */}
        <div className="space-y-1.5">
          <Label htmlFor="career-weak" className="text-xs font-semibold text-muted-foreground">Weak Areas (Topics you want to improve)</Label>
          <Textarea
            id="career-weak"
            placeholder="e.g. Recursion, Pointer manipulation, CSS layouts..."
            value={data.weak_areas || ""}
            onChange={(e) => onChange({ weak_areas: e.target.value || null })}
            className="rounded-xl border-border bg-background text-xs min-h-[80px] resize-none"
          />
        </div>

        {/* Description / Summary */}
        <div className="space-y-1.5">
          <Label htmlFor="career-desc" className="text-xs font-semibold text-muted-foreground">Bio / About Me</Label>
          <Textarea
            id="career-desc"
            placeholder="A short description about yourself..."
            value={data.description || ""}
            onChange={(e) => onChange({ description: e.target.value || null })}
            className="rounded-xl border-border bg-background text-xs min-h-[80px] resize-none"
          />
        </div>
      </div>
    </div>
  );
}
