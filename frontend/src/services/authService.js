import api from "./api";

export const registerUser = async (userData) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
}

export const loginUser = async (userData) => {
    const response = await api.post("/auth/login", userData)
    return response.data;
}

export const getUserProfile = async () => {
    const response = await api.get("/auth/profile")
    return response.data;
}

export const updateUserProfile = async (userData) => {
    const response = await api.put("/auth/profile", userData)
    return response.data;
}

export const changePassword = async (passwordData) => {
    const response = await api.put("/auth/change-password", passwordData)
    return response.data;
}

export const forgotPassword = async (email) => {
    const response = await api.post("/auth/forgot-password", { email })
    return response.data;
}

export const resetPassword = async (token, newPassword) => {
    const response = await api.post(`/auth/reset-password/${token}`, { newPassword })
    return response.data;
}