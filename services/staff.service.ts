import api from "./api";

class StaffService {
    async fetchStaff(collegeId: string) {
        const response = await api.get(`/college-admin/${collegeId}/staff`);
        return response.data.data;
    }

    async createStaff(collegeId: string, data: any) {
        const response = await api.post(`/college-admin/${collegeId}/staff`, data);
        return response.data.data;
    }

    async updateStaff(collegeId: string, id: string, data: any) {
        const response = await api.put(`/college-admin/${collegeId}/staff/${id}`, data);
        return response.data.data;
    }

    async deleteStaff(collegeId: string, id: string) {
        const response = await api.delete(`/college-admin/${collegeId}/staff/${id}`);
        return response.data.data;
    }

    async toggleStaffStatus(collegeId: string, id: string, status: string) {
        const response = await api.patch(`/college-admin/${collegeId}/staff/${id}/status`, {
            status
        });
        return response.data.data;
    }

    async resetPassword(collegeId: string, id: string) {
        const response = await api.post(`/college-admin/${collegeId}/staff/${id}/reset-password`);
        return response.data.data;
    }

    async verifyStaffOnboardingToken(
        collegeId: string,
        token: string
    ) {
        const response = await api.get(
            `/college-admin/${collegeId}/staff/onboarding/verify?token=${encodeURIComponent(token)}`
        );

        return response.data;
    }

    async setupStaffOnboardingPassword(
        collegeId: string,
        token: string,
        password: string
    ) {
        const response = await api.post(
            `/college-admin/${collegeId}/staff/onboarding/setup-password`,
            {
                token,
                password
            }
        );

        return response.data;
    }
}

export default new StaffService();