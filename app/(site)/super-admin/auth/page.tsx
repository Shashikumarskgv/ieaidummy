"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Building2,
  UserCheck,
  ShieldCheck,
  Key
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthService from "@/services/auth.service";
import StorageService from "@/services/storage.service";
import { toast } from "sonner";

export default function Login() {
  const [username, setUsername] = useState("admin@svce.edu");
  const [password, setPassword] = useState("Admin@1234");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<{
    username?: string;
    password?: string;
  }>({});

  const router = useRouter();

  const handleLogin = async (userVal: string, passVal: string) => {
    try {
      setLoading(true);

      const response = await AuthService.login({
        username: userVal,
        password: passVal,
        portal: "super-admin"
      });
      const user = response.data?.user || response.user;

      const isSuperAdmin =
        user &&
        (user.role_id === 2 ||
          user.role_id === 1 ||
          String(user.role || "").toUpperCase().includes("SUPER"));

      if (!user || !isSuperAdmin) {
        await AuthService.logout();
        toast.error("Unauthorized user role for Super Admin portal");
        return;
      }

      setSuccess(true);
      toast.success("Welcome back, Dr. K. R. Prasad! Signing you into Super Admin Portal...");

      setTimeout(() => {
        router.replace("/super-admin/dashboard");
      }, 500);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

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

    await handleLogin(username, password);
  };

  const handleQuickDemoLogin = async () => {
    setUsername("admin@svce.edu");
    setPassword("Admin@1234");
    await handleLogin("admin@svce.edu", "Admin@1234");
  };

  const handleDirectDemoAccess = () => {
    const demoUser = {
      id: 201,
      role_id: 2,
      role: "SUPER_ADMIN",
      full_name: "Dr. K. R. Prasad (Super Admin)",
      email: "admin@svce.edu",
      college_code: "SVCE1234",
      college_name: "Sri Venkateswara College of Engineering",
      department: "College Administration"
    };
    StorageService.saveSession("mock_jwt_token_super_admin_svce", demoUser);
    setSuccess(true);
    toast.success("Super Admin demo session loaded! Redirecting to dashboard...");
    setTimeout(() => {
      router.replace("/super-admin/dashboard");
    }, 300);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background text-foreground font-sans relative px-4 py-8">
      <div className="absolute inset-0 blueprint-grid opacity-5 pointer-events-none" />

      <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-xl overflow-hidden relative z-10 transition-all duration-300">
        
        {/* Navigation Bar / Back Link */}
        <div className="px-8 pt-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Home</span>
          </Link>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded-md">
            Institution Head
          </span>
        </div>

        {/* Portal Header */}
        <div className="p-8 pt-4 pb-3 text-center">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-3 transition-transform duration-300 hover:scale-105">
            <Building2 className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Super Admin Portal</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Sri Venkateswara College of Engineering • DataQuotes EduTech
          </p>
        </div>

        {/* 1-Click Demo Login Banner */}
        <div className="px-8 mb-4 space-y-2.5">
          <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/25 rounded-2xl p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="font-bold text-sm text-foreground">Demo Super Admin Access</span>
                </div>
                <p className="text-xs text-muted-foreground font-medium">
                  Dr. K. R. Prasad • Principal & Institution Head
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between bg-background/80 rounded-xl px-3 py-1.5 border border-border text-[11px] font-mono text-muted-foreground">
              <span>admin@svce.edu</span>
              <span className="text-slate-400">•</span>
              <span>Admin@1234</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Button
                type="button"
                size="sm"
                onClick={handleQuickDemoLogin}
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-xs font-bold h-9 shadow-sm flex items-center justify-center gap-1.5"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>1-Click Demo Login</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDirectDemoAccess}
                disabled={loading}
                className="w-full border-primary/30 text-primary hover:bg-primary/10 rounded-xl text-xs font-semibold h-9 flex items-center justify-center gap-1"
              >
                <span>Direct Dashboard →</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Success Alert Banner */}
        {success && (
          <div className="mx-8 mb-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center space-y-1 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="font-bold text-sm text-emerald-700">Welcome, Dr. K. R. Prasad!</h3>
            <p className="text-xs text-emerald-600">Signing into Super Admin Portal...</p>
          </div>
        )}

        {/* Standard Login Form */}
        <form onSubmit={onSubmit} className="p-8 pt-1 space-y-4">
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <Label htmlFor="username">Username / Email</Label>
              <button
                type="button"
                onClick={() => {
                  setUsername("admin@svce.edu");
                  setPassword("Admin@1234");
                }}
                className="text-[11px] text-primary hover:underline font-semibold flex items-center gap-1"
              >
                <Key className="w-3 h-3" /> Auto-fill Demo
              </button>
            </div>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                id="username"
                type="text"
                placeholder="admin@svce.edu"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (errors.username) setErrors({ ...errors, username: undefined });
                }}
                className={`pl-10 bg-background border-input text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/20 focus-visible:border-primary rounded-xl ${errors.username ? "border-destructive focus-visible:ring-destructive/20" : ""}`}
              />
            </div>
            {errors.username && <p className="text-xs text-destructive mt-1">{errors.username}</p>}
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <Label htmlFor="password">Password</Label>
              <span className="text-[11px] text-muted-foreground font-mono">Min 8 chars</span>
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
            {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-5 rounded-xl font-semibold shadow-md transition-all duration-300 hover-lift relative overflow-hidden group mt-4"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                <span>Processing...</span>
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <span>Sign In to Super Admin</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </Button>
        </form>

        {/* Security & Access Info */}
        <div className="px-8 pb-4">
          <div className="bg-muted/30 border border-border/70 rounded-xl p-3 text-[11px] text-muted-foreground space-y-1">
            <p className="font-semibold text-foreground flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              <span>Multi-Tenant RBAC Security</span>
            </p>
            <p className="leading-relaxed">
              Super Admin access provides governance across staff directory, student cohorts, HOD activations, and placement verifications for your institution.
            </p>
          </div>
        </div>

        <div className="p-4 bg-muted/30 border-t border-border/60 text-center text-[10px] text-muted-foreground">
          <span>© {new Date().getFullYear()} DataQuotes EduTech. All rights reserved.</span>
        </div>
      </div>
    </div>
  );
}
