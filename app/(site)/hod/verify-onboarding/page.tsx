"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Eye, EyeOff, Sparkles, CheckCircle2, XCircle, ArrowRight, ShieldCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import StaffService from "@/services/staff.service";

function VerifyOnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const collegeId = searchParams.get("collegeId") || "";

  const [checking, setChecking] = useState(true);
  const [valid, setValid] = useState(false);
  const [adminInfo, setAdminInfo] = useState<{ id: number; full_name: string; email: string } | null>(null);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!collegeId) {
      setChecking(false);
      setValid(false);
      setErrorMessage("College ID is missing.");
      return;
    }
    if (!token) {
      setChecking(false);
      setValid(false);
      setErrorMessage("Verification token is missing from the link.");
      return;
    }

    async function checkToken() {
      try {
        const response =
          await StaffService.verifyStaffOnboardingToken(
            collegeId,
            token
          );
        const info = response.data || response;
        if (info && info.email) {
          setAdminInfo(info);
          setValid(true);
        } else {
          setValid(false);
          setErrorMessage("Failed to read account details.");
        }
      } catch (error: any) {
        setValid(false);
        setErrorMessage(error?.response?.data?.message || "Invalid or expired verification link.");
      } finally {
        setChecking(false);
      }
    }

    checkToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password) {
      toast.error("Password is required.");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      setSubmitting(true);
      await StaffService.setupStaffOnboardingPassword(
        collegeId,
        token,
        password
      );
      setSuccess(true);
      toast.success("Account activated successfully!");
      setTimeout(() => {
        router.replace("/hod/auth");
      }, 3000);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to setup password. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (checking) {
    return (
      <div className="text-center p-8 space-y-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
        <h2 className="text-lg font-semibold text-foreground">Verifying onboarding link...</h2>
        <p className="text-sm text-muted-foreground">Please wait while we secure your session</p>
      </div>
    );
  }

  if (!valid) {
    return (
      <div className="p-8 text-center space-y-6">
        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
          <XCircle className="w-10 h-10 text-destructive" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Link Invalid or Expired</h2>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          {errorMessage || "The verification link you clicked may have expired or is invalid. Onboarding links are only valid for 24 hours."}
        </p>
        <div className="pt-4">
          <Button
            onClick={() => router.replace("/super-admin/auth")}
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
          >
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="p-8 text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
        <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-emerald-800">Password Setup Complete!</h2>
        <p className="text-sm text-emerald-600 max-w-sm mx-auto">
          Your College Super Admin account is now verified and active. You are being redirected to the portal sign-in page...
        </p>
        <div className="pt-2 flex justify-center">
          <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="text-center">
        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="w-6 h-6 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Set Admin Password</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Complete onboarding for College Super Admin
        </p>
      </div>

      <div className="bg-muted/40 border border-border/80 rounded-xl p-4 space-y-2 text-sm text-muted-foreground">
        <div>
          <span className="font-semibold text-foreground">Name:</span> {adminInfo?.full_name}
        </div>
        <div>
          <span className="font-semibold text-foreground">Username / Email:</span> {adminInfo?.email}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="password">New Password</Label>
          <div className="relative group">
            <Lock className="absolute left-3.5 top-3 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`bg-background border-input text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/20 focus-visible:border-primary pl-10 pr-10 rounded-xl ${password.length > 0 && password.length < 6 ? "border-destructive focus-visible:ring-destructive/20" : ""}`}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-3 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {password.length > 0 && password.length < 6 && (
            <p className="text-xs text-destructive mt-1">Password must be at least 6 characters.</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <div className="relative group">
            <Lock className="absolute left-3.5 top-3 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="bg-background border-input text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/20 focus-visible:border-primary pl-10 pr-10 rounded-xl"
              required
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={submitting}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-5 rounded-xl font-semibold shadow-md transition-all duration-300 hover-lift relative overflow-hidden group mt-6"
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Activating Account...</span>
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <span>Verify & Activate Account</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          )}
        </Button>
      </form>
    </div>
  );
}

export default function VerifyOnboardingPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background text-foreground font-sans relative px-4">
      <div className="absolute inset-0 blueprint-grid opacity-5 pointer-events-none" />

      <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-xl overflow-hidden relative z-10 transition-all duration-300">
        <div className="p-8 pb-0 text-center">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">DataQuotes EduTech</h1>
        </div>

        <Suspense
          fallback={
            <div className="text-center p-8 space-y-4">
              <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
              <h2 className="text-lg font-semibold text-foreground">Loading onboarding portal...</h2>
            </div>
          }
        >
          <VerifyOnboardingContent />
        </Suspense>

        <div className="p-4 bg-muted/30 border-t border-border/60 text-center text-[10px] text-muted-foreground">
          <span>© {new Date().getFullYear()} DataQuotes EduTech. All rights reserved.</span>
        </div>
      </div>
    </div>
  );
}
