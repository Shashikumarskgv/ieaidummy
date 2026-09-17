import api from "./api";

class AchievementsService {
    async getByUserId(userId: number) {
        return await api.get("/student/achievements");
    }

    async create(payload: any) {
        return await api.post("/student/achievements", payload);
    }

    async delete(id: number) {
        return await api.delete(`/student/achievements/${id}`);
    }
}

export default new AchievementsService();
