import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../../components/Layout/MainLayout";
import RoleSidebar from "../../components/Layout/RoleSidebar";

import Bookings from "../Management/Bookings";
import Stations from "../Management/Stations";
import Vehicles from "../Management/Vehicles";
import SupportTickets from "../Management/SupportTickets";
import InventoryManagement from "../Staff/InventoryManagement";
import SwapTransactions from "../Staff/SwapTransactions";

export default function StaffDashboard() {
  return (
    <MainLayout sidebar={<RoleSidebar role="STAFF" />} title="Staff Dashboard">
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Trang nhân viên trạm</h1>

        <Routes>
          <Route index element={<Navigate to="bookings" />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="stations" element={<Stations />} />
          <Route path="vehicles" element={<Vehicles />} />
          <Route path="tickets" element={<SupportTickets />} />
          <Route path="inventory" element={<InventoryManagement />} />
          <Route path="swaps" element={<SwapTransactions />} />
          <Route path="*" element={<div>Không tìm thấy trang!</div>} />
        </Routes>
      </div>
    </MainLayout>
  );
}
