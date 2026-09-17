import api from "./api";
import { mockSuperAdminStore } from "@/lib/mockSuperAdminData";
import { mockHodStore } from "@/lib/mockHodData";

class SuperAdminService {
    async getAnalytics(department?: string) {
        try {
            const url = department ? `/super-admin/analytics?department=${encodeURIComponent(department)}` : "/super-admin/analytics";
            const res = await api.get(url);
            if (res.data?.data) return res;
        } catch {}
        const data = mockSuperAdminStore.getSuperAdminAnalytics(department);
        return { data: { success: true, data } };
    }

    async getReports(department?: string) {
        try {
            const url = department ? `/super-admin/analytics/reports?department=${encodeURIComponent(department)}` : "/super-admin/analytics/reports";
            const res = await api.get(url);
            if (res.data?.data) return res;
        } catch {}
        const attempts = mockHodStore.getAttempts();
        return { data: { success: true, data: attempts } };
    }

    async reassignAttempt(attemptId: string, reason: string) {
        try {
            const res = await api.post(`/super-admin/analytics/reports/reassign/${attemptId}`, { reason });
            if (res.data?.success) return res;
        } catch {}
        mockHodStore.reassignAttempt(attemptId, reason);
        return { data: { success: true, message: "Attempt reassigned successfully" } };
    }

    async getStudentsList() {
        try {
            const res = await api.get("/super-admin/analytics/students");
            if (res.data?.data) return res;
        } catch {}
        const students = mockSuperAdminStore.getStudents();
        return { data: { success: true, data: students } };
    }

    async getPlacementAnalytics() {
        try {
            const res = await api.get("/super-admin/analytics/placement");
            if (res.data?.data) return res;
        } catch {}
        const analytics = mockSuperAdminStore.getSuperAdminAnalytics();
        return { data: { success: true, data: analytics.placementAnalytics } };
    }
}

export default new SuperAdminService();
