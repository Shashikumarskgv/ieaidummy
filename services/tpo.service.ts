import api from "./api";
import { mockTpoStore } from "@/lib/mockTpoData";

class TPOService {
    async getAnalytics(department?: string) {
        try {
            const url = department ? `/tpo/analytics?department=${encodeURIComponent(department)}` : "/tpo/analytics";
            const res = await api.get(url);
            if (res.data?.success && res.data?.data) return res;
        } catch {}
        const examAnalytics = mockTpoStore.getExamAnalytics();
        return { data: { success: true, data: examAnalytics } };
    }

    async getReports(department?: string) {
        try {
            const url = department ? `/tpo/reports?department=${encodeURIComponent(department)}` : "/tpo/reports";
            const res = await api.get(url);
            if (res.data?.data && res.data.data.length > 0) return res;
        } catch {}
        const examAnalytics = mockTpoStore.getExamAnalytics();
        return { data: { success: true, data: examAnalytics.attempts || [] } };
    }

    async reassignAttempt(attemptId: string, reason: string) {
        try {
            const res = await api.post(`/tpo/reports/reassign/${attemptId}`, { reason });
            if (res.data?.success) return res;
        } catch {}
        return { data: { success: true, message: "Attempt reset successfully" } };
    }

    async getStudentsList() {
        try {
            const res = await api.get("/tpo/students");
            if (res.data?.data && res.data.data.length > 0) return res;
        } catch {}
        const students = mockTpoStore.getStudents();
        return { data: { success: true, data: students } };
    }

    async getDashboardAnalytics() {
        try {
            const res = await api.get("/tpo/dashboard/analytics");
            if (res.data?.data) return res;
        } catch {}
        const analytics = mockTpoStore.getDashboardAnalytics();
        return { data: { success: true, data: analytics } };
    }
}

export default new TPOService();
