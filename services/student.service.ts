import api from "@/lib/api";

export interface Student {
    rollNumber: string;
    firstName: string;
    lastName: string;
    personalEmail: string;
    officialEmail?: string;
    contactNumber: string;
    department: string;
    section: string;
    currentSemester: number;
    graduationYear: number;
    cgpa?: number;
    status: "Active" | "Inactive";
    joinedCourse?: string;
    createdDate?: string;
}

class StudentService {
    async fetchStudents(collegeId: string): Promise<Student[]> {
        const response = await api.get(`/student/${collegeId}/students`);
        return response.data.data;
    }

    async createStudent(collegeId: string, payload: any) {
        const response = await api.post(
            `/student/${collegeId}/students`,
            payload
        );

        return response.data.data;
    }

    async updateStudent(
        collegeId: string,
        rollNumber: string,
        payload: any
    ) {
        const response = await api.put(
            `/student/${collegeId}/students/${rollNumber}`,
            payload
        );

        return response.data.data;
    }

    async deleteStudent(
        collegeId: string,
        rollNumber: string
    ) {
        const response = await api.delete(
            `/student/${collegeId}/students/${rollNumber}`
        );

        return response.data;
    }

    async toggleStudentStatus(
        collegeId: string,
        rollNumber: string,
        status: "Active" | "Inactive"
    ) {
        const response = await api.patch(
            `/student/${collegeId}/students/${rollNumber}/status`,
            { status }
        );

        return response.data.data;
    }

    async bulkImportStudents(
        collegeId: string,
        students: any[],
        strategy: "skip" | "update",
        fileName?: string,
        importedBy?: string
    ) {
        const response = await api.post(
            `/student/${collegeId}/students/bulk-import`,
            {
                students,
                strategy,
                fileName,
                importedBy
            }
        );

        return response.data.data;
    }

    async getImportHistory(collegeId: string) {
        const response = await api.get(`/student/${collegeId}/students/import-history`);
        return response.data.data;
    }

    async getImportFailedRows(collegeId: string, importId: string) {
        const response = await api.get(`/student/${collegeId}/students/import-history/${importId}/failed-rows`, {
            responseType: "blob"
        });
        return response;
    }

    async verifyStudentOnboardingToken(token: string) {
        const response = await api.get(
            `/student/onboarding/verify?token=${encodeURIComponent(token)}`
        );
        return response.data;
    }

    async setupStudentOnboardingPassword(token: string, password: string) {
        const response = await api.post(
            `/student/onboarding/setup-password`,
            {
                token,
                password
            }
        );
        return response.data;
    }
}

export default new StudentService();