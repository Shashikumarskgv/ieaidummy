class StorageService {

    saveSession(
        token: string,
        user: any
    ) {
        if (typeof window === "undefined") return;
        const tokenKey = process.env.NEXT_PUBLIC_TOKEN_KEY || "dq_lms_access_token";
        const userKey = process.env.NEXT_PUBLIC_USER_KEY || "dq_lms_user";

        sessionStorage.setItem(tokenKey, token);
        sessionStorage.setItem(userKey, JSON.stringify(user));

        localStorage.setItem(tokenKey, token);
        localStorage.setItem(userKey, JSON.stringify(user));
    }

    getToken() {
        if (typeof window === "undefined") return null;
        const tokenKey = process.env.NEXT_PUBLIC_TOKEN_KEY || "dq_lms_access_token";
        return sessionStorage.getItem(tokenKey) || localStorage.getItem(tokenKey);
    }

    getUser() {
        if (typeof window === "undefined") return null;
        const userKey = process.env.NEXT_PUBLIC_USER_KEY || "dq_lms_user";
        const user = sessionStorage.getItem(userKey) || localStorage.getItem(userKey);
        return user ? JSON.parse(user) : null;
    }

    clear() {
        if (typeof window === "undefined") return;
        const tokenKey = process.env.NEXT_PUBLIC_TOKEN_KEY || "dq_lms_access_token";
        const userKey = process.env.NEXT_PUBLIC_USER_KEY || "dq_lms_user";

        sessionStorage.removeItem(tokenKey);
        sessionStorage.removeItem(userKey);

        localStorage.removeItem(tokenKey);
        localStorage.removeItem(userKey);
    }
}

export default new StorageService();