import api from "./api";

class PaymentService {
    async getStudentPricing() {
        return await api.get("/finance/student/pricing");
    }

    async createOrder(gateway: string = "Razorpay") {
        return await api.post("/finance/student/order", { gateway });
    }

    async verifyPayment(payload: {
        orderId: string;
        paymentId: string;
        signature: string;
        gateway: string;
    }) {
        return await api.post("/finance/student/verify", payload);
    }

    async getLicenseStatus() {
        return await api.get("/finance/student/license");
    }
}

export default new PaymentService();
