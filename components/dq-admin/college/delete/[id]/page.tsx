"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { addActivity, College } from "@/lib/mockColleges";
import { fetchCollegeById, deleteCollege } from "@/services/college.service";

export default function DeleteCollegePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const collegeId = searchParams.get("id");

  const [college, setCollege] = useState<College | null>(null);
  const [confirmText, setConfirmText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const loadCollege = async () => {
      if (!collegeId) {
        toast.error("Invalid college reference");
        router.push("/dq-admin/college");
        return;
      }
      try {
        setIsLoading(true);
        const col = await fetchCollegeById(collegeId);
        if (col) {
          setCollege(col);
        } else {
          toast.error("College profile not found");
          router.push("/dq-admin/college");
        }
      } catch (error: any) {
        toast.error(error.message || "Failed to load college details.");
        router.push("/dq-admin/college");
      } finally {
        setIsLoading(false);
      }
    };
    loadCollege();
  }, [collegeId]);

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-muted-foreground gap-2">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="text-sm font-semibold">Loading college details...</span>
      </div>
    );
  }

  if (!college) return null;

  const isMatched = confirmText.trim().toUpperCase() === college.code.toUpperCase();

  const handleDelete = async () => {
    if (isMatched) {
      try {
        setIsDeleting(true);
        await deleteCollege(college.id);
        addActivity(college.name, `College profile permanently deleted from platform`, "Deleted");
        toast.success("College deleted successfully");
        router.push("/dq-admin/college");
      } catch (error: any) {
        toast.error(error?.response?.data?.message || error?.message || "Failed to delete college.");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6 pt-10 animate-in zoom-in-95 duration-200">
      {/* Header back button */}
      <div>
        <Button variant="outline" size="sm" onClick={() => router.push("/dq-admin/college")} className="rounded-xl flex items-center gap-1.5">
          <ArrowLeft className="w-4 h-4" /> Back to Colleges
        </Button>
      </div>

      <div className="bg-card border border-border p-6 rounded-2xl shadow-xl space-y-6">
        
        {/* Warning Icon and Title */}
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-destructive" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-lg text-foreground">Delete College?</h3>
            <p className="text-sm text-muted-foreground">
              This action cannot be undone. All database records associated with{" "}
              <strong className="text-foreground font-semibold">{college.name}</strong> will be permanently deleted.
            </p>
          </div>
        </div>

        {/* Input Confirmation instructions */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
            Type <span className="bg-muted px-1.5 py-0.5 rounded text-foreground font-mono text-xs">{college.code}</span> to continue:
          </label>
          <Input
            type="text"
            placeholder={college.code}
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className="w-full text-center font-mono tracking-widest text-sm focus-visible:ring-destructive/20 focus-visible:border-destructive"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            disabled={isDeleting}
            onClick={() => router.push("/dq-admin/college")}
            className="flex-1 py-5 rounded-xl text-sm font-semibold"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={!isMatched || isDeleting}
            onClick={handleDelete}
            className="flex-1 py-5 rounded-xl text-sm font-semibold shadow-md disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
            Delete College
          </Button>
        </div>
      </div>
    </div>
  );
}
