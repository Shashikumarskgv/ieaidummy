"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Key, Lock, Mail, ShieldCheck, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import JobsService from "@/services/jobs.service";

export default function HRLoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    college_code: "",
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.college_code || !formData.email || !formData.password) {
      toast.error("College Code, Email, and Password are required.");
      return;
    }

    try {
      setLoading(true);
      const res = await JobsService.hrLogin(formData);
      const { token, hr } = res.data.data;

      // Store HR session details securely
      const tokenKey = process.env.NEXT_PUBLIC_TOKEN_KEY || "dq_lms_access_token";
      localStorage.setItem("hr_token", token);
      localStorage.setItem(tokenKey, token);
      localStorage.setItem("hr_user", JSON.stringify(hr));
      document.cookie = `hr_token=${token}; path=/; max-age=259200`;

      toast.success(`Welcome back, ${hr.hr_name}! Connected to ${hr.company_name}.`);
      router.push("/hr/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Invalid credentials or 3-day access has expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 text-primary mb-2">
            <Building2 className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Company HR Portal</h1>
          <p className="text-xs text-muted-foreground">
            3-Day Temporary Candidate Evaluation & Skill Assessment Platform
          </p>
        </div>

        {/* Info Banner */}
        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-3.5 flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <p className="text-xs text-indigo-900 dark:text-indigo-300 leading-snug font-medium">
            End-to-End Encrypted Authentication. Please enter your institution college code and temporary HR credentials.
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">College Code / Code *</label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="e.g. COLLEGE01"
                  value={formData.college_code}
                  onChange={(e) => setFormData(p => ({ ...p, college_code: e.target.value.toUpperCase() }))}
                  className="pl-10 h-10 rounded-xl text-xs uppercase font-mono font-bold"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">HR Registered Email *</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="hr@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                  className="pl-10 h-10 rounded-xl text-xs"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Password *</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="Enter temporary password"
                  value={formData.password}
                  onChange={(e) => setFormData(p => ({ ...p, password: e.target.value }))}
                  className="pl-10 h-10 rounded-xl text-xs"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-10 rounded-xl bg-primary text-white text-xs font-bold gap-2 shadow-sm mt-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Log In to HR Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
