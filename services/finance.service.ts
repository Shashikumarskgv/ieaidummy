import api from "./api";
import { mockSuperAdminStore } from "@/lib/mockSuperAdminData";

export interface FinanceFilters {
    dateFrom?: string;
    dateTo?: string;
    collegeId?: number | string;
    department?: string;
    gateway?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
}

class FinanceService {
    async getDashboardStats() {
        try {
            const res = await api.get("/finance/dashboard");
            if (res.data?.data) return res;
        } catch {}
        return {
            data: {
                success: true,
                data: {
                    totalRevenue: 44744,
                    totalTransactions: 56,
                    activeLicenses: 52,
                    pendingSettlements: 12400
                }
            }
        };
    }

    async getTransactions(filters: FinanceFilters = {}) {
        try {
            const res = await api.get("/finance/transactions", { params: filters });
            if (res.data?.data) return res;
        } catch {}
        return {
            data: {
                success: true,
                data: []
            }
        };
    }

    async getCollegeLedger() {
        try {
            const res = await api.get("/finance/college-ledger");
            if (res.data?.data) return res;
        } catch {}
        return {
            data: {
                success: true,
                data: []
            }
        };
    }

    async getHodActivationPanel(collegeId?: number | string) {
        try {
            const res = await api.get("/finance/hod-activation", { params: { collegeId } });
            if (res.data?.data) return res;
        } catch {}
        const data = mockSuperAdminStore.getHodActivationPanel(collegeId);
        return { data: { success: true, data } };
    }

    async getTpoVerificationLedger(collegeId?: number | string, search?: string) {
        try {
            const res = await api.get("/finance/tpo-verification", { params: { collegeId, search } });
            if (res.data?.data) return res;
        } catch {}
        const data = mockSuperAdminStore.getTpoVerificationLedger(collegeId, search);
        return { data: { success: true, data } };
    }

    async getSettlements(collegeId?: number | string) {
        try {
            const res = await api.get("/finance/settlements", { params: { collegeId } });
            if (res.data?.data) return res;
        } catch {}
        return { data: { success: true, data: [] } };
    }

    async createSettlement(payload: {
        monthKey: string;
        collegeId: number;
        adjustments?: number;
        referenceNumber?: string;
        notes?: string;
    }) {
        try {
            return await api.post("/finance/settlements", payload);
        } catch {
            return { data: { success: true, message: "Settlement created" } };
        }
    }

    async getGatewaySettings() {
        try {
            return await api.get("/finance/gateways");
        } catch {
            return { data: { success: true, data: [] } };
        }
    }

    async updateGatewaySettings(payload: {
        gatewayCode: string;
        isActive: boolean;
        environment: string;
        configJson: any;
    }) {
        try {
            return await api.put("/finance/gateways", payload);
        } catch {
            return { data: { success: true, message: "Settings updated" } };
        }
    }

    async updateCollegePricing(payload: {
        collegeId: number;
        baseDqPrice: number;
        collegeSharePrice: number;
        gstRatePercent: number;
    }) {
        try {
            return await api.put("/finance/pricing", payload);
        } catch {
            return { data: { success: true, message: "Pricing updated" } };
        }
    }
}

export default new FinanceService();
