import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../../components/Layout/MainLayout";
import RoleSidebar from "../../components/Layout/RoleSidebar";

import Bookings from "../Management/Bookings";
import Transactions from "../Management/Transactions";

export default function DriverDashboard() {
  return (
    <MainLayout sidebar={<RoleSidebar role="DRIVER" />} title="Trang tài xế">
      <div className="p-4">
        <Routes>
          <Route index element={<Navigate to="bookings" />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="*" element={<div>Không tìm thấy trang!</div>} />
        </Routes>
      </div>
    </MainLayout>
  );
}
