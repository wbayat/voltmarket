import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const linkClass = "text-gray-600 hover:text-gray-900";

  return (
    <nav className="flex items-center justify-between px-6 py-3 border-b bg-white">
      <div className="flex items-center gap-4">
        <Link to="/" className="font-semibold text-lg text-gray-900">
          VoltMarket
        </Link>
        <Link to="/" className={linkClass}>
          Browse
        </Link>
        <Link to="/compare" className={linkClass}>
          Compare
        </Link>
        <Link to="/loan-calculator" className={linkClass}>
          Loan Calculator
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <>
            <Link to="/cart" className={linkClass}>
              Cart
            </Link>
            <Link to="/wishlist" className={linkClass}>
              Wishlist
            </Link>
            <Link to="/orders" className={linkClass}>
              My Orders
            </Link>
            {user.role === "admin" && (
              <>
                <Link to="/admin/sales-report" className={linkClass}>
                  Sales Report
                </Link>
                <Link to="/admin/usage-report" className={linkClass}>
                  Usage Report
                </Link>
              </>
            )}
            <span className="text-gray-500 text-sm">Hi, {user.name}</span>
            <button
              onClick={handleLogout}
              className="text-sm px-3 py-1 border rounded text-gray-700 hover:bg-gray-100"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className={linkClass}>
              Login
            </Link>
            <Link
              to="/register"
              className="text-sm px-3 py-1 bg-gray-800 text-white rounded hover:bg-gray-900"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
