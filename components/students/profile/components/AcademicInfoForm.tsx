"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Trash2, 
  Edit3, 
  GraduationCap, 
  Calendar, 
  Award, 
  Building,
  CheckCircle,
  XCircle,
  BookOpen
} from "lucide-react";
import { StudentProfileData, AcademicDetail } from "../../types";
import { toast } from "sonner";

interface AcademicInfoFormProps {
  data: StudentProfileData;
  onChange: (updates: Partial<StudentProfileData>) => void;
}

export default function AcademicInfoForm({ data, onChange }: AcademicInfoFormProps) {
  const academicList = data.academic_details || [];

  // Form edit states
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Form values state
  const [type, setType] = useState("Graduation");
  const [institution, setInstitution] = useState("");
  const [course, setCourse] = useState("");
  const [score, setScore] = useState("");
  const [startYear, setStartYear] = useState("");
  const [endYear, setEndYear] = useState("");
  const [rollNumber, setRollNumber] = useState("");

  const qualificationTypes = [
    "Post-Graduation",
    "Graduation",
    "Diploma",
    "Intermediate / 12th",
    "School / SSC"
  ];

  const resetForm = () => {
    setIsEditing(false);
    setEditId(null);
    setType("Graduation");
    setInstitution("");
    setCourse("");
    setScore("");
    setStartYear("");
    setEndYear("");
    setRollNumber("");
  };

  const handleAddClick = () => {
    resetForm();
    const availableTypes = qualificationTypes.filter(
      (t) => !academicList.some((item) => item.type.trim().toLowerCase() === t.trim().toLowerCase())
    );
    if (availableTypes.length === 0) {
      toast.info("All qualification levels are already added. You can edit existing records using the edit button.");
      return;
    }
    setType(availableTypes[0]);
    setIsEditing(true);
  };

  const handleEditClick = (item: AcademicDetail) => {
    setEditId(item.id);
    setType(item.type);
    setInstitution(item.institution);
    setCourse(item.course);
    setScore(item.score);
    setStartYear(item.start_year);
    setEndYear(item.end_year);
    setRollNumber(item.roll_number || "");
    setIsEditing(true);
  };

  const handleDeleteClick = (id: string) => {
    const updated = academicList.filter((item) => item.id !== id);
    onChange({ academic_details: updated });
    toast.success("Academic qualification removed");
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();

    if (!institution.trim()) {
      toast.error("Please enter Institution / College Name");
      return;
    }
    if (!course.trim()) {
      toast.error("Please enter Degree / Stream Name");
      return;
    }
    if (!score.trim()) {
      toast.error("Please enter CGPA / Percentage score");
      return;
    }
    if (!startYear || !endYear) {
      toast.error("Please enter duration start and end years");
      return;
    }

    // Duplicate qualification level check
    const isDuplicateLevel = academicList.some(
      (item) => item.id !== editId && item.type.trim().toLowerCase() === type.trim().toLowerCase()
    );
    if (isDuplicateLevel) {
      toast.error(`A qualification record for '${type}' already exists. Please edit the existing '${type}' record instead of adding a new one.`);
      return;
    }

    const newItem: AcademicDetail = {
      id: editId || `edu_${Date.now()}`,
      type,
      institution: institution.trim(),
      course: course.trim(),
      score: score.trim(),
      start_year: startYear,
      end_year: endYear,
      roll_number: rollNumber.trim() || undefined,
    };

    let updatedList: AcademicDetail[];
    if (editId) {
      updatedList = academicList.map((item) => (item.id === editId ? newItem : item));
      toast.success("Academic record updated");
    } else {
      updatedList = [...academicList, newItem];
      toast.success("New academic record added");
    }

    onChange({ academic_details: updatedList });
    resetForm();
  };

  return (
    <div className="space-y-6">
      
      {/* Current Academic Overview & Semester Input */}
      <div className="bg-card border border-border/80 p-5 rounded-2xl space-y-4 shadow-sm">
        <h4 className="text-xs font-bold text-foreground uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 border-b border-border/60 pb-2.5">
          <BookOpen className="w-4 h-4 text-primary" />
          <span>Current Academic Status</span>
        </h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Institution / College (Derived/Auto-filled) */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground">College / Institution</Label>
            <Input
              value={data.college || "DataQuotes EduTech Private Limited"}
              disabled
              className="rounded-xl border-border bg-muted/40 text-xs font-medium"
            />
          </div>

          {/* Program / Department (Derived/Auto-filled) */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground">Program / Department</Label>
            <Input
              value={data.joined_course || data.department || "Computer Science & Engineering"}
              disabled
              className="rounded-xl border-border bg-muted/40 text-xs font-medium"
            />
          </div>

          {/* Current Semester Input */}
          <div className="space-y-1.5">
            <Label htmlFor="current-semester-input" className="text-xs font-semibold text-foreground flex items-center gap-1">
              <span>Current Semester</span>
              <span className="text-destructive font-bold">*</span>
            </Label>
            <Input
              id="current-semester-input"
              type="number"
              min={1}
              max={10}
              placeholder="e.g. 6"
              value={data.current_semester ?? ""}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "") {
                  onChange({ current_semester: "" });
                  return;
                }
                const parsed = parseInt(val, 10);
                if (!isNaN(parsed) && parsed >= 1 && parsed <= 10) {
                  onChange({ current_semester: parsed });
                } else if (!isNaN(parsed)) {
                  onChange({ current_semester: parsed });
                }
              }}
              className="rounded-xl border-border bg-background text-xs font-medium"
            />
          </div>
        </div>
      </div>

      {/* Education Header with add button */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-primary" />
          <span>Academic Qualifications</span>
        </h3>
        {!isEditing && (
          <Button
            type="button"
            onClick={handleAddClick}
            className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold rounded-xl text-xs flex items-center gap-1 h-8 px-3 shadow"
          >
            <Plus className="w-4 h-4" /> Add Education
          </Button>
        )}
      </div>

      {/* Editor subform card */}
      {isEditing && (
        <form onSubmit={handleSaveItem} className="bg-muted/30 border border-border/80 p-5 rounded-2xl space-y-4 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between border-b border-border/60 pb-2">
            <h4 className="text-xs font-bold text-foreground">
              {editId ? "Modify Qualification Details" : "Add Education Level"}
            </h4>
            <button
              type="button"
              onClick={resetForm}
              className="text-xs text-muted-foreground hover:text-foreground font-semibold"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Qualification Type */}
            <div className="space-y-1.5">
              <Label htmlFor="edu-type" className="text-xs font-semibold text-muted-foreground">Qualification Level *</Label>
              <select
                id="edu-type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-background border border-input rounded-xl px-3 py-2 text-sm text-foreground focus-visible:ring-primary/20"
              >
                {qualificationTypes.map((t) => {
                  const isAlreadyAdded = academicList.some(
                    (item) => item.id !== editId && item.type.trim().toLowerCase() === t.trim().toLowerCase()
                  );
                  return (
                    <option key={t} value={t} disabled={isAlreadyAdded}>
                      {t} {isAlreadyAdded ? "(Already Added)" : ""}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Roll Number */}
            <div className="space-y-1.5">
              <Label htmlFor="edu-roll" className="text-xs font-semibold text-muted-foreground">Roll / Register Number</Label>
              <Input
                id="edu-roll"
                placeholder="e.g. 2026-CS-89"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                className="rounded-xl border-border bg-background text-sm"
              />
            </div>

            {/* Institution */}
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="edu-inst" className="text-xs font-semibold text-muted-foreground">Institution / School / College Name *</Label>
              <Input
                id="edu-inst"
                placeholder="e.g. Sri Venkateswara College of Engineering"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                className="rounded-xl border-border bg-background text-sm"
              />
            </div>

            {/* Course / Stream */}
            <div className="space-y-1.5">
              <Label htmlFor="edu-course" className="text-xs font-semibold text-muted-foreground">Course / Stream / Degree *</Label>
              <Input
                id="edu-course"
                placeholder="e.g. B.Tech Computer Science & Engineering"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="rounded-xl border-border bg-background text-sm"
              />
            </div>

            {/* Score */}
            <div className="space-y-1.5">
              <Label htmlFor="edu-score" className="text-xs font-semibold text-muted-foreground">Score / GPA / Percentage *</Label>
              <Input
                id="edu-score"
                placeholder="e.g. 9.15 CGPA or 88%"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                className="rounded-xl border-border bg-background text-sm"
              />
            </div>

            {/* Start Year */}
            <div className="space-y-1.5">
              <Label htmlFor="edu-start" className="text-xs font-semibold text-muted-foreground">Start Year *</Label>
              <Input
                id="edu-start"
                type="number"
                placeholder="e.g. 2023"
                value={startYear}
                onChange={(e) => setStartYear(e.target.value)}
                className="rounded-xl border-border bg-background text-sm font-mono"
              />
            </div>

            {/* End Year */}
            <div className="space-y-1.5">
              <Label htmlFor="edu-end" className="text-xs font-semibold text-muted-foreground">Graduation / End Year *</Label>
              <Input
                id="edu-end"
                type="number"
                placeholder="e.g. 2027"
                value={endYear}
                onChange={(e) => setEndYear(e.target.value)}
                className="rounded-xl border-border bg-background text-sm font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border/60">
            <Button
              type="button"
              variant="outline"
              onClick={resetForm}
              className="rounded-xl text-xs font-semibold px-4 h-9"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold rounded-xl text-xs px-4 h-9 shadow"
            >
              Save Record
            </Button>
          </div>
        </form>
      )}

      {/* List of Qualifications */}
      <div className="space-y-3.5">
        {academicList.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-8 text-center text-muted-foreground text-xs italic">
            No education history configured yet. Click "+ Add Education" to add records.
          </div>
        ) : (
          academicList.map((item) => (
            <div 
              key={item.id}
              className="bg-card border border-border p-5 rounded-2xl shadow-sm hover:border-primary/20 hover:shadow-md transition-all flex items-start justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                {/* Type Badge */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {item.type}
                  </span>
                  {item.roll_number && (
                    <span className="bg-muted text-muted-foreground text-[10px] font-semibold px-2 py-0.5 rounded font-mono">
                      Roll: {item.roll_number}
                    </span>
                  )}
                </div>

                {/* Course & Institution */}
                <div className="space-y-1">
                  <h4 className="font-bold text-foreground text-sm flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-primary/70 shrink-0" />
                    <span>{item.course}</span>
                  </h4>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 shrink-0" />
                    <span>{item.institution}</span>
                  </p>
                </div>

                {/* Score & Duration */}
                <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1.5 text-xs text-muted-foreground font-semibold border-t border-border/50 max-w-md">
                  <span className="flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-amber-500" />
                    <span>Score: <strong className="text-foreground">{item.score}</strong></span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-primary/70" />
                    <span>Duration: <strong className="text-foreground font-mono">{item.start_year} - {item.end_year}</strong></span>
                  </span>
                </div>
              </div>

              {/* Edit/Delete Actions */}
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditClick(item)}
                  className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl h-8 w-8"
                  title="Edit details"
                >
                  <Edit3 className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteClick(item.id)}
                  className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl h-8 w-8"
                  title="Remove details"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
