import api from "./api";
import { mockStudentStore } from "@/lib/mockStudentData";

class ProjectsService {
    async getByUserId(userId: number) {
        try {
            const res = await api.get("/student/projects");
            if (res.data?.data) return res;
        } catch {}
        const profile = mockStudentStore.getProfile();
        return { data: { success: true, data: profile.projects || [] } };
    }

    async create(payload: any) {
        try {
            const res = await api.post("/student/projects", payload);
            if (res.data?.success) return res;
        } catch {}
        const profile = mockStudentStore.getProfile();
        const newProj = {
            id: Date.now(),
            title: payload.title,
            description: payload.description,
            liveDemo: payload.link || "",
            role: "Developer",
            technologies: "Next.js, TypeScript"
        };
        const updatedProjects = [...(profile.projects || []), newProj];
        mockStudentStore.updateProfile({ projects: updatedProjects });
        return { data: { success: true, data: newProj } };
    }

    async delete(id: number) {
        try {
            const res = await api.delete(`/student/projects/${id}`);
            if (res.data?.success) return res;
        } catch {}
        const profile = mockStudentStore.getProfile();
        const updatedProjects = (profile.projects || []).filter((p: any) => p.id !== id);
        mockStudentStore.updateProfile({ projects: updatedProjects });
        return { data: { success: true, message: "Project deleted" } };
    }
}

export default new ProjectsService();
