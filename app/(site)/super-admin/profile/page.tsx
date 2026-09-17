"use client";

import React from "react";
import { User } from "lucide-react";

export default function SuperAdminProfile() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="border-b border-border pb-5">
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <User className="w-8 h-8 text-primary" />
          <span>Super Admin Profile</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          College administrator settings and profile details.
        </p>
      </div>
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <p className="text-sm text-muted-foreground">Admin Account Level: College Super Administrator</p>
      </div>
    </div>
  );
}
