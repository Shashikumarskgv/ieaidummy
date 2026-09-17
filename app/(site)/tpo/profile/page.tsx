"use client";

import React, { useState, useEffect } from "react";
import { User, Save, Lock, Mail, Phone, MapPin, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import ProfileService from "@/services/profile.service";
import AuthService from "@/services/auth.service";

export default function TPOProfile() {
  const [profile, setProfile] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const user = AuthService.getCurrentUser();

  // Change Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passSaving, setPassSaving] = useState(false);

  const loadProfile = async () => {
    try {
      const res = await ProfileService.getById(user.id);
      setProfile(res.data.data || {});
    } catch {
      toast.error("Failed to load profile settings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const getMaxDobDate = () => {
    const today = new Date();
    const year = today.getFullYear() - 18;
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (profile.dob) {
      const maxAllowed = getMaxDobDate();
      const selectedDob = profile.dob.split("T")[0];
      if (selectedDob > maxAllowed) {
        toast.error(`Minimum age requirement is 18 years old. DOB must be on or before ${maxAllowed}.`);
        return;
      }
    }
    setSaving(true);
    try {
      await ProfileService.update(user.id, profile);
      toast.success("Profile details updated successfully.");
      await loadProfile();
    } catch {
      toast.error("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    setPassSaving(true);
    try {
      await ProfileService.changePassword({ currentPassword, newPassword });
      toast.success("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to change password.");
    } finally {
      setPassSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-muted-foreground">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <span>Loading profile settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="border-b border-border pb-5">
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <User className="w-8 h-8 text-primary shrink-0" />
          <span>My Profile Settings</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your personal details, designations, and account security.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Profile Card */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col items-center text-center space-y-3 pb-4 border-b border-border">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl border border-primary/20">
              {profile.name ? profile.name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase() : "T"}
            </div>
            <div>
              <h3 className="font-bold text-foreground text-base capitalize">{profile.name}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{profile.email}</p>
              <span className="inline-block mt-2 text-[10px] font-bold bg-primary/10 text-primary px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {profile.role}
              </span>
            </div>
          </div>

          <div className="space-y-3 text-xs text-muted-foreground leading-relaxed">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span>{profile.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span>{profile.phone || "No phone added"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-muted-foreground" />
              <span>{profile.designation || "Training & Placement Officer"} • {profile.department || "Corporate Relations"}</span>
            </div>
          </div>
        </div>

        {/* Profile Settings and Password settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Info Form */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-base mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              <span>Personal Details</span>
            </h3>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Full Name</Label>
                  <Input value={profile.name || ""} onChange={e => setProfile({...profile, name: e.target.value})} className="rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label>Phone / Contact</Label>
                  <Input
                    value={profile.phone || ""}
                    onKeyDown={(e) => {
                      if (
                        e.key === "Backspace" ||
                        e.key === "Delete" ||
                        e.key === "Tab" ||
                        e.key === "Enter" ||
                        e.key === "ArrowLeft" ||
                        e.key === "ArrowRight" ||
                        e.ctrlKey ||
                        e.metaKey
                      ) {
                        return;
                      }
                      if (!/^[0-9]$/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    onChange={e => {
                      const clean = e.target.value.replace(/[^0-9]/g, "");
                      setProfile({...profile, phone: clean});
                    }}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="flex items-center justify-between">
                    <span>Designation</span>
                    <span className="text-[10px] text-muted-foreground font-normal">(View Only)</span>
                  </Label>
                  <Input 
                    value={profile.designation || "Training & Placement Officer (TPO)"} 
                    disabled 
                    readOnly 
                    className="rounded-xl bg-muted/60 text-muted-foreground cursor-not-allowed font-medium" 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="flex items-center justify-between">
                    <span>Department</span>
                    <span className="text-[10px] text-muted-foreground font-normal">(View Only)</span>
                  </Label>
                  <Input 
                    value={profile.department || "Training & Placement Cell"} 
                    disabled 
                    readOnly 
                    className="rounded-xl bg-muted/60 text-muted-foreground cursor-not-allowed font-medium" 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Gender</Label>
                  <Select value={profile.gender || undefined} onValueChange={val => setProfile({...profile, gender: val})}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="flex items-center justify-between">
                    <span>Date of Birth</span>
                    <span className="text-[10px] text-muted-foreground font-normal">(18+ Years Minimum)</span>
                  </Label>
                  <Input 
                    type="date" 
                    max={getMaxDobDate()}
                    value={profile.dob ? profile.dob.split("T")[0] : ""} 
                    onChange={e => {
                      const val = e.target.value;
                      const maxAllowed = getMaxDobDate();
                      if (val && val > maxAllowed) {
                        toast.error(`Minimum age requirement is 18 years. Please select a date on or before ${maxAllowed}.`);
                        return;
                      }
                      setProfile({...profile, dob: val});
                    }} 
                    className="rounded-xl" 
                  />
                </div>
                <div className="sm:col-span-2 space-y-1.5">
                  <Label>Bio / Profile Summary</Label>
                  <Textarea value={profile.description || ""} onChange={e => setProfile({...profile, description: e.target.value})} rows={3} className="rounded-xl resize-none" />
                </div>
                <div className="sm:col-span-2 space-y-1.5">
                  <Label>Mailing Address</Label>
                  <Textarea value={profile.address || ""} onChange={e => setProfile({...profile, address: e.target.value})} rows={2} className="rounded-xl resize-none" />
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={saving} className="rounded-xl bg-primary text-white text-xs font-semibold px-5 py-2">
                  {saving ? "Saving Changes..." : "Save Details"}
                </Button>
              </div>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-base mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              <span>Change Account Password</span>
            </h3>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label>Current Password</Label>
                  <Input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="rounded-xl" placeholder="••••••••" />
                </div>
                <div className="space-y-1.5">
                  <Label>New Password</Label>
                  <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="rounded-xl" placeholder="••••••••" />
                </div>
                <div className="space-y-1.5">
                  <Label>Confirm New Password</Label>
                  <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="rounded-xl" placeholder="••••••••" />
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={passSaving} className="rounded-xl bg-primary text-white text-xs font-semibold px-5 py-2">
                  {passSaving ? "Changing Password..." : "Change Password"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
