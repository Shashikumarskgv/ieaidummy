import api from "./api";

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
        return await api.get("/finance/dashboard");
    }

    async getTransactions(filters: FinanceFilters = {}) {
        return await api.get("/finance/transactions", { params: filters });
    }

    async getCollegeLedger() {
        return await api.get("/finance/college-ledger");
    }

    async getHodActivationPanel(collegeId?: number | string) {
        return await api.get("/finance/hod-activation", { params: { collegeId } });
    }

    async getTpoVerificationLedger(collegeId?: number | string, search?: string) {
        return await api.get("/finance/tpo-verification", { params: { collegeId, search } });
    }

    async getSettlements(collegeId?: number | string) {
        return await api.get("/finance/settlements", { params: { collegeId } });
    }

    async createSettlement(payload: {
        monthKey: string;
        collegeId: number;
        adjustments?: number;
        referenceNumber?: string;
        notes?: string;
    }) {
        return await api.post("/finance/settlements", payload);
    }

    async getGatewaySettings() {
        return await api.get("/finance/gateways");
    }

    async updateGatewaySettings(payload: {
        gatewayCode: string;
        isActive: boolean;
        environment: string;
        configJson: any;
    }) {
        return await api.put("/finance/gateways", payload);
    }

    async updateCollegePricing(payload: {
        collegeId: number;
        baseDqPrice: number;
        collegeSharePrice: number;
        gstRatePercent: number;
    }) {
        return await api.put("/finance/pricing", payload);
    }
}

export default new FinanceService();
