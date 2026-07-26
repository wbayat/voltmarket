import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import ChatbotWidget from "./components/ChatbotWidget";

import Login from "./pages/Login";
import Register from "./pages/Register";
import VehicleList from "./pages/VehicleList";
import VehicleDetails from "./pages/VehicleDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Wishlist from "./pages/Wishlist";
import Orders from "./pages/Orders";
import CompareVehicles from "./pages/CompareVehicles";
import LoanCalculator from "./pages/LoanCalculator";
import AdminSalesReport from "./pages/AdminSalesReport";
import AdminUsageReport from "./pages/AdminUsageReport";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          {/* public pages — no login required */}
          <Route path="/" element={<VehicleList />} />
          <Route path="/vehicles/:id" element={<VehicleDetails />} />
          <Route path="/compare" element={<CompareVehicles />} />
          <Route path="/loan-calculator" element={<LoanCalculator />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* protected pages — require login */}
          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/wishlist"
            element={
              <ProtectedRoute>
                <Wishlist />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />

          {/* admin-only pages */}
          <Route
            path="/admin/sales-report"
            element={
              <ProtectedRoute adminOnly>
                <AdminSalesReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/usage-report"
            element={
              <ProtectedRoute adminOnly>
                <AdminUsageReport />
              </ProtectedRoute>
            }
          />
        </Routes>
        <ChatbotWidget />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
