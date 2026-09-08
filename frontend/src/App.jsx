import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Home from "./pages/Home"
import ProtectedRoute from "./components/ProtectedRoute"
import AdminRoute from "./components/AdminRoute"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={<Login />} />
        <Route
          path="/register"
          element={<Register />} />
        <Route
          path="/forgot-password"
          element={<ForgotPassword />} />
        <Route
          path="/reset-password/:token"
          element={<ResetPassword />} />
        <Route element={<ProtectedRoute />}>
          <Route
            path="/"
            element={<Home />} />
        </Route>
        <Route element={<AdminRoute />}>
          <Route
            path="/admin"
            element={
              <div>
                Admin Dashboard
              </div>
            } />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
export default App
