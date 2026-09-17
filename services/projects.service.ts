import api from "./api";

class ProjectsService {
    async getByUserId(userId: number) {
        return await api.get("/student/projects");
    }

    async create(payload: any) {
        return await api.post("/student/projects", payload);
    }

    async delete(id: number) {
        return await api.delete(`/student/projects/${id}`);
    }
}

export default new ProjectsService();
