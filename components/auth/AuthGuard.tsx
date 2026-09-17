"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import AuthService from "@/services/auth.service";
import { Loader2 } from "lucide-react";

const PROTECTED_PREFIXES = ["/dq-admin", "/hod", "/super-admin", "/tpo", "/student"];

/* const isProtectedPath = (path: string): boolean => {
  return PROTECTED_PREFIXES.some(prefix =>
    path.startsWith(prefix) && !path.startsWith(`${prefix}/auth`)
  );
}; */

const PUBLIC_PATHS = [
    "/hod/auth",
    "/tpo/auth",
    "/student/auth",
    "/super-admin/auth",
    "/dq-admin/auth",

    "/hod/verify-onboarding",
    "/tpo/verify-onboarding",
    "/student/verify-onboarding"
];

const isProtectedPath = (path: string): boolean => {

    if (PUBLIC_PATHS.some(publicPath => path.startsWith(publicPath))) {
        return false;
    }

    return PROTECTED_PREFIXES.some(prefix =>
        path.startsWith(prefix)
    );

};

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(true);
  const [loadingSession, setLoadingSession] = useState(true);

  // Cross-tab sessionStorage sync handshake using BroadcastChannel
  useEffect(() => {
    if (typeof window === "undefined") return;

    const tokenKey = process.env.NEXT_PUBLIC_TOKEN_KEY || "dq_lms_access_token";
    const userKey = process.env.NEXT_PUBLIC_USER_KEY || "dq_lms_user";
    const hasToken = !!sessionStorage.getItem(tokenKey);

    const bc = new BroadcastChannel("auth_session_sync");
    let timeout: NodeJS.Timeout | null = null;

    if (hasToken) {
      // 1. If this tab has the session, listen to and respond to incoming requests
      bc.onmessage = (event) => {
        if (event.data && event.data.type === "REQUEST_SESSION") {
          const token = sessionStorage.getItem(tokenKey);
          const user = sessionStorage.getItem(userKey);
          if (token && user) {
            bc.postMessage({ type: "SESSION_DATA", token, user });
          }
        }
      };
      setLoadingSession(false);
    } else {
      // 2. If this is a new tab requesting the session, listen to responses
      bc.onmessage = (event) => {
        if (event.data && event.data.type === "SESSION_DATA") {
          try {
            const { token, user } = event.data;
            sessionStorage.setItem(tokenKey, token);
            sessionStorage.setItem(userKey, user);
            setLoadingSession(false);
          } catch (e) {
            console.error("Handshake session save error in AuthGuard:", e);
          }
        }
      };

      // Broadcast request
      bc.postMessage({ type: "REQUEST_SESSION" });

      // Fallback timeout
      timeout = setTimeout(() => {
        setLoadingSession(false);
      }, 350);
    }

    return () => {
      bc.close();
      if (timeout) clearTimeout(timeout);
    };
  }, [loadingSession]);

  useEffect(() => {
    if (loadingSession) return;

    const needsAuth = isProtectedPath(pathname);

    if (!needsAuth) {
      setIsAuthorized(true);
      setLoading(false);
      return;
    }

    if (!AuthService.isAuthenticated()) {
      setIsAuthorized(false);
      setLoading(false);
      router.replace("/");
      return;
    }

    setIsAuthorized(true);
    setLoading(false);
  }, [pathname, router, loadingSession]);

  if (loading || loadingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthorized) return null;

  return <>{children}</>;
}
