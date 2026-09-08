import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AdminRoute = () => {
    const { user, loading } = useAuth();
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>Loading...</p>
            </div>
        )
    }
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    if (user.role !== "admin") {
        return <Navigate to="/" replace />;
    }
    return <Outlet />;
}

export default AdminRoute;