import { useAuth } from "../context/AuthContext";

const Home = () => {
    const { user, logout } = useAuth();
    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-white border-b px-6 py-4 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-green-600">
                    QueueLess
                </h1>
                <div className="flex items-center gap-4">
                    <span className="text-gray-700">
                        Hello, {user?.name}
                    </span>
                    <button
                        onClick={logout}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg">
                        Logout
                    </button>
                </div>
            </nav>
            <main className="p-8">
                <h2 className="text-3xl font-bold">
                    Welcome to QueueLess
                </h2>
                <p className="mt-2 text-gray-600">
                    Your queue management dashboard will be here.
                </p>
            </main>
        </div>
    )
}

export default Home;