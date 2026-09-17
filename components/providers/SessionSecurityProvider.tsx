"use client";

import React, { useEffect, useRef } from "react";
import { getPendingRequestsCount } from "@/services/api";
import AuthService from "@/services/auth.service";
import { toast } from "sonner";

interface SessionSecurityProviderProps {
  children: React.ReactNode;
}

const INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

export const SessionSecurityProvider: React.FC<SessionSecurityProviderProps> = ({ children }) => {
  const lastActivityRef = useRef<number>(Date.now());
  const devToolsLoggedOutRef = useRef<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. User Activity Listener
    const handleUserActivity = () => {
      lastActivityRef.current = Date.now();
    };

    const activityEvents = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    activityEvents.forEach((ev) => window.addEventListener(ev, handleUserActivity, { passive: true }));

    // 2. Inactivity Check Timer (Runs every 10 seconds)
    const inactivityInterval = setInterval(() => {
      const user = AuthService.getUser();
      if (!user) return; // Not logged in

      // Inactivity auto-logout applies ONLY to Student users (role_id 5 or role 'STUDENT')
      const roleId = user.role_id || user.roleId;
      const roleStr = String(user.role || "").toUpperCase();
      const isStudent = roleId === 5 || roleStr.includes("STUDENT");
      if (!isStudent) return; // Skip inactivity logout for HOD and staff/admin roles

      const pendingRequests = getPendingRequestsCount();
      const inactiveDuration = Date.now() - lastActivityRef.current;

      // If pending API requests exist (AI generation, file upload, exam submission), keep session alive
      if (pendingRequests > 0) {
        lastActivityRef.current = Date.now();
        return;
      }

      if (inactiveDuration >= INACTIVITY_TIMEOUT_MS) {
        toast.error("Logged out due to 5 minutes of inactivity.", { id: "inactivity-logout" });
        AuthService.logout();
        setTimeout(() => {
          window.location.href = "/";
        }, 1000);
      }
    }, 10000);

    // 3. DevTools Detection (ONLY in Production Mode, NEVER on localhost/development)
    let devToolsInterval: NodeJS.Timeout | null = null;
    const isProduction = process.env.NODE_ENV === "production" && !window.location.hostname.includes("localhost") && !window.location.hostname.includes("127.0.0.1");

    if (isProduction) {
      devToolsInterval = setInterval(() => {
        if (devToolsLoggedOutRef.current) return;

        const user = AuthService.getUser();
        if (!user) return;
        const roleId = user.role_id || user.roleId;
        const roleStr = String(user.role || "").toUpperCase();
        const isStudent = roleId === 5 || roleStr.includes("STUDENT");
        if (!isStudent) return; // Skip DevTools auto logout for HOD and non-student roles

        const threshold = 160;
        const widthThreshold = window.outerWidth - window.innerWidth > threshold;
        const heightThreshold = window.outerHeight - window.innerHeight > threshold;

        if (widthThreshold || heightThreshold) {
          devToolsLoggedOutRef.current = true;
          toast.error("Developer Tools detected. Logging out in 5 seconds for security.", { id: "devtools-logout" });

          setTimeout(() => {
            AuthService.logout();
            window.location.href = "/";
          }, 5000);
        }
      }, 3000);
    }

    return () => {
      activityEvents.forEach((ev) => window.removeEventListener(ev, handleUserActivity));
      clearInterval(inactivityInterval);
      if (devToolsInterval) clearInterval(devToolsInterval);
    };
  }, []);

  return <>{children}</>;
};

export default SessionSecurityProvider;
