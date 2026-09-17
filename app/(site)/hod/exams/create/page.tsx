"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import ExamForm from "@/components/hod/exams/ExamForm";
import ExamService from "@/services/exam.service";
import { mockHodStore } from "@/lib/mockHodData";

export default function CreateExamPage() {
  const router = useRouter();

  const handleSave = async (data: any) => {
    try {
      await ExamService.create(data);
      toast.success("Exam created successfully!");
      router.push("/hod/exams");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create exam.");
    }
  };

  const handleCancel = () => {
    router.push("/hod/exams");
  };

  const courses = mockHodStore.getCourses();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="border-b border-border pb-4">
        <h1 className="text-2xl font-bold text-foreground">Create New Assessment</h1>
        <p className="text-xs text-muted-foreground">Setup questions, constraints, and assign to students.</p>
      </div>
      <ExamForm courses={courses} onSave={handleSave} onCancel={handleCancel} />
    </div>
  );
}
