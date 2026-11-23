import { useMemo, useState } from "react";
import { AuthContext } from "@/lib/auth-context";

const DEMO_EMAIL = "admin@velo.app";
const DEMO_PASSWORD = "demo1234";
const AUTH_STORAGE_KEY = "velo-demo-auth";

function readSession() {
    const email = window.sessionStorage.getItem(AUTH_STORAGE_KEY);
    return email === DEMO_EMAIL ? { email } : null;
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(readSession);

    function login(email, password) {
        if (email.trim().toLowerCase() !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
            throw new Error("The email or password is incorrect.");
        }

        const signedInUser = { email: DEMO_EMAIL };
        window.sessionStorage.setItem(AUTH_STORAGE_KEY, signedInUser.email);
        setUser(signedInUser);
    }

    function logout() {
        window.sessionStorage.removeItem(AUTH_STORAGE_KEY);
        setUser(null);
    }

    const value = useMemo(() => ({ user, login, logout }), [user]);
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
