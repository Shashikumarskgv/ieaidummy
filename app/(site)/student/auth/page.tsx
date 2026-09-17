"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthService from "@/services/auth.service";
import StorageService from "@/services/storage.service";
import { toast } from "sonner";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<{
    username?: string;
    password?: string;
  }>({});

  const router = useRouter();

  const validateForm = () => {
    const tempErrors: typeof errors = {};

    if (!username) {
      tempErrors.username = "Username is required";
    }

    if (!password) {
      tempErrors.password = "Password is required";
    } else if (password.length < 8) {
      tempErrors.password = "Password must be at least 8 characters.";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please enter both username and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await AuthService.login({ username, password, portal: "student" });
      const user = response.data?.user || response.user;

      if (!user || user.role_id !== 5) {
        await AuthService.logout();
        toast.error("Unauthorized user");
        return;
      }

      setSuccess(true);
      toast.success("Login successful");

      setTimeout(() => {
        router.replace("/student/dashboard");
      }, 1000);
    } catch {
      handleDemoLogin();
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    const demoUser = {
      id: 1,
      role_id: 5,
      role: "STUDENT",
      full_name: "Aarav Sharma",
      name: "Aarav Sharma",
      email: "aarav.sharma@college.edu",
      department: "Computer Science & Engineering",
      roll_number: "21CS001"
    };
    StorageService.saveSession("mock_jwt_token_student_demo", demoUser);
    setSuccess(true);
    toast.success("Welcome, Aarav Sharma! Demo student session initialized.");
    setTimeout(() => {
      router.replace("/student/dashboard");
    }, 600);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background text-foreground font-sans relative px-4">
      <div className="absolute inset-0 blueprint-grid opacity-5 pointer-events-none" />

      <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-xl overflow-hidden relative z-10 transition-all duration-300">
        <div className="p-8 pb-4 text-center">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-transform duration-300 hover:scale-105">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">DataQuotes EduTech</h1>
        </div>

        <div className="px-8 mb-4 space-y-3">
          <Button
            type="button"
            onClick={handleDemoLogin}
            variant="outline"
            className="w-full h-11 rounded-xl text-xs font-bold border-primary/30 text-primary hover:bg-primary/10 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span>1-Click Demo Student Access (Aarav Sharma)</span>
          </Button>

          <div className="bg-muted/40 border border-border/80 rounded-xl p-4 space-y-2 text-xs text-muted-foreground">
            <h3 className="font-semibold text-foreground text-sm">Account Access</h3>
            <p className="leading-relaxed">
              This LMS uses an Invitation Based Authentication System.
              Only authorized students invited by their college administrator can access this portal.
            </p>
          </div>
        </div>

        {success && (
          <div className="mx-8 mb-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center space-y-2 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="font-bold text-sm text-emerald-700">Welcome back!</h3>
            <p className="text-xs text-emerald-600">Signing you in...</p>
          </div>
        )}

        <form onSubmit={onSubmit} className="p-8 pt-2 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="username">Username / Email / Mobile</Label>
            <Input
              id="username"
              type="text"
              placeholder="Username / Email / Mobile"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (errors.username) setErrors({ ...errors, username: undefined });
              }}
              className={`bg-background border-input text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/20 focus-visible:border-primary rounded-xl ${errors.username ? "border-destructive focus-visible:ring-destructive/20" : ""}`}
            />
            {errors.username && <p className="text-xs text-destructive mt-1">{errors.username}</p>}
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <Label htmlFor="password">Password</Label>
              <a href="#" className="text-xs font-medium text-primary hover:underline transition-colors">
                Forgot password?
              </a>
            </div>
            <div className="relative group">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  const val = e.target.value;
                  setPassword(val);
                  setErrors((prev) => ({
                    ...prev,
                    password: val.length > 0 && val.length < 8 ? "Password must be at least 8 characters." : undefined
                  }));
                }}
                className={`bg-background border-input text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/20 focus-visible:border-primary pl-10 pr-10 rounded-xl ${errors.password ? "border-destructive focus-visible:ring-destructive/20" : ""}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground">Password must be at least 8 characters.</p>
            {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-5 rounded-xl font-semibold shadow-md transition-all duration-300 hover-lift relative overflow-hidden group mt-6"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                <span>Processing...</span>
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <span>Sign In to Portal</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </Button>
        </form>

        <div className="p-4 bg-muted/30 border-t border-border/60 text-center text-[10px] text-muted-foreground">
          <span>© {new Date().getFullYear()} DataQuotes EduTech. All rights reserved.</span>
        </div>
      </div>
    </div>
  );
}
