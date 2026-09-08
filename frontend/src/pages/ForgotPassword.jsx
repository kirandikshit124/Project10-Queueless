import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../services/authService";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");
        setLoading(true);
        try {
            const data = await forgotPassword(email);
            if (data.success) {
                setMessage(data.message);
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
                    Forgot Password?
                </h1>
                <p className="text-gray-500 text-center mt-2">
                    Enter your email and we'll send you a reset link.
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
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your registered email"
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
                            required />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50">
                        {loading
                            ? "Sending..."
                            : "Send Reset Link"
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

export default ForgotPassword;