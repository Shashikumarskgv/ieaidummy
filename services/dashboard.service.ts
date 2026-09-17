import api from "@/lib/api";
import { mockSuperAdminStore } from "@/lib/mockSuperAdminData";

class DashboardService {
    async getStats() {
        try {
            const { data } = await api.get("/super-admin/dashboard/stats");
            if (data?.data) return data.data;
        } catch {
            // Frontend fallback
        }
        return mockSuperAdminStore.getDashboardStats();
    }
}

export default new DashboardService();
