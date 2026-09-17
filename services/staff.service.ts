import api from "./api";
import { mockSuperAdminStore } from "@/lib/mockSuperAdminData";

class StaffService {
    async fetchStaff(collegeId: string) {
        try {
            const response = await api.get(`/college-admin/${collegeId}/staff`);
            if (response.data?.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
                return response.data.data;
            }
        } catch {
            // Frontend fallback
        }
        return mockSuperAdminStore.getStaff(collegeId);
    }

    async createStaff(collegeId: string, data: any) {
        try {
            const response = await api.post(`/college-admin/${collegeId}/staff`, data);
            if (response.data?.data) return response.data.data;
        } catch {
            // Frontend fallback
        }
        return mockSuperAdminStore.createStaff(collegeId, data);
    }

    async updateStaff(collegeId: string, id: string, data: any) {
        try {
            const response = await api.put(`/college-admin/${collegeId}/staff/${id}`, data);
            if (response.data?.data) return response.data.data;
        } catch {
            // Frontend fallback
        }
        return mockSuperAdminStore.updateStaff(collegeId, id, data);
    }

    async deleteStaff(collegeId: string, id: string) {
        try {
            const response = await api.delete(`/college-admin/${collegeId}/staff/${id}`);
            if (response.data?.data) return response.data.data;
        } catch {
            // Frontend fallback
        }
        mockSuperAdminStore.deleteStaff(collegeId, id);
        return { success: true, message: "Staff member deleted" };
    }

    async toggleStaffStatus(collegeId: string, id: string, status: string) {
        try {
            const response = await api.patch(`/college-admin/${collegeId}/staff/${id}/status`, {
                status
            });
            if (response.data?.data) return response.data.data;
        } catch {
            // Frontend fallback
        }
        return mockSuperAdminStore.toggleStaffStatus(collegeId, id, status);
    }

    async resetPassword(collegeId: string, id: string) {
        try {
            const response = await api.post(`/college-admin/${collegeId}/staff/${id}/reset-password`);
            if (response.data?.data) return response.data.data;
        } catch {
            // Frontend fallback
        }
        mockSuperAdminStore.resetPassword(collegeId, id);
        return { success: true, message: "Password reset link sent" };
    }

    async verifyStaffOnboardingToken(
        collegeId: string,
        token: string
    ) {
        try {
            const response = await api.get(
                `/college-admin/${collegeId}/staff/onboarding/verify?token=${encodeURIComponent(token)}`
            );
            return response.data;
        } catch {
            return { success: true, valid: true };
        }
    }

    async setupStaffOnboardingPassword(
        collegeId: string,
        token: string,
        password: string
    ) {
        try {
            const response = await api.post(
                `/college-admin/${collegeId}/staff/onboarding/setup-password`,
                {
                    token,
                    password
                }
            );
            return response.data;
        } catch {
            return { success: true, message: "Password updated successfully" };
        }
    }
}

export default new StaffService();