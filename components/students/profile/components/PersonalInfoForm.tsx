import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Camera, Trash2, User } from "lucide-react";
import { StudentProfileData } from "../../types";
import { toast } from "sonner";

interface PersonalInfoFormProps {
  data: StudentProfileData;
  onChange: (updates: Partial<StudentProfileData>) => void;
}

const AVATAR_PRESETS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80"
];



export default function PersonalInfoForm({ data, onChange }: PersonalInfoFormProps) {

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onChange({ profile_photo: event.target.result as string });
          toast.success("Profile photo selected");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Picture Uploader */}
      <div className="flex flex-col sm:flex-row items-center gap-5 bg-muted/20 p-5 rounded-2xl border border-border/60">
        <div className="relative group shrink-0">
          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary bg-card flex items-center justify-center shadow-md">
            {data.profile_photo ? (
              <img
                src={data.profile_photo}
                alt="Profile Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary text-white font-bold text-xl">
                {data.name
                  ? data.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .substring(0, 2)
                    .toUpperCase()
                  : "U"}
              </div>
            )}
          </div>
          <label className="absolute inset-0 flex items-center justify-center bg-black/45 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer">
            <Camera className="w-5 h-5 text-white" />
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </label>
        </div>

        <div className="space-y-2.5 text-center sm:text-left flex-1">
          <div>
            <h4 className="text-sm font-bold text-foreground">Profile Picture</h4>
            <p className="text-xs text-muted-foreground mt-0.5">Upload a professional JPG or PNG photo (max 2MB).</p>
          </div>
          <div className="flex flex-wrap justify-center sm:justify-start gap-2 items-center">
            {/* Real Upload Trigger */}
            <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-primary/95 text-primary-foreground rounded-lg text-xs font-semibold shadow-sm transition-all h-8">
              <Camera className="w-3.5 h-3.5" />
              <span>Upload Photo</span>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>

            {data.profile_photo && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onChange({
                    profile_photo: "",
                  });

                  toast.success("Profile photo removed");
                }}
                className="h-8 rounded-lg text-xs font-semibold border-border hover:bg-destructive/10 text-primary hover:text-destructive gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </Button>
            )}

            {/* Presets */}
            <div className="flex items-center gap-1 border-l border-border pl-2.5 ml-0.5">
              <span className="text-[10px] text-muted-foreground font-semibold uppercase mr-1">Presets:</span>
              {AVATAR_PRESETS.map((url, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    onChange({ profile_photo: url });
                    toast.success("Avatar preset loaded");
                  }}
                  className="w-7 h-7 rounded-full overflow-hidden border border-border/80 hover:border-primary transition-all shrink-0"
                >
                  <img src={url} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Basic Profile Form Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Full Name */}
        <div className="space-y-1.5 sm:col-span-2">
          <Label>Bio</Label>
          <Textarea
            value={data.description || ""}
            onChange={(e) =>
              onChange({
                description: e.target.value,
              })
            }
            className="min-h-[120px]"
          />
        </div>

        <div className="text-xs font-semibold text-muted-foreground">
          <Label>Designation</Label>
          <Input
            value={data.designation || ""}
            onChange={(e) =>
              onChange({
                designation: e.target.value,
              })
            }
          />
        </div>

        {/* <div className="text-xs font-semibold text-muted-foreground">
          <Label>Company</Label>
          <Input
            value={data.company || ""}
            onChange={(e) =>
              onChange({
                company: e.target.value,
              })
            }
          />
        </div> */}

        <div className="text-xs font-semibold text-muted-foreground">
          <Label>LinkedIn URL</Label>
          <Input
            value={data.linkedin_url || ""}
            onChange={(e) =>
              onChange({
                linkedin_url: e.target.value,
              })
            }
          />
        </div>

        <div className="text-xs font-semibold text-muted-foreground">
          <Label>GitHub URL</Label>
          <Input
            value={data.github_url || ""}
            onChange={(e) =>
              onChange({
                github_url: e.target.value,
              })
            }
          />
        </div>

        <div className="text-xs font-semibold text-muted-foreground">
          <Label>Portfolio URL</Label>
          <Input
            value={data.portfolio_url || ""}
            onChange={(e) =>
              onChange({
                portfolio_url: e.target.value,
              })
            }
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="prof-name" className="text-xs font-semibold text-muted-foreground">Full Name</Label>
          <Input
            id="prof-name"
            type="text"
            placeholder="Your full name"
            value={data.name || ""}
            onChange={(e) => onChange({ name: e.target.value })}
            className="rounded-xl border-border bg-background text-sm"
          />
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="prof-email" className="text-xs font-semibold text-muted-foreground">Email</Label>
          <Input
            id="prof-email"
            type="email"
            placeholder="email@example.com"
            value={data.email ?? ""}
            onChange={(e) => onChange({ email: e.target.value })}
            className="rounded-xl border-border bg-background text-sm"
          />
        </div>

        {/* Mobile */}
        <div className="space-y-1.5">
          <Label htmlFor="prof-mobile" className="text-xs font-semibold text-muted-foreground">Phone / Mobile</Label>
          <Input
            id="prof-mobile"
            type="text"
            placeholder="e.g. +91 98765 43210"
            value={data.mobile || ""}
            onChange={(e) => onChange({ mobile: e.target.value })}
            className="rounded-xl border-border bg-background text-sm"
          />
        </div>

        {/* Gender */}
        <div className="space-y-1.5">
          <Label htmlFor="prof-gender" className="text-xs font-semibold text-muted-foreground">Gender</Label>
          <Select
            value={data.gender ?? ""}
            onValueChange={(val) =>
              onChange({
                gender: val,
              })
            }
          >
            <SelectTrigger id="prof-gender" className="rounded-xl border-border bg-background text-sm">
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border bg-card">
              <SelectItem value="Male" className="text-xs">Male</SelectItem>
              <SelectItem value="Female" className="text-xs">Female</SelectItem>
              <SelectItem value="Other" className="text-xs">Other</SelectItem>
              <SelectItem value="Prefer Not to Say" className="text-xs">Prefer not to say</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* DOB */}
        <div className="space-y-1.5">
          <Label htmlFor="prof-dob" className="text-xs font-semibold text-muted-foreground">Date of Birth</Label>
          <Input
            type="date"
            value={data.dob ? data.dob.split("T")[0] : ""}
            onChange={(e) =>
              onChange({
                dob: e.target.value,
              })
            }
          />
        </div>

        {/* Address */}
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="prof-address" className="text-xs font-semibold text-muted-foreground">Address</Label>
          <Textarea
            id="prof-address"
            placeholder="Full mailing address details"
            value={data.address || ""}
            onChange={(e) => onChange({ address: e.target.value || null })}
            className="rounded-xl border-border bg-background text-xs min-h-[80px] resize-none"
          />
        </div>

      </div>
    </div>
  );
}
