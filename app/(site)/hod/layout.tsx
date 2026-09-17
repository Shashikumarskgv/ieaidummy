"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import AuthService from "@/services/auth.service";
import StorageService from "@/services/storage.service";
import {
  LayoutDashboard,
  FileBarChart2,
  User,
  LogOut,
  ArrowLeft,
  Menu,
  X,
  Award,
  BarChart3,
  GraduationCap
} from "lucide-react";

interface NavItem {
  path: string;
  label: string;
  icon: React.ElementType;
  end?: boolean;
}

export default function HODLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [authorized, setAuthorized] = useState(false);

  const navItems: NavItem[] = [
    { path: "/hod/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
    { path: "/hod/exams", label: "Manage Exams", icon: Award },
    { path: "/hod/reports", label: "Reports", icon: FileBarChart2 },
    { path: "/hod/analytics", label: "Analytics", icon: BarChart3 },
    { path: "/hod/profile", label: "Profile", icon: User },
  ];

  useEffect(() => {
    if (pathname.startsWith("/hod/auth") || pathname.startsWith("/hod/verify-onboarding")) {
      setAuthorized(true);
      return;
    }
    let user = AuthService.getCurrentUser();
    const isHOD = user && (user.role_id === 3 || String(user.role || "").toUpperCase().includes("HOD"));
    if (!user || !isHOD) {
      // Auto-initialize demo HOD session so direct navigation to any HOD route works immediately
      const demoUser = {
        id: 301,
        role_id: 3,
        role: "HOD",
        full_name: "Dr. Rajesh Varma",
        email: "hod.cse@college.edu",
        college_code: "SVCE1234",
        college_name: "Sri Venkateswara College of Engineering",
        department: "Computer Science & Engineering"
      };
      StorageService.saveSession("mock_jwt_token_hod_svce", demoUser);
    }
    setAuthorized(true);
  }, [pathname]);

  if (pathname.startsWith("/hod/auth") || pathname.startsWith("/hod/verify-onboarding")) {
    return <>{children}</>;
  }

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleSignOut = async () => {
    await AuthService.logout();
    router.replace("/hod/auth");
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-foreground flex font-sans overflow-x-hidden relative">
      
      {/* Mobile Top Navigation Header */}
      <header className="lg:hidden flex items-center justify-between w-full h-16 px-4 border-b border-border bg-card absolute top-0 left-0 z-40">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-primary" />
          <span className="font-bold text-lg text-foreground">HOD Portal</span>
        </div>
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all"
        >
          <Menu className="w-6 h-6" />
        </button>
      </header>

      {/* Sidebar - Desktop Layout & Mobile Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-card border-r border-border flex flex-col justify-between z-50 transition-transform duration-300 lg:translate-x-0 ${
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full overflow-y-auto scrollbar-hide p-4 space-y-6">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between px-2 pt-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-base tracking-tight text-foreground block leading-tight">HOD Portal</span>
                <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block">Dept of CSE</span>
              </div>
            </div>
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="lg:hidden p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav Links */}
          <div className="flex-1 space-y-1.5 pt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.end
                ? pathname === item.path
                : pathname.startsWith(item.path);

              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-primary-foreground" : "text-muted-foreground/80"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* HOD Profile Mini Card */}
          <Link href="/hod/profile" className="p-3 bg-muted/40 hover:bg-muted/60 transition-colors border border-border/60 rounded-2xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
              RV
            </div>
            <div className="overflow-hidden">
              <span className="text-xs font-bold text-foreground block truncate">Dr. Rajesh Varma</span>
              <span className="text-[10px] text-muted-foreground block truncate">HOD • CSE Dept</span>
            </div>
          </Link>

          {/* Sidebar Bottom Footer items */}
          <div className="border-t border-border pt-4 space-y-1">
            <Link
              href="/"
              className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
            >
              <ArrowLeft className="w-4 h-4 text-muted-foreground/80" />
              <span>Back to Main Site</span>
            </Link>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
            >
              <LogOut className="w-4 h-4 text-muted-foreground/80" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay backdrop for mobile menu */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/40 z-45 backdrop-blur-sm"
        />
      )}

      {/* Nested Main Content Area */}
      <main className="flex-1 lg:pl-64 pt-16 lg:pt-0 min-h-screen transition-all duration-300">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>

    </div>
  );
}
