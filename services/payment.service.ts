import api from "./api";
import { mockStudentStore } from "@/lib/mockStudentData";

class PaymentService {
    async getStudentPricing() {
        try {
            const res = await api.get("/finance/student/pricing");
            if (res.data?.data) return res;
        } catch {}
        const pricing = mockStudentStore.getPricing();
        return { data: { success: true, data: pricing } };
    }

    async createOrder(gateway: string = "Razorpay") {
        try {
            const res = await api.post("/finance/student/order", { gateway });
            if (res.data?.data) return res;
        } catch {}
        const order = mockStudentStore.createOrder(gateway);
        return { data: { success: true, data: order } };
    }

    async verifyPayment(payload: {
        orderId: string;
        paymentId: string;
        signature: string;
        gateway: string;
    }) {
        try {
            const res = await api.post("/finance/student/verify", payload);
            if (res.data?.success) return res;
        } catch {}
        const verification = mockStudentStore.verifyPayment(payload);
        return { data: { success: true, data: verification } };
    }

    async getLicenseStatus() {
        try {
            const res = await api.get("/finance/student/license");
            if (res.data?.data) return res;
        } catch {}
        const license = mockStudentStore.getLicenseStatus();
        return { data: { success: true, data: license } };
    }
}

export default new PaymentService();
