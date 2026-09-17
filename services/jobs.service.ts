import api from "./api";
import { mockTpoStore } from "@/lib/mockTpoData";

class JobsService {
    // Student Endpoints
    async getStudentJobs() {
        return await api.get("/student/jobs");
    }

    async studentApply(jobId: number) {
        return await api.post(`/student/jobs/${jobId}/apply`);
    }

    async studentWithdraw(jobId: number) {
        return await api.post(`/student/jobs/${jobId}/withdraw`);
    }

    async studentToggleSave(jobId: number) {
        return await api.post(`/student/jobs/${jobId}/save`);
    }

    // TPO Endpoints
    async getTPOJobs() {
        try {
            const res = await api.get("/tpo/jobs");
            if (res.data?.data && res.data.data.length > 0) return res;
        } catch {}
        const jobs = mockTpoStore.getJobs();
        return { data: { success: true, data: jobs } };
    }

    async createJob(payload: any) {
        try {
            const res = await api.post("/tpo/jobs", payload);
            if (res.data?.success) return res;
        } catch {}
        const created = mockTpoStore.createJob(payload);
        return { data: { success: true, data: created } };
    }

    async updateJob(jobId: number, payload: any) {
        try {
            const res = await api.put(`/tpo/jobs/${jobId}`, payload);
            if (res.data?.success) return res;
        } catch {}
        const updated = mockTpoStore.updateJob(jobId, payload);
        return { data: { success: true, data: updated } };
    }

    async deleteJob(jobId: number) {
        try {
            const res = await api.delete(`/tpo/jobs/${jobId}`);
            if (res.data?.success) return res;
        } catch {}
        mockTpoStore.deleteJob(jobId);
        return { data: { success: true, message: "Job deleted" } };
    }

    async updateJobStatus(jobId: number, status: string) {
        try {
            const res = await api.patch(`/tpo/jobs/${jobId}/status`, { status });
            if (res.data?.success) return res;
        } catch {}
        const updated = mockTpoStore.updateJobStatus(jobId, status);
        return { data: { success: true, data: updated } };
    }

    async getJobApplications(jobId: number) {
        try {
            const res = await api.get(`/tpo/jobs/${jobId}/applications`);
            if (res.data?.data) return res;
        } catch {}
        const apps = mockTpoStore.getApplications(jobId);
        return { data: { success: true, data: apps } };
    }

    async getTPODashboardAnalytics() {
        try {
            const res = await api.get("/tpo/dashboard/analytics");
            if (res.data?.data) return res;
        } catch {}
        const analytics = mockTpoStore.getDashboardAnalytics();
        return { data: { success: true, data: analytics } };
    }

    async getJobById(jobId: number) {
        try {
            const res = await api.get(`/tpo/jobs/${jobId}`);
            if (res.data?.data) return res;
        } catch {}
        const job = mockTpoStore.getJobById(jobId);
        return { data: { success: true, data: job } };
    }

    async getEligibleStudents(jobId: number) {
        try {
            const res = await api.get(`/tpo/jobs/${jobId}/eligible-students`);
            if (res.data?.data) return res;
        } catch {}
        const students = mockTpoStore.getEligibleStudents(jobId);
        return { data: { success: true, data: students } };
    }

    async shortlistCandidate(jobId: number, studentId: number) {
        try {
            const res = await api.post(`/tpo/jobs/${jobId}/students/${studentId}/shortlist`);
            if (res.data?.success) return res;
        } catch {}
        mockTpoStore.shortlistCandidate(jobId, studentId);
        return { data: { success: true, message: "Shortlisted" } };
    }

    async updateCandidateStatus(jobId: number, studentId: number, status: string) {
        try {
            const res = await api.patch(`/tpo/jobs/${jobId}/students/${studentId}/status`, { status });
            if (res.data?.success) return res;
        } catch {}
        mockTpoStore.updateCandidateStatus(jobId, studentId, status);
        return { data: { success: true, message: "Status updated" } };
    }

    async createHRAccount(payload: any) {
        try {
            const res = await api.post("/tpo/hr-accounts", payload);
            if (res.data?.success) return res;
        } catch {}
        const created = mockTpoStore.createHRAccount(payload);
        return { data: { success: true, data: created } };
    }

    async getHRAccounts() {
        try {
            const res = await api.get("/tpo/hr-accounts");
            if (res.data?.data) return res;
        } catch {}
        const accounts = mockTpoStore.getHRAccounts();
        return { data: { success: true, data: accounts } };
    }

    async resetHRPassword(hrId: number, newPassword: string) {
        try {
            const res = await api.post(`/tpo/hr-accounts/${hrId}/reset-password`, { newPassword });
            if (res.data?.success) return res;
        } catch {}
        mockTpoStore.resetHRPassword(hrId, newPassword);
        return { data: { success: true, message: "Password reset" } };
    }

    // HR Portal Endpoints
    async hrLogin(payload: any) {
        return await api.post("/hr/auth/login", payload);
    }

    async getHRProfile() {
        return await api.get("/hr/auth/me");
    }

    async getHRJobs() {
        return await api.get("/hr/jobs");
    }

    async getHRCandidates(jobId: number) {
        return await api.get(`/hr/jobs/${jobId}/candidates`);
    }

    async updateHRCandidateStatus(jobId: number, studentId: number, status: string) {
        return await api.patch(`/hr/jobs/${jobId}/candidates/${studentId}/status`, { status });
    }

    async createHRExam(payload: any) {
        return await api.post("/hr/exams", payload);
    }

    async getHRExams() {
        return await api.get("/hr/exams");
    }

    async getStudentHRAssessments() {
        return await api.get("/student/hr-assessments");
    }

    async startHRAssessment(examId: number) {
        return await api.post(`/student/hr-assessments/${examId}/start`);
    }

    async submitHRAssessment(examId: number, payload: { attempt_id: number; mcq_answers?: any; coding_answers?: any }) {
        return await api.post(`/student/hr-assessments/${examId}/submit`, payload);
    }
}

export default new JobsService();
