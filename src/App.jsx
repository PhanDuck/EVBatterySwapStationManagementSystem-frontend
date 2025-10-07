// jsx
// phối hợp JS & HTML 1 cách dễ dàng

import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import Dashboard from "./components/dashboard";
import { ToastContainer } from "react-toastify";
import RegisterPage from "./pages/Register";
import Home from "./pages/Home/home";
import LoginPage from "./pages/Login/login";
import AboutPage from "./pages/About";
import PackagesPage from "./pages/Packages";
import SupportPage from "./pages/Support";
import StationsNearbyPage from "./pages/StationsNearby";
import StationBookingPage from "./pages/StationBooking";
import StaffLayout from "./pages/Staff/Layout";
import StationDashboard from "./pages/Staff/StationDashboard";
import InventoryManagement from "./pages/Staff/InventoryManagement";
import SwapTransactions from "./pages/Staff/SwapTransactions";
import DashboardHeader from "./components/dashboard/DashboardHeader";
import { getCurrentRole, isAuthenticated } from "./config/auth";
import AdminDashboard from "./pages/Admin/Dashboard";

// 1. Component
// là 1 cái function
// trả về 1 cái giao diện

const RequireRole = ({ roles, children }) => {
  const authed = isAuthenticated();
  const role = getCurrentRole();
  if (!authed) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(role)) return <Navigate to="/" replace />;
  return children;
};

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Home />,
    },
    {
      path: "/about",
      element: <AboutPage />,
    },
    {
      path: "/packages",
      element: <PackagesPage />,
    },
    {
      path: "/support",
      element: <SupportPage />,
    },
    {
      path: "/stations/nearby",
      element: <StationsNearbyPage />,
    },
    {
      path: "/stations/booking",
      element: <StationBookingPage />,
    },
    {
      path: "/login",
      element: <LoginPage/>,
    },
    {
      path: "/admin",
      element: (
        <RequireRole roles={["Admin"]}>
          <Dashboard />
        </RequireRole>
      ),
      children: [
        { index: true, element: <AdminDashboard /> },
      ],
    },
    {
      path: "/staff",
      element: (
        <RequireRole roles={["Staff"]}>
          <StaffLayout />
        </RequireRole>
      ),
      children: [
        { index: true, element: <StationDashboard /> },
        { path: "inventory", element: <InventoryManagement /> },
        { path: "swaps", element: <SwapTransactions /> },
        // support legacy/typed path from screenshot
        { path: "StationDashboard", element: <StationDashboard /> },
      ],
    },
    
    {
      path: "/register",
      element: <RegisterPage />,
    },
  ]);

  return (
    <>
      <ToastContainer />
      <RouterProvider router={router} />
    </>
  );
}

export default App;
