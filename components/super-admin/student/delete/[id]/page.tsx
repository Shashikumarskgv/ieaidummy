"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Student,
  getStoredStudents,
  saveStudents
} from "@/lib/mockColleges";

interface DeleteStudentPageProps {
  studentId: string;
}

export default function DeleteStudentPage({ studentId }: DeleteStudentPageProps) {
  const router = useRouter();

  const [student, setStudent] = useState<Student | null>(null);
  const [confirmText, setConfirmText] = useState("");
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    const list = getStoredStudents();
    setStudents(list);

    const record = list.find(s => s.rollNumber === studentId);
    if (record) {
      setStudent(record);
    } else {
      toast.error("Student profile not found");
      router.push("/super-admin/student");
    }
  }, [studentId]);

  if (!student) return null;

  const isMatched = confirmText.trim().toUpperCase() === student.rollNumber.toUpperCase();

  const handleDelete = () => {
    if (isMatched) {
      const updated = students.filter(s => s.rollNumber !== student.rollNumber);
      saveStudents(updated);
      toast.success(`${student.firstName} ${student.lastName}'s profile permanently deleted`);
      router.push(`/super-admin/student?collegeId=${student.collegeId}`);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6 pt-10 animate-in zoom-in-95 duration-200">
      
      {/* Header back button */}
      <div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(`/super-admin/student?collegeId=${student.collegeId}`)}
          className="rounded-xl flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Students List
        </Button>
      </div>

      <div className="bg-card border border-border p-6 rounded-2xl shadow-xl space-y-6">
        
        {/* Warning Icon and Title */}
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-destructive" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-lg text-foreground">Delete Student Record?</h3>
            <p className="text-sm text-muted-foreground">
              This action cannot be undone. All resume metadata, placements indicator details, and course history for{" "}
              <strong className="text-foreground font-semibold">{student.firstName} {student.lastName}</strong> will be permanently wiped from the platform database.
            </p>
          </div>
        </div>

        {/* Input Confirmation instructions */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
            Type <span className="bg-muted px-1.5 py-0.5 rounded text-foreground font-mono text-xs">{student.rollNumber}</span> to continue:
          </label>
          <Input
            type="text"
            placeholder={student.rollNumber}
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className="w-full text-center font-mono tracking-widest text-sm focus-visible:ring-destructive/20 focus-visible:border-destructive"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/super-admin/student?collegeId=${student.collegeId}`)}
            className="flex-1 py-5 rounded-xl text-sm font-semibold"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={!isMatched}
            onClick={handleDelete}
            className="flex-1 py-5 rounded-xl text-sm font-semibold shadow-md disabled:opacity-50"
          >
            Delete Student
          </Button>
        </div>
      </div>
    </div>
  );
}
