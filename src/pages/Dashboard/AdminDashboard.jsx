import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../../components/Layout/MainLayout";
import RoleSidebar from "../../components/Layout/RoleSidebar";

import Users from "../Management/Users";
import Stations from "../Management/Stations";
import Vehicles from "../Management/Vehicles";
import Bookings from "../Management/Bookings";
import Transactions from "../Management/Transactions";
import SupportTickets from "../Management/SupportTickets";

export default function AdminDashboard() {
  return (
    <MainLayout sidebar={<RoleSidebar role="ADMIN" />} title="Trang quản trị hệ thống">
      <Routes>
        <Route index element={<Navigate to="users" />} />
        <Route path="users" element={<Users />} />
        <Route path="stations" element={<Stations />} />
        <Route path="vehicles" element={<Vehicles />} />
        <Route path="bookings" element={<Bookings />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="tickets" element={<SupportTickets />} />
        <Route path="*" element={<div>Không tìm thấy trang!</div>} />
      </Routes>
    </MainLayout>
  );
}
