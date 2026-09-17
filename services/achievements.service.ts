import api from "./api";
import { mockStudentStore } from "@/lib/mockStudentData";

class AchievementsService {
    async getByUserId(userId: number) {
        try {
            const res = await api.get("/student/achievements");
            if (res.data?.data) return res;
        } catch {}
        const profile = mockStudentStore.getProfile();
        return { data: { success: true, data: profile.achievements || [] } };
    }

    async create(payload: any) {
        try {
            const res = await api.post("/student/achievements", payload);
            if (res.data?.success) return res;
        } catch {}
        const profile = mockStudentStore.getProfile();
        const newAch = {
            id: "ach_" + Date.now(),
            title: payload.title,
            year: payload.date || new Date().getFullYear().toString()
        };
        const updatedAchievements = [...(profile.achievements || []), newAch];
        mockStudentStore.updateProfile({ achievements: updatedAchievements });
        return { data: { success: true, data: newAch } };
    }

    async delete(id: number) {
        try {
            const res = await api.delete(`/student/achievements/${id}`);
            if (res.data?.success) return res;
        } catch {}
        const profile = mockStudentStore.getProfile();
        const updatedAchievements = (profile.achievements || []).filter((a: any) => a.id !== id);
        mockStudentStore.updateProfile({ achievements: updatedAchievements });
        return { data: { success: true, message: "Achievement deleted" } };
    }
}

export default new AchievementsService();
