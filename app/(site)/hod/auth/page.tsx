"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthService from "@/services/auth.service";
import { toast } from "sonner";

export default function Login() {
  const [username, setUsername] = useState("hod.cse@college.edu");
  const [password, setPassword] = useState("Admin@1234");
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
    } else if (password.length < 6) {
      tempErrors.password = "Password must be at least 6 characters.";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleLogin = async (userVal: string, passVal: string) => {
    try {
      setLoading(true);

      const response = await AuthService.login({ username: userVal, password: passVal, portal: "hod" });
      const user = response.data?.user || response.user;

      if (!user || (user.role_id !== 3 && !String(user.role || "").toUpperCase().includes("HOD"))) {
        await AuthService.logout();
        toast.error("Unauthorized user role for HOD portal.");
        return;
      }

      setSuccess(true);
      toast.success("Login successful! Welcome Dr. Rajesh Varma.");

      setTimeout(() => {
        router.replace("/hod/dashboard");
      }, 500);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please enter both username and password.");
      return;
    }

    await handleLogin(username, password);
  };

  const handleQuickDemoLogin = async () => {
    setUsername("hod.cse@college.edu");
    setPassword("Admin@1234");
    await handleLogin("hod.cse@college.edu", "Admin@1234");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background text-foreground font-sans relative px-4">
      <div className="absolute inset-0 blueprint-grid opacity-5 pointer-events-none" />

      <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-xl overflow-hidden relative z-10 transition-all duration-300">
        <div className="p-8 pb-4 text-center">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-transform duration-300 hover:scale-105">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">HOD Department Portal</h1>
          <p className="text-xs text-muted-foreground mt-1">Computer Science & Engineering • DataQuotes EduTech</p>
        </div>

        <div className="px-8 mb-2">
          {/* Quick Demo Access banner */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 flex items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-bold text-foreground block">Demo HOD Access</span>
              <span className="text-[11px] text-muted-foreground">Dr. Rajesh Varma (CSE Department)</span>
            </div>
            <Button
              type="button"
              size="sm"
              onClick={handleQuickDemoLogin}
              disabled={loading}
              className="bg-primary text-white hover:bg-primary/90 rounded-lg text-xs font-semibold h-8 px-3"
            >
              <UserCheck className="w-3.5 h-3.5 mr-1" />
              1-Click Demo
            </Button>
          </div>
        </div>

        {success && (
          <div className="mx-8 mb-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center space-y-2 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="font-bold text-sm text-emerald-700">Welcome back, Dr. Rajesh Varma!</h3>
            <p className="text-xs text-emerald-600">Signing you into HOD dashboard...</p>
          </div>
        )}

        <form onSubmit={onSubmit} className="p-8 pt-2 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="username" className="text-xs font-semibold">Username / Email</Label>
            <Input
              id="username"
              type="text"
              placeholder="hod.cse@college.edu"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (errors.username) setErrors({ ...errors, username: undefined });
              }}
              className={`bg-background border-input text-foreground placeholder:text-muted-foreground rounded-xl text-xs h-10 ${errors.username ? "border-destructive" : ""}`}
            />
            {errors.username && <p className="text-xs text-destructive mt-1">{errors.username}</p>}
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <Label htmlFor="password" className="text-xs font-semibold">Password</Label>
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
                    password: val.length > 0 && val.length < 6 ? "Password must be at least 6 characters." : undefined
                  }));
                }}
                className={`bg-background border-input text-foreground pl-10 pr-10 rounded-xl text-xs h-10 ${errors.password ? "border-destructive" : ""}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-5 rounded-xl font-semibold shadow-md transition-all duration-300 relative overflow-hidden group mt-4 text-xs"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                <span>Signing In...</span>
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
          <span>© {new Date().getFullYear()} DataQuotes EduTech • Autonomous Examination & Proctoring Platform</span>
        </div>
      </div>
    </div>
  );
}
