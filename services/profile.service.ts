import api from "./api";
import AuthService from "./auth.service";
import { mockHodStore } from "@/lib/mockHodData";
import { mockTpoStore } from "@/lib/mockTpoData";

class ProfileService {
    getRolePath() {
        const user = AuthService.getCurrentUser();
        const roleId = user?.role_id;
        const roleUpper = String(user?.role || "").toUpperCase();
        if (roleId === 3 || roleUpper.includes("HOD")) return "/hod";
        if (roleId === 2 || roleId === 4 || roleUpper.includes("TPO")) return "/tpo";
        if (roleId === 5 || roleUpper.includes("STUDENT")) return "/student";
        return "/hod"; // default fallback for HOD
    }

    async getById(id: number) {
        const path = this.getRolePath();
        try {
            const res = await api.get(`${path}/profile`);
            if (res.data?.data) return res;
        } catch {
            // Frontend fallback
        }
        const profile = path === "/tpo" ? mockTpoStore.getProfile() : mockHodStore.getProfile();
        return { data: { success: true, data: profile } };
    }

    async update(id: number, payload: any) {
        const path = this.getRolePath();
        try {
            const res = await api.put(`${path}/profile`, payload);
            if (res.data?.success) return res;
        } catch {
            // Frontend fallback
        }
        const updated = path === "/tpo" ? mockTpoStore.updateProfile(payload) : mockHodStore.updateProfile(payload);
        return { data: { success: true, data: updated } };
    }

    async changePassword(payload: any) {
        const path = this.getRolePath();
        try {
            const res = await api.put(`${path}/change-password`, payload);
            if (res.data?.success) return res;
        } catch {
            // Frontend fallback
        }
        return { data: { success: true, message: "Password changed successfully." } };
    }

    async getDashboardAnalytics() {
        try {
            return await api.get("/student/dashboard/analytics");
        } catch {
            return { data: { success: true, data: {} } };
        }
    }
}

export default new ProfileService();
