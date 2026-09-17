import axios from "axios";
import { toast } from "sonner";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true
});

export let pendingApiRequestsCount = 0;

export const getPendingRequestsCount = () => pendingApiRequestsCount;

api.interceptors.request.use(
    (config) => {
        pendingApiRequestsCount++;
        if (typeof window !== "undefined") {
            const tokenKey = process.env.NEXT_PUBLIC_TOKEN_KEY || "dq_lms_access_token";
            const token = sessionStorage.getItem(tokenKey) || localStorage.getItem(tokenKey) || localStorage.getItem("hr_token");

            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        pendingApiRequestsCount = Math.max(0, pendingApiRequestsCount - 1);
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        pendingApiRequestsCount = Math.max(0, pendingApiRequestsCount - 1);
        return response;
    },
    (error) => {
        pendingApiRequestsCount = Math.max(0, pendingApiRequestsCount - 1);
        if (typeof window !== "undefined") {
            let message = "An unexpected error occurred";

            if (error.response?.data) {
                const data = error.response.data;
                if (typeof data === "string") {
                    if (data.trim().startsWith("<")) {
                        message = `Server Error (${error.response.status}): ${error.response.statusText || "Internal Server Error"}`;
                    } else {
                        message = data;
                    }
                } else if (typeof data === "object") {
                    message = data.message || data.error || error.message || message;

                    if (data.errors) {
                        if (Array.isArray(data.errors)) {
                            const details = data.errors
                                .map((e: any) => typeof e === "string" ? e : (e.msg || e.message || e.error))
                                .filter(Boolean);
                            if (details.length > 0) {
                                message = `${message}: ${details.join(", ")}`;
                            }
                        } else if (typeof data.errors === "object" && data.errors !== null) {
                            const details = Object.entries(data.errors)
                                .map(([key, val]) => {
                                    if (typeof val === "string") return `${key}: ${val}`;
                                    if (val && typeof val === "object") {
                                        return `${key}: ${(val as any).msg || (val as any).message || JSON.stringify(val)}`;
                                    }
                                    return null;
                                })
                                .filter(Boolean);
                            if (details.length > 0) {
                                message = `${message}: ${details.join(", ")}`;
                            }
                        } else if (typeof data.errors === "string") {
                            message = `${message}: ${data.errors}`;
                        }
                    }
                }
            } else if (error.message) {
                message = error.message;
            }

            if (error.response?.status === 401) {
                const isAuthPage = window.location.pathname.includes("/auth") || window.location.pathname === "/";
                if (!isAuthPage) {
                    const tokenKey = process.env.NEXT_PUBLIC_TOKEN_KEY || "dq_lms_access_token";
                    const userKey = process.env.NEXT_PUBLIC_USER_KEY || "dq_lms_user";
                    sessionStorage.removeItem(tokenKey);
                    sessionStorage.removeItem(userKey);
                    localStorage.removeItem(tokenKey);
                    localStorage.removeItem(userKey);
                    toast.error("Session expired. Please log in again.", { id: "session-expired" });
                    setTimeout(() => {
                        window.location.href = "/";
                    }, 2000);
                    return Promise.reject(error);
                }
            }

            // Do not show global error toasts for backend network failures in offline/mock mode
            console.warn("[API Offline Fallback]:", message);
        }
        return Promise.reject(error);
    }
);

export default api;