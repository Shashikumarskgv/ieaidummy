import api from "../lib/api";

export const getStats = async () => {

    const response = await api.get("/super-admin/stats/stats");

    return response.data;
};