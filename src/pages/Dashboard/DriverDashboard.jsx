import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../../components/Layout/MainLayout";
import RoleSidebar from "../../components/Layout/RoleSidebar";

import Bookings from "../Management/Bookings";
import Transactions from "../Management/Transactions";
import Vehicles from "../Management/Vehicles";
import DriverSubscriptionManagement from "../Management/DriverSubscriptionManagement";
import PackagesPage from "../Shared/Packages";
import SupportTickets from "../Management/SupportTickets";
import Profile from "../Management/Profile";

export default function DriverDashboard() {
  return (
    <MainLayout sidebar={<RoleSidebar role="DRIVER" />} title="Trang tài xế">
      <div className="p-4">
        <Routes>
          <Route index element={<Navigate to="bookings" />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="vehicles" element={<Vehicles />} />
          <Route path="driver-subscription" element={<DriverSubscriptionManagement />}/>
          <Route path="upgrade-plan" element={<PackagesPage />} />
          <Route path="tickets" element={<SupportTickets />} />
          <Route path="profile" element={<Profile />} />
          <Route path="*" element={<div>Không tìm thấy trang!</div>} />
        </Routes>
      </div>
    </MainLayout>
  );
}
