import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../../components/Layout/MainLayout";
import RoleSidebar from "../../components/Layout/RoleSidebar";

import DashboardOverview from "./DashboardOverview";
import Users from "../Management/Users";
import Stations from "../Management/Stations";
import Vehicles from "../Management/Vehicles";
import Bookings from "../Management/Bookings";
import Transactions from "../Management/Transactions";
import SupportTickets from "../Management/SupportTickets";
import Subscriptions from "../Management/ServicePackages";
import BatteryManagement from "../Management/BatteryManagement";
import ServicePackagesPage from "../Management/ServicePackages";
import Inventories from "../Management/Inventory";
import Assignments from "../Management/Assignment";
import Profile from "../Management/Profile";

export default function AdminDashboard() {
  return (
    <MainLayout
      sidebar={<RoleSidebar role="ADMIN" />}
      title="Trang quản trị hệ thống"
    >
      <Routes>
        <Route index element={<Navigate to="overview" />} />
        <Route path="overview" element={<DashboardOverview />} />
        <Route path="users" element={<Users />} />
        <Route path="stations" element={<Stations />} />
        <Route path="batteries" element={<BatteryManagement />} />
        <Route path="vehicles" element={<Vehicles />} />
        <Route path="inventories" element={<Inventories />} />
        <Route path="assignments" element={<Assignments />} />
        <Route path="bookings" element={<Bookings />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="tickets" element={<SupportTickets />} />
        <Route path="service-packages" element={<ServicePackagesPage />} />
        <Route path="profile" element={<Profile />} />
        <Route path="*" element={<div>Không tìm thấy trang!</div>} />
      </Routes>
    </MainLayout>
  );
}
