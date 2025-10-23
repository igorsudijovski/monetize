// AuthContext.js
import {createContext, useState} from "react";

const ACCESS_TOKEN_KEY = "accessToken";
export const AuthContext = createContext<{
    isLoggedIn: boolean;
    login: (token: string) => void;
    logout: () => void;
    getToken: () => string | null;
}>({
    isLoggedIn: localStorage.getItem(ACCESS_TOKEN_KEY) !== null,
    login: (token: string) => {},
    logout: () => {},
    getToken: () => null,
});

export function AuthProvider({ children } : { children: React.ReactNode }) {
    const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem(ACCESS_TOKEN_KEY) !== null);

    const login = (token: string) => {
        localStorage.setItem(ACCESS_TOKEN_KEY, token);
        setIsLoggedIn(true);
    };

    const logout = () => {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        setIsLoggedIn(false);
    };

    const getToken = () => {
        return localStorage.getItem(ACCESS_TOKEN_KEY);
    }

    return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout, getToken }}>
        {children}
    </AuthContext.Provider>
);
}
