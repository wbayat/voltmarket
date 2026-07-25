import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Redirect to /login if not authenticated,
// otherwise renders the page. Example:
// <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) return <p>Loading...</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== "admin") return <Navigate to="/" replace />;

  return children;
};

export default ProtectedRoute;
