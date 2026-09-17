"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import DetailedReport from "@/components/students/reports/DetailedReport";

export default function HODDetailedReportPage() {
  const params = useParams();
  const router = useRouter();
  const attemptId = Number(params?.id);

  return (
    <div className="p-6">
      <DetailedReport 
        attemptId={attemptId} 
        isAdmin={true} 
        onBack={() => router.push("/hod/reports")} 
      />
    </div>
  );
}
