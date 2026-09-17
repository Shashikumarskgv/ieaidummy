"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import AuthService from "@/services/auth.service";
import {
  GraduationCap,
  LayoutDashboard,
  LogOut,
  ArrowLeft,
  Menu,
  X,
  Users,
  ShieldCheck,
  BookOpen,
  MessageSquare,
  FileText,
  Tags,
  Database
} from "lucide-react";

interface NavItem {
  path: string;
  label: string;
  icon: React.ElementType;
  end?: boolean;
}

export default function DqAdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const navItems: NavItem[] = [
    { path: "/dq-admin/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
    { path: "/dq-admin/college", label: "Colleges", icon: GraduationCap },
    { path: "/dq-admin/finance/dashboard", label: "Finance Dashboard", icon: Database },
    { path: "/dq-admin/finance/transactions", label: "Transactions", icon: FileText },
    { path: "/dq-admin/finance/settlements", label: "Settlements", icon: Tags },
    { path: "/dq-admin/finance/college-ledger", label: "College Ledger", icon: Users },
    { path: "/dq-admin/finance/gateway-settings", label: "Gateway Settings", icon: MessageSquare },
  ];

  if (pathname.startsWith("/dq-admin/auth")) {
    return <>{children}</>;
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
          <span className="font-bold text-lg text-foreground">DQ Admin Panel</span>
        </div>
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all"
        >
          <Menu className="w-6 h-6" />
        </button>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-card border-r border-border flex flex-col justify-between z-50 transition-transform duration-300 lg:translate-x-0 ${
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full overflow-y-auto scrollbar-hide p-4 space-y-6">
          <div className="flex items-center justify-between px-2 pt-2">
            <span className="font-bold text-lg tracking-tight text-foreground">DQ Admin Panel</span>
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="lg:hidden p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.end ? pathname === item.path : pathname.startsWith(item.path);
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

          <div className="border-t border-border pt-4 space-y-1">
            <button
              onClick={() => router.push("/")}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground/80" />
              <span>Back to Site</span>
            </button>
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

      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/40 z-45 backdrop-blur-sm"
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 lg:pl-64 pt-16 lg:pt-0 min-h-screen transition-all duration-300">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
