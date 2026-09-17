"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import AuthService from "@/services/auth.service";
import {
  LayoutDashboard,
  Briefcase,
  User,
  LogOut,
  ArrowLeft,
  Menu,
  X,
  Award,
  Brain,
  BarChart3,
  FileText,
  ClipboardList,
} from "lucide-react";

interface NavItem {
  path: string;
  label: string;
  icon: React.ElementType;
  end?: boolean;
}

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const navItems: NavItem[] = [
    { path: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
    { path: "/student/exams", label: "My Exams", icon: Award },
    { path: "/student/interview", label: "Interview Preparation", icon: Brain },
    { path: "/student/reports", label: "Reports", icon: BarChart3 },
    { path: "/student/jobs", label: "Jobs", icon: Briefcase },
    { path: "/student/profile", label: "Profile", icon: User },
    { path: "/student/resumes", label: "Resume", icon: ClipboardList },
    { path: "/student/payment", label: "Subscription Payment", icon: ClipboardList },
  ];

  React.useEffect(() => {
    if (pathname.startsWith("/student/auth") || pathname.startsWith("/student/verify-onboarding")) {
      setAuthorized(true);
      return;
    }
    const user = AuthService.getCurrentUser();
    if (!user || user.role_id !== 5) {
      AuthService.logout();
      router.replace("/student/auth");
    } else {
      setAuthorized(true);
    }
  }, [pathname]);

  if (pathname.startsWith("/student/auth") || pathname.startsWith("/student/verify-onboarding")) {
    return <>{children}</>;
  }

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isExamRunner = pathname.includes("/examrunner/") || pathname.includes("/write");
  if (isExamRunner) {
    return <div className="min-h-screen bg-background text-foreground flex flex-col font-sans relative w-full">{children}</div>;
  }

  const handleSignOut = async () => {
    await AuthService.logout();
    router.replace("/");
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-foreground flex font-sans overflow-x-hidden relative">
      
      {/* Mobile Top Navigation Header */}
      <header className="lg:hidden flex items-center justify-between w-full h-16 px-4 border-b border-border bg-card absolute top-0 left-0 z-40">
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg text-foreground">Student Portal</span>
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
            <span className="font-bold text-lg tracking-tight text-foreground">Student Portal</span>
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="lg:hidden p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path || (item.path !== "/student/dashboard" && pathname.startsWith(item.path));
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-primary" : "text-muted-foreground/80"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Sidebar Bottom Footer items */}
          <div className="border-t border-border pt-4 space-y-1">
            <Link
              href="/"
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground/80" />
              <span>Back to Site</span>
            </Link>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
            >
              <LogOut className="w-5 h-5 text-muted-foreground/80" />
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
