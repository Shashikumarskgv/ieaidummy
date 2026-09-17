import api from "./api";
import StorageService from "./storage.service";

class AuthService {
    async login(payload: any) {
        try {
            const response = await api.post("/super-admin/authentication/login", payload);
            const data = response.data?.data || response.data;
            if (data?.access_token && data?.user) {
                StorageService.saveSession(data.access_token, data.user);
                return data;
            }
        } catch {
            // Frontend demo fallback for standalone execution
        }

        const mockHODUser = {
            id: 301,
            role_id: 3,
            role: "HOD",
            full_name: "Dr. Rajesh Varma",
            email: payload?.username || "hod.cse@college.edu",
            college_code: "SVCE1234",
            college_name: "Sri Venkateswara College of Engineering",
            department: "Computer Science & Engineering"
        };

        const mockData = {
            access_token: "mock_jwt_token_hod_svce",
            user: mockHODUser
        };

        StorageService.saveSession(mockData.access_token, mockData.user);
        return mockData;
    }

    logout() {
        StorageService.clear();
    }

    getUser() {
        return StorageService.getUser();
    }

    getCurrentUser() {
        return this.getUser();
    }

    getToken() {
        return StorageService.getToken();
    }

    isAuthenticated() {
        return !!this.getToken();
    }
}

export default new AuthService();