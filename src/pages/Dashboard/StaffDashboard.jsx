import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../../components/Layout/MainLayout";
import RoleSidebar from "../../components/Layout/RoleSidebar";
import Bookings from "../Management/Bookings";
import Stations from "../Management/Stations";
import Vehicles from "../Management/Vehicles";
import SupportTickets from "../Management/SupportTickets";
import Inventories from "../Management/Inventory";
import Profile from "../Management/Profile";

export default function StaffDashboard() {
  return (
    <MainLayout
      sidebar={<RoleSidebar role="STAFF" />}
      title="Trang nhân viên trạm"
    >
      <div className="p-4">
        <Routes>
          <Route index element={<Navigate to="bookings" />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="stations" element={<Stations />} />
          <Route path="vehicles" element={<Vehicles />} />
          <Route path="inventories" element={<Inventories />} />
          <Route path="tickets" element={<SupportTickets />} />
          <Route path="profile" element={<Profile />} />
          <Route path="*" element={<div>Không tìm thấy trang!</div>} />
        </Routes>
      </div>
    </MainLayout>
  );
}
