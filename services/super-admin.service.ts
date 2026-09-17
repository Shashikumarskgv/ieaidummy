import api from "./api";

class SuperAdminService {
    async getAnalytics(department?: string) {
        const url = department ? `/super-admin/analytics?department=${encodeURIComponent(department)}` : "/super-admin/analytics";
        return await api.get(url);
    }

    async getReports(department?: string) {
        const url = department ? `/super-admin/analytics/reports?department=${encodeURIComponent(department)}` : "/super-admin/analytics/reports";
        return await api.get(url);
    }

    async reassignAttempt(attemptId: string, reason: string) {
        return await api.post(`/super-admin/analytics/reports/reassign/${attemptId}`, { reason });
    }

    async getStudentsList() {
        return await api.get("/super-admin/analytics/students");
    }

    async getPlacementAnalytics() {
        return await api.get("/super-admin/analytics/placement");
    }
}

export default new SuperAdminService();
