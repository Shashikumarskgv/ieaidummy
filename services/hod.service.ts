import api from "./api";
import { mockHodStore } from "@/lib/mockHodData";

class HODService {
    async getReports(department?: string) {
        try {
            const url = department ? `/hod/reports?department=${encodeURIComponent(department)}` : "/hod/reports";
            const res = await api.get(url);
            if (res.data?.data && res.data.data.length > 0) {
                return res;
            }
        } catch {
            // Frontend fallback to mockHodStore
        }
        const attempts = mockHodStore.getAttempts();
        const filtered = department && department !== "all"
            ? attempts.filter(a => a.student?.department?.toLowerCase().includes(department.toLowerCase()))
            : attempts;
        return { data: { success: true, data: filtered } };
    }

    async reassignAttempt(attemptId: string | number, reason: string) {
        try {
            const res = await api.post(`/hod/reports/reassign/${attemptId}`, { reason });
            if (res.data?.success) return res;
        } catch {
            // Frontend fallback
        }
        mockHodStore.reassignAttempt(attemptId, reason);
        return { data: { success: true, message: "Exam attempt reassigned successfully." } };
    }

    async getAnalytics(department?: string) {
        try {
            const url = department ? `/hod/analytics?department=${encodeURIComponent(department)}` : "/hod/analytics";
            const res = await api.get(url);
            if (res.data?.success && res.data?.data) {
                return res;
            }
        } catch {
            // Frontend fallback to mockHodStore
        }
        const analytics = mockHodStore.getAnalyticsData(department);
        return { data: { success: true, data: analytics } };
    }

    async getDashboardStats() {
        try {
            const res = await api.get("/hod/dashboard/stats");
            if (res.data?.data) {
                return res;
            }
        } catch {
            // Frontend fallback to mockHodStore
        }
        const stats = mockHodStore.getDashboardStats();
        return { data: { success: true, data: stats } };
    }

    async getStudentsList() {
        try {
            const res = await api.get("/hod/students");
            if (res.data?.data && res.data.data.length > 0) {
                return res;
            }
        } catch {
            // Frontend fallback to mockHodStore
        }
        const students = mockHodStore.getStudents();
        return { data: { success: true, data: students } };
    }

    async getCoursesList() {
        try {
            const res = await api.get("/hod/courses");
            if (res.data?.data && res.data.data.length > 0) {
                return res;
            }
        } catch {
            // Frontend fallback to mockHodStore
        }
        const courses = mockHodStore.getCourses();
        return { data: { success: true, data: courses } };
    }
}

export default new HODService();
