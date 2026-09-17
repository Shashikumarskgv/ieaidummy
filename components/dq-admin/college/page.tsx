"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Edit2,
  Send,
  Lock,
  Unlock,
  Trash2,
  Copy,
  Download,
  Check,
  ChevronDown,
  Info,
  Calendar,
  Sparkles,
  Users,
  Activity,
  CheckCircle,
  Clock,
  Ban,
  ArrowRight,
  X,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

import {
  College,
  ActivityLog,
  getStoredActivities,
  addActivity
} from "@/lib/mockColleges";
import { fetchColleges, fetchCollegeById, updateCollegeStatus, deleteCollege as deleteCollegeApi, resendCollegeInvitation, getCollegeInvitationLink } from "@/services/college.service";

// Pages are routed directly via Next.js routes

const STATES = [
  "Andhra Pradesh",
  "Telangana",
  "Karnataka",
  "Tamil Nadu",
  "Kerala",
  "Maharashtra",
  "Delhi"
];

const TYPES = ["Engineering", "Polytechnic", "Degree", "MBA", "Arts"];

const STATUSES = ["Active", "Pending", "Inactive", "Invited", "Archived"];

const ACADEMIC_LABELS: Record<string, string> = {
  ENG: "Engineering & Technology",
  MGMT: "Management / Business School",
  ASC: "Arts, Science & Commerce",
  Engineering: "Engineering & Technology",
  Management: "Management / Business School",
  ArtsScienceCommerce: "Arts, Science & Commerce",
  UG: "Undergraduate",
  PG: "Postgraduate",
  INT: "Integrated Degree",
  DIP: "Diploma",
  BTECH: "B.Tech / B.E.",
  MTECH: "M.Tech / M.E.",
  IBTM: "Integrated B.Tech + M.Tech",
  POLY: "Polytechnic Diploma",
  MBA: "MBA / PGDM",
  EMBA: "Executive MBA",
  BBA: "BBA / BMS / BBM",
  IBBA: "Integrated BBA + MBA"
};

const formatAcademicLabel = (id: string) => ACADEMIC_LABELS[id] || id;

const getAcademicSections = (academicProfile: College["academicProfile"]) => {
  if (!academicProfile || typeof academicProfile !== "object") {
    return [];
  }

  const sectionsByDepartments = new Map<string, { key: string; type: string; degree: string; departments: string[]; score: number }>();

  Object.entries(academicProfile as Record<string, any>).forEach(([typeId, typeProfile]) => {
    if (!typeProfile || typeof typeProfile !== "object") return;

    Object.entries(typeProfile as Record<string, any>).forEach(([, levelProfile]) => {
      if (!levelProfile || typeof levelProfile !== "object") return;

      Object.entries(levelProfile as Record<string, any>).forEach(([degreeId, departments]) => {
        if (!Array.isArray(departments) || departments.length === 0) return;

        const cleanDepartments = departments.map(String).filter(Boolean);
        const signature = cleanDepartments.join("|");
        if (!signature) return;

        const score = Number(/^\d+$/.test(typeId)) + Number(/^\d+$/.test(degreeId));
        const existing = sectionsByDepartments.get(signature);

        if (existing && existing.score <= score) {
          return;
        }

        sectionsByDepartments.set(signature, {
          key: `${typeId}-${degreeId}-${signature}`,
          type: formatAcademicLabel(typeId),
          degree: formatAcademicLabel(degreeId),
          departments: cleanDepartments,
          score
        });
      });
    });
  });

  return Array.from(sectionsByDepartments.values()).map(({ score, ...section }) => section);
};

export default function CollegesMasterPage() {
  const router = useRouter();

  const [colleges, setColleges] = useState<College[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [sortBy, setSortBy] = useState("createdDesc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Selection & Modal States
  const [checkedIds, setCheckedIds] = useState<string[]>([]);
  const [viewCollege, setViewCollege] = useState<College | null>(null);
  const [editCollege, setEditCollege] = useState<College | null>(null);
  const [deleteCollege, setDeleteCollege] = useState<College | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const refreshData = async () => {
    try {
      setIsLoading(true);
      const apiColleges = await fetchColleges();
      setColleges(apiColleges);
      setActivities(getStoredActivities());
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || "Failed to load colleges from backend API.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Actions
  const handleResendInvite = async (college: College) => {
    if (college.status === "Active") {
      toast.error("Invitation can only be sent to Inactive or Suspended colleges.");
      return;
    }
    try {
      const res = await resendCollegeInvitation(college.id);
      addActivity(college.name, `Onboarding invite email resent to ${college.adminEmail} by DQ Admin`, "Invited");
      toast.success(res.message || `Invitation resent successfully to ${college.adminEmail}!`);
      refreshData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || "Failed to resend invitation.");
    }
  };

  const handleCopyInviteLink = async (college: College) => {
    if (college.status === "Active") {
      toast.error("Invitation link is only available for Inactive or Suspended colleges.");
      return;
    }
    try {
      const res = await getCollegeInvitationLink(college.id);
      const inviteData = res.data || res;
      const inviteLink = inviteData?.inviteLink || (inviteData?.token ? `${window.location.origin}/college/verify-onboarding?token=${inviteData.token}` : "");
      if (inviteLink) {
        await navigator.clipboard.writeText(inviteLink);
        toast.success("Invite link copied to clipboard!");
      } else {
        toast.error("Failed to generate invite link.");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || "Failed to copy invitation link.");
    }
  };


  const handleViewCollege = async (college: College) => {
    setOpenDropdownId(null);
    setViewCollege(college);

    try {
      const detail = await fetchCollegeById(college.id);
      setViewCollege(detail);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || "Failed to load college details.");
    }
  };

  const handleToggleActivation = async (college: College) => {
    const newStatus: College["status"] = college.status === "Active" ? "Inactive" : "Active";
    try {
      setIsLoading(true);
      await updateCollegeStatus(college.id, newStatus);
      addActivity(
        college.name,
        `College profile status changed to ${newStatus} by DQ Admin`,
        newStatus === "Active" ? "Activated" : "Deactivated"
      );
      toast.success(`College status changed to ${newStatus}`);
      refreshData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || "Failed to update college status.");
      setIsLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteCollege) return;
    try {
      setIsLoading(true);
      await deleteCollegeApi(deleteCollege.id);
      addActivity(deleteCollege.name, `College profile permanently deleted from platform`, "Deleted");
      toast.success("College deleted successfully");
      setDeleteCollege(null);
      refreshData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || "Failed to delete college.");
      setIsLoading(false);
    }
  };

  const handleSaveEdit = () => {
    refreshData();
    setEditCollege(null);
  };

  // Bulk Actions
  const handleBulkStatusChange = async (status: "Active" | "Inactive") => {
    try {
      setIsLoading(true);
      await Promise.all(checkedIds.map(id => updateCollegeStatus(id, status)));
      checkedIds.forEach(id => {
        const c = colleges.find(item => item.id === id);
        if (c) {
          addActivity(c.name, `Bulk status update: changed to ${status}`, status === "Active" ? "Activated" : "Deactivated");
        }
      });
      setCheckedIds([]);
      toast.success(`Selected colleges status set to ${status}`);
      refreshData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || "Failed to bulk update status.");
      setIsLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    try {
      setIsLoading(true);
      await Promise.all(checkedIds.map(id => deleteCollegeApi(id)));
      checkedIds.forEach(id => {
        const c = colleges.find(item => item.id === id);
        if (c) {
          addActivity(c.name, `Bulk deleted from system`, "Deleted");
        }
      });
      setCheckedIds([]);
      toast.success("Selected colleges deleted");
      refreshData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || "Failed to bulk delete colleges.");
      setIsLoading(false);
    }
  };

  // Filtered & Sorted list
  const filteredColleges = useMemo(() => {
    return colleges
      .filter(c => {
        const query = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !query ||
          c.name.toLowerCase().includes(query) ||
          c.code.toLowerCase().includes(query) ||
          c.adminName.toLowerCase().includes(query) ||
          c.adminEmail.toLowerCase().includes(query);

        const matchesType = !selectedType || c.types.some(t => t === selectedType || formatAcademicLabel(t).includes(selectedType));
        const matchesState = !selectedState || c.state === selectedState;
        const matchesStatus = !selectedStatus || c.status === selectedStatus;

        return matchesSearch && matchesType && matchesState && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === "nameAsc") return a.name.localeCompare(b.name);
        if (sortBy === "nameDesc") return b.name.localeCompare(a.name);
        // We'll simulate date comparison using standard lexicographical comparison for our format
        if (sortBy === "createdAsc") return a.createdDate.localeCompare(b.createdDate);
        return b.createdDate.localeCompare(a.createdDate); // createdDesc
      });
  }, [colleges, searchQuery, selectedType, selectedState, selectedStatus, sortBy]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredColleges.length / pageSize) || 1;
  const paginatedColleges = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredColleges.slice(startIndex, startIndex + pageSize);
  }, [filteredColleges, currentPage, pageSize]);

  // Keep pagination bounds in check
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  // Checked rows handlers
  const handleRowCheck = (id: string) => {
    if (checkedIds.includes(id)) {
      setCheckedIds(checkedIds.filter(x => x !== id));
    } else {
      setCheckedIds([...checkedIds, id]);
    }
  };

  const handleAllCheck = () => {
    const paginatedIds = paginatedColleges.map(c => c.id);
    const allChecked = paginatedIds.every(id => checkedIds.includes(id));
    if (allChecked) {
      setCheckedIds(checkedIds.filter(id => !paginatedIds.includes(id)));
    } else {
      const newChecked = [...checkedIds];
      paginatedIds.forEach(id => {
        if (!newChecked.includes(id)) {
          newChecked.push(id);
        }
      });
      setCheckedIds(newChecked);
    }
  };

  // CSV Export logic
  const handleExportCSV = () => {
    if (filteredColleges.length === 0) {
      toast.error("No colleges found to export");
      return;
    }
    const headers = "College ID,College Name,Code,Admin Name,Admin Email,Admin Phone,Type,State,Students Capacity,Status,Created Date\n";
    const rows = filteredColleges.map(c => 
      `"${c.id}","${c.name}","${c.code}","${c.adminName}","${c.adminEmail}","${c.adminPhone}","${c.types.join(", ")}","${c.state}",${c.capacity},"${c.status}","${c.createdDate}"`
    ).join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Colleges_Onboarding_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    toast.success("Colleges list exported to CSV successfully!");
  };

  // Analytics Metrics calculations
  const metrics = useMemo(() => {
    const total = colleges.length;
    const verified = colleges.filter(c => c.status === "Active").length;
    const pending = colleges.filter(c => c.status === "Pending").length;
    const inactive = colleges.filter(c => c.status === "Inactive").length;
    const eng = colleges.filter(c => c.types.includes("Engineering")).length;
    const poly = colleges.filter(c => c.types.includes("Polytechnic")).length;
    const students = colleges.reduce((sum, c) => sum + c.capacity, 0);
    const invites = colleges.filter(c => c.status === "Invited").length;

    // Dynamic trends based on creation dates
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const totalThisMonth = colleges.filter(c => {
      const d = new Date(c.createdDate);
      return !isNaN(d.getTime()) && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).length;

    const pendingThisWeek = colleges.filter(c => {
      if (c.status !== "Pending") return false;
      const d = new Date(c.createdDate);
      return !isNaN(d.getTime()) && d >= sevenDaysAgo;
    }).length;

    const activeThisMonth = colleges.filter(c => {
      if (c.status !== "Active") return false;
      const d = new Date(c.createdDate);
      return !isNaN(d.getTime()) && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).length;

    const inactiveThisMonth = colleges.filter(c => {
      if (c.status !== "Inactive" && c.status !== "Archived") return false;
      const d = new Date(c.createdDate);
      return !isNaN(d.getTime()) && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).length;

    return {
      total,
      verified,
      pending,
      inactive,
      eng,
      poly,
      students,
      invites,
      totalThisMonth,
      pendingThisWeek,
      activeThisMonth,
      inactiveThisMonth
    };
  }, [colleges]);

  const viewAcademicSections = useMemo(
    () => getAcademicSections(viewCollege?.academicProfile),
    [viewCollege]
  );
  const viewDegreeLabels = useMemo(
    () => Array.from(new Set(viewAcademicSections.map((section) => section.degree))),
    [viewAcademicSections]
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">College Onboarding</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage and onboard colleges registered in the DQ Platform.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={handleExportCSV} variant="outline" className="rounded-xl flex items-center gap-2 text-xs font-semibold py-5">
            <Download className="w-4 h-4" /> Export
          </Button>
          <Button onClick={() => router.push("/dq-admin/college/create")} className="rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground flex items-center gap-2 text-xs font-semibold py-5 shadow-md">
            <Plus className="w-4 h-4" /> Add College
          </Button>
        </div>
      </div>

      {/* Analytics Indicator Cards */}
      <div className="grid gap-6 grid-cols-2 lg:grid-cols-4">
        {/* Total Colleges */}
        <div className="bg-card border border-border p-5 rounded-2xl shadow-sm relative overflow-hidden flex items-start justify-between">
          <div className="space-y-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Total Colleges</span>
            <span className="text-3xl font-extrabold block text-foreground">{metrics.total}</span>
            <span className="text-[10px] text-emerald-500 font-semibold block">+{metrics.totalThisMonth} this month</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <GraduationCap className="w-5 h-5" />
          </div>
        </div>

        {/* Pending Verification */}
        <div className="bg-card border border-border p-5 rounded-2xl shadow-sm relative overflow-hidden flex items-start justify-between">
          <div className="space-y-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Pending Verification</span>
            <span className="text-3xl font-extrabold block text-foreground">{metrics.pending}</span>
            <span className="text-[10px] text-amber-500 font-semibold block">+{metrics.pendingThisWeek} this week</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Active Colleges */}
        <div className="bg-card border border-border p-5 rounded-2xl shadow-sm relative overflow-hidden flex items-start justify-between">
          <div className="space-y-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Active Colleges</span>
            <span className="text-3xl font-extrabold block text-foreground">{metrics.verified}</span>
            <span className="text-[10px] text-emerald-500 font-semibold block">+{metrics.activeThisMonth} this month</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        {/* Inactive Colleges */}
        <div className="bg-card border border-border p-5 rounded-2xl shadow-sm relative overflow-hidden flex items-start justify-between">
          <div className="space-y-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Inactive / Suspension</span>
            <span className="text-3xl font-extrabold block text-foreground">{metrics.inactive}</span>
            <span className="text-[10px] text-destructive font-semibold block">-{metrics.inactiveThisMonth} this month</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center text-destructive">
            <Ban className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Extended Analytics Sub-Cards */}
      

      {/* Filters & Search Row */}
      <div className="bg-card border border-border p-4 rounded-2xl shadow-sm flex flex-col md:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-muted-foreground" />
          <Input
            placeholder="Search colleges, admin name, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 py-5 rounded-xl border-input placeholder:text-muted-foreground text-sm"
          />
        </div>
        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto shrink-0">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-background border border-input rounded-xl px-3 py-2.5 text-xs font-semibold text-foreground focus-visible:ring-primary/20"
          >
            <option value="">Institution Type</option>
            {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="bg-background border border-input rounded-xl px-3 py-2.5 text-xs font-semibold text-foreground focus-visible:ring-primary/20"
          >
            <option value="">State</option>
            {STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-background border border-input rounded-xl px-3 py-2.5 text-xs font-semibold text-foreground focus-visible:ring-primary/20"
          >
            <option value="">Status</option>
            {STATUSES.map(st => <option key={st} value={st}>{st}</option>)}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-background border border-input rounded-xl px-3 py-2.5 text-xs font-semibold text-foreground focus-visible:ring-primary/20"
          >
            <option value="createdDesc">Created: Newest</option>
            <option value="createdAsc">Created: Oldest</option>
            <option value="nameAsc">Name: A-Z</option>
            <option value="nameDesc">Name: Z-A</option>
          </select>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {checkedIds.length > 0 && (
        <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl flex items-center justify-between animate-in slide-in-from-top duration-300">
          <span className="text-xs font-bold text-primary">
            {checkedIds.length} colleges selected for bulk operations
          </span>
          <div className="flex items-center gap-2">
            <Button onClick={() => handleBulkStatusChange("Active")} variant="secondary" className="rounded-xl px-4 py-2.5 text-xs font-semibold h-auto">
              Bulk Activate
            </Button>
            <Button onClick={() => handleBulkStatusChange("Inactive")} variant="secondary" className="rounded-xl px-4 py-2.5 text-xs font-semibold h-auto">
              Bulk Deactivate
            </Button>
            <Button onClick={handleBulkDelete} variant="destructive" className="rounded-xl px-4 py-2.5 text-xs font-semibold h-auto">
              Bulk Delete
            </Button>
          </div>
        </div>
      )}

      {/* College Table Container */}
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/10 text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
                <th className="py-4 px-5 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={paginatedColleges.length > 0 && paginatedColleges.every(c => checkedIds.includes(c.id))}
                    onChange={handleAllCheck}
                    className="accent-primary w-4 h-4 cursor-pointer"
                  />
                </th>
                <th className="py-4 px-4">College</th>
                <th className="py-4 px-4">Admin</th>
                <th className="py-4 px-4">Email / Phone</th>
                <th className="py-4 px-4">Type</th>
                <th className="py-4 px-4">State</th>
                <th className="py-4 px-4 text-center">Students</th>
                <th className="py-4 px-4 text-center">Status</th>
                <th className="py-4 px-4 text-center">Created</th>
                <th className="py-4 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={10} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      <span className="text-sm font-semibold">Loading colleges data...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedColleges.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 px-4 text-center">
                    <div className="space-y-4 max-w-sm mx-auto">
                      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground border border-border">
                        <GraduationCap className="w-8 h-8" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-foreground">No Colleges Found</h4>
                        <p className="text-xs text-muted-foreground">
                          Create your first college or adjust your filters/search queries to start onboarding.
                        </p>
                      </div>
                      <Button onClick={() => router.push("/dq-admin/college/create")} className="rounded-xl px-4 text-xs font-bold bg-primary text-primary-foreground py-4">
                        Add College
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedColleges.map((col) => {
                const isChecked = checkedIds.includes(col.id);
                return (
                  <tr key={col.id} className="hover:bg-muted/10 transition-colors">
                    {/* Checkbox */}
                    <td className="py-4 px-5 text-center">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleRowCheck(col.id)}
                        className="accent-primary w-4 h-4 cursor-pointer"
                      />
                    </td>

                    {/* Logo & College Info */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/5 border border-border flex items-center justify-center text-primary shrink-0">
                          <GraduationCap className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-foreground truncate max-w-[200px]" title={col.name}>{col.name}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">{col.code}</p>
                        </div>
                      </div>
                    </td>

                    {/* Admin Name */}
                    <td className="py-4 px-4">
                      <span className="font-semibold text-foreground block">{col.adminName}</span>
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{col.adminDesignation}</span>
                    </td>

                    {/* Email / Phone */}
                    <td className="py-4 px-4 text-xs font-mono">
                      <span className="block text-foreground">{col.adminEmail}</span>
                      <span className="block text-muted-foreground mt-0.5">{col.adminPhone}</span>
                    </td>

                    {/* Type Badges */}
                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-1 max-w-[120px]">
                        {col.types.map(t => (
                          <span key={t} className="inline-block px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 text-[10px] font-bold">
                            {formatAcademicLabel(t)}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* State */}
                    <td className="py-4 px-4">
                      <span className="text-foreground font-semibold">{col.state}</span>
                    </td>

                    {/* Student Capacity */}
                    <td className="py-4 px-4 text-center font-mono text-foreground font-semibold">
                      {col.capacity.toLocaleString()}
                    </td>

                    {/* Status badge */}
                    <td className="py-4 px-4 text-center">
                      {col.status === "Active" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active
                        </span>
                      )}
                      {col.status === "Pending" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 text-xs font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Pending
                        </span>
                      )}
                      {col.status === "Inactive" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-destructive/10 text-destructive text-xs font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-destructive" /> Inactive
                        </span>
                      )}
                      {col.status === "Invited" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 text-xs font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Invited
                        </span>
                      )}
                      {col.status === "Archived" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-500/10 text-slate-600 text-xs font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-500" /> Archived
                        </span>
                      )}
                    </td>

                    {/* Created date */}
                    <td className="py-4 px-4 text-center text-xs text-muted-foreground whitespace-nowrap">
                      {col.createdDate}
                    </td>

                    {/* Actions Menu */}
                    <td className="py-4 px-4 text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-all focus:outline-none"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44 p-1.5 space-y-0.5 rounded-xl shadow-xl bg-card border border-border z-50">
                          <DropdownMenuItem
                            onClick={() => handleViewCollege(col)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold hover:bg-muted text-foreground transition-all cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" /> View Drawer
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => router.push(`/dq-admin/college/edit?id=${col.id}`)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold hover:bg-muted text-foreground transition-all cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleResendInvite(col)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold hover:bg-muted text-foreground transition-all cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5" /> Resend Invite
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleCopyInviteLink(col)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold hover:bg-muted text-foreground transition-all cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" /> Copy Invite Link
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleToggleActivation(col)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold hover:bg-muted text-foreground transition-all cursor-pointer"
                          >
                            {col.status === "Active" ? (
                              <><Lock className="w-3.5 h-3.5 text-destructive mr-1" /> Deactivate</>
                            ) : (
                              <><Unlock className="w-3.5 h-3.5 text-emerald-500 mr-1" /> Activate</>
                            )}
                          </DropdownMenuItem>
                          {/* <div className="border-t border-border my-1" />
                          <DropdownMenuItem
                            onClick={() => router.push(`/dq-admin/college/delete?id=${col.id}`)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold hover:bg-destructive/10 text-destructive transition-all cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </DropdownMenuItem> */}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </div>

        {/* Table Footer (Pagination) */}
        {filteredColleges.length > 0 && (
          <div className="p-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 bg-muted/5">
            <span className="text-xs text-muted-foreground">
              Showing <strong className="text-foreground">{(currentPage - 1) * pageSize + 1}</strong> to{" "}
              <strong className="text-foreground">{Math.min(currentPage * pageSize, filteredColleges.length)}</strong> of{" "}
              <strong className="text-foreground">{filteredColleges.length}</strong> results
            </span>
            <div className="flex items-center gap-4">
              {/* Page Nav */}
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className="rounded-lg px-3 py-1.5 h-auto text-xs"
                >
                  Previous
                </Button>
                
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pg = idx + 1;
                  // Render pagination controls elegantly
                  if (totalPages > 5 && Math.abs(currentPage - pg) > 1 && pg !== 1 && pg !== totalPages) {
                    if (pg === 2 || pg === totalPages - 1) {
                      return <span key={pg} className="text-xs text-muted-foreground px-1">...</span>;
                    }
                    return null;
                  }
                  return (
                    <Button
                      key={pg}
                      variant={currentPage === pg ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pg)}
                      className={`rounded-lg w-8 h-8 p-0 text-xs font-bold ${
                        currentPage === pg ? "bg-primary text-primary-foreground" : ""
                      }`}
                    >
                      {pg}
                    </Button>
                  );
                })}

                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="rounded-lg px-3 py-1.5 h-auto text-xs"
                >
                  Next
                </Button>
              </div>
              
              {/* Page size selector */}
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-xs text-muted-foreground">Show:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(parseInt(e.target.value) || 5);
                    setCurrentPage(1);
                  }}
                  className="bg-background border border-input rounded-lg px-2 py-1 text-xs font-bold text-foreground focus-visible:ring-primary/20"
                >
                  <option value={5}>5 / page</option>
                  <option value={10}>10 / page</option>
                  <option value={20}>20 / page</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

     

      {/* --------------------- Drawers & Modals Mounts --------------------- */}

      {/* DETAIL VIEW DRAWER */}
      {viewCollege && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="absolute inset-0 -z-10" onClick={() => setViewCollege(null)} />
          <div className="bg-card border-l border-border w-full max-w-2xl h-screen flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-6 border-b border-border flex items-center justify-between bg-muted/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-foreground">{viewCollege.name}</h2>
                  <p className="text-xs text-muted-foreground font-mono">{viewCollege.code} • {viewCollege.state}</p>
                </div>
              </div>
              <button
                onClick={() => setViewCollege(null)}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Detail Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* College Header Card */}
              <div className="bg-muted/10 border border-border/80 p-5 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Onboarding Status</span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {viewCollege.status}
                  </span>
                </div>
                {viewCollege.website && (
                  <div className="text-xs text-muted-foreground">
                    Website: <a href={viewCollege.website} target="_blank" rel="noreferrer" className="text-primary font-semibold hover:underline">{viewCollege.website}</a>
                  </div>
                )}
              </div>

              {/* Admin info card */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-1">Primary Admin</h4>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-muted-foreground block">Name</span>
                    <strong className="text-foreground text-sm font-bold block mt-0.5">{viewCollege.adminName}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Designation</span>
                    <strong className="text-foreground text-sm font-bold block mt-0.5">{viewCollege.adminDesignation}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Email Address</span>
                    <strong className="text-foreground font-mono block mt-0.5">{viewCollege.adminEmail}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Phone</span>
                    <strong className="text-foreground font-mono block mt-0.5">{viewCollege.adminPhone || "N/A"}</strong>
                  </div>
                </div>
              </div>

              {/* Institution Identity Card */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-1">Institution Details</h4>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-muted-foreground block">College Code</span>
                    <strong className="text-foreground block mt-0.5 font-mono">{viewCollege.code}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Approved Domains</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {viewCollege.domains.map(d => (
                        <span key={d} className="px-2 py-0.5 rounded bg-muted text-[10px] font-semibold text-foreground border border-border">
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Academic Coordinates Card */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-1">Academic & Capacity</h4>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-muted-foreground block">Institution Types</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {viewCollege.types.map(t => (
                        <span key={t} className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold">
                          {formatAcademicLabel(t)}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Degrees Offered</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(viewDegreeLabels.length > 0 ? viewDegreeLabels : viewCollege.degrees.map(formatAcademicLabel)).map(d => (
                        <span key={d} className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 text-[10px] font-bold">
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Student Capacity</span>
                    <strong className="text-foreground text-sm font-mono block mt-0.5">{viewCollege.capacity.toLocaleString()} Students</strong>
                  </div>
                  {viewAcademicSections.length > 0 && (
                    <div className="col-span-2 pt-2 border-t border-border/50">
                      <span className="text-muted-foreground block mb-2">Branches / Departments Selection</span>
                      <div className="space-y-3 bg-muted/30 p-3 rounded-xl border border-border/50 max-h-[160px] overflow-y-auto">
                        {viewAcademicSections.map((section) => (
                          <div key={section.key} className="space-y-1">
                            <span className="text-[10px] font-bold text-primary uppercase">
                              {section.type} / {section.degree} ({section.departments.length})
                            </span>
                            <p className="text-[11px] text-foreground font-medium pl-2 leading-relaxed">
                              {section.departments.join(", ")}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Location Card */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-1">Location Coordinate</h4>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="col-span-2">
                    <span className="text-muted-foreground block">Street Address</span>
                    <strong className="text-foreground block mt-0.5">{viewCollege.streetAddress || "N/A"}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">City / District</span>
                    <strong className="text-foreground block mt-0.5">{viewCollege.city} / {viewCollege.district || "N/A"}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">State / Pincode</span>
                    <strong className="text-foreground block mt-0.5">{viewCollege.state} / {viewCollege.postalCode}</strong>
                  </div>
                  {viewCollege.coordinates && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground block">GPS Coordinates</span>
                      <strong className="text-foreground block mt-0.5">{viewCollege.coordinates}</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* History Timeline inside Drawer */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-1">Institution Activity Timeline</h4>
                <div className="relative border-l border-border pl-4 space-y-4 pt-2">
                  <div className="relative">
                    <div className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-emerald-500 border border-background" />
                    <span className="text-[10px] text-muted-foreground font-mono">{viewCollege.createdDate}</span>
                    <p className="text-xs font-bold text-foreground">Onboarding profile created</p>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-blue-500 border border-background" />
                    <span className="text-[10px] text-muted-foreground font-mono">{viewCollege.createdDate}</span>
                    <p className="text-xs font-bold text-foreground">Verification email dispatched</p>
                  </div>
                  {viewCollege.status === "Active" && (
                    <div className="relative">
                      <div className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-emerald-500 border border-background" />
                      <span className="text-[10px] text-muted-foreground font-mono">{viewCollege.createdDate}</span>
                      <p className="text-xs font-bold text-foreground">Authorized domain verification verified successfully</p>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="p-6 border-t border-border flex gap-3 bg-muted/10">
              <Button
                type="button"
                variant="outline"
                onClick={() => setViewCollege(null)}
                className="flex-1 py-5 rounded-xl text-xs font-bold"
              >
                Close Drawer
              </Button>
              <Button
                type="button"
                onClick={() => { router.push(`/dq-admin/college/edit?id=${viewCollege.id}`); setViewCollege(null); }}
                className="flex-1 py-5 bg-primary hover:bg-primary/95 text-primary-foreground rounded-xl text-xs font-bold"
              >
                Edit College Profile
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit and Delete modals are now rendered as full routes */}

    </div>
  );
}
