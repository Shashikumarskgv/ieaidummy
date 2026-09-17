"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Award, Clock, Calendar, Play, CheckCircle2, AlertCircle, Loader2, Building2, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import ExamService from "@/services/exam.service";
import JobsService from "@/services/jobs.service";

export default function StudentExams() {
  const [activeTab, setActiveTab] = useState("college");
  const [exams, setExams] = useState<any[]>([]);
  const [hrExams, setHrExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const [resCollege, resHR] = await Promise.all([
        ExamService.studentList().catch(() => ({ data: [] })),
        JobsService.getStudentHRAssessments().catch(() => ({ data: { data: [] } }))
      ]);
      setExams(resCollege.data || []);
      setHrExams(resHR.data?.data || []);
    } catch {
      toast.error("Failed to load assessments list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="border-b border-border pb-5">
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Award className="w-8 h-8 text-primary shrink-0" />
          <span>My Assessments</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Review active college exams, coding tests, and HR company evaluation assessments.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-5">
        <TabsList className="bg-muted/60 p-1 rounded-xl h-11 inline-flex gap-1">
          <TabsTrigger value="college" className="rounded-lg text-xs font-semibold px-4 h-9 gap-2">
            <FileCheck className="w-4 h-4 text-primary" />
            <span>College & Academic Exams ({exams.length})</span>
          </TabsTrigger>
          <TabsTrigger value="hr" className="rounded-lg text-xs font-semibold px-4 h-9 gap-2">
            <Building2 className="w-4 h-4 text-purple-600" />
            <span>HR Company Assessments ({hrExams.length})</span>
          </TabsTrigger>
        </TabsList>

        {loading ? (
          <div className="p-16 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="text-xs">Loading assessments...</span>
          </div>
        ) : (
          <>
            {/* College Exams Tab */}
            <TabsContent value="college" className="space-y-4">
              {exams.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {exams.map((e, idx) => {
                    const isCompleted = e.attempt_status === "completed";
                    const isInProgress = e.attempt_status === "in_progress";
                    const now = new Date();
                    const start = new Date(e.start_date);
                    const end = new Date(e.end_date);
                    const isAvailable = now >= start && now <= end;

                    return (
                      <div
                        key={`college_${e.id}_${idx}`}
                        className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-border/80 transition-all flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <h3 className="font-bold text-lg text-foreground line-clamp-1">{e.title}</h3>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                              isCompleted
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                : isInProgress
                                ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                                : "bg-blue-500/10 text-blue-600 border-blue-500/20"
                            }`}>
                              {isCompleted ? "Completed" : isInProgress ? "In Progress" : "Not Started"}
                            </span>
                          </div>

                          <p className="text-xs text-muted-foreground line-clamp-2 h-8">{e.description || "No description provided."}</p>

                          <div className="flex gap-4 pt-2 border-t border-border/60">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="w-4 h-4 text-primary/70" />
                              <span>{e.duration} Mins</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="w-4 h-4 text-primary/70" />
                              <span>Ends {end.toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-5 pt-3 border-t border-border flex items-center justify-between">
                          {isCompleted ? (
                            <div className="flex flex-col gap-1.5">
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                <span className="text-xs text-muted-foreground font-semibold">Submitted Successfully</span>
                              </div>
                              {new Date() >= new Date(e.end_date) ? (
                                <div className="text-xs text-muted-foreground">
                                  Score obtained: <span className="font-bold text-foreground">{e.total_score}</span>
                                </div>
                              ) : (
                                <div className="flex flex-col gap-1">
                                  {e.submitted_at && (
                                    <span className="text-[10px] text-muted-foreground font-medium">
                                      Submission Time: {new Date(e.submitted_at).toLocaleString()}
                                    </span>
                                  )}
                                  <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-200 uppercase w-max">
                                    Status: Submitted
                                  </span>
                                </div>
                              )}
                            </div>
                          ) : !isAvailable ? (
                            <div className="flex items-center gap-1 text-xs text-destructive font-semibold">
                              <AlertCircle className="w-4 h-4" />
                              <span>Unavailable outside schedule</span>
                            </div>
                          ) : (
                            <Link href={`/student/exams/${e.id}/write`} className="w-full">
                              <Button className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 h-10">
                                <Play className="w-4 h-4 fill-current" />
                                <span>{isInProgress ? "Resume Exam" : "Start Exam"}</span>
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-card border border-border rounded-2xl p-16 text-center text-muted-foreground text-xs italic">
                  No college academic exams currently assigned to you.
                </div>
              )}
            </TabsContent>

            {/* HR Assessments Tab */}
            <TabsContent value="hr" className="space-y-4">
              {hrExams.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {hrExams.map((e, idx) => {
                    const attempt = e.attempt;
                    const isCompleted = attempt?.status === "completed";
                    const isInProgress = attempt?.status === "in_progress";

                    return (
                      <div
                        key={`hr_${e.id}_${idx}`}
                        className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-purple-500/30 transition-all flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded-md border border-purple-200 dark:border-purple-800">
                                {e.company_name}
                              </span>
                              <h3 className="font-bold text-lg text-foreground line-clamp-1 mt-1">{e.title}</h3>
                              <p className="text-xs text-muted-foreground font-medium">{e.job_title}</p>
                            </div>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                              isCompleted
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                : isInProgress
                                ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                                : "bg-purple-500/10 text-purple-600 border-purple-500/20"
                            }`}>
                              {isCompleted ? "Completed" : isInProgress ? "In Progress" : "Assigned"}
                            </span>
                          </div>

                          <p className="text-xs text-muted-foreground line-clamp-2 h-8">{e.description || "Company technical & aptitude evaluation test."}</p>

                          <div className="flex gap-4 pt-2 border-t border-border/60">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="w-4 h-4 text-purple-600/70" />
                              <span>{e.duration} Mins</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Award className="w-4 h-4 text-purple-600/70" />
                              <span>Pass Mark: {e.pass_percentage}%</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-5 pt-3 border-t border-border flex items-center justify-between">
                          {isCompleted ? (
                            <div className="flex items-center justify-between w-full">
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                <span className="text-xs text-muted-foreground font-semibold">Completed & Submitted</span>
                              </div>
                              <span className="text-xs font-bold text-foreground bg-primary/10 px-2.5 py-1 rounded-lg">
                                Score: {attempt.total_score}
                              </span>
                            </div>
                          ) : (
                            <Link href={`/student/hr-exams/${e.id}/write`} className="w-full">
                              <Button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 h-10 shadow-sm">
                                <Play className="w-4 h-4 fill-current" />
                                <span>{isInProgress ? "Resume HR Assessment" : "Start HR Assessment"}</span>
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-card border border-border rounded-2xl p-16 text-center text-muted-foreground text-xs italic">
                  No HR company assessments currently assigned to you.
                </div>
              )}
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}
