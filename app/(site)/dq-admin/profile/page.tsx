"use client";

import React from "react";
import { User } from "lucide-react";

export default function DQAdminProfile() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="border-b border-border pb-5">
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <User className="w-8 h-8 text-primary" />
          <span>DQ Admin Profile</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Global platform administrator profile view.
        </p>
      </div>
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <p className="text-sm text-muted-foreground">Admin Account Level: Global Super Administrator</p>
      </div>
    </div>
  );
}
