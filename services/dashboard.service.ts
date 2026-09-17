import api from "@/lib/api";

class DashboardService{
    async getStats(){
        const {data}=await api.get("/super-admin/dashboard/stats");
        return data.data;
    }
}

export default new DashboardService();

