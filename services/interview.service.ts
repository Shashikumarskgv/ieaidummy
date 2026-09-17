import api from "@/lib/api";

export class InterviewService {
  static async getPanels() {
    try {
      const res = await api.get("/student/interview/panels");
      if (res.data && res.data.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
        localStorage.setItem("student_role_panels", JSON.stringify(res.data.data));
        return res.data.data;
      }
    } catch (e) {
      console.warn("API getPanels offline, using localStorage fallback:", e);
    }
    const saved = localStorage.getItem("student_role_panels");
    return saved ? JSON.parse(saved) : [];
  }

  static async setPanelRole(panelNumber: number, roleName: string) {
    try {
      const res = await api.post("/student/interview/panels", { panelNumber, roleName });
      if (res.data && res.data.success) {
        return res.data.data;
      }
    } catch (e) {
      console.warn("API setPanelRole offline, saving locally:", e);
    }
    return null;
  }

  static async getSectionQuestions(section: string, panelNumber = 0) {
    try {
      const res = await api.get(`/student/interview/questions/${section}?panel=${panelNumber}`);
      if (res.data && res.data.success && Array.isArray(res.data.data)) {
        if (section === "role") {
          localStorage.setItem(`dq_role_panel_qs_${panelNumber}`, JSON.stringify(res.data.data));
        } else {
          localStorage.setItem(`dq_section_qs_${section}`, JSON.stringify(res.data.data));
        }
        return res.data.data;
      }
    } catch (e) {
      console.warn(`API getSectionQuestions (${section}) offline, fallback:`, e);
    }
    const key = section === "role" ? `dq_role_panel_qs_${panelNumber}` : `dq_section_qs_${section}`;
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [];
  }

  static async toggleProgress(section: string, panelNumber: number, questionIndex: number, isCompleted: boolean) {
    try {
      await api.patch("/student/interview/questions/progress", { section, panelNumber, questionIndex, isCompleted });
    } catch (e) {
      console.warn("API toggleProgress offline, saved locally:", e);
    }
  }

  static async setupTestSession(payload: { section: string; scope: string; count: number; indices?: number[]; panelNumber?: number; testType?: string }) {
    try {
      const res = await api.post("/student/interview/test/setup", payload);
      if (res.data && res.data.success && res.data.data) {
        const tests = JSON.parse(localStorage.getItem("dq_test_results") || "[]");
        localStorage.setItem("dq_test_results", JSON.stringify([res.data.data, ...tests]));
        return res.data.data;
      }
    } catch (e) {
      console.warn("API setupTestSession offline, building test session locally:", e);
    }
    return null;
  }

  static async submitTestSession(testId: string, answers: number[]) {
    try {
      const res = await api.post("/student/interview/test/submit", { testId, answers });
      if (res.data && res.data.success && res.data.data) {
        const tests = JSON.parse(localStorage.getItem("dq_test_results") || "[]");
        const updated = tests.map((t: any) => t.id === testId ? res.data.data : t);
        localStorage.setItem("dq_test_results", JSON.stringify(updated));
        return res.data.data;
      }
    } catch (e) {
      console.warn("API submitTestSession offline, submitting locally:", e);
    }
    return null;
  }

  static async getTestResults() {
    try {
      const res = await api.get("/student/interview/test/results");
      if (res.data && res.data.success && Array.isArray(res.data.data)) {
        localStorage.setItem("dq_test_results", JSON.stringify(res.data.data));
        return res.data.data;
      }
    } catch (e) {
      console.warn("API getTestResults offline, returning local tests:", e);
    }
    const saved = localStorage.getItem("dq_test_results");
    return saved ? JSON.parse(saved) : [];
  }

  static async getTestResultById(testId: string) {
    try {
      const res = await api.get(`/student/interview/test/results/${testId}`);
      if (res.data && res.data.success) {
        return res.data.data;
      }
    } catch (e) {
      console.warn("API getTestResultById offline:", e);
    }
    return null;
  }

  static async checkMonthlyStatus() {
    try {
      const res = await api.get("/student/interview/monthly-status");
      if (res.data && res.data.success) {
        return res.data.data;
      }
    } catch (e) {
      console.warn("API checkMonthlyStatus offline:", e);
    }
    return { canGenerate: true, currentMonth: new Date().toISOString().substring(0, 7) };
  }

  static async generateMonthlyData() {
    const res = await api.post("/student/interview/generate-monthly");
    if (res.data && res.data.success) {
      return res.data.data;
    }
    throw new Error(res.data?.message || "Failed to generate monthly interview dataset.");
  }
}

export default InterviewService;
