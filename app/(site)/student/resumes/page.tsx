"use client";

import { useSyncExternalStore } from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import ResumeDashboard from "@/components/students/resumes/ResumeDashboard";
import ResumeEditor from "@/components/students/resumes/ResumeEditor";

export default function StudentResumesPage() {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="p-1 space-y-4">
      <HashRouter>
        <Routes>
          {/* Main Resumes Dashboard */}
          <Route path="/dashboard/resumes" element={<ResumeDashboard />} />
          
          {/* Resume Editor/Builder */}
          <Route path="/dashboard/resumes/edit/:id" element={<ResumeEditor />} />
          
          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/dashboard/resumes" replace />} />
        </Routes>
      </HashRouter>
    </div>
  );
}
