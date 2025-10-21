import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import Home from "../pages/Shared/home";
import About from "../pages/Shared/About";
import Packages from "../pages/Shared/Packages";
import NotFound from "../pages/Error/NotFound";
import AdminDashboard from "../pages/Dashboard/AdminDashboard";
import DriverDashboard from "../pages/Dashboard/DriverDashboard";
import StaffDashboard from "../pages/Dashboard/StaffDashboard";
import StationsNearbyPage from "../pages/Shared/StationsNearby";
import SupportPage from "../pages/Shared/Support";
import StationBookingPage from "../pages/Shared/StationBooking";
import PrivateRoute from "./PrivateRoute";

export default function AppRouter() {
  return (
    <Router>
      <Routes>
        {/* 🌐 Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/packages" element={<Packages />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="stations/nearby" element={<StationsNearbyPage />} />
        <Route path="/support" element={<SupportPage />} />

        {/* 🔒 Private routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/stations/booking" element={<StationBookingPage />} />
        </Route>

        {/* Trang quản trị */}
        <Route path="/admin/*" element={<AdminDashboard />} />

        <Route path="/driver/*" element={<DriverDashboard />} />

        <Route path="/staff/*" element={<StaffDashboard />} />

        {/* 🚫 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
