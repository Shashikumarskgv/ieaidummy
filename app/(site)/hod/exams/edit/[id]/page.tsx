"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import ExamForm from "@/components/hod/exams/ExamForm";
import ExamService from "@/services/exam.service";
import { mockHodStore } from "@/lib/mockHodData";

export default function EditExamPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params?.id);

  const [exam, setExam] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchExam = async () => {
      try {
        const res = await ExamService.getById(id);
        setExam(res.data);
      } catch {
        toast.error("Failed to load exam details.");
        router.push("/hod/exams");
      } finally {
        setLoading(false);
      }
    };

    fetchExam();
  }, [id, router]);

  const handleSave = async (data: any) => {
    try {
      await ExamService.update(id, data);
      toast.success("Exam updated successfully!");
      router.push("/hod/exams");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update exam.");
    }
  };

  const handleCancel = () => {
    router.push("/hod/exams");
  };

  const courses = mockHodStore.getCourses();

  if (loading) {
    return (
      <div className="p-16 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="text-xs">Loading exam details...</span>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="border-b border-border pb-4">
        <h1 className="text-2xl font-bold text-foreground">Edit Assessment</h1>
        <p className="text-xs text-muted-foreground">Modify questions, test cases, and student lists.</p>
      </div>
      <ExamForm exam={exam} courses={courses} onSave={handleSave} onCancel={handleCancel} />
    </div>
  );
}
