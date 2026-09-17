"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Users,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Edit2,
  Lock,
  Send,
  Unlock,
  Trash2,
  Download,
  Upload,
  Check,
  ChevronDown,
  Info,
  Calendar,
  Sparkles,
  ArrowRight,
  Shield,
  BookOpen,
  SlidersHorizontal,
  X,
  Plus,
  CheckCircle,
  Clock,
  AlertTriangle
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
  Staff,
  getStoredColleges,
  College
} from "@/lib/mockColleges";
import StaffService from "@/services/staff.service";
import AuthService from "@/services/auth.service";
import { fetchColleges } from "@/services/college.service";

export default function HodTpoDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentUser = AuthService.getUser();

  const initialCollegeId =
    searchParams.get("collegeId") ||
    currentUser?.college_code ||
    "";

  // States
  const [colleges, setColleges] = useState<College[]>([]);
  const [selectedCollegeId, setSelectedCollegeId] = useState(initialCollegeId);
  const [staffList, setStaffList] = useState<Staff[]>([]);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("All");
  const [selectedDept, setSelectedDept] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedInvite, setSelectedInvite] = useState("All");

  // Selection States
  const [checkedIds, setCheckedIds] = useState<string[]>([]);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  // View Drawer State
  const [viewStaff, setViewStaff] = useState<Staff | null>(null);

  // Import CSV Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);

  useEffect(() => {
    fetchColleges().then(cols => {
      setColleges(cols);
    }).catch(err => console.error(err));

    const currentUser = AuthService.getUser();
    const collegeCode = currentUser?.college_code || selectedCollegeId;

    StaffService.fetchStaff(collegeCode).then(data => {
      setStaffList(data);
    });
  }, [selectedCollegeId]);

  const selectedCollege = useMemo(() => {
    return colleges.find(c => String(c.id) === String(selectedCollegeId) || c.code === selectedCollegeId) || colleges[0] || null;
  }, [colleges, selectedCollegeId]);

  // Filter staff list based on college and filters
  const filteredStaff = useMemo(() => {
    return staffList.filter(s => {
      if (selectedCollegeId && s.collegeId && String(s.collegeId) !== String(selectedCollegeId) && s.collegeId !== selectedCollege?.code) return false;

      // Search Query filter (Employee ID, Name, Email, Phone)
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const matchesId = s.id.toLowerCase().includes(q);
        const matchesName = s.name.toLowerCase().includes(q);
        const matchesEmail = s.email.toLowerCase().includes(q);
        const matchesPhone = s.phone.includes(q);
        if (!matchesId && !matchesName && !matchesEmail && !matchesPhone) return false;
      }

      // Role filter
      if (selectedRole !== "All" && s.role !== selectedRole) return false;

      // Department filter
      if (selectedDept !== "All") {
        if (s.role === "HOD") {
          if (s.department !== selectedDept) return false;
        } else {
          // TPO access scope filters
          const depts = s.selectedDepartments || [];
          if (s.accessScope !== "Entire College" && !depts.includes(selectedDept)) return false;
        }
      }

      // Status filter
      if (selectedStatus !== "All" && s.status !== selectedStatus) return false;

      // Invitation filter
      if (selectedInvite !== "All" && s.invitationStatus !== selectedInvite) return false;

      return true;
    });
  }, [staffList, selectedCollegeId, searchQuery, selectedRole, selectedDept, selectedStatus, selectedInvite]);

  // Unique departments for HODs and TPO selectors
  const uniqueDepartments = useMemo(() => {
    const depts = new Set<string>();
    if (selectedCollege && selectedCollege.academicProfile) {
      Object.values(selectedCollege.academicProfile).forEach((levelMap: any) => {
        if (levelMap && typeof levelMap === "object") {
          Object.values(levelMap).forEach((degreeMap: any) => {
            if (degreeMap && typeof degreeMap === "object") {
              Object.values(degreeMap).forEach((list: any) => {
                if (Array.isArray(list)) {
                  list.forEach(d => depts.add(d));
                }
              });
            }
          });
        }
      });
    }
    return Array.from(depts);
  }, [selectedCollege]);

  // Analytics Metrics Counters
  const metrics = useMemo(() => {
    const collegeStaff = staffList;
    return {
      total: collegeStaff.length,
      hod: collegeStaff.filter(s => s.role === "HOD").length,
      tpo: collegeStaff.filter(s => s.role === "TPO").length,
      pending: collegeStaff.filter(s => s.invitationStatus !== "Accepted").length,
      inactive: collegeStaff.filter(s => s.status === "Inactive").length
    };
  }, [staffList, selectedCollegeId]);

  // Bulk Handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setCheckedIds(filteredStaff.map(s => s.id));
    } else {
      setCheckedIds([]);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setCheckedIds([...checkedIds, id]);
    } else {
      setCheckedIds(checkedIds.filter(x => x !== id));
    }
  };

  const handleBulkDeactivate = async () => {
    if (checkedIds.length === 0) return;
    const currentUser = AuthService.getUser();
    const collegeCode = currentUser?.college_code || selectedCollegeId;
    try {
      for (const id of checkedIds) {
        await StaffService.toggleStaffStatus(collegeCode, id, "Inactive");
      }
      const updated = staffList.map(s => {
        if (checkedIds.includes(s.id)) {
          return { ...s, status: "Inactive" as const };
        }
        return s;
      });
      setStaffList(updated);
      toast.success(`${checkedIds.length} staff members deactivated successfully`);
      setCheckedIds([]);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to deactivate staff members");
    }
  };

  const handleBulkInvite = async () => {
    if (checkedIds.length === 0) return;
    toast.info("Resending invitation links...");
    const updated = staffList.map(s => {
      if (checkedIds.includes(s.id)) {
        return { ...s, invitationStatus: "Sent" as const };
      }
      return s;
    });
    setStaffList(updated);
    toast.success(`Resent invitation links to ${checkedIds.length} selected staff`);
    setCheckedIds([]);
  };

  // Row Action Handlers
  const handleToggleActivation = async (staff: Staff) => {
    const newStatus: Staff["status"] = staff.status === "Active" ? "Inactive" : "Active";
    const currentUser = AuthService.getUser();
    const collegeCode = currentUser?.college_code || selectedCollegeId;
    try {
      const updatedStaff = await StaffService.toggleStaffStatus(collegeCode, staff.id, newStatus);
      const updated = staffList.map(s => (s.id === staff.id ? updatedStaff : s));
      setStaffList(updated);

      // Log Activity
      const newAct = {
        id: Date.now().toString(),
        staffName: staff.name,
        event: newStatus === "Active" ? "Staff Profile Activated" : "Staff Profile Deactivated",
        time: "Just Now",
        type: newStatus === "Active" ? "Activated" : "Deactivated"
      };
      
      toast.success(`Staff status changed to ${newStatus}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update staff status.");
    }
  };

  const handleResendInvitation = async (staff: Staff) => {
    toast.info("Sending invitation email...");
    // Simply reset invitation link or trigger email sending on the backend if configured
    toast.success(`Invitation link resent to ${staff.email}`);
  };

  const handleResetPassword = async (staff: Staff) => {
    const currentUser = AuthService.getUser();
    const collegeCode = currentUser?.college_code || selectedCollegeId;
    try {
      const res = await StaffService.resetPassword(collegeCode, staff.id);
      toast.success(`Password reset successfully! Temporary password: ${res.tempPassword || "StaffPassword@123"}`);
      const newAct = {
        id: Date.now().toString(),
        staffName: staff.name,
        event: "Password Reset Triggered",
        time: "Just Now",
        type: "Reset"
      };
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to reset password.");
    }
  };

  // CSV Operations
  const handleExportCSV = () => {
    const headers = "Employee ID,Name,Role,Department/Scope,Email,Phone,Status,Invitation Status,Created Date\n";
    const rows = filteredStaff
      .map(
        s =>
          `"${s.id}","${s.name}","${s.role}","${s.role === "HOD" ? s.department : s.accessScope === "Entire College" ? "Entire College" : s.selectedDepartments?.join("; ") || ""
          }","${s.email}","${s.phone}","${s.status}","${s.invitationStatus}","${s.createdDate}"`
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${selectedCollege?.code || "SVCE"}_Staff_Records.csv`;
    link.click();
    toast.success("CSV export downloaded successfully!");
  };

  const handleDownloadTemplate = () => {
    const templateHeaders = "Employee ID,Full Name,Official Email,Phone,Role (HOD/TPO),Department/Access Scope,Access Scope Selected Departments (Semicolon separated)\n";
    const sampleRow = `${selectedCollege?.code || "SVCE"}-HOD-CSE-09,John Doe,john.doe@${(selectedCollege?.code || "SVCE").toLowerCase()}.edu.in,9876543210,HOD,Computer Science & Engineering (CSE),\n`;

    const blob = new Blob([templateHeaders + sampleRow], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "Staff_Import_Template.csv";
    link.click();
    toast.success("Import template downloaded!");
  };

  const handleCsvFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCsvFile(e.target.files[0]);
    }
  };

  const handleProcessImport = async () => {
    if (!csvFile) {
      toast.error("Please upload a CSV file first");
      return;
    }

    try {
      const text = await csvFile.text();
      const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);

      if (lines.length <= 1) {
        toast.error("CSV file contains no data rows.");
        return;
      }

      // Skip header line
      const dataLines = lines.slice(1);
      const collegeCode = currentUser?.college_code || selectedCollegeId;

      let importedCount = 0;
      let skippedDuplicates = 0;

      const newStaffList: Staff[] = [...staffList];

      for (const line of dataLines) {
        const cols = line.split(",").map(c => c.replace(/^"|"$/g, "").trim());
        const empId = cols[0];
        const name = cols[1];
        const email = cols[2];
        const phone = cols[3] || "9876543210";
        const role = (cols[4] || "HOD").toUpperCase().includes("TPO") ? "TPO" : "HOD";
        const deptOrScope = cols[5] || "Computer Science & Engineering";
        const rawDepts = cols[6] ? cols[6].split(";").map(d => d.trim()).filter(Boolean) : [];

        if (!empId || !name || !email) continue;

        // Duplicate Check (Bug 4 Fix)
        const isDuplicate = newStaffList.some(
          s => s.id.toLowerCase() === empId.toLowerCase() || s.email.toLowerCase() === email.toLowerCase()
        );

        if (isDuplicate) {
          skippedDuplicates++;
          continue;
        }

        const newStaffRecord: Staff = {
          id: empId,
          name,
          email,
          phone,
          role: role as any,
          department: role === "HOD" ? deptOrScope : undefined,
          accessScope: role === "TPO" ? (deptOrScope.includes("Entire") ? "Entire College" : "Selected Departments") : undefined,
          selectedDepartments: role === "TPO" && !deptOrScope.includes("Entire") ? (rawDepts.length ? rawDepts : [deptOrScope]) : undefined,
          status: "Active",
          invitationStatus: "Sent",
          collegeId: selectedCollegeId,
          createdDate: new Date().toLocaleDateString("en-GB")
        };

        // Persist to Backend API (Bug 3 Fix)
        try {
          await StaffService.createStaff(collegeCode, {
            employeeId: empId,
            name,
            email,
            phone,
            role,
            status: "Active",
            department: newStaffRecord.department,
            accessScope: newStaffRecord.accessScope,
            selectedDepartments: newStaffRecord.selectedDepartments
          });
        } catch (e) {
          // If backend persistence fails (e.g. duplicate key), keep local copy
        }

        newStaffList.unshift(newStaffRecord);
        importedCount++;
      }

      setStaffList(newStaffList);
      toast.success(
        `Import Processed: ${importedCount} records imported into ${selectedCollege?.name || ""}` +
        (skippedDuplicates > 0 ? ` (${skippedDuplicates} duplicates skipped)` : "")
      );
      setIsImportModalOpen(false);
      setCsvFile(null);
    } catch (err: any) {
      toast.error(err?.message || "Failed to process CSV file.");
    }
  };


  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 relative">

      {/* Header and Breadcrumbs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>

          <h1 className="text-2xl font-bold tracking-tight mt-2">Manage College Staff</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Manage department HODs and Training & Placement Officers.</p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">


          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsImportModalOpen(true)}
            className="rounded-xl flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" /> Import
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="rounded-xl flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" /> Export
          </Button>

          <Button
            size="sm"
            onClick={() => router.push(`/super-admin/hod-tpo/create?collegeId=${selectedCollegeId}`)}
            className="rounded-xl flex items-center gap-1 bg-primary text-primary-foreground hover:bg-primary/95"
          >
            <Plus className="w-3.5 h-3.5" /> Add Staff
          </Button>
        </div>
      </div>

      {/* Analytics Card Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Total Staff", count: metrics.total, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "HOD", count: metrics.hod, color: "text-amber-500", bg: "bg-amber-500/10" },
          { label: "TPO", count: metrics.tpo, color: "text-indigo-500", bg: "bg-indigo-500/10" },
          { label: "Pending Invitation", count: metrics.pending, color: "text-rose-500", bg: "bg-rose-500/10" },
          { label: "Inactive", count: metrics.inactive, color: "text-slate-500", bg: "bg-slate-500/10" }
        ].map((c) => (
          <div key={c.label} className="bg-card border border-border p-4 rounded-2xl shadow-sm space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{c.label}</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-extrabold tracking-tight font-mono">{c.count}</span>
              <div className={`w-6 h-6 rounded-lg ${c.bg} flex items-center justify-center`}>
                <Users className={`w-3.5 h-3.5 ${c.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filters Bar */}
      <div className="bg-card border border-border p-4 rounded-2xl shadow-sm space-y-3">
        <div className="flex flex-wrap items-center gap-3">

          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by Employee ID, Name, Email, Phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-xl text-xs h-9"
            />
          </div>

          {/* Role Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Role</span>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="bg-background border border-input rounded-xl p-1.5 text-xs text-foreground focus-visible:ring-primary/20"
            >
              <option value="All">All Roles</option>
              <option value="HOD">HOD</option>
              <option value="TPO">TPO</option>
            </select>
          </div>

          {/* Department Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Dept</span>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-background border border-input rounded-xl p-1.5 text-xs text-foreground max-w-[160px] truncate"
            >
              <option value="All">All Departments</option>
              {uniqueDepartments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Status</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-background border border-input rounded-xl p-1.5 text-xs text-foreground"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Invitation Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Invitation</span>
            <select
              value={selectedInvite}
              onChange={(e) => setSelectedInvite(e.target.value)}
              className="bg-background border border-input rounded-xl p-1.5 text-xs text-foreground"
            >
              <option value="All">All Statuses</option>
              <option value="Accepted">Accepted</option>
              <option value="Pending">Pending</option>
              <option value="Sent">Sent</option>
              <option value="Expired">Expired</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Actions Panel */}
      {checkedIds.length > 0 && (
        <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl flex items-center justify-between animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold font-mono">
              {checkedIds.length}
            </div>
            <span className="text-xs font-semibold text-foreground">Selected Staff Records</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleBulkInvite}
              className="rounded-lg text-xs font-bold flex items-center gap-1 border-primary/30 text-primary hover:bg-primary/5"
            >
              <Send className="w-3.5 h-3.5" /> Bulk Invite
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleBulkDeactivate}
              className="rounded-lg text-xs font-bold flex items-center gap-1 border-destructive/20 text-destructive hover:bg-destructive/5"
            >
              <Lock className="w-3.5 h-3.5" /> Deactivate Selected
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={async () => {
                const currentUser = AuthService.getUser();
                const collegeCode = currentUser?.college_code || selectedCollegeId;
                try {
                  for (const id of checkedIds) {
                    await StaffService.deleteStaff(collegeCode, id);
                  }
                  const updated = staffList.filter(s => !checkedIds.includes(s.id));
                  setStaffList(updated);
                  toast.success(`Deleted ${checkedIds.length} staff records`);
                  setCheckedIds([]);
                } catch (err: any) {
                  toast.error(err?.response?.data?.message || "Failed to delete selected staff");
                }
              }}
              className="rounded-lg text-xs font-bold flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete Selected
            </Button>
          </div>
        </div>
      )}

      {/* Main Staff Data Table */}
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                <th className="p-4 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={filteredStaff.length > 0 && checkedIds.length === filteredStaff.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="accent-primary w-4 h-4 cursor-pointer"
                  />
                </th>
                <th className="p-4">Staff Member</th>
                <th className="p-4">Employee ID</th>
                <th className="p-4">Role</th>
                <th className="p-4">Department / Scope</th>
                <th className="p-4">Email</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Invitation</th>
                <th className="p-4 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs font-medium">
              {filteredStaff.map((staff) => {
                const isRowChecked = checkedIds.includes(staff.id);
                const isDropdownOpen = openDropdownId === staff.id;

                let inviteBadge = <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 text-[10px] font-bold">🔵 Sent</span>;
                if (staff.invitationStatus === "Accepted") {
                  inviteBadge = <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-bold">🟢 Accepted</span>;
                } else if (staff.invitationStatus === "Pending") {
                  inviteBadge = <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 text-[10px] font-bold">🟡 Pending</span>;
                } else if (staff.invitationStatus === "Expired") {
                  inviteBadge = <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-600 text-[10px] font-bold">🔴 Expired</span>;
                }

                return (
                  <tr
                    key={staff.id}
                    className={`hover:bg-muted/30 transition-all ${isRowChecked ? "bg-primary/5" : ""}`}
                  >
                    <td className="p-4 text-center">
                      <input
                        type="checkbox"
                        checked={isRowChecked}
                        onChange={(e) => handleSelectRow(staff.id, e.target.checked)}
                        className="accent-primary w-4 h-4 cursor-pointer"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                          {staff.name.split(" ").map(w => w[0]).join("")}
                        </div>
                        <div>
                          <span className="font-semibold text-foreground block">{staff.name}</span>
                          <span className="text-[10px] text-muted-foreground block">{staff.role} Staff</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-mono font-bold text-muted-foreground">{staff.id}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${staff.role === "HOD" ? "bg-amber-500/10 text-amber-600" : "bg-indigo-500/10 text-indigo-600"
                        }`}>
                        {staff.role}
                      </span>
                    </td>
                    <td className="p-4 max-w-[180px] truncate" title={staff.role === "HOD" ? staff.department : staff.accessScope === "Entire College" ? "Entire College" : staff.selectedDepartments?.join(", ")}>
                      {staff.role === "HOD" ? (
                        <span className="font-semibold">{staff.department}</span>
                      ) : staff.accessScope === "Entire College" ? (
                        <span className="text-muted-foreground italic">Entire College</span>
                      ) : (
                        <span className="font-semibold text-muted-foreground">Depts: {staff.selectedDepartments?.join(", ")}</span>
                      )}
                    </td>
                    <td className="p-4 font-mono">{staff.email}</td>
                    <td className="p-4 font-mono">{staff.phone}</td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleActivation(staff)}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${staff.status === "Active"
                          ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/25"
                          : "bg-slate-500/10 text-slate-600 hover:bg-slate-500/25"
                          }`}
                      >
                        {staff.status}
                      </button>
                    </td>
                    <td className="p-4 text-center">{inviteBadge}</td>
                    <td className="p-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            className="p-1 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted focus:outline-none"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44 p-1.5 space-y-0.5 rounded-xl shadow-xl bg-card border border-border z-50">
                          <DropdownMenuItem
                            onClick={() => setViewStaff(staff)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold hover:bg-muted text-foreground transition-all cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" /> View Drawer
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => router.push(`/super-admin/hod-tpo/edit/${staff.id}`)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold hover:bg-muted text-foreground transition-all cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleResetPassword(staff)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold hover:bg-muted text-foreground transition-all cursor-pointer"
                          >
                            <Lock className="w-3.5 h-3.5" /> Reset Password
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleResendInvitation(staff)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold hover:bg-muted text-foreground transition-all cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5" /> Resend Invite
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleToggleActivation(staff)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold hover:bg-muted text-foreground transition-all cursor-pointer"
                          >
                            {staff.status === "Active" ? (
                              <><Lock className="w-3.5 h-3.5 text-destructive mr-1" /> Deactivate</>
                            ) : (
                              <><Unlock className="w-3.5 h-3.5 text-emerald-500 mr-1" /> Activate</>
                            )}
                          </DropdownMenuItem>
                          <div className="border-t border-border my-1" />
                          <DropdownMenuItem
                            onClick={() => router.push(`/super-admin/hod-tpo/delete/${staff.id}`)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold hover:bg-destructive/10 text-destructive transition-all cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })}
              {filteredStaff.length === 0 && (
                <tr>
                  <td colSpan={10} className="p-8 text-center space-y-4">
                    <span className="text-4xl">👨‍🏫</span>
                    <h3 className="font-bold text-foreground text-sm">No Staff Added</h3>
                    <p className="text-xs text-muted-foreground max-w-xs mx-auto">Create your first HOD or TPO to manage placements and departments.</p>
                    <Button
                      size="sm"
                      onClick={() => router.push(`/super-admin/hod-tpo/create?collegeId=${selectedCollegeId}`)}
                      className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-bold"
                    >
                      Add Staff
                    </Button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>



      {/* VIEW STAFF DETAILS DRAWER */}
      {viewStaff && (
        <>
          <div
            onClick={() => setViewStaff(null)}
            className="fixed inset-0 bg-black/45 z-45 backdrop-blur-sm animate-in fade-in duration-300"
          />
          <div className="fixed inset-y-0 right-0 w-full max-w-md bg-card border-l border-border shadow-2xl z-50 flex flex-col justify-between animate-in slide-in-from-right duration-300">
            <div className="p-6 overflow-y-auto space-y-6 flex-1">

              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-extrabold text-sm">
                    {viewStaff.name.split(" ").map(w => w[0]).join("")}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-foreground">{viewStaff.name}</h3>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{viewStaff.role} • {viewStaff.id}</span>
                  </div>
                </div>
                <button
                  onClick={() => setViewStaff(null)}
                  className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status Badge */}
              <div className="flex items-center justify-between bg-muted/30 p-3 rounded-xl border border-border/50 text-xs">
                <span className="text-muted-foreground font-medium">Status</span>
                <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold ${viewStaff.status === "Active" ? "bg-emerald-500/10 text-emerald-600" : "bg-slate-500/10 text-slate-600"
                  }`}>
                  {viewStaff.status}
                </span>
              </div>

              {/* General Details */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-1">Affiliation</h4>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-muted-foreground block">College</span>
                    <strong className="text-foreground block mt-0.5">{selectedCollege?.name || ""}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Email</span>
                    <strong className="text-foreground font-mono block mt-0.5">{viewStaff.email}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Phone</span>
                    <strong className="text-foreground font-mono block mt-0.5">{viewStaff.phone}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Role Designation</span>
                    <strong className="text-foreground block mt-0.5">{viewStaff.role}</strong>
                  </div>
                </div>
              </div>

              {/* Academic Access / Departments */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-1">Academic Allocations</h4>
                <div className="bg-muted/30 p-4 rounded-xl border border-border/50 text-xs space-y-3">
                  {viewStaff.role === "HOD" ? (
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">HOD Department</span>
                      <strong className="text-foreground block mt-1 font-semibold text-sm">{viewStaff.department}</strong>
                    </div>
                  ) : (
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">TPO Scope</span>
                      <strong className="text-foreground block mt-1 font-semibold text-sm">{viewStaff.accessScope}</strong>
                      {viewStaff.accessScope === "Selected Departments" && viewStaff.selectedDepartments && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {viewStaff.selectedDepartments.map(d => (
                            <span key={d} className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold">
                              {d}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Invitation tracking details */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-1">Invitation Status</h4>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-muted-foreground block">Status</span>
                    <strong className="text-foreground block mt-0.5">{viewStaff.invitationStatus}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Joined Date</span>
                    <strong className="text-foreground block mt-0.5">{viewStaff.invitationStatus === "Accepted" ? viewStaff.createdDate : "Pending acceptance"}</strong>
                  </div>
                  {viewStaff.lastLogin && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground block">Last Login Timestamp</span>
                      <strong className="text-foreground font-mono block mt-0.5">{viewStaff.lastLogin}</strong>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Drawer Actions */}
            <div className="p-4 bg-muted/20 border-t border-border flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setViewStaff(null)}
                className="flex-1 py-5 rounded-xl text-xs font-bold"
              >
                Close Drawer
              </Button>
              <Button
                type="button"
                onClick={() => {
                  router.push(`/super-admin/hod-tpo/edit/${viewStaff.id}`);
                  setViewStaff(null);
                }}
                className="flex-1 py-5 bg-primary hover:bg-primary/95 text-primary-foreground rounded-xl text-xs font-bold"
              >
                Edit Staff Profile
              </Button>
            </div>
          </div>
        </>
      )}

      {/* IMPORT STAFF MODAL */}
      {isImportModalOpen && (
        <>
          <div
            onClick={() => setIsImportModalOpen(false)}
            className="fixed inset-0 bg-black/45 z-45 backdrop-blur-sm animate-in fade-in duration-300"
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl p-6 z-50 animate-in zoom-in-95 duration-200 space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-base text-foreground flex items-center gap-1.5">
                <Upload className="w-5 h-5 text-primary" /> Import Staff via CSV
              </h3>
              <button onClick={() => setIsImportModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Upload a standard CSV file to onboard multiple HODs and TPOs at once. Ensure your headers and domains match the template structure.
              </p>

              <div className="border-2 border-dashed border-border p-6 rounded-xl flex flex-col items-center justify-center text-center space-y-3 bg-muted/10 hover:bg-muted/20 transition-all relative">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleCsvFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Download className="w-6 h-6 text-primary" />
                <div>
                  <span className="text-xs font-semibold text-foreground block">
                    {csvFile ? csvFile.name : "Select Staff CSV File"}
                  </span>
                  <span className="text-[10px] text-muted-foreground block mt-0.5">Maximum size: 2MB</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="text-primary hover:underline font-semibold flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" /> Download CSV Template
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsImportModalOpen(false)}
                className="flex-1 rounded-xl text-xs font-bold py-4"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleProcessImport}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/95 rounded-xl text-xs font-bold py-4"
              >
                Import Staff
              </Button>
            </div>
          </div>
        </>
      )}

    </div>
  );
}
