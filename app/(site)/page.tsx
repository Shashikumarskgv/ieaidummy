"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  Briefcase,
  GraduationCap,
  UserCheck,
  ShieldCheck,
  Sparkles,
  Lock,
  Database,
  CheckCircle2,
  BarChart3,
  Code2,
  ArrowRight,
  ChevronRight,
  Users,
  Award,
  Globe,
  Zap,
  Check,
  PhoneCall,
  Mail,
  Menu,
  X,
  Play,
  FileText,
  Clock,
  Layers,
  Cpu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import AuthService from "@/services/auth.service";

const roles = [
  {
    label: "Superadmin",
    href: "/super-admin/auth",
    roleTitle: "College Superadmin Portal",
    icon: Building2,
    desc: "Institution profile, academic hierarchy & staff/student bulk provisioning",
    badge: "Institution Head"
  },
  {
    label: "TPO",
    href: "/tpo/auth",
    roleTitle: "Training & Placement Portal",
    icon: Briefcase,
    desc: "Recruiter management, job postings & automated eligibility filtering",
    badge: "Placement Office"
  },
  {
    label: "Company HR",
    href: "/hr/login",
    roleTitle: "Company HR Portal",
    icon: UserCheck,
    desc: "3-Day temporary recruiter access, applicant evaluation, hiring status & HR exams",
    badge: "Corporate Recruiter"
  },
  {
    label: "HOD",
    href: "/hod/auth",
    roleTitle: "Department & Faculty Portal",
    icon: GraduationCap,
    desc: "AI Question authoring, proctored exam scheduling & delayed analytics",
    badge: "Academic Lead"
  },
  {
    label: "Student",
    href: "/student/auth",
    roleTitle: "Student & Learner Portal",
    icon: UserCheck,
    desc: "Proctored exams, 100% profile builder & Gemini AI interview prep",
    badge: "Learner Portal"
  },
  {
    label: "DQ Admin",
    href: "/dq-admin/auth",
    roleTitle: "DataQuotes Platform Admin",
    icon: ShieldCheck,
    desc: "Global tenant DB provisioning, system infrastructure & health monitoring",
    badge: "Global Admin"
  }
] as const;

export default function Page() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeRoleTab, setActiveRoleTab] = useState<string>("Student");
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [demoSubmitted, setDemoSubmitted] = useState(false);

  // Preserve existing authentication check and role redirection
  useEffect(() => {
    const user = AuthService.getUser();
    if (user) {
      const roleId = Number(user.role_id || user.roleId || 0);
      const roleName = String(user.role || "").toUpperCase();

      if (roleId === 1 || roleName.includes("SUPER")) {
        router.replace("/super-admin/dashboard");
        return;
      } else if (roleId === 2 || roleName.includes("TPO")) {
        router.replace("/tpo/dashboard");
        return;
      } else if (roleId === 3 || roleName.includes("HOD")) {
        router.replace("/hod/dashboard");
        return;
      } else if (roleId === 5 || roleName.includes("STUDENT")) {
        router.replace("/student/dashboard");
        return;
      } else if (roleId === 4 || roleName.includes("DQ")) {
        router.replace("/dq-admin/dashboard");
        return;
      }
    }
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#ff6666]" />
          <p className="text-sm font-medium text-slate-500">Loading DataQuotes IEAI...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-[#ff6666]/20 selection:text-[#ff6666]">
      {/* 1. STICKY ENTERPRISE NAVIGATION */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-md transition-all">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-md shadow-[#ff6666]/25 transition-transform group-hover:scale-105">
              <img
                src="/College_Invitation_LMS.png"
                alt="Logo"
                className="h-10 w-10 object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-slate-900">
                DataQuotes<span className="text-[#ff6666]">IEAI</span>
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                Enterprise B2B
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden items-center gap-8 md:flex text-sm font-medium text-slate-600">
            <a href="#features" className="transition-colors hover:text-[#ff6666]">Features</a>
            <a href="#ai-platform" className="transition-colors hover:text-[#ff6666]">AI Platform</a>
            <a href="#proctoring" className="transition-colors hover:text-[#ff6666]">Proctoring</a>
            <a href="#placement" className="transition-colors hover:text-[#ff6666]">Placement</a>
            <a href="#workflow" className="transition-colors hover:text-[#ff6666]">Workflow</a>
            <a href="#roles" className="transition-colors hover:text-[#ff6666]">Role Portals</a>
          </nav>

          {/* Nav Actions */}
          <div className="hidden items-center gap-4 md:flex">
            <a
              href="#portal"
              className="text-sm font-semibold text-slate-700 hover:text-[#ff6666] transition-colors"
            >
              Role Logins
            </a>
            <Button
              onClick={() => setDemoModalOpen(true)}
              className="h-10 rounded-xl bg-[#ff6666] hover:bg-rose-600 text-white font-semibold shadow-md shadow-[#ff6666]/20 transition-all hover:shadow-lg hover:shadow-[#ff6666]/30"
            >
              Book Demo
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 md:hidden"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="border-t border-slate-200 bg-white px-6 py-6 md:hidden">
            <nav className="flex flex-col gap-4 text-base font-medium text-slate-700">
              <a href="#features" onClick={() => setMobileMenuOpen(false)}>Features</a>
              <a href="#ai-platform" onClick={() => setMobileMenuOpen(false)}>AI Platform</a>
              <a href="#proctoring" onClick={() => setMobileMenuOpen(false)}>Proctoring</a>
              <a href="#placement" onClick={() => setMobileMenuOpen(false)}>Placement</a>
              <a href="#workflow" onClick={() => setMobileMenuOpen(false)}>Workflow</a>
              <a href="#roles" onClick={() => setMobileMenuOpen(false)}>Role Portals</a>
              <hr className="my-2 border-slate-100" />
              <Button
                onClick={() => { setMobileMenuOpen(false); setDemoModalOpen(true); }}
                className="w-full bg-[#ff6666] text-white"
              >
                Book Institutional Demo
              </Button>
            </nav>
          </div>
        )}
      </header>

      {/* 2. HERO SECTION WITH EMBEDDED ROLE ACCESS PORTAL */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
        {/* Background Decorative Gradients */}
        <div className="pointer-events-none absolute -top-24 right-0 h-96 w-96 rounded-full bg-[#ff6666]/10 blur-3xl" />
        <div className="pointer-events-none absolute top-1/2 -left-24 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">

            {/* Hero Text Left Column */}
            <div className="flex flex-col items-start lg:col-span-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold text-slate-700 shadow-sm">
                <span className="flex h-2 w-2 rounded-full bg-[#ff6666] animate-pulse" />
                <span>Next-Gen Enterprise IEAI & Placement Platform</span>
              </div>

              <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl leading-[1.15]">
                Empowering Institutions with <span className="text-[#ff6666]">AI-Driven Learning</span>, Proctored Assessments & Placement Excellence
              </h1>

              <p className="mt-6 text-lg text-slate-600 leading-relaxed">
                A unified multi-tenant ecosystem for engineering colleges & universities. Complete with isolated tenant databases, lockdown examination proctoring, 100% dynamic profile intelligence, Gemini AI interview preparation, and corporate placement automation.
              </p>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Button
                  onClick={() => setDemoModalOpen(true)}
                  size="lg"
                  className="h-13 rounded-2xl bg-[#ff6666] hover:bg-rose-600 text-white font-bold px-8 text-base shadow-xl shadow-[#ff6666]/25 transition-all hover:scale-[1.02]"
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Book Institutional Demo
                </Button>
                <a href="#features">
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-13 rounded-2xl border-slate-300 bg-white font-semibold text-slate-700 hover:bg-slate-50 px-8 text-base shadow-sm"
                  >
                    Explore Features
                    <ArrowRight className="ml-2 h-5 w-5 text-slate-400" />
                  </Button>
                </a>
              </div>

              {/* Trust Badges Pill List */}
              <div className="mt-10 grid grid-cols-2 gap-3 text-xs font-medium text-slate-600 sm:grid-cols-3">
                <div className="flex items-center gap-2 rounded-lg bg-white p-2.5 shadow-sm border border-slate-200/80">
                  <CheckCircle2 className="h-4 w-4 text-[#ff6666]" />
                  <span>Isolated Tenant DBs</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-white p-2.5 shadow-sm border border-slate-200/80">
                  <Lock className="h-4 w-4 text-[#ff6666]" />
                  <span>Lockdown Proctoring</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-white p-2.5 shadow-sm border border-slate-200/80">
                  <Cpu className="h-4 w-4 text-[#ff6666]" />
                  <span>Gemini AI Engine</span>
                </div>
              </div>
            </div>

            {/* Hero Right Column: EMBEDDED ROLE ACCESS PORTAL */}
            <div id="portal" className="lg:col-span-6 scroll-mt-24">
              <div className="relative rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xl shadow-slate-200/50 backdrop-blur-xl">

                {/* Header Badge */}
                <div className="mb-6 text-center">
                  <span className="inline-block rounded-full bg-rose-50 px-3 py-1 text-xs font-bold uppercase tracking-widest text-[#ff6666]">
                    IEAI PORTAL
                  </span>
                  <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                    Choose your role
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Select the button below to continue to your login page.
                  </p>
                </div>

                {/* Role Buttons Grid */}
                <div className="grid gap-3">
                  {roles.map((role) => {
                    const RoleIcon = role.icon;
                    return (
                      <Link
                        key={role.href}
                        href={role.href}
                        className="group relative flex items-center justify-between rounded-2xl border border-slate-200/80 bg-slate-50 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#ff6666]/40 hover:bg-gradient-to-r hover:from-white hover:to-rose-50/40 hover:shadow-md"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white border border-slate-200 text-[#ff6666] shadow-sm transition-transform group-hover:scale-105 group-hover:bg-[#ff6666] group-hover:text-white group-hover:border-[#ff6666]">
                            <RoleIcon className="h-6 w-6" />
                          </div>
                          <div className="flex flex-col text-left">
                            <div className="flex items-center gap-2">
                              <span className="text-base font-bold text-slate-900 group-hover:text-[#ff6666]">
                                {role.label}
                              </span>
                              <span className="rounded-md bg-slate-200/70 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                                {role.badge}
                              </span>
                            </div>
                            <span className="text-xs text-slate-500 line-clamp-1">
                              {role.desc}
                            </span>
                          </div>
                        </div>

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white border border-slate-200 text-slate-400 group-hover:bg-[#ff6666] group-hover:border-[#ff6666] group-hover:text-white transition-all">
                          <ChevronRight className="h-5 w-5" />
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* Security Footer Note */}
                <div className="mt-6 border-t border-slate-100 pt-4 text-center">
                  <p className="text-xs text-slate-400 flex items-center justify-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-slate-400" />
                    <span>Protected by DataQuotes Multi-Tenant RBAC Security</span>
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. TRUST METRICS BAR */}
      <section className="border-y border-slate-200 bg-white py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-5">
            <div className="flex flex-col">
              <span className="text-3xl font-extrabold text-slate-900 sm:text-4xl">50+</span>
              <span className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">Partner Colleges</span>
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-extrabold text-[#ff6666] sm:text-4xl">100K+</span>
              <span className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">Active Students</span>
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-extrabold text-slate-900 sm:text-4xl">500K+</span>
              <span className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">Proctored Exams</span>
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-extrabold text-[#ff6666] sm:text-4xl">99.9%</span>
              <span className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">Platform Uptime</span>
            </div>
            <div className="col-span-2 flex flex-col md:col-span-1">
              <span className="text-3xl font-extrabold text-slate-900 sm:text-4xl">94%</span>
              <span className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">Placement Rate</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PRODUCT SHOWCASE - 5 CORE PILLARS */}
      <section id="features" className="py-24 bg-slate-50 scroll-mt-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#ff6666]">
              Core Capabilities
            </span>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Built for Institutional Excellence & Career Outcomes
            </h2>
            <p className="mt-4 text-slate-600 text-base sm:text-lg">
              Everything your college needs to deliver proctored academic assessments, AI career coaching, and streamlined corporate placements.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">

            {/* Card 1: Multi-Tenant Architecture */}
            <div className="group rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#ff6666]/50 hover:shadow-xl">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-[#ff6666] group-hover:bg-[#ff6666] group-hover:text-white transition-colors">
                <Database className="h-7 w-7" />
              </div>
              <h3 className="mt-6 text-xl font-bold text-slate-900">Multi-Tenant Database Isolation</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                Every onboarded institution gets a dedicated MySQL database (<code className="text-xs bg-slate-100 px-1 py-0.5 rounded">dq_ieai_college_code</code>). Ensures zero data leakage between colleges, custom branding, and independent data sovereignty.
              </p>
              <div className="mt-6 flex items-center gap-2 text-xs font-bold text-[#ff6666]">
                <span>Zero Cross-Tenant Leakage</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>

            {/* Card 2: AI Proctored Examination Engine */}
            <div id="proctoring" className="group rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#ff6666]/50 hover:shadow-xl scroll-mt-24">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Lock className="h-7 w-7" />
              </div>
              <h3 className="mt-6 text-xl font-bold text-slate-900">AI Proctored Exam Engine</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                Fullscreen lockdown browser, maximum tab-switch rules, 10-second auto-save loops, MCQ grading, and sandboxed code execution against hidden test cases.
              </p>
              <div className="mt-6 flex items-center gap-2 text-xs font-bold text-blue-600">
                <span>Delayed Score Release Policy</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>

            {/* Card 3: 100% Profile Intelligence */}
            <div className="group rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#ff6666]/50 hover:shadow-xl">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <UserCheck className="h-7 w-7" />
              </div>
              <h3 className="mt-6 text-xl font-bold text-slate-900">100% Profile Completion Engine</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                Dynamically evaluates 28 student attributes across Personal, Academic, and Career metrics. Acts as the mandatory gatekeeper to unlock AI interview prep.
              </p>
              <div className="mt-6 flex items-center gap-2 text-xs font-bold text-emerald-600">
                <span>28-Attribute Verification</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>

            {/* Card 4: Gemini AI Interview Suite */}
            <div id="ai-platform" className="group rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#ff6666]/50 hover:shadow-xl scroll-mt-24">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <Sparkles className="h-7 w-7" />
              </div>
              <h3 className="mt-6 text-xl font-bold text-slate-900">Gemini AI Interview Prep</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                Generates 300+ personalized questions monthly (250 Role-based, 30 Project-based, 20 Weak-Area targeted, 20 HR) tailored to student performance & weak exam topics.
              </p>
              <div className="mt-6 flex items-center gap-2 text-xs font-bold text-purple-600">
                <span>Monthly AI Regeneration</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>

            {/* Card 5: Corporate TPO Placement Portal */}
            <div id="placement" className="group rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#ff6666]/50 hover:shadow-xl scroll-mt-24">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <Briefcase className="h-7 w-7" />
              </div>
              <h3 className="mt-6 text-xl font-bold text-slate-900">Corporate TPO Placement Portal</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                Training & Placement Officers post job openings with automated CGPA, backlog, and branch eligibility filters. Tracks candidate progress from application to offer.
              </p>
              <div className="mt-6 flex items-center gap-2 text-xs font-bold text-amber-600">
                <span>Automated Academic Filters</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>

            {/* Card 6: Analytics & Multi-Role Governance */}
            <div className="group rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#ff6666]/50 hover:shadow-xl">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <BarChart3 className="h-7 w-7" />
              </div>
              <h3 className="mt-6 text-xl font-bold text-slate-900">Multi-Tier Analytics</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                Real-time performance analytics for HODs and Principals, branch-wise placement statistics for TPOs, and overall platform metrics for DataQuotes Admins.
              </p>
              <div className="mt-6 flex items-center gap-2 text-xs font-bold text-indigo-600">
                <span>Real-Time Dashboards</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 5. PLATFORM WORKFLOW - END-TO-END TIMELINE */}
      <section id="workflow" className="py-24 bg-white border-y border-slate-200 scroll-mt-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#ff6666]">
              End-to-End Workflow
            </span>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              From College Onboarding to Placement Success
            </h2>
            <p className="mt-4 text-slate-600 text-base sm:text-lg">
              A continuous, seamless operational cycle connecting institutional administration, faculty proctoring, student preparation, and recruiter hiring.
            </p>
          </div>

          <div className="mt-16 relative">
            {/* Timeline Line */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-slate-100 -translate-y-1/2 z-0" />

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-6 relative z-10">

              <div className="flex flex-col items-center text-center bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ff6666] text-white font-bold text-lg mb-4 shadow-md">
                  1
                </div>
                <h4 className="text-sm font-bold text-slate-900">1. Onboarding</h4>
                <p className="mt-2 text-xs text-slate-500">DQ Admin provisions isolated tenant database for college.</p>
              </div>

              <div className="flex flex-col items-center text-center bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-white font-bold text-lg mb-4 shadow-md">
                  2
                </div>
                <h4 className="text-sm font-bold text-slate-900">2. Bulk Import</h4>
                <p className="mt-2 text-xs text-slate-500">Superadmin provisions departments, staff & students via CSV.</p>
              </div>

              <div className="flex flex-col items-center text-center bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ff6666] text-white font-bold text-lg mb-4 shadow-md">
                  3
                </div>
                <h4 className="text-sm font-bold text-slate-900">3. Proctored Exam</h4>
                <p className="mt-2 text-xs text-slate-500">HOD publishes exam. Students take tests in lockdown browser.</p>
              </div>

              <div className="flex flex-col items-center text-center bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-white font-bold text-lg mb-4 shadow-md">
                  4
                </div>
                <h4 className="text-sm font-bold text-slate-900">4. 100% Profile</h4>
                <p className="mt-2 text-xs text-slate-500">Student verifies 28 profile attributes to unlock AI engine.</p>
              </div>

              <div className="flex flex-col items-center text-center bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ff6666] text-white font-bold text-lg mb-4 shadow-md">
                  5
                </div>
                <h4 className="text-sm font-bold text-slate-900">5. Gemini AI Prep</h4>
                <p className="mt-2 text-xs text-slate-500">AI generates monthly role, project & weak-area question sets.</p>
              </div>

              <div className="flex flex-col items-center text-center bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-white font-bold text-lg mb-4 shadow-md">
                  6
                </div>
                <h4 className="text-sm font-bold text-slate-900">6. Placement</h4>
                <p className="mt-2 text-xs text-slate-500">TPO posts filtered jobs; eligible student gets hired.</p>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* 6. ROLE-BASED INTERACTIVE EXPLORER */}
      <section id="roles" className="py-24 bg-slate-50 scroll-mt-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#ff6666]">
              Role Explorer
            </span>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Tailored Portals for Every Stakeholder
            </h2>
            <p className="mt-4 text-slate-600 text-base">
              Explore dedicated features and access workflows designed specifically for each role in your institution.
            </p>
          </div>

          {/* Interactive Role Tabs */}
          <div className="mt-12">
            <div className="flex flex-wrap items-center justify-center gap-2 border-b border-slate-200 pb-4">
              {roles.map((r) => (
                <button
                  key={r.label}
                  onClick={() => setActiveRoleTab(r.label)}
                  className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${activeRoleTab === r.label
                    ? "bg-[#ff6666] text-white shadow-md shadow-[#ff6666]/20"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                    }`}
                >
                  <r.icon className="h-4 w-4" />
                  <span>{r.label}</span>
                </button>
              ))}
            </div>

            {/* Role Tab Content View */}
            {roles
              .filter((r) => r.label === activeRoleTab)
              .map((r) => (
                <div key={r.label} className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
                  <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
                    <div className="lg:col-span-7">
                      <span className="rounded-md bg-rose-50 px-2.5 py-1 text-xs font-bold text-[#ff6666]">
                        {r.badge}
                      </span>
                      <h3 className="mt-4 text-2xl font-bold text-slate-900">{r.roleTitle}</h3>
                      <p className="mt-2 text-slate-600 text-base">{r.desc}</p>

                      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 text-sm text-slate-700">
                        <div className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-[#ff6666]" />
                          <span>Dedicated RBAC Permission Scope</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-[#ff6666]" />
                          <span>Real-Time Analytical Dashboards</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-[#ff6666]" />
                          <span>Automated Workflow Notifications</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-[#ff6666]" />
                          <span>Secure Multi-Tenant Isolated Access</span>
                        </div>
                      </div>

                      <div className="mt-8">
                        <Link href={r.href}>
                          <Button className="rounded-xl bg-[#ff6666] hover:bg-rose-600 text-white font-bold px-6">
                            Go to {r.label} Login Portal
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>

                    <div className="lg:col-span-5 flex justify-center">
                      <div className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center shadow-inner">
                        <r.icon className="mx-auto h-20 w-20 text-[#ff6666]/80" />
                        <h4 className="mt-4 text-lg font-bold text-slate-900">{r.roleTitle}</h4>
                        <p className="mt-1 text-xs text-slate-500">Authorized Portal Access Route: <code className="text-[#ff6666]">{r.href}</code></p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* 7. ENTERPRISE HIGHLIGHTS GRID */}
      <section className="py-24 bg-white border-y border-slate-200">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#ff6666]">
              Feature Matrix
            </span>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Complete Platform Feature Grid
            </h2>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "Multi-Tenant Isolation", desc: "Dedicated MySQL DB per institution with zero leakage.", icon: Database },
              { title: "Lockdown Proctoring", desc: "Fullscreen enforcement & tab switch limits.", icon: Lock },
              { title: "Sandboxed Code Execution", desc: "Evaluates code against hidden test cases instantly.", icon: Code2 },
              { title: "Delayed Result Policy", desc: "Student scores locked until exam end time.", icon: Clock },
              { title: "Gemini AI Question Creator", desc: "Faculty generates MCQs & code prompts via AI.", icon: Cpu },
              { title: "CSV Bulk Import Audit", desc: "Failed rows recorded in audit log for download.", icon: FileText },
              { title: "Dynamic CGPA Filtering", desc: "TPO filters applicants by CGPA & backlog count.", icon: Briefcase },
              { title: "28-Attribute Profile", desc: "Comprehensive profile completeness calculation.", icon: UserCheck },
              { title: "Monthly AI Datasets", desc: "Personalized 300+ interview questions refreshed monthly.", icon: Sparkles },
              { title: "Multi-Tier Analytics", desc: "Role-specific real-time intelligence & heatmaps.", icon: BarChart3 },
              { title: "Transactional Alerts", desc: "Email notifications for exams, results & job posts.", icon: Mail },
              { title: "White-Label Institution", desc: "Custom domains and institution branding.", icon: Globe }
            ].map((item, idx) => (
              <div key={idx} className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 transition-all hover:bg-white hover:shadow-md">
                <item.icon className="h-6 w-6 text-[#ff6666]" />
                <h4 className="mt-4 text-base font-bold text-slate-900">{item.title}</h4>
                <p className="mt-1 text-xs text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. CALL TO ACTION & DEMO REQUEST BANNER */}
      <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-[#ff6666]/20 blur-3xl" />

        <div className="mx-auto max-w-7xl px-6 relative z-10 text-center">
          <span className="inline-block rounded-full bg-[#ff6666]/20 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#ff6666]">
            Get Started Today
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-5xl text-white">
            Ready to Transform Your Institution's Ecosystem?
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-slate-300 text-base sm:text-lg leading-relaxed">
            Schedule a personalized walkthrough of the DataQuotes IEAI multi-tenant platform with our enterprise education team.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button
              onClick={() => setDemoModalOpen(true)}
              size="lg"
              className="h-14 rounded-2xl bg-[#ff6666] hover:bg-rose-600 text-white font-bold px-8 text-base shadow-xl shadow-[#ff6666]/30"
            >
              <PhoneCall className="mr-2 h-5 w-5" />
              Book Institutional Demo
            </Button>
            <a href="#portal">
              <Button
                variant="outline"
                size="lg"
                className="h-14 rounded-2xl border-slate-700 bg-slate-800 text-white hover:bg-slate-700 px-8 text-base"
              >
                Access Role Portals
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* 9. ENTERPRISE FOOTER */}
      <footer className="border-t border-slate-200 bg-white py-12 text-slate-600">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-8 md:grid-cols-4">

            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-sm">
                  <img
                    src="/College_Invitation_LMS.png"
                    alt="Logo"
                    className="h-9 w-9 object-contain"
                  />
                </div>
                <span className="text-lg font-bold text-slate-900">
                  DataQuotes<span className="text-[#ff6666]">IEAI</span>
                </span>
              </div>
              <p className="mt-4 text-xs text-slate-500 leading-relaxed">
                Enterprise Multi-Tenant Learning Management, AI Examination, & Career Placement Engine for Educational Institutions.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Portals</h4>
              <ul className="mt-4 space-y-2 text-xs">
                <li><Link href="/super-admin/auth" className="hover:text-[#ff6666]">Superadmin Portal</Link></li>
                <li><Link href="/tpo/auth" className="hover:text-[#ff6666]">TPO Placement Portal</Link></li>
                <li><Link href="/hr/login" className="hover:text-[#ff6666]">Company HR Portal</Link></li>
                <li><Link href="/hod/auth" className="hover:text-[#ff6666]">HOD & Faculty Portal</Link></li>
                <li><Link href="/student/auth" className="hover:text-[#ff6666]">Student & AI Portal</Link></li>
                <li><Link href="/dq-admin/auth" className="hover:text-[#ff6666]">DQ Platform Admin</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Features</h4>
              <ul className="mt-4 space-y-2 text-xs">
                <li><a href="#proctoring" className="hover:text-[#ff6666]">Lockdown Proctoring</a></li>
                <li><a href="#ai-platform" className="hover:text-[#ff6666]">Gemini AI Prep</a></li>
                <li><a href="#placement" className="hover:text-[#ff6666]">TPO Placement Engine</a></li>
                <li><a href="#features" className="hover:text-[#ff6666]">100% Profile Engine</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Contact & Support</h4>
              <p className="mt-4 text-xs text-slate-500">
                Official Support: <span className="text-slate-900 font-semibold">support@dataquotes.net</span>
              </p>
              <p className="mt-2 text-xs text-slate-500">
                Infrastructure: Multi-Tenant Cloud Architecture
              </p>
            </div>

          </div>

          <div className="mt-12 border-t border-slate-100 pt-6 text-center text-xs text-slate-400">
            © {new Date().getFullYear()} DataQuotes IEAI Platform. All rights reserved. Built for higher education.
          </div>
        </div>
      </footer>

      {/* 10. DEMO REQUEST MODAL */}
      {demoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => { setDemoModalOpen(false); setDemoSubmitted(false); }}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>

            {!demoSubmitted ? (
              <div>
                <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-[#ff6666]">
                  Institutional Demo
                </span>
                <h3 className="mt-3 text-2xl font-bold text-slate-900">Request Platform Walkthrough</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Fill in your institutional details to schedule a live demo with our solution architects.
                </p>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setDemoSubmitted(true);
                  }}
                  className="mt-6 space-y-4"
                >
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Institution Name</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Oxford Institute of Technology"
                      className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-[#ff6666] focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700">Official Email</label>
                      <input
                        required
                        type="email"
                        placeholder="admin@college.edu"
                        className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-[#ff6666] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700">Phone Number</label>
                      <input
                        required
                        type="tel"
                        placeholder="+91 9876543210"
                        className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-[#ff6666] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Your Role</label>
                    <select className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-[#ff6666] focus:outline-none">
                      <option>Principal / Director / Dean</option>
                      <option>Head of Department (HOD)</option>
                      <option>Training & Placement Officer (TPO)</option>
                      <option>IT Administrator / Technical Lead</option>
                    </select>
                  </div>

                  <Button type="submit" className="mt-2 w-full rounded-xl bg-[#ff6666] hover:bg-rose-600 text-white font-bold py-3 text-sm">
                    Submit Demo Request
                  </Button>
                </form>
              </div>
            ) : (
              <div className="py-8 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <Check className="h-8 w-8" />
                </div>
                <h3 className="mt-4 text-xl font-bold text-slate-900">Demo Request Submitted!</h3>
                <p className="mt-2 text-xs text-slate-600">
                  Thank you. Our DataQuotes Enterprise Team will contact your institution within 24 hours.
                </p>
                <Button
                  onClick={() => { setDemoModalOpen(false); setDemoSubmitted(false); }}
                  className="mt-6 rounded-xl bg-slate-900 text-white px-6"
                >
                  Close Window
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
