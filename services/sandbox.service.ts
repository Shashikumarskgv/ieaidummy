import api from "./api";

export async function executeCode(
    language: string,
    code: string
) {
    const response = await api.post("/compiler/run", {
        language,
        code
    });

    return response.data;
}