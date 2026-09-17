"use client";

import { useEffect, useState } from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import { InterviewPrep } from "@/components/students/interview/InterviewPrep";
import InterviewSectionView from "@/components/students/interview/InterviewSectionView";
import RolePanelQuestionsView from "@/components/students/interview/RolePanelQuestionsView";
import InterviewTestSetup from "@/components/students/interview/InterviewTestSetup";
import InterviewTestRunner from "@/components/students/interview/InterviewTestRunner";
import InterviewSession from "@/components/students/interview/InterviewSession";
import InterviewMcq from "@/components/students/interview/InterviewMcq";
import InterviewCoding from "@/components/students/interview/InterviewCoding";

export default function StudentInterviewPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
          {/* Main Interview Prep Entry Routes */}
          <Route path="/" element={<InterviewPrep />} />
          <Route path="/dashboard/interview-prep" element={<InterviewPrep />} />
          
          {/* Clean Section Routes & Shortcuts */}
          <Route path="/role-based" element={<InterviewSectionView />} />
          <Route path="/project-based" element={<InterviewSectionView />} />
          <Route path="/weak-areas" element={<InterviewSectionView />} />
          <Route path="/hr" element={<InterviewSectionView />} />
          <Route path="/section/:section" element={<InterviewSectionView />} />
          <Route path="/dashboard/interview-prep/section/:section" element={<InterviewSectionView />} />
          
          {/* Clean Panel Routes */}
          <Route path="/panel/:panelNumber" element={<RolePanelQuestionsView />} />
          <Route path="/dashboard/interview-prep/panel/:panelNumber" element={<RolePanelQuestionsView />} />
          
          {/* Clean Test Setup Routes */}
          <Route path="/test/setup/:section" element={<InterviewTestSetup />} />
          <Route path="/dashboard/interview-prep/test/setup/:section" element={<InterviewTestSetup />} />
          
          {/* Clean Test Execution/Runner Routes */}
          <Route path="/test/:resultId" element={<InterviewTestRunner />} />
          <Route path="/role-based/test/:resultId" element={<InterviewTestRunner />} />
          <Route path="/project-based/test/:resultId" element={<InterviewTestRunner />} />
          <Route path="/weak-areas/test/:resultId" element={<InterviewTestRunner />} />
          <Route path="/hr/test/:resultId" element={<InterviewTestRunner />} />
          <Route path="/dashboard/interview-prep/test/:resultId" element={<InterviewTestRunner />} />
          
          {/* Session Overview & Practice */}
          <Route path="/session/:sessionId" element={<InterviewSession />} />
          <Route path="/dashboard/interview-prep/:sessionId" element={<InterviewSession />} />
          <Route path="/session/:sessionId/mcq/:testId" element={<InterviewMcq />} />
          <Route path="/dashboard/interview-prep/:sessionId/mcq/:testId" element={<InterviewMcq />} />
          <Route path="/session/:sessionId/coding/:testId" element={<InterviewCoding />} />
          <Route path="/dashboard/interview-prep/:sessionId/coding/:testId" element={<InterviewCoding />} />
          
          {/* Catch-all fallback */}
          <Route path="*" element={<InterviewPrep />} />
        </Routes>
      </HashRouter>
    </div>
  );
}
