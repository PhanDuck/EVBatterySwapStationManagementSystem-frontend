import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "../pages/Auth/login";
import Register from "../pages/Auth/Register";
import Home from "../pages/Shared/Home";
import About from "../pages/Shared/About";
import Packages from "../pages/Shared/Packages";
import Policy from "../pages/Shared/Policy";
import NotFound from "../pages/Error/NotFound";
import AdminDashboard from "../pages/Dashboard/AdminDashboard";
import DriverDashboard from "../pages/Dashboard/DriverDashboard";
import StaffDashboard from "../pages/Dashboard/StaffDashboard";
import StationsNearbyPage from "../pages/Shared/StationsNearby";
import StationBookingPage from "../pages/Shared/StationBooking";
import EnterConfirmationCode from "../pages/Shared/EnterConfirmationCode";
import SupportPage from "../pages/Shared/Support";


import PrivateRoute from "./PrivateRoute";
import { getCurrentRole, isAuthenticated } from "../config/auth";
import HomeLayout from "../Layouts/HomeLayout";
import PaymentResult from "../pages/Payment/PaymentResult";
import ForgotPassword from "../pages/Auth/ForgotPassword";
import ResetPassword from "../pages/Auth/ResetPassword";
import PrivacyPolicy from "../pages/Shared/PrivacyPolicy";



export default function AppRouter() {
  const authed = isAuthenticated();
  const role = getCurrentRole();
  // 🔁 Hàm xác định route theo vai trò
  const redirectByRole = () => {
    switch (role) {
      case "Admin":
        return "/admin";
      case "Staff":
        return "/staff";
      case "Driver":
        return "/driver";
      default:
        return "/";
    }
  };
  return (
    <Router>
      <Routes>
        {/*  Public and Authenticated routes with HomeLayout */}
        <Route element={<HomeLayout />}>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/packages" element={<Packages />} />
          <Route path="/policy" element={<Policy />} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="/stations/nearby" element={<StationsNearbyPage />} />
          <Route path="/codeConfirm" element={<EnterConfirmationCode />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />

          {/* Protected */}
          <Route element={<PrivateRoute roles={["Driver"]} />}>
            <Route path="/stations/booking" element={<StationBookingPage />} />
          </Route>
        </Route>

        <Route
          path="/login"
          element={
            authed ? <Navigate to={redirectByRole()} replace /> : <Login />
          }
        />
        <Route path="/register" element={<Register />} />

        {/*  Protected routes without HomeLayout (Dashboards, etc.) */}
        <Route element={<PrivateRoute roles={["Admin"]} />}>
          <Route path="/admin/*" element={<AdminDashboard />} />
        </Route>

        <Route element={<PrivateRoute roles={["Driver"]} />}>
          <Route path="/driver/*" element={<DriverDashboard />} />
          <Route path="/payment/result" element={<PaymentResult />} />
        </Route>

        <Route element={<PrivateRoute roles={["Staff"]} />}>
          <Route path="/staff/*" element={<StaffDashboard />} />
        </Route>

        {/*  404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}