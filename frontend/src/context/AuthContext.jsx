import { createContext, useContext, useEffect, useState, } from "react";
import { loginUser, registerUser, getUserProfile, } from "../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            setLoading(false);
            return;
        }
        const loadUser = async () => {
            try {
                const data = await getUserProfile();
                if (data.success) {
                    setUser(data.user);
                    localStorage.setItem( "user", JSON.stringify(data.user))
                }
            } catch (error) {
                console.error(
                    "Failed to load user:",
                    error
                )
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                setUser(null);
            } finally {
                setLoading(false);
            }
        }
        loadUser();
    }, [])
    const register = async (userData) => {
        const data = await registerUser(userData);
        if (data.success) {
            localStorage.setItem("token", data.token)
            localStorage.setItem("user", JSON.stringify(data.user))
            setUser(data.user);
        }
        return data;
    }
    const login = async (userData) => {
        const data = await loginUser(userData);
        if (data.success) {
            localStorage.setItem("token", data.token)
            localStorage.setItem("user", JSON.stringify(data.user))
            setUser(data.user);
        }
        return data;
    }
    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
    }

    return (
        <AuthContext.Provider
            value={{ user, loading, register, login, logout, }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    return useContext(AuthContext);
};