"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import HRExamForm from "@/components/hr/exams/HRExamForm";
import JobsService from "@/services/jobs.service";

export default function CreateHRExamPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<any[]>([]);

  useEffect(() => {
    JobsService.getHRJobs()
      .then((res) => setJobs(res.data.data || []))
      .catch(() => setJobs([]));
  }, []);

  const handleSave = async (data: any) => {
    try {
      await JobsService.createHRExam(data);
      toast.success("HR Assessment created successfully!");
      router.push("/hr/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create HR assessment.");
    }
  };

  const handleCancel = () => {
    router.push("/hr/dashboard");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="border-b border-border pb-4">
        <h1 className="text-2xl font-bold text-foreground">Create HR Assessment Exam</h1>
        <p className="text-xs text-muted-foreground">Setup questions, constraints, and assign to shortlisted job applicants.</p>
      </div>
      <HRExamForm jobs={jobs} onSave={handleSave} onCancel={handleCancel} />
    </div>
  );
}
