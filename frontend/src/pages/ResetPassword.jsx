import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { resetPassword } from "../services/authService";

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        if (password.length < 8) {
            setError(
                "Password must be at least 8 characters"
            );
            return;
        }
        setLoading(true)
        try {
            const data = await resetPassword(
                token,
                password
            )
            if (data.success) {
                setMessage(
                    "Password reset successfully. Redirecting to login..."
                )
                setTimeout(() => {
                    navigate("/login");
                }, 2000);
            } else {
                setError(data.message);
            }
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Something went wrong"
            )
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
                <h1 className="text-3xl font-bold text-gray-900 text-center">
                    Reset Password
                </h1>
                <p className="text-gray-500 text-center mt-2">
                    Create a new password for your account.
                </p>
                {message && (
                    <div className="mt-5 bg-green-50 text-green-700 px-4 py-3 rounded-lg text-sm">
                        {message}
                    </div>
                )}
                {error && (
                    <div className="mt-5 bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
                        {error}
                    </div>
                )}
                <form
                    onSubmit={handleSubmit}
                    className="mt-6 space-y-5">
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            New Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                            placeholder="Minimum 8 characters"
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
                            required/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) =>
                                setConfirmPassword(e.target.value)
                            }
                            placeholder="Confirm new password"
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
                            required/>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50">
                        {loading
                            ? "Resetting..."
                            : "Reset Password"
                        }
                    </button>
                </form>
                <div className="text-center mt-6">
                    <Link
                        to="/login"
                        className="text-green-600 font-semibold hover:underline">
                        ← Back to Login
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default ResetPassword;